import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Key } from 'lucide-react';
import '../layouts/Dashboard.css';

interface LicenseGuardProps {
  children: React.ReactNode;
}

const LicenseGuard: React.FC<LicenseGuardProps> = ({ children }) => {
  const [isValid, setIsValid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [machineId, setMachineId] = useState('');
  const [reason, setReason] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLicense = async () => {
    try {
      const res = await fetch('/api/settings/license', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('apm_token')}` }
      });
      const data = await res.json();
      if (data.success && data.license && data.license.isValid) {
        setIsValid(true);
      } else {
        setIsValid(false);
        setReason(data.license?.reason || 'Lisans bulunamadı');
      }
      
      const machineRes = await fetch('/api/settings/machine-id', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('apm_token')}` }
      });
      const machineData = await machineRes.json();
      if (machineData.success) {
        setMachineId(machineData.machineId);
      }
    } catch (err) {
      console.error('License check failed', err);
      // Failsafe: if we can't connect, assume valid until real requests fail, or block. Let's block if we can't verify.
      setIsValid(false);
      setReason('Sunucuya ulaşılamıyor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  const handleSaveLicense = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/settings/license', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apm_token')}`
        },
        body: JSON.stringify({ licenseKey })
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        toast.error('Hata: ' + data.message);
      }
    } catch (err) {
      toast.error('Sunucu hatası.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Yükleniyor...</div>;
  }

  if (isValid) {
    return <>{children}</>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-main)',
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999
    }}>
      <div style={{
        width: '100%',
        maxWidth: '550px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '3rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
            <ShieldAlert size={48} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#ef4444' }}>
            Lisans Hatası
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
            Sistemi kullanmaya devam etmek için geçerli bir lisansa ihtiyacınız var.
            {reason && <span style={{ display: 'block', marginTop: '0.5rem', color: '#f59e0b' }}>Hata: {reason}</span>}
          </p>
        </div>

        <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Donanım Kimliğiniz (Machine ID):</p>
          <code style={{ display: 'block', background: '#000', padding: '0.75rem', borderRadius: '8px', color: '#10b981', wordBreak: 'break-all', userSelect: 'all' }}>
            {machineId}
          </code>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Yeni bir lisans alırken bu kimliği iletmelisiniz.</p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Lisans Anahtarı
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
              <textarea
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="eyJhbG..."
                rows={4}
                style={{
                  width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', transition: 'all 0.2s', resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <button
            onClick={handleSaveLicense}
            disabled={submitting || !licenseKey.trim()}
            style={{
              width: '100%', padding: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: submitting || !licenseKey.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px var(--accent-glow)', opacity: submitting || !licenseKey.trim() ? 0.7 : 1
            }}
          >
            {submitting ? 'Kaydediliyor...' : 'Lisansı Etkinleştir'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LicenseGuard;
