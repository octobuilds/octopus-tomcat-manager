'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Giriş başarısız');
            }
        } catch (err) {
            setError('Sunucuya bağlanılamadı');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-main)' }}>Yönetici Girişi</h1>
                {error && <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>E-posta</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Şifre</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none' }} />
                    </div>
                    <button type="submit" disabled={isLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>&larr; Ana Sayfaya Dön</Link>
                </div>
            </div>
        </div>
    );
}
