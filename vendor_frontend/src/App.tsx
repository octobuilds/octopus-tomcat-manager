import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, LogOut, Users, Key, LayoutDashboard } from 'lucide-react'

// --- API Helper ---
const API_URL = 'http://localhost:5001/api'

// --- Auth Guard ---
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('vendor_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

// --- Layout ---
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('vendor_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-200 font-sans">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3 text-emerald-400">
          <ShieldCheck size={28} />
          <h1 className="text-xl font-bold tracking-wider">OCTOPUS VENDOR</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/clients" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition">
            <Users size={20} /> Müşteriler
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition">
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

// --- Pages ---

// 1. Login
const Login = () => {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password123')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('vendor_token', data.token)
        navigate('/')
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert("Bağlantı hatası")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="p-4 bg-emerald-500/20 rounded-full">
            <ShieldCheck size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Satıcı Portalı</h2>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Kullanıcı Adı</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Şifre</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500" />
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition mt-4">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  )
}

// 2. Dashboard
const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white">Sisteme Hoş Geldiniz</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 mb-2">Toplam Müşteri</h3>
            <p className="text-3xl font-bold text-emerald-400">0</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 mb-2">Aktif Lisanslar</h3>
            <p className="text-3xl font-bold text-emerald-400">0</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// 3. Clients
const Clients = () => {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', machineId: '' })

  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [licenseParams, setLicenseParams] = useState({ machineId: '', maxUsers: 10, maxServers: 10, maxApps: 10, maxAlarms: 10, notificationsEnabled: true, expireDays: 30 })
  const [generatedToken, setGeneratedToken] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('vendor_token')}` } })
      const data = await res.json()
      if (data.success) setClients(data.clients)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = async () => {
    const res = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('vendor_token')}` },
      body: JSON.stringify(newClient)
    })
    const data = await res.json()
    if (data.success) {
      setShowModal(false)
      fetchClients()
    }
  }

  const openLicenseModal = (client: any) => {
    setSelectedClientId(client.id)
    setLicenseParams({ ...licenseParams, machineId: client.machineId })
    setGeneratedToken('')
    setShowLicenseModal(true)
  }

  const handleGenerateLicense = async () => {
    const res = await fetch(`${API_URL}/licenses/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('vendor_token')}` },
      body: JSON.stringify({ clientId: selectedClientId, ...licenseParams })
    })
    const data = await res.json()
    if (data.success) {
      setGeneratedToken(data.license.licenseKey)
      fetchClients()
    } else {
      alert(data.message)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Müşteriler</h2>
        <button onClick={() => setShowModal(true)} className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium transition">
          + Yeni Müşteri
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-slate-400">
            <tr>
              <th className="p-4 font-medium">Müşteri Adı</th>
              <th className="p-4 font-medium">Machine ID</th>
              <th className="p-4 font-medium">Lisans Sayısı</th>
              <th className="p-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Yükleniyor...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Henüz müşteri eklenmedi.</td></tr>
            ) : clients.map(client => (
              <tr key={client.id} className="border-t border-slate-700/50">
                <td className="p-4 font-medium text-slate-200">{client.name}</td>
                <td className="p-4 text-slate-400 font-mono text-xs">{client.machineId}</td>
                <td className="p-4 text-slate-300">{client.licenses?.length || 0}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openLicenseModal(client)} className="text-emerald-400 hover:text-emerald-300 flex items-center justify-end gap-1 w-full">
                    <Key size={16} /> Lisans Üret
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Yeni Müşteri Ekle</h3>
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Firma Adı" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none" />
              <input type="text" placeholder="E-posta" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none" />
              <input type="text" placeholder="Machine ID (Müşterinin verdiği)" value={newClient.machineId} onChange={e => setNewClient({...newClient, machineId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-sm outline-none" />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">İptal</button>
                <button onClick={handleAddClient} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Generator Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-lg border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="text-emerald-400"/> Lisans Üret</h3>
            {!generatedToken ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-slate-400">Süre (Gün)</label>
                  <input type="number" value={licenseParams.expireDays} onChange={e => setLicenseParams({...licenseParams, expireDays: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Max Kullanıcı</label>
                    <input type="number" value={licenseParams.maxUsers} onChange={e => setLicenseParams({...licenseParams, maxUsers: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Max Sunucu</label>
                    <input type="number" value={licenseParams.maxServers} onChange={e => setLicenseParams({...licenseParams, maxServers: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Max Alarm</label>
                    <input type="number" value={licenseParams.maxAlarms} onChange={e => setLicenseParams({...licenseParams, maxAlarms: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none mt-1" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer p-3 w-full bg-slate-900 border border-slate-700 rounded-lg select-none">
                      <input type="checkbox" checked={licenseParams.notificationsEnabled} onChange={e => setLicenseParams({...licenseParams, notificationsEnabled: e.target.checked})} className="w-5 h-5 accent-emerald-500" />
                      <span className="text-sm text-slate-300">Bildirimler Aktif</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowLicenseModal(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">İptal</button>
                  <button onClick={handleGenerateLicense} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Üret</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 font-medium mb-2">Lisans Başarıyla Üretildi!</p>
                  <textarea readOnly value={generatedToken} className="w-full bg-black/50 border border-slate-700 rounded p-3 font-mono text-xs text-slate-300 outline-none h-32 resize-none" />
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={() => setShowLicenseModal(false)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium">Kapat</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// --- App ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
