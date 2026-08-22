import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onNext: () => void;
}

const WelcomeStep: React.FC<Props> = ({ onNext }) => {
  const { t } = useTranslation();

  return (
    <div className="step-content">
      <div className="wizard-header">
        <h1>{t('setup.welcome.title')}</h1>
        <p>{t('setup.welcome.subtitle')}</p>
      </div>
      
      <div style={{ marginTop: '2rem', marginBottom: '2rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
        <p>{t('setup.welcome.description')}</p>
        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
          <li>{t('setup.welcome.req1')}</li>
          <li>{t('setup.welcome.req2')}</li>
          <li>{t('setup.welcome.req3')}</li>
        </ul>
      </div>

      <div className="wizard-actions" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={onNext}>
          {t('setup.welcome.button')}
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
