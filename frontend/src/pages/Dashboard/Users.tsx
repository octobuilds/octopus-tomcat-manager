import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MoreVertical, Search, Shield, Mail, X, Copy, Check } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Users: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editRole, setEditRole] = useState('');
  const [actionMenuUser, setActionMenuUser] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [limits, setLimits] = useState<any>(null);

  const currentUser = JSON.parse(localStorage.getItem('apm_user') || '{}');
  const canManageUsers = currentUser.permissions?.canManageUsers || currentUser.role === 'ADMIN';

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();
      if (data.success) {
        setInviteLink(`http://localhost:5173/#/invite/${data.token}`);
      } else {
        alert(data.message || 'Davet oluşturulamadı.');
      }
    } catch (error) {
      alert('Sunucuya ulaşılamadı.');
    }
    setLoading(false);
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editRole } : u));
        setEditingUser(null);
      } else {
        alert(data.message || 'Rol güncellenemedi.');
      }
    } catch (error) {
      alert('Sunucuya ulaşılamadı.');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
        fetchLimits();
      } else {
        alert(data.message || 'Silinemedi.');
      }
    } catch (e) {
      alert('Hata oluştu.');
    }
  };

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  };

  const fetchLimits = () => {
    fetch('/api/settings/limits')
      .then(res => res.json())
      .then(data => {
        if (data.success) setLimits(data.limits);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
    fetchLimits();

    fetch('/api/roles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRoles(data.roles);
          if (data.roles.length > 0) {
            setRole(data.roles.find((r:any) => r.name === 'USER')?.name || data.roles[0].name);
          }
        }
      })
      .catch(err => console.error("Roller çekilemedi:", err));

    fetch('/api/settings/limits')
      .then(res => res.json())
      .then(data => {
        if (data.success) setLimits(data.limits);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <>
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.users.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.users.subtitle')}</p>
        </div>
        {canManageUsers && (
          <button 
            disabled={limits && limits.users.current >= limits.users.max}
            title={limits && limits.users.current >= limits.users.max ? `Lisans limitine ulaşıldı (Max: ${limits.users.max})` : 'Kullanıcı Davet Et'}
            onClick={() => setShowModal(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: '8px', 
              color: (limits && limits.users.current >= limits.users.max) ? 'var(--text-muted)' : '#fff', 
              background: (limits && limits.users.current >= limits.users.max) ? 'var(--bg-dark)' : 'var(--accent)', 
              border: '1px solid ' + ((limits && limits.users.current >= limits.users.max) ? 'var(--border-color)' : 'transparent'), 
              fontWeight: 500, cursor: (limits && limits.users.current >= limits.users.max) ? 'not-allowed' : 'pointer', 
              boxShadow: (limits && limits.users.current >= limits.users.max) ? 'none' : '0 4px 14px var(--accent-glow)', 
              opacity: (limits && limits.users.current >= limits.users.max) ? 0.5 : 1,
              transition: 'all 0.2s' 
            }}
            onMouseOver={(e) => {
              if (!limits || limits.users.current < limits.users.max) e.currentTarget.style.background = 'var(--accent-hover)';
            }}
            onMouseOut={(e) => {
              if (!limits || limits.users.current < limits.users.max) e.currentTarget.style.background = 'var(--accent)';
            }}
          >
            <Plus size={18} />
            {t('dashboard.users.addBtn', 'Kullanıcı Davet Et')}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder={t('dashboard.users.searchPlaceholder')}
          style={{ 
            width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
            borderRadius: '8px', color: 'var(--text-main)', outline: 'none',
            backdropFilter: 'blur(12px)', transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
      </div>

      {/* Users List (Table-like Grid) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {users.map(user => (
          <div 
            key={user.id}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px',
              padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto',
              alignItems: 'center', gap: '1rem', transition: 'border-color 0.2s', backdropFilter: 'blur(12px)',
              position: 'relative', zIndex: actionMenuUser === user.id ? 10 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-glow)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            {/* Name & Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name || t('dashboard.users.unnamedUser')}</div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Mail size={16} /> {user.email}
            </div>

            {/* Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} color="var(--accent)" />
              <span style={{ color: 'var(--text-main)' }}>{user.role}</span>
            </div>

            {/* Status */}
            <div>
              <span style={{ 
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--success)'
              }}>
                {t('dashboard.users.statusActive')}
              </span>
            </div>

            {/* Actions */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setActionMenuUser(actionMenuUser === user.id ? null : user.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <MoreVertical size={20} />
              </button>

              {actionMenuUser === user.id && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 50, minWidth: '150px', overflow: 'hidden'
                }}>
                  {canManageUsers && (
                    <button 
                      onClick={() => {
                        setEditingUser(user);
                        setEditRole(user.role);
                        setActionMenuUser(null);
                      }}
                      style={{
                        display: 'block', width: '100%', padding: '0.75rem 1rem', textDecoration: 'none',
                        color: 'var(--text-main)', border: 'none', background: 'transparent', textAlign: 'left',
                        cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {t('dashboard.users.editRoleBtn')}
                    </button>
                  )}
                  {canManageUsers && user.role !== 'ADMIN' && (
                    <button 
                      onClick={() => {
                        handleDeleteUser(user.id);
                        setActionMenuUser(null);
                      }}
                      style={{
                        display: 'block', width: '100%', padding: '0.75rem 1rem', textDecoration: 'none',
                        color: 'var(--error)', border: 'none', background: 'transparent', textAlign: 'left',
                        cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {t('dashboard.users.deleteUserBtn')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

      {/* Invite Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)',
            width: '90%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>{t('dashboard.users.modal.inviteTitle')}</h2>
              <button onClick={() => {
                setShowModal(false);
                setInviteLink('');
                setEmail('');
                setCopied(false);
              }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {!inviteLink ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('dashboard.users.modal.emailLabel')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('dashboard.users.modal.emailPlaceholder')}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', color: 'var(--text-main)', outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('dashboard.users.modal.roleLabel')}</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleInvite}
                  disabled={loading || !email}
                  style={{
                    width: '100%', padding: '0.75rem', background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: '8px', fontWeight: 600, cursor: (loading || !email) ? 'not-allowed' : 'pointer', opacity: (loading || !email) ? 0.7 : 1
                  }}
                >
                  {loading ? t('dashboard.users.modal.invitingBtn') : t('dashboard.users.modal.inviteBtn')}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{t('dashboard.users.modal.successTitle')}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.users.modal.successDesc')}</p>
                </div>
                
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                  background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem'
                }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={inviteLink}
                    style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', padding: '0.5rem' }}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{
                      background: copied ? 'var(--success)' : 'var(--accent)', color: '#fff', border: 'none',
                      borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s'
                    }}
                  >
                    {copied ? <Check size={16}/> : <Copy size={16}/>}
                    {copied ? t('dashboard.users.modal.copied') : t('dashboard.users.modal.copy')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Edit Role Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)',
            width: '90%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>{t('dashboard.users.modal.editRoleTitle')}</h2>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: t('dashboard.users.modal.editRoleDesc', { name: editingUser.name || editingUser.email }) }} />
              
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('dashboard.users.modal.newRoleLabel')}</label>
              <select 
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', color: 'var(--text-main)', outline: 'none'
                }}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleUpdateRole}
              disabled={loading || editRole === editingUser.role}
              style={{
                width: '100%', padding: '0.75rem', background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '8px', fontWeight: 600, cursor: (loading || editRole === editingUser.role) ? 'not-allowed' : 'pointer', opacity: (loading || editRole === editingUser.role) ? 0.7 : 1
              }}
            >
              {loading ? t('dashboard.users.modal.savingBtn') : t('dashboard.users.modal.saveBtn')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
