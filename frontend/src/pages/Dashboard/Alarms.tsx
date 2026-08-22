import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Plus, Edit, Trash, X, Check, Activity, Search } from 'lucide-react';

interface AlarmRule {
  id: number;
  name: string;
  targetType: string;
  targetId: number | null;
  metric: string;
  operator: string;
  threshold: number;
  durationSecs: number;
  action: string;
  actionTarget: string;
  isActive: boolean;
}

const Alarms: React.FC = () => {
  const { t } = useTranslation();
  const [alarms, setAlarms] = useState<AlarmRule[]>([]);
  const [servers, setServers] = useState<{ id: number, serverName: string }[]>([]);
  const [tomcatApps, setTomcatApps] = useState<{ id: number, instanceName: string, serverIp: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<any>(null);

  const currentUser = JSON.parse(localStorage.getItem('apm_user') || '{}');
  const canManageAlarms = currentUser.role === 'ADMIN' || currentUser.permissions?.canManageServers;

  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState('SERVER');
  const [targetId, setTargetId] = useState<string>('');
  const [metric, setMetric] = useState('cpu');
  const [operator, setOperator] = useState('>');
  const [threshold, setThreshold] = useState<number | ''>('');
  const [durationSecs, setDurationSecs] = useState<number | ''>(60);
  const [actionType, setActionType] = useState('EMAIL');
  const [actionTarget, setActionTarget] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchAlarms();
    fetchServers();
    fetchTomcatApps();
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const res = await fetch('/api/settings/limits');
      const data = await res.json();
      if (data.success) {
        setLimits(data.limits);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alarms');
      const data = await res.json();
      if (data.success) {
        setAlarms(data.alarms);
      }
    } catch (e) {
      console.error('Error fetching alarms', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      if (data.success) {
        setServers(data.servers);
      }
    } catch (e) {
      console.error('Error fetching servers', e);
    }
  };

  const fetchTomcatApps = async () => {
    try {
      const res = await fetch('/api/tomcat');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTomcatApps(data);
      }
    } catch (e) {
      console.error('Error fetching tomcat apps', e);
    }
  };

  const handleOpenModal = (alarm?: AlarmRule) => {
    if (alarm) {
      setEditingAlarm(alarm);
      setName(alarm.name);
      setTargetType(alarm.targetType);
      setTargetId(alarm.targetId ? alarm.targetId.toString() : '');
      setMetric(alarm.metric);
      setOperator(alarm.operator);
      setThreshold(alarm.threshold);
      setDurationSecs(alarm.durationSecs);
      setActionType(alarm.action);
      setActionTarget(alarm.actionTarget || '');
      setIsActive(alarm.isActive);
    } else {
      setEditingAlarm(null);
      setName('');
      setTargetType('SERVER');
      setTargetId('');
      setMetric('cpu');
      setOperator('>');
      setThreshold('');
      setDurationSecs(60);
      setActionType('EMAIL');
      setActionTarget('');
      setIsActive(true);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || threshold === '') {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    const payload = {
      name,
      targetType,
      targetId: targetId ? parseInt(targetId) : null,
      metric,
      operator,
      threshold: parseFloat(threshold.toString()),
      durationSecs: durationSecs !== '' ? parseInt(durationSecs.toString()) : 0,
      action: actionType,
      actionTarget,
      isActive
    };

    try {
      const url = editingAlarm 
        ? `/api/alarms/${editingAlarm.id}` 
        : '/api/alarms';
      const method = editingAlarm ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchAlarms();
        fetchLimits();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Emin misiniz?')) return;
    try {
      const res = await fetch(`/api/alarms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAlarms();
        fetchLimits();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={28} color="var(--accent)" />
            {t('dashboard.alarms.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.alarms.subtitle')}</p>
        </div>
        {canManageAlarms && (
          <button 
            disabled={limits && limits.alarms.current >= limits.alarms.max}
            title={limits && limits.alarms.current >= limits.alarms.max ? `Lisans limitine ulaşıldı (Max: ${limits.alarms.max})` : 'Yeni Alarm'}
            onClick={() => handleOpenModal()}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: '8px', 
              color: (limits && limits.alarms.current >= limits.alarms.max) ? 'var(--text-muted)' : '#fff', 
              background: (limits && limits.alarms.current >= limits.alarms.max) ? 'var(--bg-dark)' : 'var(--accent)', 
              border: '1px solid ' + ((limits && limits.alarms.current >= limits.alarms.max) ? 'var(--border-color)' : 'transparent'), 
              fontWeight: 500, cursor: (limits && limits.alarms.current >= limits.alarms.max) ? 'not-allowed' : 'pointer', 
              boxShadow: (limits && limits.alarms.current >= limits.alarms.max) ? 'none' : '0 4px 14px var(--accent-glow)', 
              opacity: (limits && limits.alarms.current >= limits.alarms.max) ? 0.5 : 1,
              transition: 'all 0.2s' 
            }}
          >
            <Plus size={18} />
            {t('dashboard.alarms.addBtn')}
          </button>
        )}
      </div>

      {/* Alarms List */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dashboard.alarms.table.name')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dashboard.alarms.table.target')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dashboard.alarms.table.condition')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dashboard.alarms.table.action')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('dashboard.alarms.table.status')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>{t('dashboard.alarms.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</td></tr>
            ) : alarms.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Henüz alarm eklenmemiş.</td></tr>
            ) : alarms.map(alarm => (
              <tr key={alarm.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>{alarm.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  {alarm.targetType === 'SERVER' ? (alarm.targetId ? servers.find(s => s.id === alarm.targetId)?.serverName || 'Bilinmeyen Sunucu' : t('dashboard.alarms.modal.allServers')) : 'Tomcat'}
                </td>
                <td style={{ padding: '1rem', color: 'var(--warning)', fontWeight: 600 }}>
                  {alarm.metric.toUpperCase()} {alarm.operator} {alarm.threshold}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  {alarm.action} ({alarm.actionTarget})
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                    background: alarm.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: alarm.isActive ? 'var(--success)' : 'var(--text-muted)'
                  }}>
                    {alarm.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {canManageAlarms && (
                    <>
                      <button onClick={() => handleOpenModal(alarm)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginRight: '1rem' }}><Edit size={18} /></button>
                      <button onClick={() => handleDelete(alarm.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash size={18} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)',
            width: '90%', maxWidth: '600px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                {editingAlarm ? t('dashboard.alarms.modal.editTitle') : t('dashboard.alarms.modal.addTitle')}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.alarms.modal.name')}</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={t('dashboard.alarms.modal.namePlaceholder')}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.alarms.modal.targetType')}</label>
                  <select 
                    value={targetType} onChange={e => setTargetType(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="SERVER">{t('dashboard.alarms.modal.targetTypeServer')}</option>
                    <option value="TOMCAT">{t('dashboard.alarms.modal.targetTypeTomcat')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {targetType === 'SERVER' ? (t('dashboard.alarms.modal.targetId') || 'Hangi Sunucu (Which Server)') : 'Hangi Uygulama (Which App)'}
                  </label>
                  <select 
                    value={targetId} onChange={e => setTargetId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="">-- {targetType === 'SERVER' ? t('dashboard.alarms.modal.allServers') : 'Tüm Tomcat Uygulamaları'} --</option>
                    {targetType === 'SERVER' 
                      ? servers.map(s => <option key={s.id} value={s.id}>{s.serverName}</option>)
                      : tomcatApps.map(t => <option key={t.id} value={t.id}>{t.instanceName} ({t.serverIp})</option>)
                    }
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>İzlenecek Değer / Metrik</label>
                  <select 
                    value={metric} onChange={e => {
                      setMetric(e.target.value);
                      if (e.target.value === 'status') {
                        setOperator('==');
                        setThreshold(0); // 0 or whatever, not used for status but keeps type number
                      }
                    }}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    {targetType === 'SERVER' ? (
                      <>
                        <option value="cpu">{t('dashboard.alarms.modal.metricCpu')}</option>
                        <option value="ram">{t('dashboard.alarms.modal.metricRam')}</option>
                        <option value="disk">{t('dashboard.alarms.modal.metricDisk')}</option>
                        <option value="status">{t('dashboard.alarms.modal.metricServerStatus')}</option>
                      </>
                    ) : (
                      <>
                        <option value="cpu">{t('dashboard.alarms.modal.metricTomcatCpu')}</option>
                        <option value="ram">{t('dashboard.alarms.modal.metricTomcatRam')}</option>
                        <option value="status">{t('dashboard.alarms.modal.metricTomcatStatus')}</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.alarms.modal.operator')}</label>
                  <select 
                    value={operator} onChange={e => setOperator(e.target.value)}
                    disabled={metric === 'status'}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: metric === 'status' ? 'var(--text-muted)' : 'var(--text-main)', outline: 'none' }}
                  >
                    {metric !== 'status' && <option value=">">{t('dashboard.alarms.modal.operatorGt')}</option>}
                    {metric !== 'status' && <option value="<">{t('dashboard.alarms.modal.operatorLt')}</option>}
                    <option value="==">{t('dashboard.alarms.modal.operatorEq')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.alarms.modal.threshold')}</label>
                  {metric === 'status' ? (
                     <div style={{ width: '100%', padding: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '8px', color: 'var(--error)', outline: 'none', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
                       {t('dashboard.alarms.modal.statusDown')}
                     </div>
                  ) : (
                    <input 
                      type="number" value={threshold} onChange={e => setThreshold(e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder="80"
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.alarms.modal.duration')}</label>
                  <input 
                    type="number" value={durationSecs} onChange={e => setDurationSecs(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="60"
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.alarms.modal.actionTarget')}</label>
                  <input 
                    type="email" value={actionTarget} onChange={e => setActionTarget(e.target.value)}
                    placeholder={t('dashboard.alarms.modal.actionTargetPlaceholder')}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                  id="isActiveCheck"
                />
                <label htmlFor="isActiveCheck" style={{ color: 'var(--text-main)', cursor: 'pointer' }}>{t('dashboard.alarms.modal.status')}</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}
                >
                  {t('dashboard.alarms.modal.cancel')}
                </button>
                <button 
                  onClick={handleSave}
                  style={{ padding: '0.75rem 2rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, boxShadow: '0 4px 14px var(--accent-glow)' }}
                >
                  {t('dashboard.alarms.modal.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alarms;
