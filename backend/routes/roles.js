import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'asc' }
    });
    // Add user count to each role
    const rolesWithUsers = await Promise.all(roles.map(async (role) => {
      const userCount = await prisma.user.count({
        where: { role: role.name }
      });
      return { ...role, usersCount: userCount };
    }));

    res.json({ success: true, roles: rolesWithUsers });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ success: false, message: 'Roller alınamadı' });
  }
});

// Create a new role
router.post('/', requirePermission('canManageRoles'), async (req, res) => {
  try {
    const { name, description, canViewLogs, canViewCharts, canStartStopApps, canEditApps, canManageUsers, canManageRoles, canManageServers } = req.body;
    
    if (!name) return res.status(400).json({ success: false, message: 'Rol adı zorunludur' });

    const existingRole = await prisma.role.findUnique({ where: { name } });
    if (existingRole) return res.status(400).json({ success: false, message: 'Bu isimde bir rol zaten mevcut' });

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        canViewLogs: !!canViewLogs,
        canViewCharts: !!canViewCharts,
        canStartStopApps: !!canStartStopApps,
        canEditApps: !!canEditApps,
        canManageUsers: !!canManageUsers,
        canManageRoles: !!canManageRoles,
        canManageServers: !!canManageServers
      }
    });

    res.json({ success: true, role: newRole });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ success: false, message: 'Rol oluşturulamadı' });
  }
});

// Update a role
router.put('/:id', requirePermission('canManageRoles'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, canViewLogs, canViewCharts, canStartStopApps, canEditApps, canManageUsers, canManageRoles, canManageServers } = req.body;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ success: false, message: 'Rol bulunamadı' });

    // Ensure ADMIN role name cannot be changed or its permissions cannot be removed
    if (role.name === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'ADMIN rolü düzenlenemez' });
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        canViewLogs: !!canViewLogs,
        canViewCharts: !!canViewCharts,
        canStartStopApps: !!canStartStopApps,
        canEditApps: !!canEditApps,
        canManageUsers: !!canManageUsers,
        canManageRoles: !!canManageRoles,
        canManageServers: !!canManageServers
      }
    });

    res.json({ success: true, role: updatedRole });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, message: 'Rol güncellenemedi' });
  }
});

// Delete a role
router.delete('/:id', requirePermission('canManageRoles'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ success: false, message: 'Rol bulunamadı' });

    if (role.name === 'ADMIN' || role.name === 'USER') {
      return res.status(403).json({ success: false, message: 'Sistem rolleri (ADMIN/USER) silinemez' });
    }

    const userCount = await prisma.user.count({ where: { role: role.name } });
    if (userCount > 0) {
      return res.status(400).json({ success: false, message: 'Bu role atanmış kullanıcılar var. Önce onların rollerini değiştirin.' });
    }

    await prisma.role.delete({ where: { id } });
    res.json({ success: true, message: 'Rol başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ success: false, message: 'Rol silinemedi' });
  }
});

export default router;
