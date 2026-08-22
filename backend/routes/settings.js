import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get SMTP Settings
router.get('/smtp', async (req, res) => {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: 1 }
      });
    }

    // Don't send the password back to the frontend for security reasons,
    // but the frontend will know if a password is set by seeing a masked value or just empty.
    res.json({
      success: true,
      settings: {
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || '',
        smtpUser: settings.smtpUser || '',
        smtpPass: settings.smtpPass ? '********' : '', // Masked password
        authType: settings.authType || 'BASIC'
      }
    });
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    res.status(500).json({ success: false, message: 'Ayarlar getirilemedi' });
  }
});

// Update SMTP Settings
router.post('/smtp', async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, oauthClientId, oauthClientSecret } = req.body;
    
    // Only update the password if a new one is provided (i.e., not masked)
    const updateData = {
      smtpHost,
      smtpPort: smtpPort ? parseInt(smtpPort) : null,
      smtpUser,
      oauthClientId,
      oauthClientSecret: oauthClientSecret && oauthClientSecret !== '********' ? oauthClientSecret : undefined
    };

    if (smtpPass && smtpPass !== '********') {
      updateData.smtpPass = smtpPass;
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        ...updateData
      }
    });

    res.json({ success: true, message: 'SMTP ayarları başarıyla kaydedildi' });
  } catch (error) {
    console.error('Error updating SMTP settings:', error);
    res.status(500).json({ success: false, message: 'Ayarlar kaydedilemedi' });
  }
});

import { OAuth2Client } from 'google-auth-library';
import { ConfidentialClientApplication } from '@azure/msal-node';

// --- GOOGLE OAUTH ---
router.get('/auth/google', async (req, res) => {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  const clientId = settings?.oauthClientId;
  const clientSecret = settings?.oauthClientSecret;
  const redirectUrl = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/settings/auth/google/callback';

  if (!clientId || !clientSecret) {
    return res.status(400).send('Google Client ID veya Secret veritabanında bulunamadı. Lütfen önce ayarlar sayfasından girip Kaydet butonuna basın.');
  }

  const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // refresh token almak için şart
    scope: ['https://mail.google.com/', 'email'],
    prompt: 'consent' // her seferinde refresh token garantilemek için
  });

  res.redirect(authorizeUrl);
});

router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  const clientId = settings?.oauthClientId;
  const clientSecret = settings?.oauthClientSecret;
  const redirectUrl = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/settings/auth/google/callback';

  if (!clientId || !clientSecret) return res.status(400).send('API Anahtarı eksik.');

  try {
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    // Extract email from userinfo endpoint
    const response = await oAuth2Client.request({ url: 'https://www.googleapis.com/oauth2/v2/userinfo' });
    const userEmail = response.data.email;
    
    // Refresh token'ı veritabanına kaydet
    await prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        authType: 'GOOGLE_OAUTH',
        oauthRefreshToken: tokens.refresh_token || undefined, // Eğer daha önceden alınmışsa gelmeyebilir
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        smtpUser: userEmail
      }
    });

    res.send('<script>window.close();</script><h2>Google ile Başarıyla Bağlanıldı. Bu pencereyi kapatabilirsiniz.</h2>');
  } catch (e) {
    console.error('Google OAuth Hatası:', e);
    res.status(500).send('Google bağlantısı başarısız oldu.');
  }
});

// --- MICROSOFT OAUTH ---
router.get('/auth/microsoft', async (req, res) => {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  const clientId = settings?.oauthClientId;
  const clientSecret = settings?.oauthClientSecret;
  const redirectUri = process.env.MS_REDIRECT_URI || 'http://localhost:5000/api/settings/auth/microsoft/callback';

  if (!clientId || !clientSecret) {
    return res.status(400).send('Microsoft Client ID veya Secret veritabanında bulunamadı. Lütfen önce ayarlar sayfasından girip Kaydet butonuna basın.');
  }

  const cca = new ConfidentialClientApplication({
    auth: { clientId, clientSecret, authority: 'https://login.microsoftonline.com/common' }
  });

  const authCodeUrlParameters = {
    scopes: ['offline_access', 'https://outlook.office.com/SMTP.Send', 'User.Read'],
    redirectUri: redirectUri,
    prompt: 'select_account'
  };

  try {
    const response = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(response);
  } catch (e) {
    console.error('Microsoft Auth URL Error:', e);
    res.status(500).send('URL oluşturulamadı');
  }
});

router.get('/auth/microsoft/callback', async (req, res) => {
  const { code } = req.query;
  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  const clientId = settings?.oauthClientId;
  const clientSecret = settings?.oauthClientSecret;
  const redirectUri = process.env.MS_REDIRECT_URI || 'http://localhost:5000/api/settings/auth/microsoft/callback';

  if (!clientId || !clientSecret) return res.status(400).send('API Anahtarı eksik.');

  const cca = new ConfidentialClientApplication({
    auth: { clientId, clientSecret, authority: 'https://login.microsoftonline.com/common' }
  });

  const tokenRequest = {
    code: code,
    scopes: ['offline_access', 'https://outlook.office.com/SMTP.Send', 'User.Read'],
    redirectUri: redirectUri
  };

  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    const userEmail = response.account ? response.account.username : undefined;
    
    await prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        authType: 'MICROSOFT_OAUTH',
        oauthRefreshToken: response.refreshToken || undefined,
        smtpHost: 'smtp-mail.outlook.com',
        smtpPort: 587,
        smtpUser: userEmail
      }
    });

    res.send('<script>window.close();</script><h2>Microsoft ile Başarıyla Bağlanıldı. Bu pencereyi kapatabilirsiniz.</h2>');
  } catch (error) {
    console.error('Error handling Microsoft OAuth callback:', error);
    res.status(500).send('OAuth callback sırasında bir hata oluştu: ' + error.message);
  }
});

// --- LICENSE ---
import { getMachineId, verifyLicense, checkLimits } from '../services/licenseService.js';

router.get('/limits', async (req, res) => {
  const limitsCheck = await checkLimits();
  if (!limitsCheck.ok) return res.json({ success: false, message: limitsCheck.reason });
  res.json({ success: true, limits: limitsCheck.limits });
});

router.get('/machine-id', (req, res) => {
  res.json({ success: true, machineId: getMachineId() });
});

router.get('/license', async (req, res) => {
  const license = await verifyLicense(true);
  res.json({ success: true, license });
});

router.post('/license', async (req, res) => {
  const { licenseKey } = req.body;
  if (!licenseKey) return res.status(400).json({ success: false, message: 'Lisans anahtarı boş olamaz.' });

  try {
    await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: { licenseKey },
      create: { id: 1, licenseKey }
    });

    const license = await verifyLicense(true);
    if (!license.isValid) {
      // Revert if invalid (optional, but let's keep it so they can see it's invalid)
      return res.json({ success: false, message: 'Geçersiz Lisans: ' + license.reason, license });
    }

    res.json({ success: true, message: 'Lisans başarıyla kaydedildi!', license });
  } catch (error) {
    console.error('Error saving license:', error);
    res.status(500).json({ success: false, message: 'Lisans kaydedilemedi.' });
  }
});

export default router;
