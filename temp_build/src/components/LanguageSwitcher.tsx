'use client';

import { useRouter } from 'next/navigation';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: 'tr' | 'en' }) {
  const router = useRouter();

  const handleLanguageChange = (e: React.MouseEvent, lang: 'tr' | 'en') => {
    e.preventDefault();
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="lang-switch">
      <a 
        href="#" 
        onClick={(e) => handleLanguageChange(e, 'tr')}
        className={`lang-btn ${currentLocale === 'tr' ? 'active' : ''}`}
      >
        TR
      </a>
      <a 
        href="#" 
        onClick={(e) => handleLanguageChange(e, 'en')}
        className={`lang-btn ${currentLocale === 'en' ? 'active' : ''}`}
      >
        EN
      </a>
    </div>
  );
}
