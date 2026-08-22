import { PrismaClient } from '@prisma/client';
import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();
const __dirname = path.resolve();

// Tek bir sunucudaki tüm tomcat'leri tara
const scanServerTomcats = async (serverIp, tomcatApps) => {
  const scriptPath = path.join(__dirname, 'scripts', 'tomcat_status.sh');
  const privateKeyPath = path.join(__dirname, '.ssh', 'id_ed25519');
  
  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(scriptPath)) {
    logger.warn(`[TomcatMonitor] SSH key or script missing for ${serverIp}`);
    return;
  }

  const ssh = new NodeSSH();
  try {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    await ssh.connect({
      host: serverIp,
      username: 'octopus',
      privateKey: privateKey,
      readyTimeout: 5000,
    });

    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    for (const app of tomcatApps) {
      // Execute bash script securely with arguments
      // using temp file to avoid escaping issues
      const remoteTempFile = `/tmp/tomcat_status_${app.id}.sh`;
      await ssh.execCommand(`cat << 'EOF' > ${remoteTempFile}\n${scriptContent}\nEOF`);
      await ssh.execCommand(`chmod +x ${remoteTempFile}`);
      
      const result = await ssh.execCommand(`sudo ${remoteTempFile} "${serverIp}" "${app.instanceName}" "${app.pid || ''}"`);
      await ssh.execCommand(`rm -f ${remoteTempFile}`);

      if (result.stdout) {
        try {
          const metrics = JSON.parse(result.stdout);
          
          // 1. Update/Upsert TomcatApp (Ana Tablo)
          const updatedApp = await prisma.tomcatApp.upsert({
            where: {
              serverIp_instanceName: {
                serverIp: metrics.server_ip,
                instanceName: metrics.instance_name
              }
            },
            update: {
              pid: metrics.pid === 0 ? null : metrics.pid,
              cpuPercent: parseFloat(metrics.cpu_percent) || 0,
              rssMb: parseFloat(metrics.rss_mb) || 0,
              vszMb: parseFloat(metrics.vsz_mb) || 0,
              uptimeSec: parseInt(metrics.uptime_sec) || 0,
              status: metrics.status,
            },
            create: {
              serverIp: metrics.server_ip,
              instanceName: metrics.instance_name,
              pid: metrics.pid === 0 ? null : metrics.pid,
              cpuPercent: parseFloat(metrics.cpu_percent) || 0,
              rssMb: parseFloat(metrics.rss_mb) || 0,
              vszMb: parseFloat(metrics.vsz_mb) || 0,
              uptimeSec: parseInt(metrics.uptime_sec) || 0,
              status: metrics.status,
            }
          });

          // 2. Insert into TomcatAppHistory (Geçmiş Tablo)
          await prisma.tomcatAppHistory.create({
            data: {
              tomcatAppId: updatedApp.id,
              cpuPercent: parseFloat(metrics.cpu_percent) || 0,
              rssMb: parseFloat(metrics.rss_mb) || 0,
              vszMb: parseFloat(metrics.vsz_mb) || 0,
              uptimeSec: parseInt(metrics.uptime_sec) || 0,
              status: metrics.status,
            }
          });

          logger.info(`[TomcatMonitor] Updated metrics for ${metrics.instance_name} on ${serverIp} (${metrics.status})`);
        } catch (e) {
          logger.error(`[TomcatMonitor] JSON parse error for ${app.instanceName} on ${serverIp}: ${e.message}`);
        }
      }
    }
  } catch (error) {
    logger.error(`[TomcatMonitor] Connection error for ${serverIp}: ${error.message}`);
  } finally {
    ssh.dispose();
  }
};

export const forceScanTomcats = async () => {
  logger.info('[TomcatMonitor] Manual scan triggered via API');
  try {
    const apps = await prisma.tomcatApp.findMany();
    if (apps.length === 0) return;

    // Group apps by serverIp
    const appsByServer = apps.reduce((acc, app) => {
      if (app.serverIp) {
        if (!acc[app.serverIp]) acc[app.serverIp] = [];
        acc[app.serverIp].push(app);
      }
      return acc;
    }, {});

    // Run scans for each server concurrently
    await Promise.all(
      Object.entries(appsByServer).map(([serverIp, serverApps]) => 
        scanServerTomcats(serverIp, serverApps)
      )
    );
  } catch (error) {
    logger.error('[TomcatMonitor] Error during manual scan:', error);
    throw error;
  }
};

export const startTomcatMonitoring = () => {
  const intervalSec = parseInt(process.env.TOMCAT_SCAN_INTERVAL_SEC || '60');
  logger.info(`[TomcatMonitor] Background Tomcat Monitoring started... (Interval: ${intervalSec}s)`);
  
  // Cleanup task for data > 6 months
  const cleanupOldHistory = async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { count } = await prisma.tomcatAppHistory.deleteMany({
        where: { recordedAt: { lt: sixMonthsAgo } }
      });
      if (count > 0) {
        logger.info(`[TomcatMonitor] Cleaned up ${count} metrics older than 6 months`);
      }
    } catch (e) {
      logger.error('[TomcatMonitor] Cleanup error:', e);
    }
  };

  // Run cleanup once on start
  cleanupOldHistory();

  // Run on interval
  setInterval(async () => {
    try {
      const apps = await prisma.tomcatApp.findMany();
      if (apps.length === 0) return;

      const appsByServer = apps.reduce((acc, app) => {
        if (app.serverIp) {
          if (!acc[app.serverIp]) acc[app.serverIp] = [];
          acc[app.serverIp].push(app);
        }
        return acc;
      }, {});

      for (const [serverIp, serverApps] of Object.entries(appsByServer)) {
        // Run sequentially to avoid crushing the DB connection pool if many servers
        await scanServerTomcats(serverIp, serverApps);
      }
    } catch (error) {
      logger.error('[TomcatMonitor] Error during scheduled scan:', error);
    }
  }, intervalSec * 1000);
};
