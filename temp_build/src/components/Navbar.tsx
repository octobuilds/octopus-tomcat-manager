'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  dict: Record<string, string>;
  currentLocale: 'tr' | 'en';
}

export default function Navbar({ dict, currentLocale }: NavbarProps) {
  const pathname = usePathname();

  // Hide Navbar on dashboard and login pages
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/login') || pathname?.startsWith('/demo-login')) {
    return null;
  }

  return (
    <nav className="navbar" id="navbar">
      <div className="container nav-container">
        <Link href="/" className="logo">
          {/* Eğer public/logo.png yoksa geçici bir icon koyuyoruz, ancak proje senin bilgisayarında olduğu için muhtemelen logo duruyor. */}
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold" style={{display: 'none'}}>O</div>
          <img src="/logo.png" alt="OctopusAPM Logo" />
          <span className="logo-text text-gradient">OctopusAPM</span>
        </Link>
        
        <div className="nav-center hidden md:flex">
          <div className="nav-links">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>{dict.home}</Link>
            <Link href="/features" className={pathname === '/features' ? 'active' : ''}>{dict.features}</Link>
            <Link href="/how-it-works" className={pathname === '/how-it-works' ? 'active' : ''}>{dict.howItWorks}</Link>
            <Link href="/pricing" className={pathname === '/pricing' ? 'active' : ''}>{dict.pricing}</Link>
            <Link href="/faq" className={pathname === '/faq' ? 'active' : ''}>{dict.faq || (currentLocale === 'en' ? 'FAQ' : 'S.S.S')}</Link>
          </div>
        </div>

        <div className="nav-right hidden md:flex">
          <Link href="/demo-login" className="btn btn-demo btn-nav">
            {dict.demo}
          </Link>
          <Link href="/contact" className="btn btn-outline btn-nav">
            {dict.contact}
          </Link>
          <LanguageSwitcher currentLocale={currentLocale} />
        </div>
        
        <button className="hamburger md:hidden" aria-label="Menü">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
