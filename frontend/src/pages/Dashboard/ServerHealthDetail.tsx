import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Cpu, Activity, HardDrive, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const ServerHealthDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [history, setHistory] = useState<any[]>([]);
  const [serverInfo, setServerInfo] = useState<{name: string, ip: string} | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('15m');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchHistory = async () => {
    try {
      let url = `/api/stats/system-health/${id}/history?range=${timeRange}`;
      if (timeRange === 'custom') {
        if (!customStart || !customEnd) return; // Wait for user to select dates
        url += `&start=${encodeURIComponent(customStart)}&end=${encodeURIComponent(customEnd)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (data.server) {
          setServerInfo(data.server);
        }
        if (data.current) {
          setCurrentMetrics(data.current);
        }
        // Format time for charts
        const formatted = data.history.map((item: any) => ({
          ...item,
          formattedTime: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));
        setHistory(formatted);
      }
    } catch (err) {
      console.error('Error fetching system health history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [id, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('dashboard.serverHealthDetail.loading')}</div>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/servers/health" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <ArrowLeft size={18} /> {t('dashboard.serverHealthDetail.backBtn')}
          </Link>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 600, margin: 0 }}>
              {serverInfo ? serverInfo.name : t('dashboard.serverHealthDetail.serverTitle', { id })}
            </h1>
            {serverInfo && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>IP: {serverInfo.ip}</span>
                {currentMetrics && currentMetrics.updatedAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', background: 'var(--bg-dark)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                    <Clock size={14} style={{ color: 'var(--accent)' }} />
                    {t('dashboard.serverHealthDetail.lastUpdated')}: {new Date(currentMetrics.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TIME RANGE FILTER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {['15m', '1h', '6h', '24h', 'custom'].map(r => (
              <button
                key={r}
                onClick={() => { setTimeRange(r); if (r !== 'custom') setLoading(true); }}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  background: timeRange === r ? 'var(--accent)' : 'var(--input-bg)',
                  color: timeRange === r ? '#fff' : 'var(--text-main)',
                  fontWeight: timeRange === r ? 600 : 400
                }}
              >
                {r === '15m' ? t('dashboard.serverHealthDetail.timeRange.15m') : 
                 r === '1h' ? t('dashboard.serverHealthDetail.timeRange.1h') : 
                 r === '6h' ? t('dashboard.serverHealthDetail.timeRange.6h') : 
                 r === '24h' ? t('dashboard.serverHealthDetail.timeRange.24h') : 
                 t('dashboard.serverHealthDetail.timeRange.custom')}
              </button>
            ))}
          </div>
          {timeRange === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', animation: 'fadeIn 0.2s ease' }}>
              <input 
                type="datetime-local" 
                value={customStart} 
                onChange={e => setCustomStart(e.target.value)} 
                style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none' }} 
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input 
                type="datetime-local" 
                value={customEnd} 
                onChange={e => setCustomEnd(e.target.value)} 
                style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none' }} 
              />
              <button 
                onClick={() => { setLoading(true); fetchHistory(); }} 
                disabled={!customStart || !customEnd}
                style={{ padding: '0.35rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: (!customStart || !customEnd) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (!customStart || !customEnd) ? 0.5 : 1 }}
              >
                Uygula
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* CPU Chart (Full Width) */}
        <div style={{ gridColumn: '1 / -1', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1rem', color: 'var(--accent)' }}>
            <Cpu size={20} /> {t('dashboard.serverHealthDetail.cpuHistory')}
          </h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                <Legend />
                <Line type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM Chart (Half Width) */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1rem', color: 'var(--warning)' }}>
            <Activity size={20} /> {t('dashboard.serverHealthDetail.ramHistory')}
          </h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                <Legend />
                <Line type="monotone" dataKey="ram" name="RAM" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk Chart (Half Width) */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1rem', color: 'var(--success)' }}>
            <HardDrive size={20} /> {t('dashboard.serverHealthDetail.diskHistory')}
          </h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                <Legend />
                <Line type="monotone" dataKey="disk" name="Disk" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Disk Partitions Table (Full Width) */}
        {currentMetrics && currentMetrics.diskPartitions && Array.isArray(currentMetrics.diskPartitions) && currentMetrics.diskPartitions.length > 0 && (
          <div style={{ gridColumn: '1 / -1', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              <HardDrive size={20} style={{ color: 'var(--accent)' }} /> {t('dashboard.serverHealthDetail.diskPartitions')}
            </h3>
            
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('dashboard.serverHealthDetail.mountPoint')}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('dashboard.serverHealthDetail.size')}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, width: '40%' }}>{t('dashboard.serverHealthDetail.usage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMetrics.diskPartitions.map((item: any, idx: number) => {
                    const usagePct = item.usage_percent || 0;
                    const barColor = usagePct > 90 ? 'var(--error)' : usagePct > 75 ? 'var(--warning)' : 'var(--success)';
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>{item.mount_point}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.used_gb} GB / {item.total_gb} GB</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${usagePct}%`, background: barColor, transition: 'width 1s ease' }}></div>
                            </div>
                            <span style={{ color: barColor, fontWeight: 600, minWidth: '40px', textAlign: 'right' }}>{usagePct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Top Data Paths Table (Full Width) */}
        {currentMetrics && currentMetrics.topPaths && Array.isArray(currentMetrics.topPaths) && currentMetrics.topPaths.length > 0 && (
          <div style={{ gridColumn: '1 / -1', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              <HardDrive size={20} style={{ color: 'var(--success)' }} /> {t('dashboard.serverHealthDetail.topPaths')}
            </h3>
            
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>#</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('dashboard.serverHealthDetail.path')}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('dashboard.serverHealthDetail.size')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMetrics.topPaths.map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>{item.path}</td>
                      <td style={{ padding: '1rem', color: 'var(--warning)', fontWeight: 600 }}>{item.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServerHealthDetail;
