import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Bell, Shield, Globe, Monitor, Clock, Mail, Key } from 'lucide-react';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [authType, setAuthType] = useState('BASIC');
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isOAuthSetupOpen, setIsOAuthSetupOpen] = useState(false);
  
  // 2FA States
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaSetupSecret, setTwoFaSetupSecret] = useState('');

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);


  const currentUser = JSON.parse(localStorage.getItem('apm_user') || '{}');
  const isAdmin = currentUser.role === 'ADMIN';

  const fetchSmtpSettings = () => {
    fetch('/api/settings/smtp')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSmtpHost(data.settings.smtpHost || '');
          setSmtpPort(data.settings.smtpPort ? data.settings.smtpPort.toString() : '');
          setSmtpUser(data.settings.smtpUser || '');
          setSmtpPass(data.settings.smtpPass || '');
          setAuthType(data.settings.authType || 'BASIC');
          setOauthClientId(data.settings.oauthClientId || '');
          setOauthClientSecret(data.settings.oauthClientSecret || '');
        }
      })
      .catch(err => console.error('Error fetching SMTP settings', err));
  };

  React.useEffect(() => {
    if (isAdmin) {
      fetchSmtpSettings();
        
      // Also fetch user details to see if 2FA is enabled
      fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('apm_token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if(data.success && data.users) {
           const me = data.users.find((u:any) => u.email === currentUser.email);
           if (me && me.isTwoFactorEnabled) {
             setIs2FAEnabled(true);
           }
        }
      });
        
      // Fetch active sessions
      fetch('/api/users/sessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('apm_token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if(data.success && data.sessions) {
           setSessions(data.sessions);
        }
      });
        
    }
  }, [isAdmin, currentUser.email]);

  const handleSaveSmtp = async () => {
    try {
      const res = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpHost, smtpPort, smtpUser, smtpPass, oauthClientId, oauthClientSecret })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'SMTP ayarları kaydedildi!');
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (e) {
      alert('Ayarlar kaydedilirken hata oluştu');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Yeni şifreler eşleşmiyor.');
      return;
    }

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apm_token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Şifreniz başarıyla güncellendi!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (e) {
      alert('Şifre değiştirilirken hata oluştu');
    }
  };

  const start2FASetup = async () => {
    try {
      const res = await fetch('/api/users/2fa/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('apm_token')}` }
      });
      const data = await res.json();
      if(data.success) {
        setQrCodeDataUrl(data.qrCodeImage);
        setTwoFaSetupSecret(data.secret);
        setShow2FAModal(true);
      } else {
        alert("2FA oluşturulamadı: " + data.message);
      }
    } catch(e) {
      alert("Hata oluştu.");
    }
  };

  const confirm2FA = async () => {
    try {
      const res = await fetch('/api/users/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apm_token')}`
        },
        body: JSON.stringify({ token: twoFaCode })
      });
      const data = await res.json();
      if(data.success) {
        alert("2FA başarıyla aktifleştirildi!");
        setShow2FAModal(false);
        setIs2FAEnabled(true);
      } else {
        alert("Kod yanlış: " + data.message);
      }
    } catch(e) {
      alert("Hata oluştu.");
    }
  };

  const disable2FA = async () => {
    const pw = prompt("2FA'yı devre dışı bırakmak için mevcut şifrenizi girin:");
    if(!pw) return;
    try {
      const res = await fetch('/api/users/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apm_token')}`
        },
        body: JSON.stringify({ currentPassword: pw })
      });
      const data = await res.json();
      if(data.success) {
        alert("2FA devre dışı bırakıldı.");
        setIs2FAEnabled(false);
      } else {
        alert("Hata: " + data.message);
      }
    } catch(e) {
      alert("Hata oluştu.");
    }
  };

  const terminateSession = async (id: number) => {
    if (window.confirm('Bu oturumu sonlandırmak istediğinize emin misiniz?')) {
      try {
        const res = await fetch(`/api/users/sessions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('apm_token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setSessions(prev => prev.filter(s => s.id !== id));
          alert('Oturum başarıyla sonlandırıldı.');
        } else {
          alert("Hata: " + data.message);
        }
      } catch(e) {
        alert("Hata oluştu.");
      }
    }
  };


  const tabs = [
    { id: 'general', label: t('dashboard.settings.tabs.general'), icon: <User size={18} /> },
    isAdmin ? { id: 'notifications', label: t('dashboard.settings.tabs.notifications'), icon: <Bell size={18} /> } : null,
    { id: 'security', label: t('dashboard.settings.tabs.security'), icon: <Shield size={18} /> }
  ].filter(Boolean) as any[];

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.settings.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.settings.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Settings Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem',
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                background: activeTab === tab.id ? 'var(--bg-card-hover)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none', fontWeight: activeTab === tab.id ? 600 : 500,
                boxShadow: activeTab === tab.id ? 'inset 3px 0 0 var(--accent)' : 'none'
              }}
              onMouseOver={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--bg-card)'; }}
              onMouseOut={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ color: activeTab === tab.id ? 'var(--accent)' : 'inherit' }}>{tab.icon}</div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px', 
          padding: '2rem',
          backdropFilter: 'blur(12px)'
        }}>
          
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Language Setting */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-main)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={18} color="var(--text-muted)"/> {t('dashboard.settings.general.language')}
                </label>
                <select style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', width: '100%', maxWidth: '400px' }}>
                  <option value="tr">Türkçe (TR)</option>
                  <option value="en">English (EN)</option>
                </select>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Üst menüden hızlıca da değiştirebilirsiniz.</span>
              </div>

              {/* Theme Setting */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-main)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Monitor size={18} color="var(--text-muted)"/> {t('dashboard.settings.general.theme')}
                </label>
                <select style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', width: '100%', maxWidth: '400px' }}>
                  <option value="dark">Koyu Tema (Dark)</option>
                  <option value="light">Açık Tema (Light)</option>
                  <option value="system">Sistem Teması</option>
                </select>
              </div>

              {/* Timezone Setting */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-main)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--text-muted)"/> {t('dashboard.settings.general.timezone')}
                </label>
                <select style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', width: '100%', maxWidth: '400px' }}>
                  <option value="Europe/Istanbul">(UTC+03:00) Istanbul</option>
                  <option value="UTC">(UTC+00:00) Coordinated Universal Time</option>
                  <option value="America/New_York">(UTC-05:00) New York</option>
                </select>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button 
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#fff', background: 'var(--accent)', border: 'none', fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 14px var(--accent-glow)', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
                >
                  {t('dashboard.settings.general.saveBtn')}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} color="var(--accent)" />
                {t('dashboard.settings.notifications.title')}
              </h2>

                <>
                  {/* The rest of SMTP settings */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button 
                      onClick={() => setAuthType('BASIC')}
                      style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '2px solid ' + (authType === 'BASIC' ? 'var(--accent)' : 'var(--border-color)'), background: authType === 'BASIC' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-dark)', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Key size={24} color={authType === 'BASIC' ? 'var(--accent)' : 'var(--text-muted)'} />
                      Basic SMTP Şifresi
                    </button>
                    <button 
                      onClick={() => setAuthType('GOOGLE_OAUTH')}
                      style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '2px solid ' + (authType === 'GOOGLE_OAUTH' ? 'var(--accent)' : 'var(--border-color)'), background: authType === 'GOOGLE_OAUTH' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-dark)', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Globe size={24} color={authType === 'GOOGLE_OAUTH' ? 'var(--accent)' : 'var(--text-muted)'} />
                      Google OAuth2
                    </button>
                    <button 
                      onClick={() => setAuthType('MICROSOFT_OAUTH')}
                      style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '2px solid ' + (authType === 'MICROSOFT_OAUTH' ? 'var(--accent)' : 'var(--border-color)'), background: authType === 'MICROSOFT_OAUTH' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-dark)', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Mail size={24} color={authType === 'MICROSOFT_OAUTH' ? 'var(--accent)' : 'var(--text-muted)'} />
                      Microsoft OAuth2
                    </button>
                  </div>

                  <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => {
                        const popup = window.open('/api/settings/auth/google', 'GoogleAuth', 'width=500,height=600');
                        const timer = setInterval(() => {
                          if (popup?.closed) {
                            clearInterval(timer);
                            fetchSmtpSettings(); // Auto refresh settings
                          }
                        }, 500);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <Globe size={16} color="#DB4437" />
                      Google ile Bağlan
                    </button>
                    <button 
                      onClick={() => {
                        const popup = window.open('/api/settings/auth/microsoft', 'MicrosoftAuth', 'width=500,height=600');
                        const timer = setInterval(() => {
                          if (popup?.closed) {
                            clearInterval(timer);
                            fetchSmtpSettings(); // Auto refresh settings
                          }
                        }, 500);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <Mail size={16} color="#0078D4" />
                      Microsoft ile Bağlan
                    </button>
                    <button 
                      onClick={() => setIsOAuthSetupOpen(!isOAuthSetupOpen)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', marginLeft: 'auto', fontSize: '0.9rem' }}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Shield size={14} />
                      OAuth Kimlik Bilgilerini Gir
                    </button>
                  </div>

                  {isOAuthSetupOpen && (
                    <div style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>OAuth2 API Ayarları</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Google veya Microsoft ile bağlanmadan önce kendi uygulamanızın API anahtarlarını (Client ID ve Secret) girip "Kaydet" butonuna basmanız gerekmektedir.</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>Client ID</label>
                          <input type="text" placeholder="örn: 12345-abcde.apps.googleusercontent.com" value={oauthClientId} onChange={e => setOauthClientId(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>Client Secret</label>
                          <input type="password" placeholder="••••••••" value={oauthClientSecret} onChange={e => setOauthClientSecret(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                        </div>
                      </div>
                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            handleSaveSmtp();
                            setIsOAuthSetupOpen(false);
                          }}
                          style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', color: '#fff', background: 'var(--accent)', border: 'none', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
                        >
                          Anahtarları Kaydet
                        </button>
                      </div>
                    </div>
                  )}

                  {authType !== 'BASIC' && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={18} />
                      <span>Şu anda güvenli <strong>{authType === 'GOOGLE_OAUTH' ? 'Google OAuth2' : 'Microsoft OAuth2'}</strong> bağlantısı kullanılıyor.</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.settings.notifications.host')}</label>
                      <input 
                        type="text" 
                        value={smtpHost} 
                        onChange={e => setSmtpHost(e.target.value)} 
                        placeholder="smtp.example.com"
                        style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.settings.notifications.port')}</label>
                      <input 
                        type="number" 
                        value={smtpPort} 
                        onChange={e => setSmtpPort(e.target.value)} 
                        placeholder="587"
                        style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.settings.notifications.user')}</label>
                      <input 
                        type="text" 
                        value={smtpUser} 
                        onChange={e => setSmtpUser(e.target.value)} 
                        placeholder="no-reply@example.com"
                        style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{t('dashboard.settings.notifications.pass')}</label>
                      <input 
                        type="password" 
                        value={smtpPass} 
                        onChange={e => setSmtpPass(e.target.value)} 
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'var(--text-main)', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--border-color)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-dark)'; }}
                    >
                      {t('dashboard.settings.notifications.testBtn')}
                    </button>
                    <button onClick={handleSaveSmtp} style={{ padding: '0.75rem 2rem', borderRadius: '8px', color: '#fff', background: 'var(--accent)', border: 'none', fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 14px var(--accent-glow)', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                    >
                      {t('dashboard.settings.notifications.saveBtn')}
                    </button>
                  </div>
                </>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('dashboard.settings.security.title', 'Güvenlik Ayarları')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.settings.security.desc', 'Hesabınızı ve verilerinizi güvende tutun.')}</p>
              </div>

              {/* Password Change */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>Şifre Değiştir</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: '400px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Mevcut Şifre</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Yeni Şifre</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Yeni Şifre (Tekrar)</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                  </div>
                  <button 
                    onClick={handlePasswordChange}
                    style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={e => e.currentTarget.style.filter = 'none'}
                  >Şifreyi Güncelle</button>
                </div>
              </div>

              {/* 2FA */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>İki Faktörlü Kimlik Doğrulama (2FA)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hesabınıza giriş yaparken ekstra bir güvenlik katmanı ekleyin.</p>
                </div>
                <button 
                  onClick={(e) => {
                    if(is2FAEnabled) {
                      disable2FA();
                    } else {
                      start2FASetup();
                    }
                  }}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: is2FAEnabled ? 'transparent' : 'var(--success)', color: is2FAEnabled ? 'var(--error)' : '#fff', border: is2FAEnabled ? '1px solid var(--error)' : 'none', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {is2FAEnabled ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                </button>
              </div>

              {/* 2FA Modal */}
              {show2FAModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>2FA Kurulumu</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lütfen Google Authenticator veya benzeri bir uygulama ile aşağıdaki QR kodu okutun.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
                      {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />}
                    </div>

                    <p style={{ textAlign: 'center', color: 'var(--text-main)', fontFamily: 'monospace', margin: '0.5rem 0' }}>{twoFaSetupSecret}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Uygulamadaki 6 Haneli Kod</label>
                      <input type="text" maxLength={6} value={twoFaCode} onChange={e => setTwoFaCode(e.target.value)} placeholder="123456" style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                      <button onClick={() => setShow2FAModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>İptal</button>
                      <button onClick={confirm2FA} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>Doğrula ve Aktifleştir</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Sessions */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>Aktif Oturumlar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sessions.map(session => (
                    <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{session.device}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>IP: {session.ip} • Son etkinlik: {new Date(session.time).toLocaleString()}</span>
                      </div>
                      {!session.isCurrent && (
                        <button 
                          onClick={() => terminateSession(session.id)}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', fontSize: '0.85rem', cursor: 'pointer' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'var(--error)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--error)'; }}
                        >
                          Sonlandır
                        </button>
                      )}
                    </div>
                  ))}
                  {sessions.length === 1 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Başka aktif oturumunuz bulunmuyor.</p>
                  )}
                </div>
              </div>
            </div>
          )}



        </div>
      </div>
    </div>
  );
};

export default Settings;
