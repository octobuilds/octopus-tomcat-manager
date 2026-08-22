import { cookies } from 'next/headers';
import CtaBand from '@/components/CtaBand';
import { getDictionary } from '@/lib/getDictionary';

export default async function FeaturesPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'tr';
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32">
      <div className="container">
        <div className="section-header">
          <span className="section-label text-accent uppercase tracking-widest font-bold text-sm mb-3 inline-block">
            {dict.nav?.features || "ÖZELLİKLER"}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'en' ? `The Smartest Way to` : `Altyapınızı Yönetmenin`} <span className="text-accent">{locale === 'en' ? `Manage Your Infrastructure` : `En Akıllı Yolu`}</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {locale === 'en' ? `OctopusAPM combines complex server management and Tomcat monitoring into a single, secure platform. You are in full control.` : `OctopusAPM, karmaşık sunucu yönetimini ve Tomcat izlemeyi tek ve güvenli bir platformda birleştirir. Tüm kontrol sizde.`}
          </p>
        </div>

        {/* Feature Showcase 1 */}
        <div className="feature-showcase mb-32">
          <div className="showcase-grid flex items-center gap-16">
            <div className="flex-1">
              <div className="feature-icon mb-6">
                <span className="text-4xl">📊</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{locale === 'en' ? `Time-Based Seamless Charts` : `Zamana Bağlı Kesintisiz Grafikler`}</h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                {locale === 'en' ? `Analyze CPU, memory (Heap), and server health historically in detail. Your browser will not crash thanks to smart downsampling.` : `CPU, bellek (Heap) ve sunucu sağlık durumlarını geriye dönük detaylı şekilde inceleyin. Smart downsampling ile tarayıcınız çökmez.`}
              </p>
              <ul className="showcase-list space-y-3">
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> {locale === 'en' ? `CPU and RAM Consumption Analysis` : `CPU ve RAM Tüketim Analizi`}</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> {locale === 'en' ? `Historical Downsampling` : `Geriye Dönük Downsampling`}</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> {locale === 'en' ? `Customizable Time Ranges` : `Özelleştirilebilir Zaman Aralıkları`}</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-bg-section p-8 rounded-2xl border border-border-light shadow-lg">
                <div className="flex items-end h-48 gap-2">
                  <div className="flex-1 bg-accent opacity-70 rounded-t-sm" style={{height: '40%'}}></div>
                  <div className="flex-1 bg-accent rounded-t-sm" style={{height: '70%'}}></div>
                  <div className="flex-1 bg-accent opacity-80 rounded-t-sm" style={{height: '50%'}}></div>
                  <div className="flex-1 bg-warning rounded-t-sm" style={{height: '90%'}}></div>
                  <div className="flex-1 bg-accent rounded-t-sm" style={{height: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase 2 */}
        <div className="feature-showcase reverse mb-32">
          <div className="showcase-grid flex items-center gap-16 flex-row-reverse">
            <div className="flex-1">
              <div className="feature-icon mb-6">
                <span className="text-4xl">⚡</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{locale === 'en' ? `Live Log Reading (WebSocket)` : `Canlı Log Okuma (WebSocket)`}</h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                {locale === 'en' ? `Monitor your application logs live without a second of delay. OctopusAPM securely backs up logs for you in the background.` : `Uygulamalarınızın loglarını saniyelik gecikme bile olmadan canlı izleyin. OctopusAPM arka planda sizin için logları güvenle yedekler.`}
              </p>
              <ul className="showcase-list space-y-3">
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> {locale === 'en' ? `Real-Time Streaming` : `Gerçek Zamanlı Streaming`}</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> {locale === 'en' ? `Advanced Log Filtering` : `Gelişmiş Log Filtreleme`}</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> {locale === 'en' ? `Automatic Log Archiving` : `Otomatik Log Arşivleme`}</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-[#0f172a] p-6 rounded-2xl shadow-xl border border-gray-800 text-sm font-mono text-gray-300">
                <div className="flex gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div className="space-y-2">
                  <p><span className="text-green-400">[INFO]</span> Starting Tomcat...</p>
                  <p><span className="text-green-400">[INFO]</span> Loaded configuration from server.xml</p>
                  <p><span className="text-yellow-400">[WARN]</span> High memory usage detected in app /api</p>
                  <p><span className="text-green-400">[INFO]</span> Connection established to DB_MAIN</p>
                  <p className="animate-pulse">_</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Features */}
        <div className="section-header">
          <h2 className="text-3xl font-bold mb-2">{locale === 'en' ? `Discover More` : `Daha Fazlasını Keşfedin`}</h2>
          <p className="text-text-secondary">{locale === 'en' ? `All the enterprise-level management tools you need.` : `Enterprise seviyesinde ihtiyacınız olan tüm yönetim araçları.`}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-24">
          <div className="bg-bg-card p-8 rounded-2xl border border-border-color shadow-sm hover:shadow-md hover:border-accent/20 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-4">🛡️</div>
            <h3 className="text-lg font-bold mb-2">{locale === 'en' ? `Advanced Authorization (RBAC)` : `Gelişmiş Yetkilendirme (RBAC)`}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {locale === 'en' ? `Decide which user can start, delete, or view logs of which application. Full control, zero risk.` : `Hangi kullanıcının hangi uygulamayı başlatabileceğine, silebileceğine veya loglarını görebileceğine siz karar verin. Tam denetim, sıfır risk.`}
            </p>
          </div>
          
          <div className="bg-bg-card p-8 rounded-2xl border border-border-color shadow-sm hover:shadow-md hover:border-accent/20 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-xl mb-4">🔔</div>
            <h3 className="text-lg font-bold mb-2">{locale === 'en' ? `Smart Alerts & Notifications` : `Akıllı Alarmlar & Bildirimler`}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {locale === 'en' ? `Get instant emails when server health deteriorates, Tomcat apps become unresponsive, or thresholds are exceeded.` : `Sunucu sağlığı bozulduğunda veya Tomcat uygulamalarınız yanıt vermediğinde, eşikleri aşan durumlarda anında e-posta alın.`}
            </p>
          </div>
          
          <div className="bg-bg-card p-8 rounded-2xl border border-border-color shadow-sm hover:shadow-md hover:border-accent/20 transition-all">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-4">🌐</div>
            <h3 className="text-lg font-bold mb-2">{locale === 'en' ? `Multi-Server Management` : `Çoklu Sunucu Yönetimi`}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {locale === 'en' ? `Easily organize and control dozens of servers and hundreds of Tomcat services from a single dashboard.` : `Onlarca sunucuyu ve yüzlerce Tomcat servisini tek bir dashboard üzerinden kolayca organize edin ve kontrol edin.`}
            </p>
          </div>
          
          <div className="bg-bg-card p-8 rounded-2xl border border-border-color shadow-sm hover:shadow-md hover:border-accent/20 transition-all">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl mb-4">🔌</div>
            <h3 className="text-lg font-bold mb-2">{locale === 'en' ? `API Support` : `API Desteği`}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {locale === 'en' ? `Export OctopusAPM data to your internal systems. Easily build your own automations with our RESTful API.` : `OctopusAPM verilerini kendi iç sistemlerinize aktarın. RESTful API ile kendi otomasyonlarınızı kolayca kurgulayın.`}
            </p>
          </div>
        </div>
      </div>
      
      <CtaBand dict={dict.cta} />
    </div>
  );
}
