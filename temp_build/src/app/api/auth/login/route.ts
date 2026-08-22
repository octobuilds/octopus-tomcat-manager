import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Basit doğrulama (Geliştirme için)
        if (email === 'admin@octopusapm.com' && password === 'admin123') {
            const token = await new SignJWT({ email, role: 'admin' })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('24h')
                .sign(new TextEncoder().encode(JWT_SECRET));

            const response = NextResponse.json({ success: true, redirectUrl: '/dashboard' });
            
            response.cookies.set({
                name: 'octopus_session',
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 // 24 hours
            });

            return response;
        }

        return NextResponse.json(
            { success: false, error: 'E-posta veya şifre hatalı' },
            { status: 401 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
