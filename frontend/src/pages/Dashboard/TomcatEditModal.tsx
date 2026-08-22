import React, { useState, useEffect } from 'react';
import { X, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TomcatEditModal = ({ app, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    instanceName: '',
    catalinaBase: '',
    serverIp: '',
    startScript: '',
    stopScript: ''
  });

  useEffect(() => {
    if (app) {
      setFormData({
        instanceName: app.instanceName || '',
        catalinaBase: app.catalinaBase || '',
        serverIp: app.serverIp || '',
        startScript: app.startScript || '',
        stopScript: app.stopScript || ''
      });
    }
  }, [app]);

  if (!app) return null;

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/tomcat/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const updatedApp = await response.json();
        if (onUpdate) onUpdate(updatedApp);
        onClose();
      } else {
        alert("Güncelleme başarısız oldu.");
      }
    } catch (error) {
      console.error("Error updating app", error);
      alert("Bağlantı hatası.");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-dark)', borderRadius: '16px', border: '1px solid var(--border-color)',
        width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
        <h2 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Coffee size={24} color="var(--accent)" />
          {t('dashboard.tomcatApps.editTitle', 'Uygulamayı Düzenle')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('dashboard.tomcatApps.instanceName')}</label>
            <input 
              type="text" 
              value={formData.instanceName} 
              onChange={(e) => setFormData({...formData, instanceName: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('dashboard.tomcatApps.catalinaBase')}</label>
            <input 
              type="text" 
              value={formData.catalinaBase} 
              onChange={(e) => setFormData({...formData, catalinaBase: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('dashboard.tomcatApps.serverIp')}</label>
            <input 
              type="text" 
              value={formData.serverIp} 
              onChange={(e) => setFormData({...formData, serverIp: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('dashboard.tomcatApps.startScript')}</label>
            <input 
              type="text" 
              placeholder="/opt/tomcat/bin/startup.sh"
              value={formData.startScript} 
              onChange={(e) => setFormData({...formData, startScript: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('dashboard.tomcatApps.stopScript')}</label>
            <input 
              type="text" 
              placeholder="/opt/tomcat/bin/shutdown.sh"
              value={formData.stopScript} 
              onChange={(e) => setFormData({...formData, stopScript: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              onClick={onClose}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}
            >
              {t('dashboard.tomcatApps.cancel')}
            </button>
            <button 
              onClick={handleSave}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 500, boxShadow: '0 4px 14px var(--accent-glow)' }}
            >
              {t('dashboard.tomcatApps.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TomcatEditModal;
