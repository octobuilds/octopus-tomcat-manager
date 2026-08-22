import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, Activity, Settings, LogOut, ChevronDown, ChevronRight, Layers, Menu, Shield, Terminal, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

interface Props {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sadece bir menünün açık kalması için (Akordeon mantığı)
  const [openMenu, setOpenMenu] = useState<string | null>('serverManagement');

  const toggleMenu = (menuId: string) => {
    setOpenMenu(prev => (prev === menuId ? null : menuId));
  };

  const currentUser = JSON.parse(localStorage.getItem('apm_user') || '{}');
  const permissions = currentUser.permissions || {};
  const isAdmin = currentUser.role === 'ADMIN';

  const canManageUsers = isAdmin || permissions.canManageUsers;
  const canManageRoles = isAdmin || permissions.canManageRoles;
  const canViewLogs = isAdmin || permissions.canViewLogs;

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={18} />, label: t('dashboard.menu.overview') },
    { 
      id: 'serverManagement',
      icon: <Server size={18} />, 
      label: t('dashboard.menu.serverManagement'),
      children: [
        { path: '/servers', label: t('dashboard.menu.myServers') },
        { path: '/servers/health', label: t('dashboard.menu.systemHealth') }
      ]
    },
    {
      id: 'runtimeManagement',
      icon: <Layers size={18} />,
      label: t('dashboard.menu.runtimeManagement'),
      children: [
        { path: '/runtimes/tomcat', label: t('dashboard.menu.tomcatApplications') }
      ]
    },
    (canManageUsers || canManageRoles) ? {
      id: 'systemManagement',
      icon: <Shield size={18} />,
      label: t('dashboard.menu.systemManagement'),
      children: [
        ...(canManageUsers ? [{ path: '/system/users', label: t('dashboard.menu.users') }] : []),
        ...(canManageRoles ? [{ path: '/system/roles', label: t('dashboard.menu.roles') }] : [])
      ]
    } : null,
    isAdmin ? { path: '/alarms', icon: <Bell size={18} />, label: t('dashboard.alarms.title') } : null,
    isAdmin ? { path: '/logs', icon: <Terminal size={18} />, label: 'Logs' } : null,
  ].filter(Boolean) as any[];

  return (
    <div className="dashboard-container sidebar-layout-container">
      {/* SIDEBAR */}
      <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{ maxHeight: '45px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.2rem' }}>OctopusAPM</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = openMenu === item.id;
              return (
                <div key={item.id} className="sidebar-item-group">
                  <div className="sidebar-item-header" onClick={() => toggleMenu(item.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  {isOpen && (
                    <div className="sidebar-subnav">
                      {item.children.map(child => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`sidebar-subitem ${location.pathname === child.path ? 'active' : ''}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link 
                key={item.path} 
                to={item.path as string} 
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings" className="sidebar-item">
            <Settings size={18} />
            {t('dashboard.menu.settings')}
          </Link>
          <button onClick={() => {
            localStorage.removeItem('apm_authenticated');
            localStorage.removeItem('apm_user');
            localStorage.removeItem('apm_token');
            navigate('/login');
          }} className="sidebar-item logout-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <LogOut size={18} />
            {t('dashboard.menu.logout')}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="sidebar-main">
        
        {/* Floating Button for Fullscreen Mode */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ 
              position: 'fixed', top: '1rem', left: '1rem', zIndex: 100,
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem', 
              borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)'
            }}
            title="Menüyü Göster"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Simple Topbar just for user profile etc. in Sidebar layout */}
        {isSidebarOpen && (
          <header className="sidebar-topbar">
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                title={isSidebarOpen ? "Menüyü Gizle" : "Menüyü Göster"}
              >
                <Menu size={22} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               {/* Componentlerde position: absolute var ancak SidebarLayout içinde de sorunsuz çalışır, 
                   ThemeToggle bottom-left olduğu için sidebar altında görünür, 
                   LanguageSwitcher top-right olduğu için topbar'da görünür. */}
               <LanguageSwitcher />
               <ThemeToggle />
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 10 }}>
                 {(() => {
                   try {
                     const user = JSON.parse(localStorage.getItem('apm_user') || '{}');
                     const name = user.name || user.email || 'A';
                     return name.charAt(0).toUpperCase();
                   } catch {
                     return 'A';
                   }
                 })()}
               </div>
            </div>
          </header>
        )}

        <main className="sidebar-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
