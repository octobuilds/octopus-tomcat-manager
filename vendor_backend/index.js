import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Read Private Key
const privateKeyPath = path.join(__dirname, 'privateKey.pem');
let privateKey = '';
if (fs.existsSync(privateKeyPath)) {
  privateKey = fs.readFileSync(privateKeyPath, 'utf8');
} else {
  console.error("FATAL ERROR: privateKey.pem not found!");
  process.exit(1);
}

// Middleware to check vendor auth
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Yetkisiz erişim' });
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'vendor_super_secret');
    req.adminId = payload.adminId;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

// 1. Auth (Login)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  // For simplicity, let's auto-create the admin if the DB is empty (since it's a private tool)
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    await prisma.admin.create({
      data: { username: 'admin', password: 'password123' } // We can hash this in production
    });
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || admin.password !== password) {
    return res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre' });
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET || 'vendor_super_secret', { expiresIn: '12h' });
  res.json({ success: true, token, username: admin.username });
});

// 2. Clients
app.get('/api/clients', authenticateAdmin, async (req, res) => {
  const clients = await prisma.client.findMany({
    include: { licenses: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, clients });
});

app.post('/api/clients', authenticateAdmin, async (req, res) => {
  const { name, email, machineId } = req.body;
  try {
    const client = await prisma.client.create({
      data: { name, email, machineId }
    });
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Müşteri eklenemedi' });
  }
});

// 3. Generate License
app.post('/api/licenses/generate', authenticateAdmin, async (req, res) => {
  const { clientId, machineId, maxUsers, maxServers, maxApps, maxAlarms, notificationsEnabled, expireDays } = req.body;
  
  try {
    // Generate JWT
    const payload = {
      machineId,
      maxUsers: parseInt(maxUsers, 10),
      maxServers: parseInt(maxServers, 10),
      maxApps: parseInt(maxApps, 10),
      maxAlarms: parseInt(maxAlarms || 10, 10),
      notificationsEnabled: Boolean(notificationsEnabled)
    };
    
    const licenseKey = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: expireDays + 'd',
      issuer: 'OctopusAPM'
    });

    // Save to DB
    const dbLicense = await prisma.license.create({
      data: {
        clientId: parseInt(clientId, 10),
        licenseKey,
        maxUsers: parseInt(maxUsers, 10),
        maxServers: parseInt(maxServers, 10),
        maxApps: parseInt(maxApps, 10),
        maxAlarms: parseInt(maxAlarms || 10, 10),
        notificationsEnabled: Boolean(notificationsEnabled),
        expireDays: parseInt(expireDays, 10)
      }
    });

    res.json({ success: true, license: dbLicense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lisans oluşturulurken hata oluştu' });
  }
});

app.listen(port, () => {
  console.log(`Vendor Backend is running on http://localhost:${port}`);
});
