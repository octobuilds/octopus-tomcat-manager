import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SetupFormData } from '..';

interface Props {
  data: SetupFormData;
  updateData: (data: Partial<SetupFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SmtpStep: React.FC<Props> = ({ data, updateData, onNext, onPrev }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="step-content">
      <div className="wizard-header">
        <h1>{t('setup.smtp.title')}</h1>
        <p>{t('setup.smtp.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div className="form-group">
          <label>{t('setup.smtp.host')} {t('setup.common.optional')}</label>
          <input 
            type="text" 
            placeholder={t('setup.smtp.hostPlaceholder')} 
            value={data.smtpHost || ''}
            onChange={(e) => updateData({ smtpHost: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>{t('setup.smtp.port')} {t('setup.common.optional')}</label>
          <input 
            type="text" 
            placeholder={t('setup.smtp.portPlaceholder')} 
            value={data.smtpPort || ''}
            onChange={(e) => updateData({ smtpPort: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('setup.smtp.user')} {t('setup.common.optional')}</label>
            <input 
              type="email" 
              placeholder={t('setup.smtp.userPlaceholder')} 
              value={data.smtpUser || ''}
              onChange={(e) => updateData({ smtpUser: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('setup.smtp.pass')} {t('setup.common.optional')}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={t('setup.smtp.passPlaceholder')} 
                value={data.smtpPass || ''}
                onChange={(e) => updateData({ smtpPass: e.target.value })}
                style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '0.75rem', background: 'none', border: 'none', 
                  color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' 
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="wizard-actions">
          <button type="button" className="btn btn-secondary" onClick={onPrev}>
            {t('setup.common.prev')}
          </button>
          <button type="submit" className="btn btn-primary">
            {t('setup.common.next')} / {t('setup.common.skip')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmtpStep;
