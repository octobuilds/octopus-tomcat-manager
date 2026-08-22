import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Activity, AlertTriangle, CheckCircle, Clock, Shield, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalServers: number;
  activeServers: number;
  totalProjects: number;
  totalUsers: number;
  avgResponseTime: number;
  errorRate: number;
  requestsPerMin: number;
}

const Overview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Helper for time
  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds} sn önce`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };


  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(err => console.error("Stats çekilemedi:", err));

    fetch('/api/logs?limit=5')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoadingEvents(false);
      })
      .catch(err => {
        console.error("Logs çekilemedi:", err);
        setLoadingEvents(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.overview.title')}</h1>
      </div>

      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{t('dashboard.overview.metrics.activeServers')}</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {stats ? `${stats.activeServers} / ${stats.totalServers}` : '...'}
          </div>
        </div>
        
        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <h3 style={{ color: 'var(--success)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div> {t('dashboard.overview.metrics.avgResponseTime')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            {stats?.avgResponseTime != null ? stats.avgResponseTime : '—'}
            {stats?.avgResponseTime != null && <span style={{ fontSize: '1rem', marginLeft: '4px' }}>ms</span>}
          </div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ color: 'var(--error)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }}></div> {t('dashboard.overview.metrics.errorRate')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
            {stats?.errorRate != null ? `${stats.errorRate}%` : '—'}
          </div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
          <h3 style={{ color: 'var(--warning)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div> {t('dashboard.overview.metrics.requestsPerMin')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
            {stats?.requestsPerMin != null ? stats.requestsPerMin.toLocaleString() : '—'}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Quick System Modules Navigation */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} color="var(--success)"/> {t('dashboard.overview.quickStatus')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              
              <div onClick={() => navigate('/servers/health')} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor= (stats && stats.totalServers > stats.activeServers) ? 'var(--error)' : 'var(--accent)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border-color)'}>
                <div style={{ color: (stats && stats.totalServers > stats.activeServers) ? 'var(--error)' : 'var(--success)' }}>
                  {(stats && stats.totalServers > stats.activeServers) ? <AlertTriangle size={24}/> : <CheckCircle size={24}/>}
                </div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Sistem Sağlığı</div>
                <div style={{ fontSize: '0.75rem', color: (stats && stats.totalServers > stats.activeServers) ? 'var(--error)' : 'var(--text-muted)' }}>
                  {(stats && stats.totalServers > stats.activeServers) ? `${stats.totalServers - stats.activeServers} Kapalı` : 'Tümü Normal'}
                </div>
              </div>
              
              <div onClick={() => navigate('/runtimes/tomcat')} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--warning)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border-color)'}>
                <div style={{ color: 'var(--warning)' }}><AlertTriangle size={24}/></div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Tomcat APM</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 Uyarı</div>
              </div>

              <div onClick={() => navigate('/system/users')} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border-color)'}>
                <div style={{ color: 'var(--text-muted)' }}><Shield size={24}/></div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Erişim & Roller</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yönet</div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Recent Events */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)', height: '100%' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--accent)"/> {t('dashboard.overview.recentEvents')}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loadingEvents ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Yükleniyor...</div>
            ) : events.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Henüz kayıtlı olay yok.</div>
            ) : (
              events.map((ev, i) => {
                let color = 'var(--text-muted)';
                let bg = 'var(--bg-dark)';
                let Icon = Shield;
                
                if(ev.level === 'error' || ev.level === 'critical') { 
                  color = 'var(--error)'; bg = 'rgba(239, 68, 68, 0.1)'; Icon = AlertTriangle;
                }
                else if(ev.level === 'warning') { 
                  color = 'var(--warning)'; bg = 'rgba(245, 158, 11, 0.1)'; Icon = AlertTriangle;
                }
                else if(ev.level === 'success' || ev.level === 'ok') { 
                  color = 'var(--success)'; bg = 'rgba(16, 185, 129, 0.1)'; Icon = CheckCircle;
                }
                else if(ev.level === 'info') { 
                  color = 'var(--accent)'; bg = 'rgba(59, 130, 246, 0.1)'; Icon = Shield;
                }

                return (
                  <div key={ev.id || i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{ev.message}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(ev.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <button style={{ width: '100%', marginTop: '2rem', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-muted)'}>
            Tüm Logları Görüntüle &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};

export default Overview;
