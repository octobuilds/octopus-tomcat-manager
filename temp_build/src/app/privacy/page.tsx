import { getDictionary } from '@/lib/getDictionary';

export default async function PrivacyPage() {
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32 pb-24 min-h-screen">
      <div className="container max-w-4xl">
        
        <div className="legal-section">
          <div className="section-header text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Gizlilik Politikası
            </h1>
            <p className="legal-meta text-text-muted">
              Son Güncelleme: 1 Ocak 2026
            </p>
          </div>

          <div className="legal-content bg-bg-card border border-border-color p-8 md:p-12 rounded-2xl shadow-sm text-text-secondary leading-relaxed">
            
            <p className="mb-6 font-medium text-text-main">
              OctopusAPM olarak gizliliğinize büyük önem veriyoruz. Hizmetlerimizi kullanırken kişisel verilerinizin ve sunucu bilgilerinizin nasıl işlendiğini bu politikada açıklıyoruz.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">1. Toplanan Veriler</h3>
            <p className="mb-6">
              Hizmetlerimizi sunabilmek için şu verileri topluyoruz:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Hesap Bilgileri:</strong> Adınız, e-posta adresiniz, fatura bilgileriniz.</li>
              <li><strong>Sunucu Meta Verileri:</strong> IP adresleriniz, SSH bağlantı yapılandırmalarınız.</li>
              <li><strong>Performans Metrikleri:</strong> CPU, RAM, Disk IO ve ağ kullanımı gibi teknik veriler. Log içerikleriniz sadece canlı (WebSocket) olarak aktarılır ve kendi sunucularımızda siz aksini talep etmedikçe kalıcı olarak loglanmaz.</li>
            </ul>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">2. Verilerin Kullanımı</h3>
            <p className="mb-6">
              Toplanan veriler yalnızca size APM (Application Performance Monitoring) hizmeti sunmak, dashboard üzerinden grafiklerinizi çizmek ve uyarı/alarm bildirimlerini (e-posta, Slack vb.) gönderebilmek amacıyla işlenir.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">3. Veri Güvenliği ve Şifreleme</h3>
            <p className="mb-6">
              Sunucularınıza bağlanmak için kullandığınız SSH anahtarları ve şifreler AES-256 standartlarında şifrelenir. Veritabanımız yetkisiz erişimlere karşı endüstri standardı güvenlik duvarları ve izole ağlar (VPC) ile korunmaktadır. Tüm veri transferleri SSL/TLS ile şifrelenir.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">4. Çerezler (Cookies)</h3>
            <p className="mb-6">
              Platformumuzda oturum yönetimi, dil seçimi (TR/EN tercihleri) ve temel performans analizi için zorunlu çerezler kullanılmaktadır. Üçüncü taraf reklam çerezleri platform (dashboard) içinde kullanılmaz.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">5. İletişim</h3>
            <p className="mb-0">
              Gizlilik politikamız ile ilgili soru ve talepleriniz için <strong>privacy@octopusapm.com</strong> adresi üzerinden veri koruma ekibimizle iletişime geçebilirsiniz.
            </p>

          </div>
        </div>
        
      </div>
    </div>
  );
}
