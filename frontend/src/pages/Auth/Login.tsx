import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Key, Mail, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ThemeToggle from '../../components/ThemeToggle';
import '../../layouts/Dashboard.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // First Login States
  const [isFirstLoginStep, setIsFirstLoginStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // 2FA States
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.requirePasswordChange) {
          setIsFirstLoginStep(true);
          setTempToken(result.tempToken);
          setErrorMsg('');
        } else if (result.require2FA) {
          setIs2FAStep(true);
          setTempToken(result.tempToken);
          setErrorMsg('');
        } else {
          localStorage.setItem('apm_authenticated', 'true');
          localStorage.setItem('apm_token', result.token);
          localStorage.setItem('apm_user', JSON.stringify(result.user));
          navigate('/');
        }
      } else {
        setErrorMsg(result.message || 'Giriş başarısız');
      }
    } catch (err: any) {
      setErrorMsg('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstLoginChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/first-login-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, newPassword })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.require2FA) {
          setIsFirstLoginStep(false);
          setIs2FAStep(true);
          setTempToken(result.tempToken);
        } else {
          localStorage.setItem('apm_authenticated', 'true');
          localStorage.setItem('apm_token', result.token);
          localStorage.setItem('apm_user', JSON.stringify(result.user));
          navigate('/');
        }
      } else {
        setErrorMsg(result.message || 'Şifre güncellenemedi');
      }
    } catch (err: any) {
      setErrorMsg('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: twoFaCode })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('apm_authenticated', 'true');
        localStorage.setItem('apm_token', result.token);
        localStorage.setItem('apm_user', JSON.stringify(result.user));
        navigate('/');
      } else {
        setErrorMsg(result.message || 'Kod doğrulanamadı');
      }
    } catch (err: any) {
      setErrorMsg('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
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
            WebkitTextFillColor: 'transparent'
          }}>
            OctopusAPM
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', margin: 0 }}>
            {t('auth.login.subtitle')}
          </p>
        </div>

        {/* Form Area */}
        {errorMsg && <div style={{ color: 'var(--error)', textAlign: 'center', fontSize: '0.9rem', width: '100%' }}>{errorMsg}</div>}
        
        {isFirstLoginStep ? (
          <form onSubmit={handleFirstLoginChange} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Güvenliğiniz için lütfen yeni bir şifre belirleyin</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
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
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle ve Giriş Yap'}
              {!loading && <ArrowRight size={18} />}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsFirstLoginStep(false); setTempToken(''); setNewPassword(''); }}
              style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
            >
              Geri Dön
            </button>
          </form>
        ) : !is2FAStep ? (
          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('auth.login.email')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('auth.login.password')}</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none' }}>{t('auth.login.forgot')}</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                marginTop: '0.5rem', width: '100%', padding: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 15px var(--accent-glow)' 
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.filter = 'none')}
            >
              {loading ? t('auth.login.loading', 'Giriş Yapılıyor...') : t('auth.login.submit', 'Sisteme Giriş Yap')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>2FA Kodu</label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  maxLength={6}
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  placeholder="123456"
                  required
                  style={{ 
                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', transition: 'all 0.2s', letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem' 
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
              {loading ? 'Doğrulanıyor...' : 'Doğrula'}
              {!loading && <ArrowRight size={18} />}
            </button>
            <button 
              type="button" 
              onClick={() => { setIs2FAStep(false); setTempToken(''); setTwoFaCode(''); }}
              style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
            >
              Geri Dön
            </button>
          </form>
        )}
        
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Shield size={14} /> {t('auth.login.secureLogin')}
        </div>

      </div>
    </div>
  );
};

export default Login;
