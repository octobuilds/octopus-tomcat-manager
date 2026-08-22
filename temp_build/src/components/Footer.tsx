import Link from 'next/link';

interface FooterProps {
  dict: Record<string, string>;
  dictNav: Record<string, string>;
}

export default function Footer({ dict, dictNav }: FooterProps) {
  const f = dict || {} as Record<string, string>;
  const n = dictNav || {} as Record<string, string>;
  
  return (
    <footer>
      <div className="container footer-container">
        <div className="footer-brand">
          <Link href="/" className="logo">
            <img src="/logo.png" alt="OctopusAPM Logo" />
            <span className="logo-text">OctopusAPM</span>
          </Link>
        </div>
        
        <div className="footer-links">
          <div className="link-column">
            <h4>{f.product || 'ÜRÜN'}</h4>
            <Link href="/features">{n.features || 'Özellikler'}</Link>
            <Link href="/how-it-works">{n.howItWorks || 'Nasıl Çalışır?'}</Link>
            <Link href="/pricing">{n.pricing || 'Paketler'}</Link>
          </div>
          
          <div className="link-column">
            <h4>{f.company || 'ŞİRKET'}</h4>
            <Link href="/pricing">{n.pricing}</Link>
            <Link href="/contact">{n.demo || 'Demo'}</Link>
            <Link href="/terms">{f.terms || 'Kullanım Şartları'}</Link>
            <Link href="/privacy">{f.privacy || 'Gizlilik Politikası'}</Link>
            <Link href="/refund">{f.refund || 'İade Politikası'}</Link>
          </div>
          
          <div className="link-column">
            <h4>{f.support || 'DESTEK'}</h4>
            <Link href="/faq">{f.faq || 'Sıkça Sorulan Sorular'}</Link>
            <a href="mailto:support@octopusapm.com">support@octopusapm.com</a>
            <Link href="/release-notes">{f.releaseNotes || 'Sürüm Notları'}</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 OctopusAPM. {f.rights || 'Tüm hakları saklıdır.'}</p>
      </div>
    </footer>
  );
}
