import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SetupWizard.css';
import WelcomeStep from './Steps/WelcomeStep';
import DatabaseStep from './Steps/DatabaseStep';
import SmtpStep from './Steps/SmtpStep';
import SuccessStep from './Steps/SuccessStep';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';

export interface SetupFormData {
  dbHost?: string;
  dbPort?: string;
  dbUser?: string;
  dbPass?: string;
  dbName?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  adminEmail?: string;
  adminPass?: string;
}

const SetupWizard: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SetupFormData>({
    dbHost: 'postgres',
    dbPort: '5432',
    dbName: 'apm_tool',
    dbUser: 'postgres',
    dbPass: '1234'
  });

  const steps = [
    { id: 1, title: t('setup.common.stepWelcome') },
    { id: 2, title: t('setup.common.stepDatabase') },
    { id: 3, title: t('setup.common.stepSmtp') },
    { id: 4, title: t('setup.common.stepSuccess') },
  ];

  const updateFormData = (data: Partial<SetupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={nextStep} />;
      case 2:
        return <DatabaseStep data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <SmtpStep data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <SuccessStep data={formData} />;
      default:
        return <WelcomeStep onNext={nextStep} />;
    }
  };

  return (
    <div className="setup-wizard-container">
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <LanguageSwitcher />
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div className="setup-wizard-card">
        
        {currentStep < 4 && (
          <div className="wizard-progress">
            {steps.slice(0, 3).map((step) => (
              <div 
                key={step.id} 
                className={`progress-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                title={step.title}
              >
                {currentStep > step.id ? '✓' : step.id}
              </div>
            ))}
          </div>
        )}

        <div className="step-container">
          {renderStep()}
        </div>
        
      </div>
    </div>
  );
};

export default SetupWizard;
