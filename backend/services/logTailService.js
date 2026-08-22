import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const prisma = new PrismaClient();

// Helper to create a dedicated logger for a specific app
const getAppLogger = (appId, serverIp) => {
  const logDir = path.join(path.resolve(), 'logs', 'remote');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return winston.createLogger({
    level: 'info',
    format: winston.format.printf(({ message }) => message), // Just raw messages
    transports: [
      new DailyRotateFile({
        filename: path.join(logDir, `tomcat_app_${appId}_${serverIp}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });
};

export const initializeLogTailing = (io) => {
  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);
    
    // Store the SSH instance for this socket so we can kill it later
    socket.sshInstance = null;
    socket.appLogger = null;

    socket.on('start_tail', async (data) => {
      const { appId, path: customPath, grepPattern } = data;
      console.log(`[WebSocket] start_tail requested for app: ${appId}`);

      try {
        const app = await prisma.tomcatApp.findUnique({ where: { id: parseInt(appId) } });
        if (!app || !app.serverIp) {
          socket.emit('log_error', 'Tomcat app or server IP not found.');
          return;
        }

        const privateKeyPath = path.join(path.resolve(), '.ssh', 'id_ed25519');
        if (!fs.existsSync(privateKeyPath)) {
          socket.emit('log_error', 'SSH private key not found.');
          return;
        }

        const ssh = new NodeSSH();
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        await ssh.connect({
          host: app.serverIp,
          username: 'octopus',
          privateKey: privateKey,
          readyTimeout: 5000,
        });

        socket.sshInstance = ssh;
        socket.appLogger = getAppLogger(app.id, app.serverIp);

        const catalinaBase = app.catalinaBase || '/opt/tomcat';
        const targetPath = customPath || `${catalinaBase}/logs/catalina.out`;

        // We use tail -F so it survives log rotation
        let command = `sudo tail -n 500 -F "${targetPath}"`;
        if (grepPattern) {
           // Basic injection protection
           const safePattern = (grepPattern || '').replace(/"/g, '\\"');
           command = `sudo tail -n 500 -F "${targetPath}" | grep --line-buffered -i "${safePattern}"`;
        }

        console.log(`[WebSocket] Executing: ${command}`);

        ssh.execCommand(command, {
          onStdout(chunk) {
            const lines = chunk.toString('utf8');
            // Emit to frontend
            socket.emit('log_line', lines);
            // Write to local disk
            if (socket.appLogger) {
              socket.appLogger.info(lines.replace(/\n$/, '')); // Remove trailing newline for winston
            }
          },
          onStderr(chunk) {
            socket.emit('log_error', chunk.toString('utf8'));
          }
        }).catch(err => {
            // Usually triggers when SSH is forcibly disconnected
            console.log(`[WebSocket] SSH command ended/error for app ${appId}`);
        });

      } catch (error) {
        console.error("[WebSocket] Error setting up SSH:", error);
        socket.emit('log_error', 'Bağlantı hatası: ' + error.message);
      }
    });

    socket.on('stop_tail', () => {
      console.log(`[WebSocket] stop_tail received for socket ${socket.id}`);
      if (socket.sshInstance) {
        socket.sshInstance.dispose();
        socket.sshInstance = null;
      }
      if (socket.appLogger) {
        socket.appLogger.close();
        socket.appLogger = null;
      }
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      if (socket.sshInstance) {
        socket.sshInstance.dispose();
      }
      if (socket.appLogger) {
        socket.appLogger.close();
      }
    });
  });
};
