import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuditLogger: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Sadece giriş yapmış kullanıcılar için log tut
      const token = localStorage.getItem('apm_token');
      if (!token) return;

      const target = (e.target as HTMLElement).closest('button, a');
      
      if (target) {
        let actionName = target.getAttribute('aria-label') || target.textContent?.trim() || 'Bilinmeyen Buton';
        
        // Çok uzun metinleri kısalt (örn: iç içe çok div olan butonlar)
        if (actionName.length > 50) {
          actionName = actionName.substring(0, 50) + '...';
        }
        
        // Sadece anlamlı bir ismi varsa kaydet
        if (actionName && actionName !== '') {
          // Arka planda sessizce API'ye gönder
          fetch('/api/audit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              action: `Tıkladı: ${actionName}`,
              details: `Sayfa: ${location.pathname}`
            })
          }).catch(err => {
            // Sessizce yut, kullanıcının deneyimini bozmasın
            console.error('Audit Log gönderilemedi', err);
          });
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [location.pathname]);

  return null; // Arayüzü yok, sadece arka planda çalışır
};

export default AuditLogger;
