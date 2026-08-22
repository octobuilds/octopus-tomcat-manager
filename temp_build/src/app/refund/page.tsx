import { getDictionary } from '@/lib/getDictionary';

export default async function RefundPage() {
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32 pb-24 min-h-screen">
      <div className="container max-w-4xl">
        
        <div className="legal-section">
          <div className="section-header text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              İade Politikası
            </h1>
            <p className="legal-meta text-text-muted">
              Son Güncelleme: 1 Ocak 2026
            </p>
          </div>

          <div className="legal-content bg-bg-card border border-border-color p-8 md:p-12 rounded-2xl shadow-sm text-text-secondary leading-relaxed">
            
            <p className="mb-6 font-medium text-text-main">
              Müşteri memnuniyeti bizim için önceliklidir. Ancak dijital bir hizmet sağladığımız için iade süreçlerimiz belirli kurallara tabidir.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">1. 14 Günlük Koşulsuz İade Hakkı</h3>
            <p className="mb-6">
              OctopusAPM aboneliğinizi başlattıktan sonraki ilk 14 gün içerisinde hizmetimizden memnun kalmazsanız, hiçbir gerekçe göstermeksizin tam ücret iadesi talep edebilirsiniz. Bu hak yalnızca ilk kez abone olan kullanıcılar için geçerlidir. Yenilenen aboneliklerde 14 günlük koşulsuz iade hakkı bulunmamaktadır.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">2. Yıllık Planlarda İptal ve İade</h3>
            <p className="mb-6">
              Yıllık plan satın alımlarında 14 gün geçtikten sonra iptal talep edilmesi durumunda, kullanılmış aylar aylık standart tarife üzerinden hesaplanır ve kalan bakiye tarafınıza iade edilir.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">3. İade Süreci</h3>
            <p className="mb-6">
              İade talebinizi oluşturmak için kontrol panelinizdeki "Faturalandırma" bölümünden "İptal ve İade" butonuna tıklayabilir veya e-posta yoluyla bize ulaşabilirsiniz.
              Talebiniz onaylandıktan sonra iade işleminin kredi kartınıza yansıması, bankanıza bağlı olarak 3-7 iş günü sürebilmektedir.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">4. İletişim</h3>
            <p className="mb-0">
              İade talepleri veya faturalandırma ile ilgili sorularınız için <strong>billing@octopusapm.com</strong> adresi üzerinden bizimle iletişime geçebilirsiniz.
            </p>

          </div>
        </div>
        
      </div>
    </div>
  );
}
