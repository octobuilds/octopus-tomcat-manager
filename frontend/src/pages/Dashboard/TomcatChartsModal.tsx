import React, { useState, useEffect } from 'react';
import { X, Activity, Server, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

import { Clock } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        color: 'var(--text-main)'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }}></div>
            <span style={{ color: 'var(--text-muted)' }}>{entry.name}:</span>
            <span style={{ fontWeight: 600, color: entry.color }}>%{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TomcatChartsModal = ({ app, onClose }) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('cpu');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('15m');
  
  useEffect(() => {
    if (app) {
      setLoading(true);
      fetch(`/api/tomcat/${app.id}/history?range=${timeRange}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Format time for charts
            const formatted = data.history.map((item: any) => ({
              ...item,
              time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setChartData(formatted);
          }
        })
        .catch(err => console.error("Error fetching tomcat history:", err))
        .finally(() => setLoading(false));
    }
  }, [app, timeRange]);

  if (!app) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <Activity size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{app.instanceName} Metrics</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <Server size={12} /> {app.serverIp}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-muted)', 
              cursor: 'pointer', padding: '0.5rem', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Time Range Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
          <Clock size={16} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '1rem' }}>Zaman Aralığı:</span>
          {['15m', '1h', '6h', '24h'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? 'var(--accent)' : 'var(--bg-card)',
                color: timeRange === range ? '#fff' : 'var(--text-main)',
                border: `1px solid ${timeRange === range ? 'var(--accent)' : 'var(--border-color)'}`,
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {range === '15m' ? t('dashboard.serverHealthDetail.timeRange.15m', '15m') : 
               range === '1h' ? t('dashboard.serverHealthDetail.timeRange.1h', '1h') : 
               range === '6h' ? t('dashboard.serverHealthDetail.timeRange.6h', '6h') : 
               t('dashboard.serverHealthDetail.timeRange.24h', '24h')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', minHeight: '400px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('cpu')}
              style={{
                background: 'transparent', border: 'none', 
                padding: '0.75rem 1rem', cursor: 'pointer',
                color: activeTab === 'cpu' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: activeTab === 'cpu' ? 600 : 400,
                borderBottom: `2px solid ${activeTab === 'cpu' ? 'var(--accent)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s', fontSize: '0.95rem'
              }}
            >
              <Zap size={16} /> CPU Usage
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              style={{
                background: 'transparent', border: 'none', 
                padding: '0.75rem 1rem', cursor: 'pointer',
                color: activeTab === 'memory' ? 'var(--success)' : 'var(--text-muted)',
                fontWeight: activeTab === 'memory' ? 600 : 400,
                borderBottom: `2px solid ${activeTab === 'memory' ? 'var(--success)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s', fontSize: '0.95rem'
              }}
            >
              <Server size={16} /> Memory (Heap)
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
              Veriler yükleniyor...
            </div>
          ) : (
            <>
              {/* Chart Area */}
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="var(--text-muted)" 
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      tickMargin={10}
                      minTickGap={30}
                      axisLine={false}
                    />
                    <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(val) => `%${val}`} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                    
                    {activeTab === 'cpu' && (
                      <Area type="monotone" dataKey="cpu" name="CPU" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" animationDuration={1000} />
                    )}
                    {activeTab === 'memory' && (
                      <Area type="monotone" dataKey="memory" name="Memory" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" animationDuration={1000} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TomcatChartsModal;

