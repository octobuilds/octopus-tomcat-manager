import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Coffee, MoreVertical, Cpu, AlertTriangle, Search, Play, Square, FileText, BarChart2, Edit, X, Plus } from 'lucide-react';
import TomcatEditModal from './TomcatEditModal';
import TomcatLogsModal from './TomcatLogsModal';
import TomcatChartsModal from './TomcatChartsModal';

const TomcatApps: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [logsApp, setLogsApp] = useState<any>(null);
  const [chartsApp, setChartsApp] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('apm_user') || '{}');
  const permissions = currentUser.permissions || {};
  const isAdmin = currentUser.role === 'ADMIN';

  const canEditApps = isAdmin || permissions.canEditApps;
  const canStartStopApps = isAdmin || permissions.canStartStopApps;
  const canViewLogs = isAdmin || permissions.canViewLogs;
  const canViewCharts = isAdmin || permissions.canViewCharts;

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/tomcat');
      if (response.ok) {
        const data = await response.json();
        setApps(data);
      } else {
        console.error("Failed to fetch");
      }
    } catch (error) {
      console.error("Error fetching tomcat apps", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const totalApps = apps.length;
  const activeApps = apps.filter(a => a.status === 'running').length;
  const stoppedApps = apps.filter(a => a.status === 'stopped').length;
  const warningApps = apps.filter(a => a.warning).length;

  const filteredApps = apps.filter(app => 
    app.instanceName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.serverIp.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Area */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.tomcatApps.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.tomcatApps.subtitle')}</p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{t('dashboard.tomcatApps.metrics.total')}</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalApps}</div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <h3 style={{ color: 'var(--success)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div> {t('dashboard.tomcatApps.metrics.active')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{activeApps}</div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
          <h3 style={{ color: 'var(--warning)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div> {t('dashboard.tomcatApps.metrics.warning')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{warningApps}</div>
        </div>

        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ color: 'var(--error)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }}></div> {t('dashboard.tomcatApps.metrics.stopped')}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>{stoppedApps}</div>
        </div>
      </div>

      {/* Search Bar & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} />
          <input 
            type="text" 
            placeholder={t('dashboard.tomcatApps.searchPlaceholder', 'Uygulama veya IP ara...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', 
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
              borderRadius: '8px', color: 'var(--text-main)', outline: 'none',
              backdropFilter: 'blur(12px)', transition: 'border-color 0.2s', position: 'relative', zIndex: 5
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/tomcat/scan', { method: 'POST' });
                if (res.ok) {
                  toast.success('Tarama başlatıldı! Birkaç saniye sürebilir.');
                  setTimeout(() => fetchApps(), 3000); // refresh after 3 seconds
                }
              } catch (err) {
                console.error(err);
                toast.error('Tarama başlatılamadı!');
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
              background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 14px var(--accent-glow)'
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
          >
            <Play size={18} /> {t('dashboard.tomcatApps.scanNow', 'Yenile / Scan Now')}
          </button>
        </div>
      </div>

      {/* App Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          Yükleniyor...
        </div>
      ) : filteredApps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Coffee size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>{t('dashboard.tomcatApps.emptyState.title')}</h3>
          <p>{t('dashboard.tomcatApps.emptyState.desc')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredApps.map((app) => {
            const isRunning = app.status === 'running';
            // We use rssMb / vszMb for the percentage now
            const memMax = app.vszMb > 0 ? app.vszMb : 2048;
            const heapPercentage = isRunning ? Math.round((app.rssMb / memMax) * 100) : 0;
            
            let heapColor = 'var(--success)';
            let statusBg = 'rgba(16, 185, 129, 0.1)';
            let statusColor = 'var(--success)';
            
            if (app.warning) {
              heapColor = 'var(--warning)';
              statusBg = 'rgba(245, 158, 11, 0.1)';
              statusColor = 'var(--warning)';
            }
            if (heapPercentage > 90) heapColor = 'var(--error)';
            if (!isRunning) {
              heapColor = 'var(--border-color)';
              statusBg = 'rgba(239, 68, 68, 0.1)';
              statusColor = 'var(--error)';
            }

            return (
              <div 
                key={app.id}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${app.warning ? 'var(--warning)' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(12px)',
                  boxShadow: app.warning ? '0 0 10px rgba(245, 158, 11, 0.1)' : 'none'
                }}
                onMouseOver={(e) => { if(!app.warning) e.currentTarget.style.borderColor = 'var(--accent-glow)'; }}
                onMouseOut={(e) => { if(!app.warning) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      flexShrink: 0,
                      width: '44px', height: '44px', borderRadius: '10px', 
                      background: isRunning ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-dark)',
                      color: isRunning ? 'var(--accent)' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Coffee size={24} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.instanceName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.catalinaBase || 'Unknown Path'} &bull; {app.serverIp}</div>
                    </div>
                  </div>
                  
                  {canEditApps && (
                    <button 
                      onClick={() => setEditingApp(app)}
                      style={{ 
                        background: 'transparent', border: '1px solid var(--border-color)', 
                        color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem 0.75rem',
                        borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem',
                        fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                  )}
                </div>

              {/* Status & Metrics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.35rem 0.75rem', borderRadius: '20px',
                  background: statusBg,
                  color: statusColor,
                  fontSize: '0.8rem', fontWeight: 600
                }}>
                  {app.warning ? <AlertTriangle size={14} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>}
                  {isRunning ? (app.warning ? t('dashboard.tomcatApps.metrics.warning') : t('dashboard.tomcatApps.status.running')) : t('dashboard.tomcatApps.status.stopped')}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Cpu size={16} color="var(--text-muted)" />
                  {isRunning ? `%${app.cpuPercent} CPU` : '-'}
                </div>
              </div>

              {/* Heap Memory Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('dashboard.tomcatApps.columns.heap')}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    {isRunning ? `${app.rssMb} MB / ${app.vszMb} MB` : 'N/A'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${heapPercentage}%`, 
                    background: heapColor,
                    transition: 'width 1s ease',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: heapPercentage > 85 ? 'var(--warning)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {isRunning ? `%${heapPercentage} Kullanım` : ''}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <button 
                    disabled={!canViewCharts || !isRunning}
                    onClick={() => { if (canViewCharts && isRunning) setChartsApp(app); }}
                    title={!canViewCharts ? "Yetkiniz Yok" : (!isRunning ? "Uygulama Çalışmıyor" : "")}
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', 
                      background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', 
                      cursor: (canViewCharts && isRunning) ? 'pointer' : 'not-allowed', 
                      opacity: (canViewCharts && isRunning) ? 1 : 0.5,
                      transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 500 
                    }}
                    onMouseOver={(e) => { if (canViewCharts && isRunning) e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)' }}
                    onMouseOut={(e) => { if (canViewCharts && isRunning) e.currentTarget.style.background = 'transparent' }}
                  >
                    <BarChart2 size={16} /> Charts
                  </button>
                
                  <button 
                    disabled={!canViewLogs}
                    onClick={() => { if (canViewLogs) setLogsApp(app); }}
                    title={!canViewLogs ? "Yetkiniz Yok" : ""}
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', 
                      background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', 
                      cursor: canViewLogs ? 'pointer' : 'not-allowed', 
                      opacity: canViewLogs ? 1 : 0.5,
                      transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 500 
                    }}
                    onMouseOver={(e) => { if (canViewLogs) e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)' }}
                    onMouseOut={(e) => { if (canViewLogs) e.currentTarget.style.background = 'transparent' }}
                  >
                    <FileText size={16} /> Logs
                  </button>

                {isRunning ? (
                  <button 
                    disabled={!canStartStopApps}
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', 
                      background: 'var(--error)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', 
                      cursor: canStartStopApps ? 'pointer' : 'not-allowed', opacity: canStartStopApps ? 1 : 0.5,
                      transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 500 
                    }}
                    title={!canStartStopApps ? "Yetkiniz Yok" : ""}
                    onMouseOver={(e) => { if (canStartStopApps) e.currentTarget.style.filter = 'brightness(1.1)' }}
                    onMouseOut={(e) => { if (canStartStopApps) e.currentTarget.style.filter = 'none' }}
                  >
                    <Square size={16} /> Stop
                  </button>
                ) : (
                  <button 
                    disabled={!canStartStopApps}
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', 
                      background: 'var(--success)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', 
                      cursor: canStartStopApps ? 'pointer' : 'not-allowed', opacity: canStartStopApps ? 1 : 0.5,
                      transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 500 
                    }}
                    title={!canStartStopApps ? "Yetkiniz Yok" : ""}
                    onMouseOver={(e) => { if (canStartStopApps) e.currentTarget.style.filter = 'brightness(1.1)' }}
                    onMouseOut={(e) => { if (canStartStopApps) e.currentTarget.style.filter = 'none' }}
                  >
                    <Play size={16} /> Start
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
      )}

      {/* Edit App Modal */}
      {editingApp && (
        <TomcatEditModal 
          app={editingApp} 
          onClose={() => setEditingApp(null)} 
          onUpdate={(updatedApp) => setApps(apps.map(a => a.id === updatedApp.id ? updatedApp : a))}
        />
      )}

      {/* Logs Modal */}
      {logsApp && (
        <TomcatLogsModal 
          app={logsApp} 
          onClose={() => setLogsApp(null)} 
        />
      )}

      {/* Charts Modal */}
      {chartsApp && (
        <TomcatChartsModal 
          app={chartsApp} 
          onClose={() => setChartsApp(null)} 
        />
      )}
    </div>
  );
};

export default TomcatApps;
