import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const sshDir = path.join(process.cwd(), '.ssh');
const privKeyPath = path.join(sshDir, 'id_ed25519');
const pubKeyPath = path.join(sshDir, 'id_ed25519.pub');

/**
 * Returns the APM backend's ED25519 public and private keys.
 * Generates them if they do not exist.
 */
export function getOrGenerateSSHKeys() {
  if (!fs.existsSync(sshDir)) {
    fs.mkdirSync(sshDir, { recursive: true });
  }

  if (!fs.existsSync(privKeyPath) || !fs.existsSync(pubKeyPath)) {
    console.log('SSH keys not found. Generating new ED25519 keypair (Rocky/RHEL 9 compatible)...');
    try {
      execSync(`ssh-keygen -t ed25519 -f "${privKeyPath}" -N "" -q`);
      console.log('SSH keypair generated successfully at', sshDir);
    } catch (error) {
      console.error('Failed to generate SSH keys:', error);
      throw error;
    }
  }

  return {
    privateKey: fs.readFileSync(privKeyPath, 'utf8'),
    publicKey: fs.readFileSync(pubKeyPath, 'utf8')
  };
}

/**
 * Constructs the bash script to setup the 'octopus' user with passwordless sudo.
 * Reads the script from backend/scripts/setup_octopus.sh and injects the pubkey.
 */
export function getOctopusSetupScript(publicKey) {
  const scriptPath = path.join(process.cwd(), 'scripts', 'setup_octopus.sh');
  try {
    const scriptContent = fs.readFileSync(scriptPath, 'utf8').replace(/\r/g, '');
    const cleanKey = publicKey.replace(/\r?\n|\r/g, '').trim();
    return scriptContent.replace('{{PUB_KEY}}', cleanKey);
  } catch (error) {
    console.error('Failed to read setup_octopus.sh:', error);
    throw new Error('Kurulum betiği okunamadı.');
  }
}
