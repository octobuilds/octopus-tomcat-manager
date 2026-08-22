import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre' });
    }

    // Get client info
    const device = req.headers['user-agent'] || 'Bilinmeyen Cihaz';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Bilinmeyen IP';

    if (user.isFirstLogin) {
      const tempToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, isTemp: true, requirePasswordChange: true },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'İlk Giriş Bekleniyor',
          details: 'Kullanıcının ilk girişte şifresini değiştirmesi bekleniyor.',
          ip
        }
      });

      return res.json({
        success: true,
        requirePasswordChange: true,
        tempToken,
        message: 'Güvenliğiniz için lütfen yeni bir şifre belirleyin.'
      });
    }

    if (user.isTwoFactorEnabled) {
      // Create a temporary token for 2FA step
      const tempToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, isTemp: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: '2FA Bekleniyor',
          details: 'Kullanıcı giriş yaptı, 2FA kodunu girmesi bekleniyor.',
          ip
        }
      });
      
      return res.json({
        success: true,
        require2FA: true,
        tempToken,
        message: 'Lütfen 2FA kodunuzu girin.'
      });
    }

    // Fetch the role and permissions
    const roleDetails = await prisma.role.findUnique({
      where: { name: user.role }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: token,
        device: device,
        ip: ip
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'Sisteme Giriş Yapıldı',
        details: 'Başarılı giriş yapıldı (Parola ile).',
        ip: ip
      }
    });

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token, // Return token
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: roleDetails || {
          canViewLogs: false,
          canViewCharts: false,
          canStartStopApps: false,
          canEditApps: false,
          canManageUsers: false,
          canManageRoles: false,
          canManageServers: false
        }
      }
    });

  } catch (error) {
    console.error("Login hatası:", error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

router.post('/verify-2fa', async (req, res) => {
  const { tempToken, code } = req.body;

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.isTemp) {
      return res.status(400).json({ success: false, message: 'Geçersiz token türü.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isTwoFactorEnabled) {
      return res.status(400).json({ success: false, message: 'Kullanıcı veya 2FA bulunamadı.' });
    }

    const speakeasy = await import('speakeasy');
    const isValid = speakeasy.default.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 4
    });

    if (!isValid) {
      console.log('2FA Hatalı Kod! user ID:', user.id, 'Gönderilen kod:', code, 'Beklenen secret:', user.twoFactorSecret);
      return res.status(400).json({ success: false, message: 'Girdiğiniz 2FA kodu hatalı.' });
    }

    // Generate FINAL JWT token
    const roleDetails = await prisma.role.findUnique({
      where: { name: user.role }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get client info
    const device = req.headers['user-agent'] || 'Bilinmeyen Cihaz';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Bilinmeyen IP';

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: token,
        device: device,
        ip: ip
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'Sisteme Giriş Yapıldı',
        details: 'Başarılı giriş yapıldı (2FA Doğrulaması ile).',
        ip: ip
      }
    });

    res.json({
      success: true,
      message: '2FA doğrulandı, giriş başarılı.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: roleDetails || {
          canViewLogs: false,
          canViewCharts: false,
          canStartStopApps: false,
          canEditApps: false,
          canManageUsers: false,
          canManageRoles: false,
          canManageServers: false
        }
      }
    });
  } catch (error) {
    console.error('Verify 2FA hatası:', error);
    res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
  }
});

router.post('/first-login-change', async (req, res) => {
  const { tempToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.isTemp || !decoded.requirePasswordChange) {
      return res.status(400).json({ success: false, message: 'Geçersiz istek.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Şifreniz en az 6 karakter olmalıdır.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, isFirstLogin: false }
    });

    if (user.isTwoFactorEnabled) {
      const newTempToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, isTemp: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({
        success: true,
        require2FA: true,
        tempToken: newTempToken,
        message: 'Şifreniz güncellendi. Lütfen 2FA kodunuzu girin.'
      });
    }

    const roleDetails = await prisma.role.findUnique({
      where: { name: user.role }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const device = req.headers['user-agent'] || 'Bilinmeyen Cihaz';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Bilinmeyen IP';

    await prisma.session.create({
      data: { userId: user.id, token: token, device: device, ip: ip }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'Sisteme Giriş Yapıldı',
        details: 'İlk giriş şifre değiştirme tamamlandı.',
        ip: ip
      }
    });

    res.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi ve giriş yapıldı.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: roleDetails || {
          canViewLogs: false, canViewCharts: false, canStartStopApps: false, canEditApps: false, canManageUsers: false, canManageRoles: false, canManageServers: false
        }
      }
    });
  } catch (error) {
    console.error('first-login-change hatası:', error);
    res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
  }
});

// Get invite by token
router.get('/invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await prisma.userInvite.findUnique({ where: { token } });
    if (!invite) return res.status(404).json({ success: false, message: 'Geçersiz veya süresi dolmuş davet linki.' });
    
    res.json({ success: true, email: invite.email, role: invite.role });
  } catch (error) {
    console.error('Error fetching invite:', error);
    res.status(500).json({ success: false, message: 'Davet bilgisi alınamadı' });
  }
});

router.post('/accept-invite', async (req, res) => {
  const { token, name, password } = req.body;

  try {
    const invite = await prisma.userInvite.findUnique({ where: { token } });
    if (!invite) return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş davet linki.' });

    const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Bu kullanıcı zaten kayıtlı.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: invite.email,
        name,
        password: hashedPassword,
        role: invite.role
      }
    });

    await prisma.userInvite.delete({ where: { token } });

    res.json({ success: true, message: 'Kayıt başarılı, giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('Accept invite hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Lütfen e-posta adresinizi girin.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, don't reveal if user exists, just return success anyway
      return res.json({ success: true, message: 'E-posta adresinize sıfırlama bağlantısı gönderildi.' });
    }

    // Load dynamic import for UUID
    const crypto = await import('crypto');
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Clean up any old reset tokens for this email
    await prisma.passwordReset.deleteMany({ where: { email } }).catch(() => {});

    await prisma.passwordReset.create({
      data: {
        email,
        token,
        expiresAt
      }
    });

    const resetLink = `http://localhost:5173/#/reset-password/${token}`;
    
    // Import and send email
    const { sendEmail } = await import('../services/emailService.js');
    const emailSent = await sendEmail({
      to: email,
      subject: 'OctopusAPM - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Password Reset Request</h2>
          <p>You have requested a password reset for your OctopusAPM account.</p>
          <p>Click the link below to set a new password. This link is valid for 1 hour.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    if (emailSent) {
      return res.json({ success: true, message: 'E-posta adresinize sıfırlama bağlantısı gönderildi.' });
    } else {
      return res.status(500).json({ success: false, message: 'SMTP ayarları hatalı veya mail gönderilemedi.' });
    }

  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token ve yeni şifre gereklidir.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Şifreniz en az 6 karakter olmalıdır.' });
  }

  try {
    const resetRecord = await prisma.passwordReset.findUnique({ where: { token } });
    
    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Geçersiz veya kullanılmış şifre sıfırlama bağlantısı.' });
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordReset.delete({ where: { token } });
      return res.status(400).json({ success: false, message: 'Şifre sıfırlama bağlantısının süresi dolmuş.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword }
    });

    // Delete token
    await prisma.passwordReset.delete({ where: { token } });

    res.json({ success: true, message: 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
  }
});

export default router;
