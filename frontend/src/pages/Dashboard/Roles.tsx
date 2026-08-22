import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Shield, MoreVertical, X, Check, Trash } from 'lucide-react';

interface RoleData {
  id: number;
  name: string;
  description: string;
  canViewLogs: boolean;
  canViewCharts: boolean;
  canStartStopApps: boolean;
  canEditApps: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageServers: boolean;
  usersCount?: number;
}

const Roles: React.FC = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState({
    canViewLogs: false,
    canViewCharts: false,
    canStartStopApps: false,
    canEditApps: false,
    canManageUsers: false,
    canManageRoles: false,
    canManageServers: false
  });

  const fetchRoles = () => {
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRoles(data.roles);
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role?: RoleData) => {
    if (role) {
      setEditingRole(role);
      setName(role.name);
      setDescription(role.description || '');
      setPermissions({
        canViewLogs: role.canViewLogs,
        canViewCharts: role.canViewCharts,
        canStartStopApps: role.canStartStopApps,
        canEditApps: role.canEditApps,
        canManageUsers: role.canManageUsers,
        canManageRoles: role.canManageRoles,
        canManageServers: role.canManageServers || false
      });
    } else {
      setEditingRole(null);
      setName('');
      setDescription('');
      setPermissions({
        canViewLogs: false,
        canViewCharts: false,
        canStartStopApps: false,
        canEditApps: false,
        canManageUsers: false,
        canManageRoles: false,
        canManageServers: false
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name) return;
    const isEdit = !!editingRole;
    const url = isEdit ? `/api/roles/${editingRole.id}` : `/api/roles`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, ...permissions })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchRoles();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Sunucu hatası');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu rolü silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchRoles();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Sunucu hatası');
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('apm_user') || '{}');
  const canManageRoles = currentUser.permissions?.canManageRoles || currentUser.role === 'ADMIN';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.roles.title', 'Roller')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.roles.subtitle', 'Sistemdeki kullanıcı yetkilerini yönetin.')}</p>
        </div>
        {canManageRoles && (
          <button 
            onClick={() => handleOpenModal()}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: '8px', 
              color: '#fff', background: 'var(--accent)', border: 'none', 
              fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 14px var(--accent-glow)', 
              transition: 'all 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <Plus size={18} />
            {t('dashboard.roles.addBtn', 'Yeni Rol Ekle')}
          </button>
        )}
      </div>

      {/* Grid of Roles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {roles.map(role => (
          <div 
            key={role.id}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px',
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              transition: 'all 0.2s ease', backdropFilter: 'blur(12px)'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-glow)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={24} color={role.name === 'ADMIN' ? 'var(--error)' : 'var(--accent)'} />
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>{role.name}</h3>
              </div>
              
              {canManageRoles && role.name !== 'ADMIN' && (
                <button 
                  onClick={() => handleDelete(role.id)}
                  title="Rolü Sil"
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.7 }}
                  onMouseOver={e => e.currentTarget.style.opacity = '1'}
                  onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, margin: 0 }}>
              {role.description || t('dashboard.roles.noDescription')}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>{role.usersCount || 0}</strong> {t('dashboard.roles.usersCount')}
              </span>
              {canManageRoles && (
                <span 
                  onClick={() => handleOpenModal(role)}
                  style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('dashboard.roles.editBtn')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)',
            width: '90%', maxWidth: '600px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {editingRole ? t('dashboard.roles.modal.editTitle', { name: editingRole.name }) : t('dashboard.roles.modal.addTitle')}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.roles.modal.roleName')}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={editingRole?.name === 'ADMIN'}
                  placeholder={t('dashboard.roles.modal.roleNamePlaceholder')}
                  style={{
                    width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '8px', color: 'var(--text-main)', outline: 'none',
                    opacity: editingRole?.name === 'ADMIN' ? 0.5 : 1
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.roles.modal.description')}</label>
                <textarea 
                  value={description}
                  placeholder={t('dashboard.roles.modal.descPlaceholder')}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '8px', color: 'var(--text-main)', outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '1.1rem' }}>{t('dashboard.roles.modal.permissions')}</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { key: 'canViewLogs', label: t('dashboard.roles.modal.canViewLogs') },
                    { key: 'canViewCharts', label: t('dashboard.roles.modal.canViewCharts') },
                    { key: 'canStartStopApps', label: t('dashboard.roles.modal.canStartStopApps') },
                    { key: 'canEditApps', label: t('dashboard.roles.modal.canEditApps') },
                    { key: 'canManageUsers', label: t('dashboard.roles.modal.canManageUsers') },
                    { key: 'canManageRoles', label: t('dashboard.roles.modal.canManageRoles') },
                    { key: 'canManageServers', label: t('dashboard.roles.modal.canManageServers') },
                  ].map(perm => (
                    <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <div 
                        onClick={() => {
                          if (editingRole?.name === 'ADMIN') return;
                          setPermissions(prev => ({ ...prev, [perm.key]: !prev[perm.key as keyof typeof permissions] }));
                        }}
                        style={{
                          width: '24px', height: '24px', borderRadius: '6px', border: '2px solid var(--accent)',
                          background: permissions[perm.key as keyof typeof permissions] ? 'var(--accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                          opacity: editingRole?.name === 'ADMIN' ? 0.5 : 1
                        }}
                      >
                        {permissions[perm.key as keyof typeof permissions] && <Check size={16} color="#fff" />}
                      </div>
                      <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={!name}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem 2rem',
                borderRadius: '8px', fontWeight: 500, cursor: name ? 'pointer' : 'not-allowed',
                boxShadow: name ? '0 4px 14px var(--accent-glow)' : 'none', opacity: name ? 1 : 0.5
              }}
            >
              {t('dashboard.roles.modal.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
