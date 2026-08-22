import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      if (prefersLight) {
        setIsDark(false);
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (!newIsDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      style={{
        padding: '10px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: '50%',
        color: 'var(--text-main)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'var(--bg-card-hover)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'var(--bg-card)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={isDark ? "Açık Tema" : "Koyu Tema"}
    >
      {isDark ? (
        // Güneş ikonu (Açık temaya geç)
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        // Ay ikonu (Koyu temaya geç)
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
