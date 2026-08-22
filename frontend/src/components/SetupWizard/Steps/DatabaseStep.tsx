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

const DatabaseStep: React.FC<Props> = ({ data, updateData, onNext, onPrev }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="step-content">
      <div className="wizard-header">
        <h1>{t('setup.database.title')}</h1>
        <p>{t('setup.database.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div className="form-group">
          <label>{t('setup.database.host')}</label>
          <input 
            type="text" 
            placeholder={t('setup.database.hostPlaceholder')} 
            required 
            value={data.dbHost || ''}
            onChange={(e) => updateData({ dbHost: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>{t('setup.database.port')}</label>
          <input 
            type="text" 
            placeholder={t('setup.database.portPlaceholder')} 
            required 
            value={data.dbPort || ''}
            onChange={(e) => updateData({ dbPort: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>{t('setup.database.dbName')}</label>
          <input 
            type="text" 
            placeholder={t('setup.database.dbNamePlaceholder')} 
            required 
            value={data.dbName || ''}
            onChange={(e) => updateData({ dbName: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('setup.database.user')}</label>
            <input 
              type="text" 
              placeholder={t('setup.database.userPlaceholder')} 
              required 
              value={data.dbUser || ''}
              onChange={(e) => updateData({ dbUser: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('setup.database.pass')}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={t('setup.database.passPlaceholder')} 
                required 
                value={data.dbPass || ''}
                onChange={(e) => updateData({ dbPass: e.target.value })}
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
            {t('setup.common.next')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DatabaseStep;
