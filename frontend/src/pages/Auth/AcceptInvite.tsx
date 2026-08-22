import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Key, User, Check, AlertTriangle } from 'lucide-react';

const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Validate token
    fetch(`/api/auth/invite/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmail(data.email);
        } else {
          setError(data.message || 'Davet linki geçersiz.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Sunucuya ulaşılamadı.');
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }
    if (!name || password.length < 6) {
      toast.error('Lütfen adınızı girin ve şifrenizin en az 6 karakter olduğuna emin olun.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (err) {
      toast.error('Sunucu hatası.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Davet linki kontrol ediliyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <AlertTriangle size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-main)', marginTop: 0 }}>Hata</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <Check size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-main)', marginTop: 0 }}>Kayıt Başarılı!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '1rem' }}>
      <div style={{ 
        width: '100%', maxWidth: '400px', background: 'var(--bg-card)', 
        borderRadius: '16px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent)', marginBottom: '1rem' }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Daveti Kabul Et</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-main)' }}>{email}</strong> olarak sisteme davet edildiniz. Lütfen bilgilerinizi tamamlayın.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ad Soyad</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                required
                style={{ 
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
                  background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
                  borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Şifre Belirleyin</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ 
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
                  background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
                  borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Şifre (Tekrar)</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ 
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
                  background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
                  borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            style={{ 
              width: '100%', padding: '0.875rem', background: 'var(--accent)', 
              color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', 
              fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem', opacity: submitting ? 0.7 : 1, transition: 'background 0.2s'
            }}
          >
            {submitting ? 'Hesap Oluşturuluyor...' : 'Hesabımı Oluştur'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvite;
