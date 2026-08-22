import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token bulunamadı' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const session = await prisma.session.findUnique({
      where: { token: token }
    });

    if (!session || !session.isActive) {
      return res.status(401).json({ success: false, message: 'Oturum sonlandırılmış veya geçersiz' });
    }

    req.user = decoded;
    
    const roleDetails = await prisma.role.findUnique({
      where: { name: decoded.role }
    });
    
    req.user.permissions = roleDetails || {};
    next();
  } catch (error) {
    console.error('JWT verify error:', error.message);
    return res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user.permissions[permissionKey] === true) {
      next();
    } else {
      res.status(403).json({ success: false, message: `Bu işlem için yetkiniz yok (${permissionKey}).` });
    }
  };
};
