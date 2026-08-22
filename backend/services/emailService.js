import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sends an email using the SMTP settings configured in the system.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body of the email
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings || !settings.smtpHost || !settings.smtpUser) {
      console.warn('System Settings for SMTP are not fully configured.');
      return false;
    }

    let authConfig;
    if (settings.authType === 'GOOGLE_OAUTH' || settings.authType === 'MICROSOFT_OAUTH') {
      authConfig = {
        type: 'OAuth2',
        user: settings.smtpUser,
        clientId: settings.oauthClientId,
        clientSecret: settings.oauthClientSecret,
        refreshToken: settings.oauthRefreshToken
      };
    } else {
      authConfig = {
        user: settings.smtpUser,
        pass: settings.smtpPass
      };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: authConfig
    });

    const mailOptions = {
      from: `"OctopusAPM" <${settings.smtpUser}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
