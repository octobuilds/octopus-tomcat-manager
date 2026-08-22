import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This middleware logs all data-modifying requests automatically
export const auditMiddleware = async (req, res, next) => {
  // We only want to log POST, PUT, DELETE, PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Intercept the response so we can know if it succeeded
    const originalSend = res.json;
    
    res.json = function (body) {
      res.json = originalSend;
      
      // We only log if the user was authenticated (req.user exists)
      // and if it's not the /api/audit endpoint itself (to prevent infinite loops)
      if (req.user && !req.originalUrl.includes('/api/audit') && !req.originalUrl.includes('/api/auth/login') && !req.originalUrl.includes('/api/auth/verify-2fa')) {
        
        // Define action name based on method and URL
        let action = `${req.method} ${req.originalUrl}`;
        let details = '';

        if (req.method === 'POST') action = `Sistem Tetiklemesi (POST)`;
        if (req.method === 'PUT' || req.method === 'PATCH') action = `Veri Güncelleme (PUT)`;
        if (req.method === 'DELETE') action = `Kayıt Silme (DELETE)`;
        
        // Include body payload in details (excluding passwords)
        const safeBody = { ...req.body };
        if (safeBody.password) safeBody.password = '***';
        if (safeBody.currentPassword) safeBody.currentPassword = '***';
        if (safeBody.token) safeBody.token = '***';
        
        details = `API: ${req.originalUrl}\nİşlem Verisi: ${JSON.stringify(safeBody)}\nSonuç: ${res.statusCode} ${body?.success === false ? '(Başarısız)' : '(Başarılı)'}`;
        
        // Save async
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            userEmail: req.user.email,
            action,
            details,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP'
          }
        }).catch(err => console.error("Auto-audit failed:", err));
      }
      
      return originalSend.call(this, body);
    };
  }
  
  next();
};
