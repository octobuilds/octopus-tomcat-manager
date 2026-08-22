import Link from 'next/link';
import { getDictionary } from '@/lib/getDictionary';
import CtaBand from '@/components/CtaBand';

export default async function Home() {
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)]">
      {/* Hero Section */}
      <header className="hero" id="home">
        <div className="container hero-container">
          <div className="hero-content reveal active">
            <div className="badge">{dict.hero.badge}</div>
            
            <h1 className="hero-title">
              <span>{dict.hero.title1}</span> <br/>
              <span className="text-gradient">{dict.hero.title2}</span>
            </h1>
            
            <p className="hero-subtitle">
              {dict.hero.subtitle}
            </p>
            
            <div className="hero-actions">
              <Link 
                href="/contact" 
                className="btn btn-primary btn-large"
              >
                {dict.hero.btn.demo}
              </Link>
              <Link 
                href="/features"
                className="btn btn-outline btn-large"
              >
                {dict.hero.btn.features}
              </Link>
            </div>
          </div>
          
          <div className="hero-visual reveal-right active">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar">
                  <div className="mock-nav-item active"></div>
                  <div className="mock-nav-item"></div>
                  <div className="mock-nav-item"></div>
                  <div className="mock-nav-item" style={{ marginTop: 'auto' }}></div>
                </div>
                <div className="mockup-main">
                  <div className="mock-topbar">
                    <div className="mock-search"></div>
                    <div className="mock-profile"></div>
                  </div>
                  <div className="mock-cards">
                    <div className="mock-card">
                      <div className="mock-card-title"></div>
                      <div className="mock-card-value"></div>
                    </div>
                    <div className="mock-card">
                      <div className="mock-card-title"></div>
                      <div className="mock-card-value green"></div>
                    </div>
                    <div className="mock-card">
                      <div className="mock-card-title"></div>
                      <div className="mock-card-value"></div>
                    </div>
                  </div>
                  <div className="mock-bottom">
                    <div className="mock-chart">
                      <div className="mock-chart-bar b1"></div>
                      <div className="mock-chart-bar b2"></div>
                      <div className="mock-chart-bar b3"></div>
                      <div className="mock-chart-bar b4"></div>
                      <div className="mock-chart-bar b5"></div>
                    </div>
                    <div className="mock-terminal">
                      <div className="mock-log l1"></div>
                      <div className="mock-log l2"></div>
                      <div className="mock-log l3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container stats-container">
          <div className="stat-item reveal active">
            <div className="stat-number">%12</div>
            <h3>{dict.stats.servers}</h3>
            <p>{dict.stats.serversDesc}</p>
          </div>
          <div className="stat-item reveal active">
            <div className="stat-number">5M+</div>
            <h3>{dict.stats.logs}</h3>
            <p>{dict.stats.logsDesc}</p>
          </div>
          <div className="stat-item reveal active">
            <div className="stat-number">%99.9</div>
            <h3>{dict.stats.uptime}</h3>
            <p>{dict.stats.uptimeDesc}</p>
          </div>
        </div>
      </section>

      {/* Trusted Logos Section */}
      <section className="trusted-section">
        <div className="container trusted-container">
          <p>{dict.trusted.title}</p>
          <div className="trusted-logos">
            <div className="trusted-logo-item">
              <svg viewBox="0 0 120 40" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 10L25 30L35 10H45L30 40H20L5 10H15Z" fill="currentColor"></path>
                <circle cx="25" cy="5" r="4" fill="currentColor"></circle>
                <text x="50" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="22" fill="currentColor" letterSpacing="-0.03em">INNOVA</text>
              </svg>
            </div>
            <div className="trusted-logo-item">
              <svg viewBox="0 0 150 40" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5ZM20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28Z" fill="currentColor"></path>
                <path d="M25 15L35 5H45L25 25V15Z" fill="currentColor"></path>
                <text x="50" y="27" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="20" fill="currentColor" letterSpacing="-0.02em">Nexa<tspan fontWeight="400">Data</tspan></text>
              </svg>
            </div>
            <div className="trusted-logo-item">
              <svg viewBox="0 0 130 40" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 30L20 5L35 30H25L20 20L15 30H5Z" fill="currentColor"></path>
                <path d="M12 35L20 22L28 35H12Z" fill="currentColor" opacity="0.6"></path>
                <text x="45" y="27" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="21" fill="currentColor" letterSpacing="0.05em">VERTEX</text>
              </svg>
            </div>
            <div className="trusted-logo-item">
              <svg viewBox="0 0 160 40" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="15" width="10" height="20" rx="2" fill="currentColor"></rect>
                <rect x="20" y="5" width="10" height="30" rx="2" fill="currentColor"></rect>
                <rect x="35" y="22" width="10" height="13" rx="2" fill="currentColor"></rect>
                <text x="55" y="28" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="21" fill="currentColor" letterSpacing="-0.04em">SynthCore</text>
              </svg>
            </div>
            <div className="trusted-logo-item">
              <svg viewBox="0 0 150 40" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5L35 13.66V31.34L20 40L5 31.34V13.66L20 5Z" stroke="currentColor" strokeWidth="3"></path>
                <circle cx="20" cy="22.5" r="5" fill="currentColor"></circle>
                <text x="48" y="28" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="20" fill="currentColor" letterSpacing="-0.01em">Quantum</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <CtaBand dict={dict.cta} />
    </div>
  );
}
