import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all alarms
router.get('/', async (req, res) => {
  try {
    const alarms = await prisma.alarmRule.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, alarms });
  } catch (error) {
    console.error('Error fetching alarms:', error);
    res.status(500).json({ success: false, message: 'Alarmlar getirilemedi' });
  }
});

// Create a new alarm
router.post('/', async (req, res) => {
  try {
    const { name, targetType, targetId, metric, operator, threshold, durationSecs, action, actionTarget, isActive } = req.body;
    
    if (!name || !metric || !operator || threshold === undefined) {
      return res.status(400).json({ success: false, message: 'Lütfen zorunlu alanları doldurun' });
    }

    const alarm = await prisma.alarmRule.create({
      data: {
        name,
        targetType: targetType || 'SERVER',
        targetId: targetId ? parseInt(targetId) : null,
        metric,
        operator,
        threshold: parseFloat(threshold),
        durationSecs: parseInt(durationSecs) || 0,
        action: action || 'EMAIL',
        actionTarget,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json({ success: true, alarm });
  } catch (error) {
    console.error('Error creating alarm:', error);
    res.status(500).json({ success: false, message: 'Alarm oluşturulamadı' });
  }
});

// Update an alarm
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetType, targetId, metric, operator, threshold, durationSecs, action, actionTarget, isActive } = req.body;
    
    const alarm = await prisma.alarmRule.update({
      where: { id: parseInt(id) },
      data: {
        name,
        targetType,
        targetId: targetId ? parseInt(targetId) : null,
        metric,
        operator,
        threshold: threshold !== undefined ? parseFloat(threshold) : undefined,
        durationSecs: durationSecs !== undefined ? parseInt(durationSecs) : undefined,
        action,
        actionTarget,
        isActive
      }
    });

    res.json({ success: true, alarm });
  } catch (error) {
    console.error('Error updating alarm:', error);
    res.status(500).json({ success: false, message: 'Alarm güncellenemedi' });
  }
});

// Delete an alarm
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.alarmRule.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: 'Alarm silindi' });
  } catch (error) {
    console.error('Error deleting alarm:', error);
    res.status(500).json({ success: false, message: 'Alarm silinemedi' });
  }
});

export default router;
