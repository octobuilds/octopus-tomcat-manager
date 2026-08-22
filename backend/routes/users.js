import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isTwoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Kullanıcılar alınamadı' });
  }
});

// Change Password
router.post('/change-password', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const bcrypt = await import('bcrypt');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Mevcut şifreniz yanlış.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Şifre güncellenemedi.' });
  }
});

// 2FA - Generate Secret
router.post('/2fa/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const speakeasy = await import('speakeasy');
    const qrcode = await import('qrcode');

    // Generate secret
    const secret = speakeasy.default.generateSecret({
      name: 'OctopusAPM',
      length: 20
    });

    // Update user with secret (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 }
    });

    // Generate QR code image
    const qrCodeImage = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ success: true, secret: secret.base32, qrCodeImage });
  } catch (error) {
    console.error('Error generating 2FA:', error);
    res.status(500).json({ success: false, message: '2FA anahtarı oluşturulamadı.' });
  }
});

// 2FA - Enable
router.post('/2fa/enable', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;
    const speakeasy = await import('speakeasy');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA anahtarı bulunamadı.' });
    }

    const isValid = speakeasy.default.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 4
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Girdiğiniz kod hatalı veya süresi dolmuş.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true }
    });

    res.json({ success: true, message: 'İki Faktörlü Kimlik Doğrulama aktifleştirildi.' });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({ success: false, message: '2FA aktifleştirilemedi.' });
  }
});

// SESSIONS - Get all active sessions for current user
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.headers.authorization?.split(' ')[1];

    const sessions = await prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, device: true, ip: true, createdAt: true, token: true }
    });

    // Map to expected format
    const formattedSessions = sessions.map(s => ({
      id: s.id,
      device: s.device + (s.token === currentToken ? ' (Mevcut Oturum)' : ''),
      ip: s.ip,
      time: s.createdAt,
      isCurrent: s.token === currentToken
    }));

    res.json({ success: true, sessions: formattedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, message: 'Oturumlar getirilemedi.' });
  }
});

// SESSIONS - Terminate a session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = parseInt(req.params.id);

    // Verify session belongs to user
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Oturum bulunamadı' });
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Oturum başarıyla sonlandırıldı' });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({ success: false, message: 'Oturum sonlandırılamadı.' });
  }
});

// 2FA - Disable
router.post('/2fa/disable', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword } = req.body;
    const bcrypt = await import('bcrypt');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Verify password for security
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mevcut şifreniz yanlış.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null }
    });

    res.json({ success: true, message: 'İki Faktörlü Kimlik Doğrulama devre dışı bırakıldı.' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ success: false, message: '2FA devre dışı bırakılamadı.' });
  }
});

// Generate Invite Link
router.post('/invite', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' });

    const crypto = await import('crypto');
    const token = crypto.randomUUID();

    // Upsert so we can re-invite
    await prisma.userInvite.upsert({
      where: { email },
      update: { token, role, createdAt: new Date() },
      create: { email, token, role }
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ success: false, message: 'Davet oluşturulamadı' });
  }
});


// Delete user (optional but good to have)
router.delete('/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Sistemdeki son Admin silinemez.' });
      }
    }

    await prisma.user.delete({ where: { id } });

    // Explicit Audit Log for deletion
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'Kullanıcı Silindi',
        details: `${user.email} (ID: ${user.id}) sistemden silindi.`,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP'
      }
    });

    res.json({ success: true, message: 'Kullanıcı silindi.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Kullanıcı silinemedi' });
  }
});

// Update user role
router.put('/:id/role', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;

    if (!role) return res.status(400).json({ success: false, message: 'Role is required' });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });

    // Prevent removing the last ADMIN
    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Sistemdeki son Admin rolü değiştirilemez.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    // Explicit Audit Log for role change
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'Kullanıcı Rolü Değiştirildi',
        details: `${user.email} (ID: ${user.id}) kullanıcısının rolü '${user.role}' değerinden '${role}' değerine değiştirildi.`,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP'
      }
    });

    res.json({ success: true, message: 'Rol güncellendi', user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Rol güncellenemedi' });
  }
});

export default router;
