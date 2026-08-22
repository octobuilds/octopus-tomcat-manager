import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { SetupFormData } from '..';

interface Props {
  data: SetupFormData;
}

const SuccessStep: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [copied, setCopied] = useState(false);
  const hasRun = useRef(false);

  const handleCopy = () => {
    const textToCopy = `${t('setup.success.credentialsEmail')} admin@octopusapm.com\n${t('setup.success.credentialsPass')} admin123`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runSetup = async () => {
      try {
        setStatusText(t('setup.success.steps.connecting'));
        setProgress(20);

        const response = await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setProgress(100);
          setStatusText(t('setup.success.steps.finishing'));
          localStorage.setItem('apm_setup_complete', 'true');
          setTimeout(() => setIsProcessing(false), 1000);
        } else {
          setStatusText('Hata: ' + (result.message || 'Kurulum başarısız'));
          setProgress(100);
          // Hata durumunda kurulumu tamamlandı işaretlemiyoruz
        }
      } catch (error: any) {
        setStatusText('Bağlantı Hatası: ' + error.message);
        setProgress(100);
      }
    };

    runSetup();
  }, [data, t]);

  return (
    <div className="step-content text-center">
      {isProcessing ? (
        <div style={{ padding: '3rem 0' }}>
          <div className="wizard-header">
            <h2>{t('setup.success.processingTitle')}</h2>
            <p>{t('setup.success.processingSubtitle')}</p>
          </div>
          <div style={{ marginTop: '2.5rem', maxWidth: '400px', margin: '2.5rem auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
              <span>{statusText}</span>
              <span style={{ color: 'var(--accent)' }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', borderRadius: '4px', transition: 'width 0.1s linear' }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem 0' }}>
          <div className="success-icon">✓</div>
          <div className="wizard-header">
            <h1 style={{ background: 'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip: 'text' }}>
              {t('setup.success.successTitle')}
            </h1>
            <p>{t('setup.success.successSubtitle')}</p>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'left', maxWidth: '400px', margin: '2rem auto 0', position: 'relative' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {t('setup.success.credentialsTitle')}
              <button 
                onClick={handleCopy}
                style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                title={t('setup.success.copy')}
              >
                {copied ? t('setup.success.copied') : t('setup.success.copy')}
              </button>
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('setup.success.credentialsEmail')}</span>
              <strong style={{ color: 'var(--accent)' }}>admin@octopusapm.com</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('setup.success.credentialsPass')}</span>
              <strong style={{ color: 'var(--accent)' }}>admin123</strong>
            </div>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {t('setup.success.credentialsWarning')}
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
              {t('setup.success.button')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStep;
