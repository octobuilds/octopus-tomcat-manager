import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to downsample data for charts
const downsampleData = (data, maxPoints) => {
  if (data.length <= maxPoints) return data;
  
  const bucketSize = Math.ceil(data.length / maxPoints);
  const result = [];
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);
    
    // Average values in the bucket
    const sumCpu = bucket.reduce((sum, item) => sum + item.cpu, 0);
    const sumRam = bucket.reduce((sum, item) => sum + item.ram, 0);
    const sumDisk = bucket.reduce((sum, item) => sum + item.disk, 0);
    
    // Get the timestamp of the last item in the bucket (to represent the bucket end time)
    const lastItemTime = bucket[bucket.length - 1].time;
    
    result.push({
      time: lastItemTime,
      cpu: parseFloat((sumCpu / bucket.length).toFixed(1)),
      ram: parseFloat((sumRam / bucket.length).toFixed(1)),
      disk: parseFloat((sumDisk / bucket.length).toFixed(1))
    });
  }
  
  return result;
};

// Get dashboard stats
router.get('/', async (req, res) => {
  try {
    const totalServers = await prisma.server.count();
    const activeServers = await prisma.server.count({ where: { isActive: true } });
    const totalProjects = await prisma.project.count();
    const totalUsers = await prisma.user.count();

    res.json({ 
      success: true, 
      stats: {
        totalServers,
        activeServers,
        totalProjects,
        totalUsers,
        avgResponseTime: null,
        errorRate: null,
        requestsPerMin: null
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'İstatistikler alınamadı' });
  }
});

// Get real-time system health data for all servers
router.get('/system-health', async (req, res) => {
  try {
    // Tüm sunucuları (aktif/pasif) çek ki eski verileri görebilelim
    const serversWithMetrics = await prisma.server.findMany({
      include: {
        healthMetric: true
      }
    });

    const formattedServers = serversWithMetrics.map(server => {
      const metric = server.healthMetric;
      if (!metric) return null;
      
      let totalDisk = 0;
      let usedDisk = 0;
      if (Array.isArray(metric.diskPartitions)) {
        totalDisk = metric.diskPartitions.reduce((sum, disk) => sum + (disk.total_gb || 0), 0);
        usedDisk = metric.diskPartitions.reduce((sum, disk) => sum + (disk.used_gb || 0), 0);
      }
      
      return {
        id: server.id.toString(),
        name: server.serverName,
        ip: server.serverIp,
        cpu: metric.cpuUsagePercent || 0,
        ram: { 
          used: metric.memUsedMb ? parseFloat((metric.memUsedMb / 1024).toFixed(1)) : 0, 
          total: metric.memTotalMb ? parseFloat((metric.memTotalMb / 1024).toFixed(1)) : 0 
        },
        disk: { 
          used: usedDisk, 
          total: totalDisk 
        },
        network: { 
          tx: metric.netTxMb || 0, 
          rx: metric.netRxMb || 0 
        },
        load: metric.loadAvg1min != null ? `${metric.loadAvg1min}, ${metric.loadAvg5min}, ${metric.loadAvg15min}` : 'N/A',
        status: metric.status || 'ok',
        isActive: server.isActive
      };
    }).filter(Boolean); // null olanları uçur

    res.json({ success: true, servers: formattedServers });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ success: false, message: 'Sistem sağlığı verileri alınamadı' });
  }
});

// Get historical system health data for a specific server (e.g. for charts)
router.get('/system-health/:serverId/history', async (req, res) => {
  try {
    const serverId = parseInt(req.params.serverId);
    if (isNaN(serverId)) {
      return res.status(400).json({ success: false, message: 'Geçersiz sunucu ID' });
    }

    // Fetch the server details to get name and IP
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { serverName: true, serverIp: true }
    });

    if (!server) {
      return res.status(404).json({ success: false, message: 'Sunucu bulunamadı' });
    }

    const range = req.query.range || '15m';
    
    let queryConditions = { serverId };
    let takeConfig = {};

    if (range === 'custom') {
      const start = req.query.start;
      const end = req.query.end;
      if (start && end) {
        queryConditions.recordedAt = {
          gte: new Date(start),
          lte: new Date(end)
        };
      }
      takeConfig.take = 10000; // Hard limit for custom queries to avoid memory issues
    } else {
      let takeCount = 60; // 15m default
      if (range === '1h') takeCount = 240;
      else if (range === '6h') takeCount = 1440;
      else if (range === '24h') takeCount = 5760;
      
      takeConfig.take = -takeCount; // Last N records
    }

    // Fetch the history records
    const history = await prisma.serverHealthHistory.findMany({
      where: queryConditions,
      orderBy: { recordedAt: 'asc' },
      ...takeConfig
    });

    const formattedHistory = history.map(record => ({
      time: record.recordedAt,
      cpu: record.cpuUsagePercent || 0,
      ram: record.memUsagePercent || 0,
      // Calculate disk usage percent from partitions
      disk: Array.isArray(record.diskPartitions) && record.diskPartitions.length > 0 
        ? Math.round((record.diskPartitions.reduce((sum, d) => sum + (d.used_gb || 0), 0) / 
                      record.diskPartitions.reduce((sum, d) => sum + (d.total_gb || 0), 0)) * 100)
        : 0
    }));

    // Fetch current metric to get topPaths and other current details
    const currentMetric = await prisma.serverHealthMetric.findUnique({
      where: { serverId }
    });

    const downsampledHistory = downsampleData(formattedHistory, 120);

    res.json({ 
      success: true, 
      server: { name: server.serverName, ip: server.serverIp },
      history: downsampledHistory,
      current: currentMetric
    });
  } catch (error) {
    console.error('Error fetching system health history:', error);
    res.status(500).json({ success: false, message: 'Geçmiş veriler alınamadı' });
  }
});

export default router;
