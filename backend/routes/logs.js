import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get logs with filtering
router.get('/', async (req, res) => {
  try {
    const { level, search, projectId, limit = 100 } = req.query;

    const where = {};
    if (level) {
      where.level = level;
    }
    if (projectId) {
      where.projectId = parseInt(projectId);
    }
    if (search) {
      where.message = {
        contains: search,
        mode: 'insensitive' // PostgreSQL'de büyük/küçük harf duyarsız arama
      };
    }

    const logs = await prisma.logEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Ingest a new log
router.post('/', async (req, res) => {
  try {
    const { projectId, level, message, metaData } = req.body;

    if (!projectId || !level || !message) {
      return res.status(400).json({ error: "Missing required fields (projectId, level, message)" });
    }

    const newLog = await prisma.logEvent.create({
      data: {
        projectId,
        level,
        message,
        metaData: metaData || {}
      }
    });

    res.status(201).json(newLog);
  } catch (error) {
    console.error("Error saving log:", error);
    res.status(500).json({ error: "Failed to save log" });
  }
});

export default router;
