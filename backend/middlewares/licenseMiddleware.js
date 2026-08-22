import { verifyLicense, checkLimits } from '../services/licenseService.js';

// This middleware checks if the license is valid.
const requireLicense = async (req, res, next) => {
  // Allow OPTIONS preflight
  if (req.method === 'OPTIONS') return next();

  // Validate license
  const license = await verifyLicense();
  
  const path = req.originalUrl || req.url;
  // Let settings routes for license pass through even if invalid
  if (path.includes('/api/settings/license') || path.includes('/api/settings/machine-id')) {
    req.license = license.payload;
    return next();
  }

  if (!license.isValid) {
    return res.status(402).json({
      success: false,
      isLicenseError: true, // Special flag for frontend to intercept
      message: 'Geçersiz veya süresi dolmuş lisans.',
      reason: license.reason,
      machineId: license.machineId
    });
  }

  // Attach license to request object just in case we need it
  req.license = license.payload;
  next();
};

const enforceLimits = async (req, res, next) => {
  if (req.method !== 'POST') return next();

  const limitsCheck = await checkLimits();
  if (!limitsCheck.ok) return next(); // Handled by requireLicense

  const path = req.originalUrl || req.url;
  
  if (path.includes('/api/servers')) {
    const { current, max } = limitsCheck.limits.servers;
    if (current >= max) {
      return res.status(403).json({ success: false, message: `Lisans limitine ulaştınız. Maksimum sunucu sayısı: ${max}` });
    }
  }

  if (path.includes('/api/users')) {
    const { current, max } = limitsCheck.limits.users;
    if (current >= max) {
      return res.status(403).json({ success: false, message: `Lisans limitine ulaştınız. Maksimum kullanıcı sayısı: ${max}` });
    }
  }

  if (path.includes('/api/alarms')) {
    const { current, max } = limitsCheck.limits.alarms;
    if (current >= max) {
      return res.status(403).json({ success: false, message: `Lisans limitine ulaştınız. Maksimum alarm sayısı: ${max}` });
    }
  }

  next();
};

export {
  requireLicense,
  enforceLimits
};
