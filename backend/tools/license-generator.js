import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(__dirname, '../privateKey.pem');
if (!fs.existsSync(privateKeyPath)) {
  console.error("Private key not found!");
  process.exit(1);
}
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

const generateLicense = ({ machineId, maxUsers, maxServers, maxApps, expireDays }) => {
  const payload = {
    machineId, // the hardware lock
    maxUsers,
    maxServers,
    maxApps
  };
  
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: expireDays + 'd',
    issuer: 'OctopusAPM'
  });
  
  return token;
};

// Simple CLI wrapper
const args = process.argv.slice(2);
if (args.length < 5) {
  console.log("Usage: node license-generator.js <machineId> <maxUsers> <maxServers> <maxApps> <expireDays>");
  process.exit(1);
}

const [machineId, maxUsers, maxServers, maxApps, expireDays] = args;
const licenseKey = generateLicense({
  machineId,
  maxUsers: parseInt(maxUsers, 10),
  maxServers: parseInt(maxServers, 10),
  maxApps: parseInt(maxApps, 10),
  expireDays: parseInt(expireDays, 10)
});

console.log("=====================");
console.log("LICENSE KEY GENERATED");
console.log("=====================");
console.log(licenseKey);
