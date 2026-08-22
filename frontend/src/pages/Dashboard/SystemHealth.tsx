import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Server, Cpu, Activity, HardDrive, Network, Clock, AlertTriangle, Search } from 'lucide-react';

const SystemHealth: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [servers, setServers] = useState<any[]>([]);

  // Real-time data polling
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/stats/system-health');
        const data = await res.json();
        if (data.success) {
          setServers(data.servers);
        }
      } catch (err) {
        console.error('Error fetching system health', err);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    server.ip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColor = (pct: number) => pct > 85 ? 'var(--error)' : pct > 70 ? 'var(--warning)' : 'var(--success)';

  const formatNetworkSpeed = (mbps: any) => {
    const val = parseFloat(mbps);
    if (isNaN(val)) return '0 KB/s';
    if (val < 1) {
      return (val * 1024).toFixed(1) + ' KB/s';
    }
    return val.toFixed(1) + ' MB/s';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.systemHealth.title')}</h1>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{t('dashboard.systemHealth.summary.totalServers')}</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{servers.length}</div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <h3 style={{ color: 'var(--success)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div> {t('dashboard.systemHealth.summary.healthy')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            {servers.filter(s => {
              const r = Math.round((s.ram.used / s.ram.total) * 100);
              const d = Math.round((s.disk.used / s.disk.total) * 100);
              return !(s.cpu > 80 || r > 85 || d > 90);
            }).length}
          </div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
          <h3 style={{ color: 'var(--warning)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div> {t('dashboard.systemHealth.summary.warnings')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
            {servers.filter(s => {
              const r = Math.round((s.ram.used / s.ram.total) * 100);
              const d = Math.round((s.disk.used / s.disk.total) * 100);
              const isWarning = (s.cpu > 80 || r > 85 || d > 90) && !(s.cpu > 90 || r > 95 || d > 95);
              return isWarning;
            }).length}
          </div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ color: 'var(--error)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }}></div> {t('dashboard.systemHealth.summary.critical')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
            {servers.filter(s => {
              const r = Math.round((s.ram.used / s.ram.total) * 100);
              const d = Math.round((s.disk.used / s.disk.total) * 100);
              return (s.cpu > 90 || r > 95 || d > 95);
            }).length}
          </div>
        </div>

      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder={t('dashboard.systemHealth.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
            borderRadius: '8px', color: 'var(--text-main)', outline: 'none',
            backdropFilter: 'blur(12px)', transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
      </div>

      {/* Grid of Servers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredServers.map(server => {
          const ramPct = Math.round((server.ram.used / server.ram.total) * 100);
          const diskPct = Math.round((server.disk.used / server.disk.total) * 100);
          
          const cpuColor = getColor(server.cpu);
          const ramColor = getColor(ramPct);
          const diskColor = getColor(diskPct);
          
          const isCritical = server.cpu > 90 || ramPct > 95 || diskPct > 95;
          const hasWarning = (server.cpu > 80 || ramPct > 85 || diskPct > 90) && !isCritical;
          
          let borderColor = 'var(--border-color)';
          let shadow = 'none';
          
          if (!server.isActive) {
            borderColor = 'rgba(255,255,255,0.1)';
            shadow = 'none';
          } else if(isCritical) { 
            borderColor = 'var(--error)'; 
            shadow = '0 0 15px rgba(239, 68, 68, 0.15)'; 
          } else if(hasWarning) { 
            borderColor = 'var(--warning)'; 
            shadow = '0 0 15px rgba(245, 158, 11, 0.05)'; 
          }

          return (
            <div 
              key={server.id}
              onClick={() => navigate(`/servers/${server.id}/health`)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(12px)',
                boxShadow: shadow,
                cursor: 'pointer',
                opacity: server.isActive ? 1 : 0.6,
                filter: server.isActive ? 'none' : 'grayscale(0.8)'
              }}
              onMouseOver={(e) => { 
                e.currentTarget.style.transform = 'translateY(-2px)';
                if(server.isActive && !hasWarning && !isCritical) e.currentTarget.style.borderColor = 'var(--accent-glow)'; 
              }}
              onMouseOut={(e) => { 
                e.currentTarget.style.transform = 'translateY(0)';
                if(server.isActive && !hasWarning && !isCritical) e.currentTarget.style.borderColor = 'var(--border-color)'; 
              }}
            >
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '44px', height: '44px', borderRadius: '10px', 
                    background: !server.isActive ? 'rgba(255,255,255,0.05)' : isCritical ? 'rgba(239, 68, 68, 0.1)' : hasWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: !server.isActive ? 'var(--text-muted)' : isCritical ? 'var(--error)' : hasWarning ? 'var(--warning)' : 'var(--success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Server size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {server.name}
                      {!server.isActive && (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--bg-dark)', color: 'var(--text-muted)', borderRadius: '4px', fontWeight: 500 }}>
                          OFFLINE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{server.ip}</div>
                  </div>
                </div>
                {server.isActive && (hasWarning || isCritical) && (
                  <div style={{ color: isCritical ? 'var(--error)' : 'var(--warning)', animation: 'pulse 2s infinite' }}>
                    <AlertTriangle size={20} />
                  </div>
                )}
              </div>

              {/* Resource Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* CPU */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <Cpu size={14}/> CPU
                    </span>
                    <span style={{ color: cpuColor, fontWeight: 600 }}>{server.cpu}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${server.cpu}%`, background: cpuColor, transition: 'width 1s ease' }}></div>
                  </div>
                </div>

                {/* RAM */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <Activity size={14}/> RAM ({server.ram.used} / {server.ram.total} GB)
                    </span>
                    <span style={{ color: ramColor, fontWeight: 600 }}>{ramPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ramPct}%`, background: ramColor, transition: 'width 1s ease' }}></div>
                  </div>
                </div>

                {/* Disk */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <HardDrive size={14}/> Disk ({server.disk.used} / {server.disk.total} GB)
                    </span>
                    <span style={{ color: diskColor, fontWeight: 600 }}>{diskPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${diskPct}%`, background: diskColor, transition: 'width 1s ease' }}></div>
                  </div>
                </div>

              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Footer Stats (Network & Load) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Network size={12}/> Network</span>
                  <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                    <span style={{ color: 'var(--success)' }}>&darr;{formatNetworkSpeed(server.network.rx)}</span> <span style={{ color: 'var(--text-muted)' }}>|</span> <span style={{ color: 'var(--accent)' }}>&uarr;{formatNetworkSpeed(server.network.tx)}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Load Avg <Clock size={12}/></span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{server.load}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default SystemHealth;
