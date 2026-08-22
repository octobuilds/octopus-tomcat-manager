'use client';

export default function SettingsPage() {
    return (
        <div>
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-main mb-2 tracking-tight">Ayarlar</h1>
                <p className="text-muted text-lg">Yönetici hesap ayarlarınızı ve sistem konfigürasyonlarını yapılandırın.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className="lg:col-span-2 glass-card p-8">
                    <h2 className="text-xl font-bold text-main mb-6 border-b border-[var(--border-color)] pb-4">Profil Bilgileri</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-accent text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20">
                                A
                            </div>
                            <div>
                                <button className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-sm font-bold text-main hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                    Fotoğrafı Değiştir
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-muted mb-2">Ad Soyad</label>
                                <input type="text" defaultValue="Admin User" className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-main focus:border-accent transition-colors outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-muted mb-2">E-posta Adresi</label>
                                <input type="email" defaultValue="admin@octopusapm.com" className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-main focus:border-accent transition-colors outline-none opacity-70" readOnly />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold transition-all shadow-lg">
                                Değişiklikleri Kaydet
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-bold text-main mb-6 border-b border-[var(--border-color)] pb-4">Güvenlik</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-muted mb-2">Mevcut Şifre</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-main focus:border-accent transition-colors outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-muted mb-2">Yeni Şifre</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-main focus:border-accent transition-colors outline-none" />
                        </div>
                        
                        <div className="pt-2">
                            <button className="w-full px-6 py-3 rounded-xl border border-[var(--border-color)] text-main font-bold hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                Şifreyi Güncelle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
