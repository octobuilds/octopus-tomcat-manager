import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n';

// Global Fetch Interceptor to attach JWT token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');
  if (url.startsWith('')) {
    const token = localStorage.getItem('apm_token');
    if (token) {
      args[1] = args[1] || {};
      args[1].headers = {
        ...args[1].headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  
  const response = await originalFetch(...args);
  
  // If unauthorized, clear auth state and redirect to login
  if (response.status === 401 && !url.includes('/api/auth/login')) {
    localStorage.removeItem('apm_authenticated');
    localStorage.removeItem('apm_token');
    window.location.href = '/login';
  }
  
  return response;
};

async function enableMocking() {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    // Demo modunda login ekranını pas geçmek için sahte auth verileri:
    localStorage.setItem('apm_authenticated', 'true');
    localStorage.setItem('apm_setup_complete', 'true');
    localStorage.setItem('apm_token', 'mock-demo-token');
    localStorage.setItem('apm_user', JSON.stringify({
      id: 1,
      name: 'Demo Admin',
      email: 'demo@octopusapm.com',
      role: 'ADMIN',
      permissions: { canManageServers: true, canViewCharts: true }
    }));

    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: import.meta.env.BASE_URL + 'mockServiceWorker.js'
      }
    });
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
