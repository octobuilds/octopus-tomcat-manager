import { cookies } from 'next/headers';
import CtaBand from '@/components/CtaBand';
import { getDictionary } from '@/lib/getDictionary';

export default async function HowItWorksPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'tr';
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32">
      <div className="container">
        
        {/* Header */}
        <div className="section-header text-center">
          <span className="section-label text-accent uppercase tracking-widest font-bold text-sm mb-3 inline-block">
            {dict.nav?.howItWorks || "{locale === 'en' ? `HOW IT WORKS?` : `NASIL ÇALIŞIR?`}"}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'en' ? `Start Monitoring in` : `3 Adımda İzlemeye`} {locale === 'en' ? `3 Steps` : `Başlayın`}
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {locale === 'en' ? `OctopusAPM takes the hassle out of setup. It directly establishes a secure SSH connection and starts working in seconds.` : `OctopusAPM, kurulumunuzu hiç dert etmez. Doğrudan güvenli SSH bağlantısı kurarak saniyeler içinde çalışmaya başlar.`}
          </p>
        </div>

        {/* 3 Steps Flow */}
        <div className="architecture-flow max-w-4xl mx-auto flex flex-col md:flex-row justify-between relative mb-32">
          
          <div className="flow-step text-center relative z-10 flex-1">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-accent text-accent text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-md">1</div>
            <h4 className="font-bold text-lg mb-2">{locale === 'en' ? `Connect` : `Bağlantı Kurun`}</h4>
            <p className="text-text-secondary text-sm">{locale === 'en' ? `Connect the system with your servers IP address and SSH credentials.` : `Sunucunuzun IP adresi ve SSH kimlik bilgileriyle sistemi bağlayın.`}</p>
          </div>

          <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-accent to-accent/20 mt-8 relative z-0"></div>

          <div className="flow-step text-center relative z-10 flex-1 mt-8 md:mt-0">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-accent text-accent text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-md">2</div>
            <h4 className="font-bold text-lg mb-2">{locale === 'en' ? `Auto Discover` : `Otomatik Keşfet`}</h4>
            <p className="text-text-secondary text-sm">Uygulamalar (Tomcat vs.) otomatik bulunur ve listeye alınır.</p>
          </div>

          <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-accent to-accent/20 mt-8 relative z-0"></div>

          <div className="flow-step text-center relative z-10 flex-1 mt-8 md:mt-0">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-accent text-accent text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-md">3</div>
            <h4 className="font-bold text-lg mb-2">{locale === 'en' ? `Start Monitoring` : `İzlemeye Başla`}</h4>
            <p className="text-text-secondary text-sm">{locale === 'en' ? `Real-time charts and log screens open immediately.` : `Gerçek zamanlı grafikler ve log ekranları hemen açılır.`}</p>
          </div>
        </div>
      </div>

      {/* Details (01, 02, 03) */}
      <div className="hiw-details bg-[var(--bg-section)] py-24">
        <div className="container max-w-5xl mx-auto space-y-32">
          
          {/* 01 */}
          <div className="hiw-detail-card flex flex-col md:flex-row items-center gap-12 relative">
            <div className="text-[120px] font-black text-border-light leading-none absolute -top-16 -left-8 select-none z-0">01</div>
            <div className="flex-1 relative z-10">
              <h3 className="text-3xl font-bold mb-4">{locale === 'en' ? `Define Server Connection` : `Sunucu Bağlantısını Tanımlayın`}</h3>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                {locale === 'en' ? `OctopusAPM does not install any agent on your server. You simply register your server via Dashboard by entering IP, username (e.g. ubuntu), and SSH key / password. It directly connects to the account you authorized.` : `OctopusAPM sunucunuza hiçbir ajan (Agent) kurmaz. Sadece IP, kullanıcı adı (Örn: ubuntu) ve SSH anahtarınızı / şifrenizi girerek Dashboard üzerinden sunucunuzu kaydedersiniz. Doğrudan yetkilendirdiğiniz hesaba bağlanılır.`}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `Privacy friendly (No Agent)` : `Gizlilik dostu (Agent yüklemez)`}</li>
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> RSA ve Ed25519 Key desteği</li>
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `Customizable SSH port` : `Özelleştirilebilir SSH portu`}</li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-[#0a0f1c] h-64 md:h-80 rounded-2xl shadow-xl border border-border-color overflow-hidden flex items-center justify-center">
              <img src="/mockups/add-server.png" alt="Add Server UI Mockup" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105" />
            </div>
          </div>

          {/* 02 */}
          <div className="hiw-detail-card flex flex-col md:flex-row-reverse items-center gap-12 relative">
            <div className="text-[120px] font-black text-border-light leading-none absolute -top-16 -right-8 select-none z-0">02</div>
            <div className="flex-1 relative z-10">
              <h3 className="text-3xl font-bold mb-4">{locale === 'en' ? `Auto Discover Tomcat Services` : `Tomcat Servislerini Otomatik Keşfedin`}</h3>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                Sunucu eklendikten sonra "Keşfet" butonuna basmanız yeterli. OctopusAPM, sunucunuzdaki tüm Tomcat Instance'larını (Catalina Base dizinleri) otomatik olarak tarar ve listeler. İsimlendirmesi size, portu ve durumu anında güncellenir.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `Dynamic Tomcat detection` : `Dinamik Tomcat tespiti`}</li>
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `Auto server.xml settings analysis` : `Otomatik server.xml ayar analizi`}</li>
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `Foresee port conflicts` : `Port çakışmalarını önden görme`}</li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-[#0a0f1c] h-64 md:h-80 rounded-2xl shadow-xl border border-border-color overflow-hidden flex items-center justify-center">
              <img src="/mockups/discovery.png" alt="Tomcat Services Discovery UI Mockup" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105" />
            </div>
          </div>

          {/* 03 */}
          <div className="hiw-detail-card flex flex-col md:flex-row items-center gap-12 relative">
            <div className="text-[120px] font-black text-border-light leading-none absolute -top-16 -left-8 select-none z-0">03</div>
            <div className="flex-1 relative z-10">
              <h3 className="text-3xl font-bold mb-4">{locale === 'en' ? `Start Real-Time Monitoring` : `Anlık İzlemeye Geçin`}</h3>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                {locale === 'en' ? `Now you can start, stop any Tomcat service and watch its logs stream in real-time. On the Metrics screen, your current CPU, RAM usage, and active thread count are tracked via modern charts.` : `Artık dilediğiniz Tomcat servisini başlatabilir, durdurabilir (Start/Stop) ve loglarını anlık akacak şekilde izleyebilirsiniz. Metrics ekranında o anki işlemciniz, RAM kullanımınız ve aktif thread sayınız modern grafikler üzerinden takip edilir.`}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `Start, Stop, Restart flexibility` : `Start, Stop, Restart esnekliği`}</li>
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `CPU, RAM, Disk usage charts` : `CPU, RAM, Disk kullanım grafikleri`}</li>
                <li className="flex items-center gap-3 font-medium"><span className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs">✓</span> {locale === 'en' ? `Historical data retention` : `Geriye dönük data saklanması`}</li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-[#0a0f1c] h-64 md:h-80 rounded-2xl shadow-xl border border-border-color overflow-hidden flex items-center justify-center">
              <img src="/mockups/metrics.png" alt="Real-time Metrics UI Mockup" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105" />
            </div>
          </div>

        </div>
      </div>

      {/* Agentless Advantages */}
      <div className="py-24">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label text-accent font-bold mb-2 inline-block">AVANTAJ</span>
            <h2 className="text-3xl font-bold mb-4">{locale === 'en' ? `Why No Agent?` : `Neden Ajan (Agent) Yok?`}</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {locale === 'en' ? `Traditional APM tools force you to install an agent on your server. We solved this in a completely different way.` : `Geleneksel APM araçları sunucunuza ajan (agent) kurmanızı zorunlu kılar. Biz bunu tamamen farklı bir şekilde çözdük.`}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
            
            <div className="bg-bg-card border border-border-color p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">🔒</div>
              <h4 className="text-lg font-bold mb-2">{locale === 'en' ? `Security (SSH Connection)` : `Güvenlik (SSH Bağlantısı)`}</h4>
              <p className="text-text-secondary text-sm">{locale === 'en' ? `All data is received over an encrypted SSH tunnel. You do not need to open an extra outbound port on your server. It is completely isolated and secure.` : `Tüm veri şifrelenmiş SSH tüneli üzerinden alınır. Sunucunuzda dışarıya açık ekstra bir port açmanız gerekmez. Tamamen izole ve güvenlidir.`}</p>
            </div>
            
            <div className="bg-bg-card border border-border-color p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-4">⚡</div>
              <h4 className="text-lg font-bold mb-2">{locale === 'en' ? `Zero Performance Loss` : `Sıfır Performans Kaybı`}</h4>
              <p className="text-text-secondary text-sm">{locale === 'en' ? `Since no background service is installed on your server, RAM and CPU are not wasted unnecessarily. Only an instant command is run and the result is retrieved.` : `Sunucunuza hiçbir arkaplan servisi yüklenmediği için gereksiz yere RAM ve CPU harcanmaz. Sadece o anlık komut çalıştırılır ve sonucu alınır.`}</p>
            </div>

            <div className="bg-bg-card border border-border-color p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-4">🚀</div>
              <h4 className="text-lg font-bold mb-2">{locale === 'en' ? `Instant Setup` : `Anında Kurulum`}</h4>
              <p className="text-text-secondary text-sm">Kullanıcı adı ve şifrenizi girerek saniyeler içinde bağlanabilirsiniz. Kurulum Script'leri veya bağımlılık paketleriyle uğraşmazsınız.</p>
            </div>

            <div className="bg-bg-card border border-border-color p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">🛡️</div>
              <h4 className="text-lg font-bold mb-2">{locale === 'en' ? `Full RBAC Control` : `Tam RBAC Kontrolü`}</h4>
              <p className="text-text-secondary text-sm">Hangi kullanıcıların logları okuyabileceğine, görev başlatıp durdurabileceğine siz karar verirsiniz.</p>
            </div>

            <div className="bg-bg-card border border-border-color p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-4">📊</div>
              <h4 className="text-lg font-bold mb-2">{locale === 'en' ? `Historical Data` : `Geriye Dönük Veriler`}</h4>
              <p className="text-text-secondary text-sm">{locale === 'en' ? `Performance data is stored in our secure database instead of your server. You see the historical past without overloading your server.` : `Performans verileri sunucunuz yerine bizim güvenli veritabanımızda saklanır. Tarihsel geçmişi sunucunuzu yormadan görürsünüz.`}</p>
            </div>

            <div className="bg-bg-card border border-border-color p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center text-2xl mb-4">🔔</div>
              <h4 className="text-lg font-bold mb-2">{locale === 'en' ? `Smart Alerts` : `Akıllı Alarmlar`}</h4>
              <p className="text-text-secondary text-sm">Sunucu sağlığı durumunda e-posta ve webhook bildirimleri ile haberdar edilirsiniz. Sorun büyümeden müdahale edebilirsiniz.</p>
            </div>
            
          </div>
        </div>
      </div>



      <CtaBand dict={dict.cta} />
    </div>
  );
}
