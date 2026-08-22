import React, { useEffect, useState } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import SetupWizard from './components/SetupWizard';
import SidebarLayout from './layouts/SidebarLayout';
import Overview from './pages/Dashboard/Overview';
import Servers from './pages/Dashboard/Servers';
import AddServer from './pages/Dashboard/AddServer';
import SystemHealth from './pages/Dashboard/SystemHealth';
import ServerHealthDetail from './pages/Dashboard/ServerHealthDetail';
import TomcatApps from './pages/Dashboard/TomcatApps';
import Users from './pages/Dashboard/Users';
import Roles from './pages/Dashboard/Roles';
import Alarms from './pages/Dashboard/Alarms';
import Settings from './pages/Dashboard/Settings';
import Login from './pages/Auth/Login';
import AcceptInvite from './pages/Auth/AcceptInvite';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Logs from './pages/Dashboard/Logs';
import AuditLogger from './components/AuditLogger';
import './App.css'; 

// Global fetch interceptor to automatically inject Authorization token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && resource.includes('/api/')) {
    const token = localStorage.getItem('apm_token');
    if (token) {
      config = config || {};
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  
  return originalFetch(resource, config);
};

// Basit bir guard: Kurulum yapıldı mı ve Giriş yapıldı mı?
const RequireAuthAndSetup = ({ children, isSetupComplete }: { children: React.ReactNode, isSetupComplete: boolean }) => {
  if (!isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }
  
  const isAuth = localStorage.getItem('apm_authenticated') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [setupStatus, setSetupStatus] = useState<'checking' | 'complete' | 'incomplete'>('checking');

  useEffect(() => {
    fetch('/api/setup/status')
      .then(res => res.json())
      .then(data => {
        if (data.isSetupComplete) {
          localStorage.setItem('apm_setup_complete', 'true');
          setSetupStatus('complete');
        } else {
          localStorage.removeItem('apm_setup_complete');
          setSetupStatus('incomplete');
        }
      })
      .catch(() => {
        // Backend ulaşılamıyorsa veya veritabanı yoksa kurulum eksik sayılır
        setSetupStatus('incomplete');
      });
  }, []);

  if (setupStatus === 'checking') {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>Yükleniyor...</div>;
  }

  const isSetupComplete = setupStatus === 'complete';
  const isAuth = localStorage.getItem('apm_authenticated') === 'true';

  return (
    <BrowserRouter>
      <AuditLogger />
      <Routes>
        <Route path="/setup" element={isSetupComplete ? <Navigate to={isAuth ? "/" : "/login"} replace /> : <SetupWizard />} />
        
        {/* If trying to access login but setup is not complete, redirect to setup */}
        <Route path="/login" element={!isSetupComplete ? <Navigate to="/setup" replace /> : <Login />} />

        {/* Invite link acceptance route (no auth required) */}
        <Route path="/invite/:token" element={<AcceptInvite />} />
        
        {/* Forgot and Reset Password routes (no auth required) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Dashboard Routes (Setup ve Auth gerekli) */}
        <Route path="/" element={<RequireAuthAndSetup isSetupComplete={isSetupComplete}><SidebarLayout><Outlet /></SidebarLayout></RequireAuthAndSetup>}>
          <Route index element={<Overview />} />
          <Route path="servers" element={<Servers />} />
          <Route path="servers/new" element={<AddServer />} />
          <Route path="servers/health" element={<SystemHealth />} />
          <Route path="servers/:id/health" element={<ServerHealthDetail />} />
          <Route path="runtimes/tomcat" element={<TomcatApps />} />
          <Route path="system/users" element={<Users />} />
          <Route path="system/roles" element={<Roles />} />
          <Route path="alarms" element={<Alarms />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
