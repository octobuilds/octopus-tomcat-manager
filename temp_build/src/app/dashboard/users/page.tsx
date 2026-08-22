'use client';

import { useState } from 'react';

// Mock data
const mockUsers = [
    { id: 1, email: 'demo_user1@acme.com', role: 'customer', createdAt: '2026-08-01', licenseKey: null },
    { id: 2, email: 'tech_lead@startup.io', role: 'customer', createdAt: '2026-08-02', licenseKey: 'eyJhbGciOiJSUzI1NiJ9...' },
    { id: 3, email: 'admin@octopusapm.com', role: 'admin', createdAt: '2026-07-31', licenseKey: 'MASTER_KEY' }
];

export default function UsersPage() {
    const [users, setUsers] = useState(mockUsers);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [licenseForm, setLicenseForm] = useState({ maxServers: 10, maxUsers: 5 });

    const openLicenseModal = (id: number) => {
        setSelectedUser(id);
        setShowModal(true);
    };

    const submitLicense = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock generation
        const newKey = `eyJhbGciOiJSUzI1NiJ9.servers_${licenseForm.maxServers}.users_${licenseForm.maxUsers}.mock`;
        setUsers(users.map(u => u.id === selectedUser ? { ...u, licenseKey: newKey } : u));
        setShowModal(false);
    };

    return (
        <div>
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-main mb-2 tracking-tight">Kullanıcı Yönetimi</h1>
                    <p className="text-muted text-lg">Sisteme kayıtlı müşterileri ve lisans atamalarını buradan yönetin.</p>
                </div>
            </header>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Kullanıcı</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Rol</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Kayıt Tarihi</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Lisans Durumu</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[rgba(59,130,246,0.2)] text-accent flex items-center justify-center font-bold">
                                                {user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-main">{user.email.split('@')[0]}</div>
                                                <div className="text-sm text-muted">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-[rgba(139,92,246,0.15)] text-purple-400' : 'bg-[rgba(59,130,246,0.15)] text-accent'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-muted">
                                        {user.createdAt}
                                    </td>
                                    <td className="p-4">
                                        {user.licenseKey ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                                                <code className="text-sm text-accent-green font-mono">{user.licenseKey.substring(0,20)}...</code>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted italic">Lisans Yok</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => openLicenseModal(user.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${user.licenseKey ? 'border border-[var(--border-color)] text-main hover:bg-[rgba(255,255,255,0.05)]' : 'bg-accent-green text-black hover:bg-emerald-400'}`}
                                        >
                                            {user.licenseKey ? 'Yenile' : 'Lisans Üret'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* License Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-main">Yeni Lisans Üret</h3>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-main transition-colors">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={submitLicense} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-2">Sunucu Kotası</label>
                                    <input 
                                        type="number" 
                                        value={licenseForm.maxServers} 
                                        onChange={e => setLicenseForm({...licenseForm, maxServers: parseInt(e.target.value)})}
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-main focus:border-accent transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-2">Kullanıcı Kotası</label>
                                    <input 
                                        type="number" 
                                        value={licenseForm.maxUsers} 
                                        onChange={e => setLicenseForm({...licenseForm, maxUsers: parseInt(e.target.value)})}
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-main focus:border-accent transition-colors outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-muted hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                    İptal
                                </button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold transition-all shadow-lg shadow-blue-500/20">
                                    Lisans Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
