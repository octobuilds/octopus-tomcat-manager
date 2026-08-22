import { cookies } from 'next/headers';
import CtaBand from '@/components/CtaBand';
import { getDictionary } from '@/lib/getDictionary';

export default async function ReleaseNotesPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'tr';
  const dict = await getDictionary();

  const releases = [
    {
      version: 'v1.2.0',
      date: locale === 'en' ? 'August 01, 2026' : '01 Ağustos 2026',
      badge: locale === 'en' ? 'Latest' : 'En Güncel',
      title: locale === 'en' ? 'Real-time WebSocket Logs & RBAC' : 'Gerçek Zamanlı WebSocket Logları ve RBAC',
      changes: locale === 'en' ? [
        'Added real-time streaming of Tomcat logs directly to the dashboard via Socket.io.',
        'Introduced granular Role-Based Access Control (RBAC) for team members.',
        'Optimized the node-ssh connection pool, reducing server CPU footprint to near 0%.',
        'Fixed a bug where large server.xml files caused slow parsing.'
      ] : [
        'Tomcat loglarının Socket.io üzerinden arayüze anlık olarak akması özelliği eklendi.',
        'Takım üyeleri için detaylı Rol Bazlı Erişim Kontrolü (RBAC) altyapısı getirildi.',
        'node-ssh bağlantı havuzu optimize edildi, boşta CPU kullanımı %0 seviyesine indirildi.',
        'Çok büyük boyutlu server.xml dosyalarının okunmasını yavaşlatan bir hata giderildi.'
      ]
    },
    {
      version: 'v1.1.0',
      date: locale === 'en' ? 'July 15, 2026' : '15 Temmuz 2026',
      badge: '',
      title: locale === 'en' ? 'Auto Service Discovery' : 'Otomatik Servis Keşfi',
      changes: locale === 'en' ? [
        'Added the "Auto Discover" feature which automatically scans and lists all Tomcat instances on a server.',
        'Added port conflict detection before starting a Tomcat service.',
        'Enhanced the dark mode UI with modern glassmorphism effects.',
      ] : [
        '"Otomatik Keşfet" butonu eklendi. Artık sunucudaki tüm Tomcat instance\'ları tek tıkla bulunup listelenebiliyor.',
        'Bir Tomcat servisini başlatmadan önce port çakışması olup olmadığını denetleyen sistem eklendi.',
        'Karanlık (dark mode) tema için modern glassmorphism (buzlu cam) efektleri arayüze entegre edildi.',
      ]
    },
    {
      version: 'v1.0.0',
      date: locale === 'en' ? 'June 01, 2026' : '01 Haziran 2026',
      badge: '',
      title: locale === 'en' ? 'Initial Release: The Agentless Revolution' : 'İlk Sürüm: Ajansız (Agentless)',
      changes: locale === 'en' ? [
        'OctopusAPM officially launched!',
        'Agentless monitoring engine over SSH was deployed.',
        'Real-time CPU, RAM, and Disk charts were introduced.',
        'Start, Stop, Restart actions for Tomcat servers added.'
      ] : [
        'OctopusAPM resmen yayınlandı!',
        'SSH üzerinden tamamen ajansız (agentless) çalışan altyapı devreye alındı.',
        'Gerçek zamanlı CPU, RAM ve Disk izleme grafikleri eklendi.',
        'Tomcat sunucuları için başlatma (Start), durdurma (Stop) ve yeniden başlatma (Restart) aksiyonları getirildi.'
      ]
    }
  ];

  return (
    <>
      <div className="bg-[var(--bg-main)] pt-32 min-h-screen">
        <div className="container max-w-4xl mx-auto">
          <div className="section-header text-center mb-16">
            <span className="section-label text-accent font-bold mb-2 inline-block uppercase tracking-widest text-sm">
              {locale === 'en' ? 'Changelog' : 'Güncellemeler'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'en' ? 'Release Notes' : 'Sürüm Notları'}
            </h1>
            <p className="text-text-secondary text-lg">
              {locale === 'en'
                ? 'Stay up to date with the latest features, improvements, and bug fixes in OctopusAPM.'
                : 'OctopusAPM\'ye eklenen en son özellikleri, iyileştirmeleri ve hata düzeltmelerini buradan takip edin.'}
            </p>
          </div>

          <div className="relative border-l-2 border-border-color ml-4 md:ml-8 space-y-12">
            {releases.map((release, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-accent rounded-full ring-4 ring-bg-main"></div>

                <div className="bg-bg-card border border-border-color rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-text-main">{release.version}</h2>
                    <span className="text-text-muted text-sm font-medium">{release.date}</span>
                    {release.badge && (
                      <span className="bg-accent-light text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {release.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-text-main mb-4 pb-4 border-b border-border-light">
                    {release.title}
                  </h3>

                  <ul className="space-y-3">
                    {release.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-3 text-text-secondary leading-relaxed">
                        <span className="text-accent mt-1 shrink-0">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div> {/* container */}
      </div> {/* bg-main */}

      {/* CtaBand (Padding eklendi) */}
      <div style={{ marginTop: '8rem' }}>
        <CtaBand dict={dict.cta} />
      </div>
    </>
  );
}
