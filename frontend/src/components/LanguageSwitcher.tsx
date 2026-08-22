import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button 
      onClick={toggleLanguage}
      style={{
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        color: 'var(--text-main)',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.borderColor = 'var(--text-muted)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <span style={{ fontWeight: i18n.language === 'tr' ? 'bold' : 'normal', color: i18n.language === 'tr' ? 'var(--accent)' : 'inherit' }}>TR</span>
      <span style={{ color: 'var(--text-muted)' }}>/</span>
      <span style={{ fontWeight: i18n.language === 'en' ? 'bold' : 'normal', color: i18n.language === 'en' ? 'var(--accent)' : 'inherit' }}>EN</span>
    </button>
  );
};

export default LanguageSwitcher;
