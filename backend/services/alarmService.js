import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const alarmStates = new Map(); // key: alarmId_serverId, value: { triggeredSince: timestamp, emailed: boolean }

// Helper to send email
const sendAlarmEmail = async (alarm, targetName, currentValue) => {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      console.error('[AlarmMailer] Cannot send email. System settings not found.');
      return;
    }

    if (!settings.smtpHost || !settings.smtpUser || (!settings.smtpPass && settings.authType === 'BASIC')) {
      if (settings.authType === 'BASIC') {
        console.error('[AlarmMailer] Cannot send email. SMTP settings are incomplete.');
        return;
      }
    }

    let authConfig = {};

    if (settings.authType === 'GOOGLE_OAUTH' || settings.authType === 'MICROSOFT_OAUTH') {
      if (!settings.oauthClientId || !settings.oauthClientSecret || !settings.oauthRefreshToken) {
        console.error('[AlarmMailer] Missing OAuth2 credentials in settings.');
        return;
      }
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
      from: `"OctopusAPM Alarms" <${settings.smtpUser}>`,
      to: alarm.actionTarget,
      subject: `ALARM TRIGGERED: ${alarm.name} - ${targetName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #ef4444;"> OctopusAPM Alarm Notification</h2>
          <p>An alarm configured in your system has been triggered.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Alarm Name:</td><td style="padding: 10px; border: 1px solid #ddd;">${alarm.name}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Target:</td><td style="padding: 10px; border: 1px solid #ddd;">${targetName}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Metric:</td><td style="padding: 10px; border: 1px solid #ddd;">${alarm.metric.toUpperCase()}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Current Value:</td><td style="padding: 10px; border: 1px solid #ddd; color: #ef4444;">${currentValue}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Violation Condition:</td><td style="padding: 10px; border: 1px solid #ddd;">${alarm.metric === 'status' ? 'DOWN' : `${alarm.operator} ${alarm.threshold}`} (Duration: ${alarm.durationSecs} sec)</td></tr>
          </table>
          <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[AlarmMailer] Email sent successfully to ${alarm.actionTarget}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('[AlarmMailer] Error sending email:', error);
  }
};

export const evaluateAlarms = async () => {
  try {
    const activeAlarms = await prisma.alarmRule.findMany({
      where: { isActive: true }
    });

    if (activeAlarms.length === 0) return;

    // Fetch latest metrics for all active servers
    const serverMetrics = await prisma.serverHealthMetric.findMany({
      include: { server: true }
    });

    // Fetch latest tomcat apps
    const tomcatApps = await prisma.tomcatApp.findMany();

    for (const alarm of activeAlarms) {
      if (alarm.targetType === 'SERVER') {
        const relevantMetrics = alarm.targetId
          ? serverMetrics.filter(m => m.serverId === alarm.targetId)
          : serverMetrics;

        for (const metric of relevantMetrics) {
          let currentValue = null;
          switch (alarm.metric) {
            case 'cpu': currentValue = metric.cpuUsagePercent; break;
            case 'ram': currentValue = metric.memUsagePercent; break;
            case 'disk': currentValue = metric.diskUsagePercent; break;
            case 'status':
              const isOffline = metric.server.status === 'offline' || (Date.now() - new Date(metric.recordedAt).getTime() > 60000);
              currentValue = isOffline ? 'DOWN' : 'UP';
              break;
            default: continue;
          }

          if (currentValue === null || currentValue === undefined) continue;

          let isTriggered = false;
          if (alarm.metric === 'status') {
            isTriggered = (currentValue === 'DOWN');
          } else {
            switch (alarm.operator) {
              case '>': isTriggered = currentValue > alarm.threshold; break;
              case '<': isTriggered = currentValue < alarm.threshold; break;
              case '==': isTriggered = currentValue === alarm.threshold; break;
            }
          }

          const stateKey = `${alarm.id}_SERVER_${metric.serverId}`;
          const state = alarmStates.get(stateKey) || { triggeredSince: null, lastEmailed: null };
          const targetName = metric.server ? metric.server.serverName : 'Bilinmeyen Sunucu';

          if (isTriggered) {
            if (!state.triggeredSince) {
              state.triggeredSince = Date.now();
            }

            const durationPassed = (Date.now() - state.triggeredSince) / 1000 >= alarm.durationSecs;
            const timeSinceLastEmail = state.lastEmailed ? (Date.now() - state.lastEmailed) / 1000 : Infinity;

            if (durationPassed && timeSinceLastEmail >= alarm.durationSecs) {
              console.log(`[ALARM TRIGGERED] ${alarm.name} on server ${targetName}. ${alarm.metric.toUpperCase()} is ${currentValue}`);

              if (alarm.action === 'EMAIL' && alarm.actionTarget) {
                // Background email sending
                sendAlarmEmail(alarm, targetName, currentValue);
              }

              state.lastEmailed = Date.now();
            }
          } else {
            // Reset state if threshold is no longer exceeded
            state.triggeredSince = null;
            state.lastEmailed = null;
          }

          alarmStates.set(stateKey, state);
        }
      } else if (alarm.targetType === 'TOMCAT') {
        const relevantTomcats = alarm.targetId
          ? tomcatApps.filter(t => t.id === alarm.targetId)
          : tomcatApps;

        for (const tomcat of relevantTomcats) {
          let currentValue = null;
          switch (alarm.metric) {
            case 'cpu': currentValue = tomcat.cpuPercent; break;
            case 'ram': currentValue = tomcat.rssMb; break;
            case 'status':
              const isTomcatOffline = tomcat.status === 'stopped' || tomcat.status === 'offline';
              currentValue = isTomcatOffline ? 'DOWN' : 'UP';
              break;
            default: continue;
          }

          if (currentValue === null || currentValue === undefined) continue;

          let isTriggered = false;
          if (alarm.metric === 'status') {
            isTriggered = (currentValue === 'DOWN');
          } else {
            switch (alarm.operator) {
              case '>': isTriggered = currentValue > alarm.threshold; break;
              case '<': isTriggered = currentValue < alarm.threshold; break;
              case '==': isTriggered = currentValue === alarm.threshold; break;
            }
          }

          const stateKey = `${alarm.id}_TOMCAT_${tomcat.id}`;
          const state = alarmStates.get(stateKey) || { triggeredSince: null, lastEmailed: null };
          const targetName = `Tomcat: ${tomcat.instanceName} (${tomcat.serverIp})`;

          if (isTriggered) {
            if (!state.triggeredSince) {
              state.triggeredSince = Date.now();
            }

            const durationPassed = (Date.now() - state.triggeredSince) / 1000 >= alarm.durationSecs;
            const timeSinceLastEmail = state.lastEmailed ? (Date.now() - state.lastEmailed) / 1000 : Infinity;

            if (durationPassed && timeSinceLastEmail >= alarm.durationSecs) {
              console.log(`[ALARM TRIGGERED] ${alarm.name} on ${targetName}. ${alarm.metric.toUpperCase()} is ${currentValue}`);

              if (alarm.action === 'EMAIL' && alarm.actionTarget) {
                // Background email sending
                sendAlarmEmail(alarm, targetName, currentValue);
              }

              state.lastEmailed = Date.now();
            }
          } else {
            // Reset state if threshold is no longer exceeded
            state.triggeredSince = null;
            state.lastEmailed = null;
          }

          alarmStates.set(stateKey, state);
        }
      }
    }
  } catch (error) {
    console.error('Error in alarm evaluation:', error);
  }
};

export const startAlarmService = () => {
  // Evaluate alarms every 1 second for instant triggers
  setInterval(evaluateAlarms, 1000);
  console.log('Alarm evaluation service started (Interval: 1s)');
};
