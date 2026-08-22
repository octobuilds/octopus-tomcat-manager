import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);
import setupRoute from './routes/setup.js';
import authRoute from './routes/auth.js';
import serversRoute from './routes/servers.js';
import usersRoute from './routes/users.js';
import statsRoute from './routes/stats.js';
import tomcatRoute from './routes/tomcat.js';
import logsRoute from './routes/logs.js';
import auditRoutes from './routes/audit.js';
import rolesRoute from './routes/roles.js';
import alarmsRoute from './routes/alarms.js';
import settingsRoute from './routes/settings.js';
import { startMonitoring } from './services/monitorService.js';
import { startTomcatMonitoring } from './services/tomcatMonitorService.js';
import { startAlarmService } from './services/alarmService.js';
import { requireAuth } from './middleware/authMiddleware.js';
import { auditMiddleware } from './middleware/auditMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  const user = process.env.DB_USER || 'postgres';
  const pass = process.env.DB_PASS || '1234';
  const host = process.env.DB_HOST || 'postgres';
  const port = process.env.DB_PORT || '5432';
  const name = process.env.DB_NAME || 'apm_tool';
  process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${name}?schema=public`;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running correctly.' });
});

// Setup API Endpoint (Kurulum Sihirbazı İçin)
app.use('/api/setup', setupRoute);

// Auth API Endpoint (Giriş İçin)
app.use('/api/auth', authRoute);

// Dashboard APIs (Protected)
app.use(auditMiddleware); // Bütün alttaki rotalara etki eder
app.use('/api/servers', requireAuth, serversRoute);
app.use('/api/users', requireAuth, usersRoute);
app.use('/api/stats', requireAuth, statsRoute);
app.use('/api/tomcat', requireAuth, tomcatRoute);
app.use('/api/logs', requireAuth, logsRoute);
app.use('/api/audit', requireAuth, auditRoutes);
app.use('/api/roles', requireAuth, rolesRoute);
app.use('/api/alarms', requireAuth, alarmsRoute);
app.use('/api/settings', requireAuth, settingsRoute);

// Status API: Frontend kurulumun yapılıp yapılmadığını anlar
app.get('/api/status', async (req, res) => {
  try {
    const prisma = new PrismaClient();
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    await prisma.$disconnect();

    if (adminExists) {
      return res.json({ setupComplete: true });
    }
    return res.json({ setupComplete: false });
  } catch (error) {
    // Veritabanı yoksa veya tablo yoksa
    return res.json({ setupComplete: false, error: "Database not initialized" });
  }
});

// Socket.io injection to req (optional but helpful)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve Frontend Static Files
const frontendDistPath = path.join(__dirname, 'public');
app.use(express.static(frontendDistPath));

// Catch-all route to serve React app for non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

httpServer.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);

  let isDbReady = false;
  const prisma = new PrismaClient();
  
  try {
    // Check if db is reachable
    await prisma.$queryRaw`SELECT 1`;
    isDbReady = true;
  } catch (err) {
    console.error("Database connection failed. Background services suspended.");
  }

  if (isDbReady) {
    try {
      // Just check if the db is reachable. 
      // All table creation, role seeding, and admin creation is now handled by the /api/setup endpoint.
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.error("Veritabanı bağlantı hatası:", error.message);
    } finally {
      await prisma.$disconnect();
    }
  }

  if (isDbReady) {
    // Start Background Server Monitoring
    startMonitoring();
    // Start Tomcat Metric Monitoring
    startTomcatMonitoring();
    // Start Alarm Evaluation
    startAlarmService();
  }

  // Socket.io Log Tailing Handler'ını başlat
  import('./services/logTailService.js').then(({ initializeLogTailing }) => {
    initializeLogTailing(io);
  }).catch(err => console.error("Failed to load logTailService:", err));
});
