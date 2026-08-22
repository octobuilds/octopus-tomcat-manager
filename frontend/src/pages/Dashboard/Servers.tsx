import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Server, Terminal, Trash2, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Gerçek Veritabanı Modeli
interface ServerData {
  id: number;
  serverName: string;
  serverIp: string;
  environment: string;
  os?: string;
  team?: string;
  description?: string;
  isActive: boolean;
}

const Servers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<any>(null);
  
  // Edit Modal State
  const [editingServer, setEditingServer] = useState<ServerData | null>(null);
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('apm_user') || '{}');
  const canManageServers = currentUser.permissions?.canManageServers || currentUser.role === 'ADMIN';

  const fetchServers = () => {
    setLoading(true);
    fetch('/api/servers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setServers(data.servers);
      })
      .catch(err => console.error("Sunucular çekilirken hata oluştu:", err))
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
    fetchServers();
    fetchLimits();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Satıra tıklama olayını engelle
    if (!window.confirm('Bu sunucuyu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/servers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServers(servers.filter(s => s.id !== id));
        fetchLimits();
      } else {
        alert(data.message || 'Silinemedi');
      }
    } catch (err) {
      console.error(err);
      alert('Bağlantı hatası');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/servers/${editingServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverName: editingServer.serverName,
          environment: editingServer.environment,
          team: editingServer.team,
          description: editingServer.description
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingServer(null);
        fetchServers();
      } else {
        alert(data.message || 'Güncellenemedi');
      }
    } catch (err) {
      alert('Bağlantı hatası');
    } finally {
      setSaving(false);
    }
  };

  const filteredServers = servers.filter(s => 
    s.serverName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.serverIp?.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>{t('dashboard.servers.title')}</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('dashboard.servers.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder={t('dashboard.servers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', width: '300px', outline: 'none' }}
            />
          </div>
          
          {canManageServers && (
            <button 
              disabled={limits && limits.servers.current >= limits.servers.max}
              title={limits && limits.servers.current >= limits.servers.max ? `Lisans limitine ulaşıldı (Max: ${limits.servers.max})` : 'Yeni Sunucu Ekle'}
              onClick={() => navigate('/servers/new')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', background: (limits && limits.servers.current >= limits.servers.max) ? 'var(--bg-dark)' : 'var(--accent)', color: (limits && limits.servers.current >= limits.servers.max) ? 'var(--text-muted)' : '#fff', border: '1px solid ' + ((limits && limits.servers.current >= limits.servers.max) ? 'var(--border-color)' : 'transparent'), fontWeight: 500, cursor: (limits && limits.servers.current >= limits.servers.max) ? 'not-allowed' : 'pointer', boxShadow: (limits && limits.servers.current >= limits.servers.max) ? 'none' : '0 4px 14px var(--accent-glow)', opacity: (limits && limits.servers.current >= limits.servers.max) ? 0.5 : 1 }}>
              <Plus size={18} />
              {t('dashboard.servers.addServerBtn')}
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1.5fr 1fr 1.5fr 1fr 80px', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.875rem' }}>
          <div>{t('dashboard.servers.serverName')}</div>
          <div>{t('dashboard.servers.ipAddress')}</div>
          <div>{t('dashboard.servers.environment')}</div>
          <div>{t('dashboard.servers.os')}</div>
          <div>{t('dashboard.servers.team')}</div>
          <div>{t('dashboard.servers.description')}</div>
          <div>{t('dashboard.servers.status')}</div>
          <div style={{ textAlign: 'right' }}>{t('dashboard.servers.actions')}</div>
        </div>

        {/* Table Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</div>}
          
          {!loading && filteredServers.map((server) => (
            <div 
              key={server.id} 
              onClick={() => {
                if (canManageServers) {
                  setEditingServer(server);
                }
              }}
              style={{ 
                display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1.5fr 1fr 1.5fr 1fr 80px', 
                padding: '1rem 1.5rem', alignItems: 'center', 
                borderBottom: '1px solid var(--border-color)',
                cursor: canManageServers ? 'pointer' : 'default', transition: 'all 0.2s',
                background: 'transparent'
              }}
              onMouseOver={(e) => { if (canManageServers) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              title={canManageServers ? "Düzenlemek için tıkla" : ""}
            >
              {/* İsim & İkon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                  <Server size={18} />
                </div>
                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{server.serverName}</span>
              </div>
              
              {/* IP */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Terminal size={14} />
                {server.serverIp}
              </div>

              {/* Environment */}
              <div style={{ color: 'var(--text-muted)' }}>{server.environment}</div>
              
              {/* OS */}
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{server.os || '-'}</div>

              {/* Team */}
              <div style={{ color: 'var(--text-muted)' }}>{server.team || '-'}</div>

              {/* Description */}
              <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {server.description || '-'}
              </div>
              
              {/* Status */}
              <div>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem', 
                  background: server.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: server.isActive ? 'var(--success)' : 'var(--error)',
                  padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                  {server.isActive ? t('dashboard.servers.statusActive') : t('dashboard.servers.statusOffline')}
                </span>
              </div>
              
              {/* Actions */}
              <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                {canManageServers && (
                  <button 
                    onClick={(e) => handleDelete(e, server.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--error)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--error)'; }}
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {!loading && filteredServers.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Kriterlerinize uygun sunucu bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL - PREMIUM REDESIGN */}
      {editingServer && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Modal Container */}
          <div 
            style={{ 
              background: 'linear-gradient(145deg, var(--bg-card), var(--bg-dark))', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '24px', 
              width: '550px', 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease-out'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '1.5rem 2rem', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Server size={22} style={{ color: 'var(--accent)' }} /> {t('dashboard.servers.editModal.title')}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('dashboard.servers.editModal.subtitle')}</p>
              </div>
              <button 
                onClick={() => setEditingServer(null)} 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', 
                  cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' 
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--error)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* IP Field */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    <Terminal size={14} /> {t('dashboard.servers.editModal.ipAddress')}
                  </label>
                  <div style={{ 
                    width: '100%', padding: '0.875rem 1rem', background: 'rgba(0,0,0,0.2)', 
                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', 
                    color: 'var(--text-muted)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                    {editingServer.serverIp}
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{t('dashboard.servers.editModal.serverName')} <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input 
                    type="text" 
                    value={editingServer.serverName} 
                    onChange={e => setEditingServer({...editingServer, serverName: e.target.value})} 
                    required 
                    autoFocus
                    style={{ 
                      width: '100%', padding: '0.875rem 1rem', background: 'var(--input-bg)', 
                      border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)',
                      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', fontSize: '0.95rem'
                    }} 
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Env & Team Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{t('dashboard.servers.editModal.environment')}</label>
                    <input 
                      type="text" 
                      value={editingServer.environment || ''} 
                      onChange={e => setEditingServer({...editingServer, environment: e.target.value})} 
                      placeholder={t('dashboard.servers.editModal.envPlaceholder')}
                      style={{ 
                        width: '100%', padding: '0.875rem 1rem', background: 'var(--input-bg)', 
                        border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)',
                        outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                      }} 
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{t('dashboard.servers.editModal.team')}</label>
                    <input 
                      type="text" 
                      value={editingServer.team || ''} 
                      onChange={e => setEditingServer({...editingServer, team: e.target.value})} 
                      placeholder={t('dashboard.servers.editModal.teamPlaceholder')}
                      style={{ 
                        width: '100%', padding: '0.875rem 1rem', background: 'var(--input-bg)', 
                        border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)',
                        outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                      }} 
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{t('dashboard.servers.editModal.description')}</label>
                  <textarea 
                    value={editingServer.description || ''} 
                    onChange={e => setEditingServer({...editingServer, description: e.target.value})} 
                    rows={3} 
                    placeholder={t('dashboard.servers.editModal.descPlaceholder')}
                    style={{ 
                      width: '100%', padding: '0.875rem 1rem', background: 'var(--input-bg)', 
                      border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', 
                      resize: 'vertical', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                    }} 
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
                  />
                </div>
              </div>

              {/* Modal Footer (Actions) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingServer(null)} 
                  style={{ 
                    padding: '0.875rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', 
                    color: 'var(--text-main)', borderRadius: '12px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {t('dashboard.servers.editModal.cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', 
                    background: 'linear-gradient(to right, var(--accent), #2563eb)', color: '#fff', 
                    border: 'none', borderRadius: '12px', cursor: saving ? 'wait' : 'pointer', 
                    fontWeight: 500, transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 14px var(--accent-glow)'
                  }}
                  onMouseOver={(e) => { if(!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px var(--accent-glow)'; } }}
                  onMouseOut={(e) => { if(!saving) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px var(--accent-glow)'; } }}
                >
                  <Save size={18} />
                  {saving ? t('dashboard.servers.editModal.saving') : t('dashboard.servers.editModal.save')}
                </button>
              </div>

            </form>
          </div>
          
          {/* Keyframe animations support via internal style block */}
          <style>
            {`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}
          </style>
        </div>
      )}

    </div>
  );
};

export default Servers;
