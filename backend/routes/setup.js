import express from 'express';
import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { startMonitoring } from '../services/monitorService.js';
import { startTomcatMonitoring } from '../services/tomcatMonitorService.js';
import { startAlarmService } from '../services/alarmService.js';

const router = express.Router();
const execPromise = util.promisify(exec);

router.post('/', async (req, res) => {
  const { dbHost, dbPort, dbUser, dbPass, dbName, smtpHost, smtpPort, smtpUser, smtpPass } = req.body;

  try {
    const databaseUrl = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=public`;

    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${databaseUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
    }
    fs.writeFileSync(envPath, envContent);
    
    // Uygulamayı yeniden başlatmaya gerek kalmadan mevcut process'in veritabanını görmesini sağla
    process.env.DATABASE_URL = databaseUrl;

    console.log("Creating database tables...");
    await execPromise('npx prisma db push', { 
        env: { ...process.env, DATABASE_URL: databaseUrl } 
    });
    console.log("Database tables created successfully.");

    const prisma = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
    });

    const existingAdmin = await prisma.user.findFirst();
    if (!existingAdmin) {
      console.log("Loading default roles...");
      await prisma.role.create({
        data: { name: 'ADMIN', description: 'Sistem Yöneticisi', canViewLogs: true, canViewCharts: true, canStartStopApps: true, canEditApps: true, canManageUsers: true, canManageRoles: true, canManageServers: true }
      });
      await prisma.role.create({
        data: { name: 'USER', description: 'Standart Kullanıcı', canViewLogs: false, canViewCharts: true, canStartStopApps: false, canEditApps: false, canManageUsers: false, canManageRoles: false }
      });

      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@octopusapm.com',
          password: hashedPassword,
          name: 'System Admin',
          role: 'ADMIN',
          isFirstLogin: true
        }
      });
      console.log("Default Admin user created.");
    }

    // Save SMTP Settings if provided
    if (smtpHost) {
      await prisma.systemSettings.upsert({
        where: { id: 1 },
        update: {
          smtpHost: smtpHost || null,
          smtpPort: smtpPort ? parseInt(smtpPort) : null,
          smtpUser: smtpUser || null,
          smtpPass: smtpPass || null,
        },
        create: {
          id: 1,
          smtpHost: smtpHost || null,
          smtpPort: smtpPort ? parseInt(smtpPort) : null,
          smtpUser: smtpUser || null,
          smtpPass: smtpPass || null,
        }
      });
      console.log("SMTP settings saved.");
    }

    await prisma.$disconnect();

    // Arka plan servislerini (sunucu izleme, tomcat, alarmlar) yeniden başlatmaya gerek kalmadan başlat
    try {
      startMonitoring();
      startTomcatMonitoring();
      startAlarmService();
      console.log("Background services started successfully.");
    } catch (bgError) {
      console.error("Failed to start background services:", bgError);
    }

    res.json({ success: true, message: 'Kurulum başarıyla tamamlandı!' });
  } catch (error) {
    console.error("Installation error:", error);
    res.status(500).json({ success: false, message: 'Kurulum başarısız', error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const prisma = new PrismaClient();
    const userCount = await prisma.user.count();
    res.json({ isSetupComplete: userCount > 0 });
  } catch (error) {
    // Veritabanı bağlantısı yoksa veya tablolar yoksa hata verir
    res.json({ isSetupComplete: false });
  }
});

export default router;
