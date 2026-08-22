import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST: Save frontend action log
router.post('/', requireAuth, async (req, res) => {
  try {
    const { action, details } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: "Missing required fields (action)" });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userEmail: req.user.email,
        action,
        details,
        ip
      }
    });

    res.status(201).json(auditLog);
  } catch (error) {
    console.error("Error saving audit log:", error);
    res.status(500).json({ error: "Failed to save audit log" });
  }
});

// GET: Fetch audit logs
router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
