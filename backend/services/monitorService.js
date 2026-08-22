import { PrismaClient } from '@prisma/client';
import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();
const __dirname = path.resolve();

export const startMonitoring = () => {
  logger.info('[Health] Background Server Health Monitoring started...');
  
  const scriptPath = path.join(__dirname, 'scripts', 'health_check.sh');
  const privateKeyPath = path.join(__dirname, '.ssh', 'id_ed25519');
  
  // Cleanup task for data > 60 days
  const cleanupOldHistory = async () => {
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      await prisma.serverHealthHistory.deleteMany({
        where: { recordedAt: { lt: sixtyDaysAgo } }
      });
      logger.info('[Health] Cleaned up metrics older than 60 days');
    } catch (e) {
      logger.error('[Health] Cleanup error:', e);
    }
  };

  // Run cleanup once on start
  cleanupOldHistory();

  // Run every 60 seconds
  setInterval(async () => {
    try {
      const servers = await prisma.server.findMany();
      if (servers.length === 0) return;
      
      if (!fs.existsSync(privateKeyPath) || !fs.existsSync(scriptPath)) return;
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      const healthScript = fs.readFileSync(scriptPath, 'utf8');

      await Promise.all(servers.map(async (server) => {
        const ssh = new NodeSSH();
        try {
          await ssh.connect({
            host: server.serverIp,
            username: 'octopus',
            privateKey: privateKey,
            readyTimeout: 5000,
          });
          
          if (!server.isActive) {
            await prisma.server.update({ where: { id: server.id }, data: { isActive: true } });
          }

          // Execute Health Script
          const result = await ssh.execCommand(healthScript);
          ssh.dispose();

          if (result.stdout) {
            try {
              const metrics = JSON.parse(result.stdout);
              
              // 1. Upsert ServerHealthMetric (Son Durum)
              await prisma.serverHealthMetric.upsert({
                where: { serverId: server.id },
                update: {
                  hostname: metrics.hostname,
                  cpuUsagePercent: parseFloat(metrics.cpu.usage_percent),
                  cpuCores: parseInt(metrics.cpu.cores),
                  loadAvg1min: parseFloat(metrics.cpu.load_average['1min']),
                  loadAvg5min: parseFloat(metrics.cpu.load_average['5min']),
                  loadAvg15min: parseFloat(metrics.cpu.load_average['15min']),
                  memTotalMb: parseFloat(metrics.memory.total_mb),
                  memUsedMb: parseFloat(metrics.memory.used_mb),
                  memFreeMb: parseFloat(metrics.memory.free_mb),
                  memUsagePercent: parseFloat(metrics.memory.usage_percent),
                  swapTotalMb: parseFloat(metrics.swap.total_mb),
                  swapUsedMb: parseFloat(metrics.swap.used_mb),
                  swapUsagePercent: parseFloat(metrics.swap.usage_percent),
                  netRxMb: parseFloat(metrics.network.rx_mb),
                  netTxMb: parseFloat(metrics.network.tx_mb),
                  status: metrics.status,
                  diskPartitions: metrics.disks,
                  topPaths: metrics.top_data_paths
                },
                create: {
                  serverId: server.id,
                  hostname: metrics.hostname,
                  cpuUsagePercent: parseFloat(metrics.cpu.usage_percent),
                  cpuCores: parseInt(metrics.cpu.cores),
                  loadAvg1min: parseFloat(metrics.cpu.load_average['1min']),
                  loadAvg5min: parseFloat(metrics.cpu.load_average['5min']),
                  loadAvg15min: parseFloat(metrics.cpu.load_average['15min']),
                  memTotalMb: parseFloat(metrics.memory.total_mb),
                  memUsedMb: parseFloat(metrics.memory.used_mb),
                  memFreeMb: parseFloat(metrics.memory.free_mb),
                  memUsagePercent: parseFloat(metrics.memory.usage_percent),
                  swapTotalMb: parseFloat(metrics.swap.total_mb),
                  swapUsedMb: parseFloat(metrics.swap.used_mb),
                  swapUsagePercent: parseFloat(metrics.swap.usage_percent),
                  netRxMb: parseFloat(metrics.network.rx_mb),
                  netTxMb: parseFloat(metrics.network.tx_mb),
                  status: metrics.status,
                  diskPartitions: metrics.disks,
                  topPaths: metrics.top_data_paths
                }
              });

              // 2. Insert ServerHealthHistory (Zaman Çizelgesi)
              await prisma.serverHealthHistory.create({
                data: {
                  serverId: server.id,
                  cpuUsagePercent: parseFloat(metrics.cpu.usage_percent),
                  memUsagePercent: parseFloat(metrics.memory.usage_percent),
                  status: metrics.status,
                  diskPartitions: metrics.disks,
                  topPaths: metrics.top_data_paths
                }
              });
              
              logger.info(`[Health] Saved metrics for ${server.serverIp} (${metrics.status})`);
            } catch (parseError) {
              logger.error(`[Health] JSON Parse Error on ${server.serverIp}:`, parseError, result.stdout);
            }
          }
          
        } catch (error) {
          logger.error(`[Health] Connection error for ${server.serverIp}: ${error.message}`);
          if (server.isActive) {
            logger.warn(`[Health] Server ${server.serverIp} went OFFLINE.`);
            await prisma.server.update({ where: { id: server.id }, data: { isActive: false } });
          }
        }
      }));

    } catch (error) {
      logger.error('Error during monitoring cycle:', error);
    }
  }, 15000); // Her 15 saniyede bir
};
