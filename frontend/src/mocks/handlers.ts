import { http, HttpResponse } from 'msw';

export const handlers = [
  // Setup & Auth
  http.get('/api/setup/status', () => HttpResponse.json({ isSetupComplete: true })),
  http.post('/api/auth/login', () => HttpResponse.json({ token: 'mock-demo-token', twoFactorRequired: false })),
  
  // Dashboard & Stats
  http.get('/api/stats', () => HttpResponse.json({
    success: true,
    stats: {
      totalServers: 4,
      activeServers: 3,
      totalProjects: 2,
      totalUsers: 8,
      avgResponseTime: 42,
      errorRate: 1.2,
      requestsPerMin: 1250
    }
  })),

  // System Health (Used by Servers -> Health)
  http.get('/api/stats/system-health', () => HttpResponse.json({
    success: true,
    servers: [
      { id: 1, name: 'prod-web-01', ip: '10.0.0.12', status: 'online', cpu: 15, ram: { used: 16, total: 32 }, disk: { used: 250, total: 500 }, network: { rx: 12.5, tx: 4.2 }, load: '0.45, 0.55, 0.50', uptime: 86400 * 5, isActive: true },
      { id: 2, name: 'prod-db-cluster', ip: '10.0.0.22', status: 'online', cpu: 45, ram: { used: 60, total: 64 }, disk: { used: 800, total: 1000 }, network: { rx: 45.2, tx: 22.8 }, load: '2.40, 2.10, 1.95', uptime: 86400 * 12, isActive: true },
      { id: 3, name: 'dev-test-server', ip: '10.0.0.50', status: 'offline', cpu: 0, ram: { used: 0, total: 16 }, disk: { used: 0, total: 250 }, network: { rx: 0, tx: 0 }, load: '0.0, 0.0, 0.0', uptime: 0, isActive: false },
    ]
  })),

  // Server Health Detail History
  http.get('/api/stats/system-health/*/history', () => HttpResponse.json({
    success: true,
    server: { name: 'prod-web-01', ip: '10.0.0.12' },
    current: {
      updatedAt: new Date().toISOString(),
      diskPartitions: [
        { mount_point: '/', used_gb: 40, total_gb: 100, usage_percent: 40 },
        { mount_point: '/var/log', used_gb: 45, total_gb: 50, usage_percent: 90 },
        { mount_point: '/data', used_gb: 165, total_gb: 350, usage_percent: 47 }
      ],
      topPaths: [
        { path: '/var/log/nginx/access.log', size: '12.4 GB' },
        { path: '/opt/tomcat/logs/catalina.out', size: '8.2 GB' },
        { path: '/home/deploy/backups.tar.gz', size: '4.1 GB' }
      ]
    },
    history: Array.from({ length: 60 }).map((_, i) => ({
      time: new Date(Date.now() - (60 - i) * 60000).toISOString(),
      cpu: Math.floor(Math.random() * 30) + 10,
      ram: Math.floor(Math.random() * 20) + 40,
      disk: 50 + (i * 0.01)
    }))
  })),

  // Servers
  http.get('/api/servers', () => HttpResponse.json({
    success: true,
    servers: [
      { id: 1, serverName: 'prod-web-01', serverIp: '10.0.0.12', status: 'online', os: 'linux', cpu: 15, ram: 42, disk: 50, lastSeen: new Date().toISOString() },
      { id: 2, serverName: 'prod-db-cluster', serverIp: '10.0.0.22', status: 'online', os: 'linux', cpu: 45, ram: 82, disk: 70, lastSeen: new Date().toISOString() },
      { id: 3, serverName: 'dev-test-server', serverIp: '10.0.0.50', status: 'offline', os: 'linux', cpu: 0, ram: 0, disk: 0, lastSeen: new Date(Date.now() - 3600000).toISOString() },
    ]
  })),

  // Tomcat (Expects raw array)
  http.get('/api/tomcat', () => HttpResponse.json([
    { id: 1, serverId: 1, serverIp: '10.0.0.12', path: '/opt/tomcat', port: 8080, status: 'running', version: '10.1.2', instanceName: 'Billing App', rssMb: 512, vszMb: 2048, warning: false },
    { id: 2, serverId: 2, serverIp: '10.0.0.22', path: '/usr/local/tomcat', port: 8080, status: 'stopped', version: '9.0.75', instanceName: 'Legacy API', rssMb: 0, vszMb: 1024, warning: true }
  ])),
  http.get('/api/tomcat/*/history', () => HttpResponse.json([
    { timestamp: new Date(Date.now() - 30000).toISOString(), cpu: 5, ram: 200 },
    { timestamp: new Date(Date.now() - 20000).toISOString(), cpu: 15, ram: 250 },
    { timestamp: new Date(Date.now() - 10000).toISOString(), cpu: 8, ram: 220 },
    { timestamp: new Date().toISOString(), cpu: 12, ram: 230 }
  ])),

  // Alarms
  http.get('/api/alarms', () => HttpResponse.json({
    success: true,
    alarms: [
      { id: 1, serverId: 2, name: 'Yüksek Bellek', targetType: 'SERVER', targetId: 2, metric: 'ram', operator: '>', threshold: 80, action: 'EMAIL', actionTarget: 'admin@demo.com', severity: 'warning', createdAt: new Date(Date.now() - 600000).toISOString(), isRead: false, isActive: true },
      { id: 2, serverId: 3, name: 'Sunucu Çöktü', targetType: 'SERVER', targetId: 3, metric: 'status', operator: '==', threshold: 'offline', action: 'WEBHOOK', actionTarget: 'https://api.slack.com', severity: 'critical', createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: false, isActive: true }
    ]
  })),

  // Logs & Audit (Expects raw array)
  http.get('/api/logs', () => HttpResponse.json([
    { id: 1, level: 'info', message: 'User admin logged in', createdAt: new Date().toISOString() },
    { id: 2, level: 'warning', message: 'High memory usage on prod-db-cluster', createdAt: new Date().toISOString() },
    { id: 3, level: 'error', message: 'SSH connection failed to dev-test-server', createdAt: new Date().toISOString() }
  ])),
  http.get('/api/audit', () => HttpResponse.json([
    { id: 1, action: 'LOGIN', username: 'demo', details: 'Successful login', createdAt: new Date().toISOString() }
  ])),

  // Settings & License
  http.get('/api/settings/machine-id', () => HttpResponse.json({ success: true, machineId: 'DEMO-MACHINE-OCTOPUS' })),
  http.get('/api/settings/license', () => HttpResponse.json({
    success: true,
    license: {
      isValid: true,
      licenseKey: 'DEMO-LICENSE-KEY',
      isActive: true,
      expiresAt: '2099-12-31T23:59:59Z',
      plan: 'PRO'
    }
  })),
  http.get('/api/settings/limits', () => HttpResponse.json({
    success: true,
    limits: {
      servers: { max: 100, current: 3 },
      alarms: { max: 50, current: 2 },
      tomcat: { max: 20, current: 2 },
      users: { max: 10, current: 1 },
      notificationsEnabled: true
    }
  })),
  http.get('/api/settings/smtp', () => HttpResponse.json({ host: 'smtp.demo.com', port: 587, user: 'demo@octopusapm.com' })),

  // Users & Roles (Expects raw array usually or { success: true })
  http.get('/api/users', () => HttpResponse.json({ success: true, users: [{ id: 1, name: 'Demo Admin', email: 'demo@octopusapm.com', role: 'ADMIN' }, { id: 2, name: 'Test Editor', email: 'test@demo.com', role: 'EDITOR' }] })),
  http.get('/api/roles', () => HttpResponse.json({ success: true, roles: [{ id: 1, name: 'ADMIN', permissions: { canManageServers: true, canViewCharts: true } }, { id: 2, name: 'EDITOR', permissions: { canViewCharts: true } }] })),
  http.get('/api/users/sessions', () => HttpResponse.json({ success: true, sessions: [{ id: 1, ip: '127.0.0.1', userAgent: 'Demo Browser', lastActive: new Date().toISOString() }] })),

  // Generic Fallback for POST/PUT/DELETE
  http.post('/api/*', () => HttpResponse.json({ success: true, id: 999 })),
  http.put('/api/*', () => HttpResponse.json({ success: true })),
  http.delete('/api/*', () => HttpResponse.json({ success: true })),
];
