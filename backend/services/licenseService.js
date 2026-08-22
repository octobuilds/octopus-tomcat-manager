import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodeMachineId from 'node-machine-id';
const { machineIdSync } = nodeMachineId;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the public key (should be deployed with the app)
const publicKeyPath = path.join(__dirname, '../publicKey.pem');
let publicKey = '';
if (fs.existsSync(publicKeyPath)) {
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
}

let cachedLicense = null;
let cachedMachineId = null;

const getMachineId = () => {
  if (cachedMachineId) return cachedMachineId;
  try {
    // true = original string instead of hashed, but hashed is safer
    cachedMachineId = machineIdSync(false);
    return cachedMachineId;
  } catch (err) {
    console.error('Error getting machine ID', err);
    return 'UNKNOWN_MACHINE_ID';
  }
};

const verifyLicense = async (forceRefresh = false) => {
  if (cachedLicense && !forceRefresh) {
    // If it was already validated, we just check if it's expired in cache.
    // Actually, to be safe, let's re-check the expiration time.
    if (cachedLicense.isValid && cachedLicense.payload.exp * 1000 > Date.now()) {
      return cachedLicense;
    }
  }

  const settings = await prisma.systemSettings.findFirst();
  const licenseKey = settings?.licenseKey;
  const hwid = getMachineId();

  if (!licenseKey) {
    cachedLicense = { isValid: false, reason: 'NO_LICENSE', payload: null, machineId: hwid };
    return cachedLicense;
  }

  if (!publicKey) {
    console.error('CRITICAL: publicKey.pem is missing. Cannot verify license.');
    cachedLicense = { isValid: false, reason: 'SYSTEM_ERROR', payload: null, machineId: hwid };
    return cachedLicense;
  }

  try {
    const payload = jwt.verify(licenseKey, publicKey, { algorithms: ['RS256'] });
    
    // Check Machine ID
    if (payload.machineId !== hwid) {
      cachedLicense = { isValid: false, reason: 'MACHINE_ID_MISMATCH', payload, machineId: hwid };
      return cachedLicense;
    }

    cachedLicense = { isValid: true, reason: 'VALID', payload, machineId: hwid };
    return cachedLicense;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      cachedLicense = { isValid: false, reason: 'EXPIRED', payload: null, machineId: hwid };
    } else {
      cachedLicense = { isValid: false, reason: 'INVALID_SIGNATURE', payload: null, machineId: hwid };
    }
    return cachedLicense;
  }
};

const checkLimits = async () => {
  const license = await verifyLicense();
  if (!license.isValid) return { ok: false, reason: license.reason };

  const { maxServers, maxUsers, maxAlarms, notificationsEnabled } = license.payload;
  
  const serverCount = await prisma.server.count();
  const userCount = await prisma.user.count();
  const alarmCount = await prisma.alarmRule.count();

  const limits = {
    servers: { current: serverCount, max: maxServers },
    users: { current: userCount, max: maxUsers },
    alarms: { current: alarmCount, max: maxAlarms || 10 },
    notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true
  };

  return { ok: true, limits };
};

export {
  getMachineId,
  verifyLicense,
  checkLimits
};
