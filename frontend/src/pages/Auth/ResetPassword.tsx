import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ThemeToggle from '../../components/ThemeToggle';
import '../../layouts/Dashboard.css';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    
    if (password.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept-Language': i18n.language // Pass language to backend if needed
        },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Şifre sıfırlanamadı.');
      }
    } catch (err) {
      setError('Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      background: 'var(--bg-main)'
    }}>
      {/* Top Controls */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem', zIndex: 10 }}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '3rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        {/* Logo Area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="OctopusAPM Logo" style={{ height: '110px', objectFit: 'contain' }} />
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            margin: 0,
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}>
            {t('auth.resetPassword.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', margin: 0 }}>
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ padding: '2rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={48} />
              <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{message}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('auth.resetPassword.redirecting')}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('auth.resetPassword.newPassword')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('auth.resetPassword.confirmPassword')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem', width: '100%', padding: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 15px var(--accent-glow)'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.filter = 'none')}
            >
              {loading ? t('auth.resetPassword.loading') : t('auth.resetPassword.submit')}
              {!loading && <ArrowRight size={18} />}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
