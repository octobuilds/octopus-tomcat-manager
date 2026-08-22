'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { href: '/dashboard', label: 'Genel Bakış', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { href: '/dashboard/users', label: 'Kullanıcılar', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { href: '/dashboard/settings', label: 'Ayarlar', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' }
    ];

    const handleLogout = async () => {
        // Clear cookie by setting it to expire
        document.cookie = "octopus_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 glass border-r border-[var(--border-color)] hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)]">
                    <Link href="/dashboard" className="text-xl font-bold text-main tracking-tight flex items-center gap-2">
                        <div className="w-6 h-6 bg-accent rounded md flex items-center justify-center">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        Admin
                    </Link>
                </div>
                
                <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
                    {menuItems.map(item => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link 
                                key={item.href}
                                href={item.href} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-[rgba(59,130,246,0.15)] text-accent border border-[rgba(59,130,246,0.3)]' : 'text-muted hover:bg-[rgba(255,255,255,0.05)] hover:text-main border border-transparent'}`}
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] mb-4">
                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">A</div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold text-main truncate">Admin</div>
                            <div className="text-xs text-muted truncate">admin@octopusapm.com</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-400 bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] rounded-lg transition-colors border border-[rgba(239,68,68,0.2)]">
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top header for mobile */}
                <div className="md:hidden h-16 glass border-b border-[var(--border-color)] flex items-center px-4 justify-between">
                    <span className="font-bold text-main">OctopusAPM Admin</span>
                    <button onClick={handleLogout} className="text-red-400 text-sm font-bold">Çıkış</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
