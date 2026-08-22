import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getDictionary } from '@/lib/getDictionary'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OctopusAPM - Kapsamlı Sistem İzleme Çözümü',
  description: 'Sunucularınızı, veritabanlarınızı ve uygulamalarınızı tek noktadan izleyin.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'tr') as 'tr' | 'en';
  const dict = await getDictionary();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/old-site.css?v=2" />
        <link rel="stylesheet" href="/tailwind-mock.css?v=3" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning>
        <Navbar dict={dict.nav} currentLocale={locale} />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer dict={dict.footer} dictNav={dict.nav} />
      </body>
    </html>
  )
}
