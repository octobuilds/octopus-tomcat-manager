import React, { useState, useEffect, useRef } from 'react';
import { X, Search, RefreshCw, Folder, FileText, Play, FolderOpen } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const TomcatLogsModal = ({ app, onClose }) => {
  const [path, setPath] = useState('');
  const [mode, setMode] = useState('ls'); // 'ls', 'tail', 'cat', 'grep', 'live'
  const [grepPattern, setGrepPattern] = useState('');
  
  const [output, setOutput] = useState('');
  const [isDir, setIsDir] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveIntervalRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const stopLiveTail = () => {
    if (socketRef.current) {
      socketRef.current.emit('stop_tail');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    if (app) {
      setPath(`${app.catalinaBase || '/opt/tomcat'}/logs`);
      setMode('ls');
      fetchLogs(`${app.catalinaBase || '/opt/tomcat'}/logs`, 'ls');
    }
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      stopLiveTail();
    };
  }, [app]);

  const fetchLogs = (targetPath, targetMode, pattern = '') => {
    if (!app) return;
    setLoading(true);
    
    fetch(`/api/tomcat/${app.id}/logs/explore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: targetPath, mode: targetMode, grepPattern: pattern })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setOutput(data.result);
          setIsDir(data.isDir);
        } else if (data.error) {
          setOutput(`Error: ${data.error}\n${data.details || ''}`);
        } else {
          setOutput('Sonuç bulunamadı.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setOutput('Bağlantı hatası.');
        setLoading(false);
      });
  };

  const handleFetchClick = () => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    stopLiveTail();
    setOutput('');
    setIsDir(false);

    if (mode === 'live') {
      const socket = io('');
      socketRef.current = socket;
      
      socket.on('connect', () => {
        socket.emit('start_tail', {
          appId: app.id,
          path,
          grepPattern
        });
      });
      
      socket.on('log_line', (lines) => {
        setOutput(prev => {
           const next = prev + lines;
           // Keep buffer reasonable to avoid browser crash
           return next.length > 200000 ? next.substring(next.length - 200000) : next;
        });
      });
      
      socket.on('log_error', (err) => {
        setOutput(prev => prev + '\n[HATA] ' + err);
      });
    } else {
      fetchLogs(path, mode, grepPattern);
    }
  };

  const handleFileClick = (filename) => {
    const isFolder = filename.endsWith('/');
    const cleanFilename = filename.replace('/', '');
    const newPath = path.endsWith('/') ? `${path}${cleanFilename}` : `${path}/${cleanFilename}`;
    
    setPath(newPath);
    
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    stopLiveTail();

    if (isFolder) {
      setMode('ls');
      fetchLogs(newPath, 'ls');
    } else {
      setMode('tail');
      fetchLogs(newPath, 'tail');
    }
  };

  useEffect(() => {
    if (scrollRef.current && mode !== 'ls') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, mode]);

  if (!app) return null;

  // Dizin çıktısını tıklanabilir satırlara böl (ls -laF)
  const renderDirListing = () => {
    const lines = output.split('\n');
    return lines.map((line, i) => {
      if (!line.trim() || line.startsWith('total ')) return <div key={i}>{line}</div>;
      
      const parts = line.trim().split(/\s+/);
      const filename = parts.slice(7).join(' '); // ls -laF time-style=long-iso usually has filename at index 7+
      
      if (!filename) return <div key={i}>{line}</div>;

      const isFolder = filename.endsWith('/');
      const isLog = filename.includes('.log') || filename.includes('.out') || filename.includes('.txt');
      
      let color = '#d4d4d4';
      let Icon = FileText;
      
      if (isFolder) { color = '#3b82f6'; Icon = Folder; }
      else if (isLog) { color = '#27c93f'; }

      return (
        <div 
          key={i} 
          onClick={() => handleFileClick(filename)}
          style={{ 
            cursor: 'pointer', 
            padding: '2px 4px', 
            borderRadius: '4px',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Icon size={14} color={color}/>
          <span style={{ flex: 1, fontFamily: 'monospace' }}>
            {parts.slice(0, 7).join(' ')} <span style={{ color }}>{filename}</span>
          </span>
        </div>
      );
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
    }}>
      <div style={{
        background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-color)',
        width: '95%', maxWidth: '1200px', height: '85vh', display: 'flex', flexDirection: 'column',
        position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header / Toolbar */}
        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              value={path} 
              onChange={e => setPath(e.target.value)}
              placeholder="Dizin veya Dosya Yolu..."
              style={{ flex: 1, minWidth: '300px', padding: '0.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontFamily: 'monospace' }}
            />
            
            <select 
              value={mode} 
              onChange={e => setMode(e.target.value)}
              style={{ padding: '0.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="ls">Dizini Listele (ls -la)</option>
              <option value="tail">Son N Satırı Oku (tail)</option>
              <option value="grep">Grep ile Arama</option>
              <option value="cat">Tüm Dosyayı Oku (cat)</option>
              <option value="live">Canlı İzle (WebSocket)</option>
            </select>

            {mode === 'grep' && (
              <input 
                type="text" 
                value={grepPattern} 
                onChange={e => setGrepPattern(e.target.value)}
                placeholder="Aranacak kelime..."
                style={{ padding: '0.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            )}

            <button 
              onClick={handleFetchClick}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', 
                background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' 
              }}
            >
              {mode === 'live' ? <Play size={16}/> : <Search size={16}/>}
              {loading ? 'Bekleniyor...' : 'Çalıştır'}
            </button>

            {mode === 'ls' && (
              <button 
                onClick={() => {
                  const parentPath = path.substring(0, path.lastIndexOf('/'));
                  setPath(parentPath || '/');
                  setMode('ls');
                  fetchLogs(parentPath || '/', 'ls');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
              >
                <FolderOpen size={16}/> Üst Dizin
              </button>
            )}
          </div>
        </div>
        
        {/* Terminal Body */}
        <div 
          ref={scrollRef}
          style={{ 
            flex: 1, padding: '1.5rem', overflowY: 'auto', 
            fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: '0.9rem', 
            color: 'var(--text-main)', lineHeight: 1.6 
          }}
        >
          {loading && !output && (
            <div style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} className="spin" /> İşlem yapılıyor...
            </div>
          )}
          
          {!loading && isDir && renderDirListing()}
          
          {!isDir && output && (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {output}
              {mode === 'live' && (
                <div style={{ marginTop: '1rem', color: '#27c93f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={14} className="spin" /> Canlı log akışı bekleniyor...
                </div>
              )}
            </div>
          )}
        </div>
        
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    </div>
  );
};

export default TomcatLogsModal;
