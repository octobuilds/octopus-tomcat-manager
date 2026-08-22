import express from 'express';
import { PrismaClient } from '@prisma/client';
import { NodeSSH } from 'node-ssh';
import { getOrGenerateSSHKeys, getOctopusSetupScript } from '../utils/sshUtils.js';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all servers
router.get('/', async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ success: false, message: 'Sunucular alınamadı' });
  }
});

// Create a new server (and provision octopus via SSH)
router.post('/', requirePermission('canManageServers'), async (req, res) => {
  try {
    const { serverName, serverIp, environment, description, sshUser = 'root', rootPassword, sshKey, sshPort = 22 } = req.body;
    
    // 1. Get APM Public Key
    const { publicKey } = getOrGenerateSSHKeys();
    
    // 2. Connect to the target server via SSH
    const ssh = new NodeSSH();
    console.log(`Connecting to ${serverIp}:${sshPort} as ${sshUser}...`);
    
    const connectConfig = {
      host: serverIp,
      username: sshUser,
      port: sshPort,
      readyTimeout: 10000,
      tryKeyboard: true
    };

    if (sshKey) {
      connectConfig.privateKey = sshKey;
    } else {
      connectConfig.password = rootPassword;
    }
    
    let sshConnected = false;
    let detectedOS = 'Unknown Linux';
    let sshErrorMsg = '';

    try {
      await ssh.connect(connectConfig);
      sshConnected = true;
      console.log('SSH connected. Running octopus setup script...');

      // 3. Execute setup script via base64 to avoid escaping issues, using sudo if needed
      const script = getOctopusSetupScript(publicKey);
      const scriptBase64 = Buffer.from(script).toString('base64');
      
      let runCommand = `echo "${scriptBase64}" | base64 -d | bash`;
      
      if (sshUser !== 'root') {
        if (rootPassword) {
          runCommand = `echo "${rootPassword}" | sudo -S -p "" bash -c "echo '${scriptBase64}' | base64 -d | bash"`;
        } else {
          runCommand = `sudo bash -c "echo '${scriptBase64}' | base64 -d | bash"`;
        }
      }

      const result = await ssh.execCommand(runCommand);
      ssh.dispose(); // Close connection

      if (result.code !== 0) {
        console.error('Script failed:', result.stderr);
        sshConnected = false;
        sshErrorMsg = 'Sunucuya bağlanıldı ancak octopus kurulumu başarısız oldu: ' + result.stderr;
      } else {
        const osMatch = result.stdout.match(/___OS_DETECTED___:(.+)/);
        if (osMatch && osMatch[1]) {
          detectedOS = osMatch[1].trim();
          console.log('Detected OS from script:', detectedOS);
        }
        console.log('Octopus setup successful!');
      }

    } catch (sshErr) {
      console.error('SSH Connection Error:', sshErr.message);
      sshConnected = false;
      sshErrorMsg = 'SSH Bağlantı Hatası: ' + sshErr.message;
    }

    // 4. Save to Database regardless of SSH success (so they can test limits and keep inventory)
    const newServer = await prisma.server.create({
      data: {
        serverName,
        serverIp,
        environment,
        os: sshConnected ? detectedOS : 'Bilinmiyor (Bağlantı Hatası)',
        description,
        isActive: sshConnected
      }
    });

    if (!sshConnected) {
      return res.json({ 
        success: true, 
        message: 'Sunucu envantere eklendi ancak bağlantı kurulamadı. Lütfen network (SSH) erişimlerinizi ve güvenlik duvarı ayarlarınızı kontrol edin.', 
        warning: sshErrorMsg,
        server: newServer 
      });
    }

    res.json({ success: true, message: 'Sunucu eklendi ve Octopus ajanı başarıyla kuruldu!', server: newServer });
  } catch (error) {
    console.error('Error provisioning server:', error);
    res.status(500).json({ success: false, message: 'Sunucu eklenirken beklenmedik bir hata oluştu.' });
  }
});

// Get a specific server by ID
router.get('/:id', async (req, res) => {
  try {
    const serverId = parseInt(req.params.id);
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        projects: true
      }
    });

    if (!server) {
      return res.status(404).json({ success: false, message: 'Sunucu bulunamadı' });
    }

    res.json({ success: true, server });
  } catch (error) {
    console.error('Error fetching server details:', error);
    res.status(500).json({ success: false, message: 'Sunucu detayları alınamadı' });
  }
});

// Delete a server
router.delete('/:id', requirePermission('canManageServers'), async (req, res) => {
  try {
    const serverId = parseInt(req.params.id);
    await prisma.server.delete({
      where: { id: serverId }
    });
    res.json({ success: true, message: 'Sunucu başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting server:', error);
    res.status(500).json({ success: false, message: 'Sunucu silinemedi' });
  }
});

// Update a server
router.put('/:id', async (req, res) => {
  try {
    const serverId = parseInt(req.params.id);
    const { serverName, environment, team, description } = req.body;
    
    const updatedServer = await prisma.server.update({
      where: { id: serverId },
      data: {
        serverName,
        environment,
        team,
        description
      }
    });
    
    res.json({ success: true, server: updatedServer });
  } catch (error) {
    console.error('Error updating server:', error);
    res.status(500).json({ success: false, message: 'Sunucu güncellenemedi' });
  }
});

export default router;
