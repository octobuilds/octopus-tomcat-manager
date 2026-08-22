import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, Search, Filter, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';

const Logs: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [activeTab, setActiveTab] = useState<'system' | 'audit'>('system');
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'system') {
        let url = '/api/logs?';
        if (search) url += `search=${search}&`;
        if (level) url += `level=${level}&`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } else {
        const token = localStorage.getItem('apm_token');
        const response = await fetch('/api/audit', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAuditLogs(data);
        }
      }
    } catch (error) {
      console.error("Error fetching logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [level, activeTab]); // Arama (search) butona basınca veya enter'a basınca tetiklenecek

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getLevelIcon = (logLevel: string) => {
    switch (logLevel.toUpperCase()) {
      case 'ERROR': return <AlertCircle size={16} color="#ef4444" />;
      case 'WARN': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'DEBUG': return <Bug size={16} color="#8b5cf6" />;
      default: return <Info size={16} color="#3b82f6" />;
    }
  };

  const getLevelColor = (logLevel: string) => {
    switch (logLevel.toUpperCase()) {
      case 'ERROR': return '#ef4444';
      case 'WARN': return '#f59e0b';
      case 'DEBUG': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal size={32} color="var(--primary-color)" />
            {t('logs.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('logs.subtitle')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('system')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'system' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'system' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'system' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Sistem Logları
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'audit' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'audit' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Kullanıcı Hareketleri (Audit)
        </button>
      </div>

      {activeTab === 'system' ? (
        <>
          <div style={{ 
            display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'var(--bg-card)', 
            padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)',
            alignItems: 'center', flexWrap: 'wrap'
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, minWidth: '300px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder={t('dashboard.logs.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', 
                  background: 'var(--bg-dark)', border: '1px solid var(--border-color)', 
                  borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.95rem'
                }}
              />
              <button type="submit" style={{ display: 'none' }}>Ara</button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--text-muted)" />
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ 
                  padding: '0.75rem 2rem 0.75rem 1rem', background: 'var(--bg-dark)', 
                  border: '1px solid var(--border-color)', borderRadius: '8px', 
                  color: 'var(--text-main)', fontSize: '0.95rem', cursor: 'pointer'
                }}
              >
                <option value="">{t('dashboard.logs.allLevels')}</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>
          </div>

          <div style={{ 
            background: '#0c0c0c', borderRadius: '12px', border: '1px solid #333', 
            overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
          }}>
            <div style={{ 
              display: 'grid', gridTemplateColumns: '120px 120px 120px 80px 1fr', 
              padding: '1rem 1.5rem', background: '#1a1a1a', borderBottom: '1px solid #333',
              fontWeight: 600, color: '#888', fontSize: '0.85rem', letterSpacing: '0.05em',
              alignItems: 'center'
            }}>
              <div>{t('dashboard.logs.firstSeen')}</div>
              <div>{t('dashboard.logs.lastSeen')}</div>
              <div>{t('dashboard.logs.level')}</div>
              <div style={{ textAlign: 'center' }}>{t('dashboard.logs.count')}</div>
              <div>{t('dashboard.logs.message')}</div>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '0.5rem 0' }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>{t('dashboard.logs.loading')}</div>
              ) : logs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                  <Terminal size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                  {t('dashboard.logs.emptyState')}
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{ 
                    display: 'grid', gridTemplateColumns: '120px 120px 120px 80px 1fr', 
                    padding: '0.75rem 1.5rem', borderBottom: '1px solid #222',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: '0.85rem',
                    color: '#ccc', alignItems: 'center', gap: '0'
                  }}>
                    <div style={{ color: '#888' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                    <div style={{ color: '#888' }}>{new Date(log.updatedAt).toLocaleTimeString()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getLevelColor(log.level) }}>
                      {getLevelIcon(log.level)}
                      <span style={{ fontWeight: 600 }}>{log.level}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ 
                        background: '#333', color: '#fff', padding: '2px 8px', 
                        borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 
                      }}>{log.count}</span>
                    </div>
                    <div style={{ color: '#e0e0e0' }}>{log.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ 
          background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', 
          overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
        }}>
          <div style={{ 
            display: 'grid', gridTemplateColumns: '180px 250px 150px 1fr', 
            padding: '1rem 1.5rem', background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)',
            fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em',
            alignItems: 'center'
          }}>
            <div>Tarih & Saat</div>
            <div>Kullanıcı</div>
            <div>IP Adresi</div>
            <div>İşlem & Detaylar</div>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '0.5rem 0' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Henüz kayıt bulunmuyor.
              </div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} style={{ 
                  display: 'grid', gridTemplateColumns: '180px 250px 150px 1fr', 
                  padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.9rem', color: 'var(--text-main)', alignItems: 'center'
                }}>
                  <div style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{log.userEmail}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {log.userId}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--primary-color)' }}>{log.ip}</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{log.action}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.details}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
