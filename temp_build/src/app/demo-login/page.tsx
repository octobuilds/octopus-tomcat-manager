'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoLoginPage() {
    const [email, setEmail] = useState('demo@octopusapm.com');
    const [password, setPassword] = useState('demo123');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Fake loading for realistic effect
        setTimeout(() => {
            window.location.href = 'https://demo.octopusapm.com';
        }, 800);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', width: '48px', height: '48px', background: 'var(--accent)', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>
                        O
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>OctopusAPM Demo</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Demo ortamına erişmek için giriş yapın.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '0.875rem', background: 'var(--accent)', color: '#fff', border: 'none',
                            borderRadius: '8px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 14px var(--accent-glow)'
                        }}
                        onMouseOver={e => { if (!isLoading) e.currentTarget.style.filter = 'brightness(1.1)' }}
                        onMouseOut={e => { if (!isLoading) e.currentTarget.style.filter = 'none' }}
                    >
                        {isLoading ? 'Bağlanıyor...' : 'Demo Ortamına Gir'}
                    </button>
                </form>
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        &larr; Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
