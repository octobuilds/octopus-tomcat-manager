import { getDictionary } from '@/lib/getDictionary';

export default async function TermsPage() {
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32 pb-24 min-h-screen">
      <div className="container max-w-4xl">
        
        <div className="legal-section">
          <div className="section-header text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kullanım Şartları
            </h1>
            <p className="legal-meta text-text-muted">
              Son Güncelleme: 1 Ocak 2026
            </p>
          </div>

          <div className="legal-content bg-bg-card border border-border-color p-8 md:p-12 rounded-2xl shadow-sm text-text-secondary leading-relaxed">
            
            <h3 className="text-xl font-bold text-text-main mb-4 mt-0">1. Taraflar ve Sözleşmenin Konusu</h3>
            <p className="mb-6">
              Bu Kullanım Şartları (kısaca "Şartlar"), OctopusAPM (kısaca "Platform", "Biz" veya "Şirket") ile Platform'u kullanan siz ("Kullanıcı", "Siz") arasındaki yasal bir sözleşmedir. OctopusAPM hizmetlerini kullanarak bu Şartları kabul etmiş sayılırsınız. Eğer bu Şartları kabul etmiyorsanız, lütfen Platform'u kullanmayın.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">2. Hizmetin Kapsamı (Agentless APM)</h3>
            <p className="mb-6">
              OctopusAPM, sunucularınızın ve Tomcat uygulamalarınızın performansını SSH üzerinden agentless (ajansız) olarak izlemenize olanak tanır.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Platform, sunucunuza veri toplamak amacıyla hiçbir kalıcı ajan (agent) kurmaz.</li>
              <li>Tüm veriler (CPU, RAM, Log vb.) sadece sizin yetkilendirdiğiniz SSH kullanıcısının erişim yetkileri çerçevesinde toplanır.</li>
              <li>Platformun sağladığı anlık (WebSocket) log okuma verileri sunucunuzda diskte ekstra yer kaplamaz, doğrudan tarayıcınıza iletilir.</li>
            </ul>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">3. Kullanıcı Yükümlülükleri ve Güvenlik</h3>
            <p className="mb-6">
              Kullanıcılar, OctopusAPM'e bağladıkları sunucuların (IP Adresi, SSH Portu) ve sundukları kimlik bilgilerinin (Kullanıcı Adı, Şifre veya Private Key) güvenliğinden sorumludur.
            </p>
            <p className="mb-6">
              Platforma yetkisiz erişimi engellemek için güçlü şifreler kullanmanız ve 2FA (İki Faktörlü Doğrulama) gibi özellikleri (sunulduğunda) aktif etmeniz önerilir. OctopusAPM, sizin tarafınızdan hatalı yetkilendirilen veya sızdırılan kimlik bilgilerinden kaynaklı zararlardan sorumlu tutulamaz.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">4. Hizmet Kesintileri ve SLA</h3>
            <p className="mb-6">
              OctopusAPM, %99.9 çalışma süresi (uptime) hedefine ulaşmak için ticari olarak makul olan tüm çabayı gösterir. Ancak internet altyapısındaki sorunlar, bakım çalışmaları veya mücbir sebepler (doğal afetler, siber saldırılar vb.) nedeniyle oluşabilecek kesintiler garanti kapsamı dışındadır. (SLA Garantisi sadece "Advanced/Enterprise" planlar için ayrıca düzenlenir).
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">5. İptal ve Fesih</h3>
            <p className="mb-6">
              Kullanıcı, dilediği zaman kontrol paneli üzerinden üyeliğini veya sunucu bağlantılarını iptal edebilir. İptal işlemi sonrasında sunucu bağlantı bilgileriniz (SSH kimlik bilgileri dahil) sistemlerimizden kalıcı olarak silinir. Geriye dönük metrik verileriniz ise veri saklama (data retention) politikanızın süresi dolduğunda otomatik olarak imha edilir.
            </p>

            <h3 className="text-xl font-bold text-text-main mb-4 mt-8">6. İletişim</h3>
            <p className="mb-0">
              Bu Kullanım Şartları ile ilgili herhangi bir sorunuz olması durumunda lütfen <strong>support@octopusapm.com</strong> adresi üzerinden bizimle iletişime geçin.
            </p>

          </div>
        </div>
        
      </div>
    </div>
  );
}
