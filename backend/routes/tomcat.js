import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Tüm tomcat uygulamalarını getir
router.get('/', async (req, res) => {
  try {
    const apps = await prisma.tomcatApp.findMany({
      orderBy: { lastUpdated: 'desc' }
    });
    res.json(apps);
  } catch (error) {
    console.error("Error fetching tomcat apps:", error);
    res.status(500).json({ error: "Veritabanı hatası" });
  }
});

// Tomcat uygulamasını güncelle (Edit)
router.put('/:id', requirePermission('canEditApps'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { instanceName, catalinaBase, serverIp, startScript, stopScript } = req.body;
  
  try {
    const updatedApp = await prisma.tomcatApp.update({
      where: { id },
      data: {
        instanceName,
        catalinaBase,
        serverIp,
        startScript,
        stopScript
      }
    });
    res.json(updatedApp);
  } catch (error) {
    console.error("Error updating tomcat app:", error);
    res.status(500).json({ error: "Güncelleme hatası" });
  }
});
// Tomcat taramasını manuel tetikle
router.post('/scan', requirePermission('canEditApps'), async (req, res) => {
  try {
    // Dinamik olarak servisi import et ki döngüsel bağımlılık olmasın veya route yüklendiğinde hazır olsun
    const { forceScanTomcats } = await import('../services/tomcatMonitorService.js');
    // Arka planda taramayı başlat, cevabı beklemeden dön (çok uzun sürebilir)
    forceScanTomcats().catch(err => console.error("Manual scan failed:", err));
    res.json({ message: "Scan started" });
  } catch (error) {
    console.error("Error starting scan:", error);
    res.status(500).json({ error: "Tarama başlatılamadı" });
  }
});

// Tomcat loglarını SSH ile oku (Gelişmiş Mod)
router.post('/:id/logs/explore', async (req, res) => {
  const id = parseInt(req.params.id);
  const { path: reqPath, mode, grepPattern } = req.body;
  
  try {
    const app = await prisma.tomcatApp.findUnique({ where: { id } });
    if (!app || !app.serverIp) {
      return res.status(404).json({ error: "Tomcat veya sunucu bulunamadı" });
    }

    const { NodeSSH } = await import('node-ssh');
    const fs = await import('fs');
    const pathLib = await import('path');
    
    const __dirname = pathLib.resolve();
    const privateKeyPath = pathLib.join(__dirname, '.ssh', 'id_ed25519');
    
    if (!fs.existsSync(privateKeyPath)) {
      return res.status(500).json({ error: "SSH anahtarı bulunamadı" });
    }

    const ssh = new NodeSSH();
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    
    await ssh.connect({
      host: app.serverIp,
      username: 'octopus',
      privateKey: privateKey,
      readyTimeout: 5000,
    });

    const catalinaBase = app.catalinaBase || '/opt/tomcat';
    let targetPath = reqPath || `${catalinaBase}/logs`;

    let command = '';
    
    if (mode === 'ls') {
      // Dizin listeleme (Kullanıcının n8n script'i)
      command = `sudo ls -laF --group-directories-first --time-style=long-iso "${targetPath}/" | tail -n +2`;
    } else {
      // Dosya okuma modları
      if (mode === 'tail' || mode === 'live') {
        command = `sudo tail -n 2000 "${targetPath}"`;
      } else if (mode === 'cat') {
        command = `sudo cat "${targetPath}"`;
      } else if (mode === 'grep') {
        // Grep (Basit injection koruması)
        const safePattern = (grepPattern || '').replace(/"/g, '\\"');
        command = `sudo grep -i "${safePattern}" "${targetPath}" | tail -n 2000`;
      } else {
        command = `sudo tail -n 200 "${targetPath}"`;
      }
    }
    
    const result = await ssh.execCommand(command);
    ssh.dispose();

    if (result.stderr && !result.stdout) {
      return res.status(500).json({ error: "İşlem başarısız", details: result.stderr });
    }

    res.json({ result: result.stdout, isDir: mode === 'ls' });
  } catch (error) {
    console.error("Error fetching logs via SSH:", error);
    res.status(500).json({ error: "Loglar çekilemedi" });
  }
});

// Tomcat uygulama geçmişini getir
router.get('/:appId/history', async (req, res) => {
  try {
    const appId = parseInt(req.params.appId);
    if (isNaN(appId)) return res.status(400).json({ success: false, message: 'Geçersiz ID' });

    const range = req.query.range || '15m';
    let takeConfig = {};

    if (range === 'custom') {
      const start = req.query.start;
      const end = req.query.end;
      let queryConditions = { tomcatAppId: appId };
      if (start && end) {
        queryConditions.recordedAt = {
          gte: new Date(start),
          lte: new Date(end)
        };
      }
      takeConfig = { where: queryConditions, take: 10000 };
    } else {
      let takeCount = 60; // 15m default
      if (range === '1h') takeCount = 240;
      else if (range === '6h') takeCount = 1440;
      else if (range === '24h') takeCount = 5760;
      
      takeConfig = { where: { tomcatAppId: appId }, take: -takeCount };
    }

    const history = await prisma.tomcatAppHistory.findMany({
      orderBy: { recordedAt: 'asc' },
      ...takeConfig
    });

    const formatted = history.map(record => ({
      time: record.recordedAt,
      cpu: record.cpuPercent || 0,
      memory: record.vszMb > 0 ? Math.round((record.rssMb / record.vszMb) * 100) : 0
    }));

    // Downsample
    const maxPoints = 120;
    let downsampled = formatted;
    
    if (formatted.length > maxPoints) {
      const bucketSize = Math.ceil(formatted.length / maxPoints);
      downsampled = [];
      
      for (let i = 0; i < formatted.length; i += bucketSize) {
        const bucket = formatted.slice(i, i + bucketSize);
        const sumCpu = bucket.reduce((sum, item) => sum + item.cpu, 0);
        const sumMem = bucket.reduce((sum, item) => sum + item.memory, 0);
        const lastItemTime = bucket[bucket.length - 1].time;
        
        downsampled.push({
          time: lastItemTime,
          cpu: parseFloat((sumCpu / bucket.length).toFixed(1)),
          memory: parseFloat((sumMem / bucket.length).toFixed(1))
        });
      }
    }

    res.json({ success: true, history: downsampled });
  } catch (error) {
    console.error('Error fetching tomcat history:', error);
    res.status(500).json({ success: false, message: 'Geçmiş veriler alınamadı' });
  }
});

export default router;
