'use client';

import { useState } from 'react';

export default function DashboardOverview() {
    const [copied, setCopied] = useState(false);
    
    // Admin license key (mocked for frontend demo, usually fetched from API)
    const adminLicense = "eyJhbGciOiJSUzI1NiJ9.eyJtYWNoaW5lSWQiOiJhZG1pbiIsIm1heFVzZXJzIjo5OTk5LCJtYXhTZXJ2ZXJzIjo5OTk5fQ.signature_mock";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(adminLicense);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-main mb-2 tracking-tight">Genel Bakış</h1>
                <p className="text-muted text-lg">OctopusAPM yönetici paneline hoş geldiniz. Sisteminizi buradan yapılandırabilirsiniz.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* Master License Card */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.1)] text-accent-green flex items-center justify-center">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                        </div>
                        <h2 className="text-xl font-bold text-main">Master Lisans Anahtarı</h2>
                    </div>
                    <p className="text-muted mb-4 text-sm flex-1">
                        Bu anahtar sınırsız yetkiye sahiptir ve admin node'larını başlatmak için kullanılır. Ajan kurulumunda `config.yaml` içerisine ekleyin.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-[var(--background)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-accent-green text-sm overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                            {adminLicense}
                        </code>
                        <button 
                            onClick={copyToClipboard}
                            className={`px-4 py-3 rounded-xl font-bold transition-all ${copied ? 'bg-accent-green text-black' : 'bg-[var(--background)] border border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                        >
                            {copied ? 'Kopyalandı!' : 'Kopyala'}
                        </button>
                    </div>
                </div>

                {/* Download Agent Card */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(59,130,246,0.1)] text-accent flex items-center justify-center">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </div>
                        <h2 className="text-xl font-bold text-main">Ajanı (Agent) İndir</h2>
                    </div>
                    <p className="text-muted mb-6 text-sm flex-1">
                        Sunucularınızdaki (Linux/Windows) metrikleri ve logları okuyup merkeze iletmek için OctopusAPM Ajan uygulamasını indirin.
                    </p>
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold transition-all shadow-lg">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        octopusapm-agent-v2.0.zip
                    </button>
                </div>
            </div>

            {/* Quick Start */}
            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-main mb-6">Hızlı Kurulum Rehberi</h2>
                
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent-green text-black font-bold flex items-center justify-center shrink-0">1</div>
                        <div>
                            <h3 className="font-bold text-main mb-1 text-lg">Dosyayı Çıkartın</h3>
                            <p className="text-muted text-sm mb-2">İndirdiğiniz zip dosyasını sunucunuzda (örn: <code>/opt/octopusapm</code>) dizinine çıkartın.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent-green text-black font-bold flex items-center justify-center shrink-0">2</div>
                        <div>
                            <h3 className="font-bold text-main mb-1 text-lg">Lisans Anahtarını Ekleyin</h3>
                            <p className="text-muted text-sm mb-3"><code>config.yaml</code> dosyasını açıp yukarıdaki lisans anahtarınızı yapıştırın.</p>
                            <code className="block bg-[var(--background)] p-4 rounded-xl border border-[var(--border-color)] text-sm font-mono text-purple-400">
                                license_key: "eyJhbGci..."<br/>
                                server_name: "prod-node-1"
                            </code>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent-green text-black font-bold flex items-center justify-center shrink-0">3</div>
                        <div>
                            <h3 className="font-bold text-main mb-1 text-lg">Ajanı Başlatın</h3>
                            <p className="text-muted text-sm mb-3">Başlatma komutunu çalıştırarak logların merkeze iletilmesini sağlayın.</p>
                            <code className="block bg-[var(--background)] p-4 rounded-xl border border-[var(--border-color)] text-sm font-mono text-accent">
                                ./start_agent.sh
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
