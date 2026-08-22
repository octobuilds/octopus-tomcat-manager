import React from 'react';
import { useTranslation } from 'react-i18next';
import type { SetupFormData } from '..';

interface Props {
  data: SetupFormData;
  updateData: (data: Partial<SetupFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const AdminStep: React.FC<Props> = ({ data, updateData, onNext, onPrev }) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="step-content">
      <div className="wizard-header">
        <h1>{t('setup.admin.title')}</h1>
        <p>{t('setup.admin.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div className="form-group">
          <label>{t('setup.admin.email')}</label>
          <input 
            type="email" 
            placeholder={t('setup.admin.emailPlaceholder')} 
            required 
            value={data.adminEmail || ''}
            onChange={(e) => updateData({ adminEmail: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>{t('setup.admin.pass')}</label>
          <input 
            type="password" 
            placeholder={t('setup.admin.passPlaceholder')} 
            required 
            value={data.adminPass || ''}
            onChange={(e) => updateData({ adminPass: e.target.value })}
          />
        </div>

        <div className="wizard-actions">
          <button type="button" className="btn btn-secondary" onClick={onPrev}>
            {t('setup.common.prev')}
          </button>
          <button type="submit" className="btn btn-primary">
            {t('setup.common.finish')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminStep;
