import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Server, Key, Lock, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddServer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password');
  
  const [serverName, setServerName] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [sshUser, setSshUser] = useState('root');
  const [rootPassword, setRootPassword] = useState('');
  const [sshKey, setSshKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'error' | 'warning', title: string, message: string, onClose?: () => void}>({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });

  const isValidIPOrHost = (address: string) => {
    // Eğer sadece rakam ve noktalardan oluşuyorsa, kesinlikle 4 kısımlı geçerli bir IP olmalıdır.
    if (/^[0-9.]+$/.test(address)) {
      const parts = address.split('.');
      if (parts.length !== 4) return false;
      return parts.every(p => {
        if (p === '') return false;
        const n = parseInt(p, 10);
        return n >= 0 && n <= 255;
      });
    }
    // Aksi halde geçerli bir domain/hostname formatında olmalıdır (harf, rakam, tire, nokta içerebilir).
    return /^[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidIPOrHost(serverIp)) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Bağlantı Hatası',
        message: 'Geçerli bir IP adresi veya Host adı (domain) giriniz.'
      });
      return;
    }

    setLoading(true);

    try {
      const payload: any = { serverName, serverIp, environment, sshUser };
      if (authMethod === 'password') payload.rootPassword = rootPassword;
      else payload.sshKey = sshKey;

      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (data.warning) {
          setModalConfig({
            isOpen: true,
            type: 'warning',
            title: 'Uyarı',
            message: data.message + '\n\nDetay: ' + data.warning,
            onClose: () => navigate('/servers')
          });
        } else {
          navigate('/servers');
        }
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Hata',
          message: data.message || 'Sunucu eklenirken bir hata oluştu.'
        });
      }
    } catch (err) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Bağlantı Hatası',
        message: 'Bağlantı hatası: Sunucuya ulaşılamadı. Lütfen ağınızı kontrol edin.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.addServer.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.addServer.subtitle')}</p>
      </div>

      {/* Form Container */}
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '16px', 
        padding: '2rem',
        backdropFilter: 'blur(12px)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Row 1: Name & IP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.addServer.form.serverName')}</label>
              <div style={{ position: 'relative' }}>
                <Server size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required 
                  placeholder="Örn: Prod Web Node 1"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.addServer.form.ipAddress')}</label>
              <div style={{ position: 'relative' }}>
                <Terminal size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required 
                  placeholder="192.168.1.50"
                  value={serverIp}
                  onChange={(e) => setServerIp(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

          {/* Row 2: Port & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.addServer.form.username')}</label>
              <input 
                type="text" 
                required 
                placeholder="root veya ubuntu"
                value={sshUser}
                onChange={(e) => setSshUser(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.addServer.form.port')}</label>
              <input 
                type="number" 
                required 
                defaultValue="22"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
          </div>

          {/* Auth Method Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.addServer.form.authMethod')}</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div 
                onClick={() => setAuthMethod('password')}
                style={{ 
                  flex: 1, padding: '1rem', borderRadius: '8px', border: `1px solid ${authMethod === 'password' ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: authMethod === 'password' ? 'rgba(37, 99, 235, 0.1)' : 'var(--input-bg)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                <Lock size={20} color={authMethod === 'password' ? 'var(--accent)' : 'var(--text-muted)'} />
                <span style={{ color: authMethod === 'password' ? 'var(--accent)' : 'var(--text-main)', fontWeight: 500 }}>{t('dashboard.addServer.form.authPassword')}</span>
              </div>
              <div 
                onClick={() => setAuthMethod('key')}
                style={{ 
                  flex: 1, padding: '1rem', borderRadius: '8px', border: `1px solid ${authMethod === 'key' ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: authMethod === 'key' ? 'rgba(37, 99, 235, 0.1)' : 'var(--input-bg)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                <Key size={20} color={authMethod === 'key' ? 'var(--accent)' : 'var(--text-muted)'} />
                <span style={{ color: authMethod === 'key' ? 'var(--accent)' : 'var(--text-main)', fontWeight: 500 }}>{t('dashboard.addServer.form.authKey')}</span>
              </div>
            </div>
          </div>

          {/* Auth Inputs */}
          {authMethod === 'password' ? (
             <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.addServer.form.password')}</label>
               <input 
                 type="password" 
                 required 
                 placeholder="••••••••"
                 value={rootPassword}
                 onChange={(e) => setRootPassword(e.target.value)}
                 style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
               />
             </div>
          ) : (
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.addServer.form.sshKey')}</label>
               <textarea 
                 required 
                 placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                 rows={5}
                 value={sshKey}
                 onChange={(e) => setSshKey(e.target.value)}
                 style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
               />
             </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button"
              onClick={() => navigate('/servers')}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'var(--text-main)', background: 'transparent', border: '1px solid var(--border-color)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {t('dashboard.addServer.form.cancelBtn')}
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#fff', background: 'var(--accent)', border: 'none', fontWeight: 500, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 14px var(--accent-glow)', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.background = 'var(--accent)')}
            >
              {loading ? 'Ekleniyor...' : t('dashboard.addServer.form.submitBtn')}
            </button>
          </div>

        </form>
      </div>

      {/* Custom Modal */}
      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90%', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: modalConfig.type === 'error' ? 'var(--error)' : '#F59E0B' }}>
              <div style={{ padding: '0.75rem', background: modalConfig.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}>
                <Terminal size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>{modalConfig.title}</h3>
            </div>
            <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              {modalConfig.type === 'error' ? (
                <>
                  <button 
                    onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                    onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    İptal
                  </button>
                  <button 
                    onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--error)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={e => e.currentTarget.style.filter = 'none'}
                  >
                    Tekrar Dene
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setModalConfig({ ...modalConfig, isOpen: false });
                    if (modalConfig.onClose) modalConfig.onClose();
                  }} 
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseOut={e => e.currentTarget.style.filter = 'none'}
                >
                  Tamam
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddServer;
