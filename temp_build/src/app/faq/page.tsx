import { cookies } from 'next/headers';
import CtaBand from '@/components/CtaBand';
import { getDictionary } from '@/lib/getDictionary';

export default async function FaqPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'tr';
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32 pb-24 min-h-screen">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-label text-accent font-bold mb-2 inline-block uppercase tracking-widest text-sm">
            {locale === 'en' ? 'FAQ' : 'S.S.S'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'en' ? `Frequently Asked Questions` : `Sıkça Sorulan Sorular`}
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {locale === 'en' 
              ? 'Find answers to the most common questions about OctopusAPM below.' 
              : 'OctopusAPM hakkında en çok merak edilen soruların cevaplarını aşağıda bulabilirsiniz.'}
          </p>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          details > summary { list-style: none !important; }
          details > summary::-webkit-details-marker { display: none !important; }
        `}} />

        <div className="faq-list max-w-3xl mx-auto mt-12 space-y-4 mb-24">
          <details className="group border border-border-color rounded-xl bg-bg-card overflow-hidden">
            <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg hover:bg-bg-section transition">
              {locale === 'en' ? `Do I need to install any packages on my server?` : `Sunucuma herhangi bir paket kurmam gerekiyor mu?`}
              <span className="text-accent text-2xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 pb-6 text-text-secondary leading-relaxed pt-2">
              <p>{locale === 'en' 
                ? 'No. OctopusAPM is entirely agentless. Our Node.js backend uses the "node-ssh" library to securely connect to your server using standard SSH credentials. It executes lightweight commands without requiring any daemon or agent installation on your target machine.' 
                : 'Hayır. OctopusAPM tamamen "agentless" (ajansız) bir mimariye sahiptir. Node.js tabanlı arka ucumuz, "node-ssh" kütüphanesini kullanarak standart SSH üzerinden sunucunuza bağlanır. Hedef makinenizde herhangi bir arka plan servisi kurmanıza gerek yoktur.'}</p>
            </div>
          </details>
          
          <details className="group border border-border-color rounded-xl bg-bg-card overflow-hidden">
            <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg hover:bg-bg-section transition">
              {locale === 'en' ? `Does OctopusAPM affect my server performance?` : `OctopusAPM sunucumun performansını etkiler mi?`}
              <span className="text-accent text-2xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 pb-6 text-text-secondary leading-relaxed pt-2">
              <p>{locale === 'en' 
                ? 'Not at all. Because there is no background process constantly running, your server maintains a 0% CPU footprint while idle. Metrics are fetched via fast, native shell commands only when requested.' 
                : 'Kesinlikle etkilemez. Sunucunuzda sürekli çalışan bir agent olmadığı için sistem boşta iken CPU tüketimi %0\'dır. Sadece metrikler anlık olarak istendiğinde son derece hafif yerel shell komutları çalıştırılır.'}</p>
            </div>
          </details>
          
          <details className="group border border-border-color rounded-xl bg-bg-card overflow-hidden">
            <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg hover:bg-bg-section transition">
              {locale === 'en' ? `Which operating systems are supported?` : `Hangi işletim sistemleri destekleniyor?`}
              <span className="text-accent text-2xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 pb-6 text-text-secondary leading-relaxed pt-2">
              <p>{locale === 'en' 
                ? 'All major POSIX-compliant Linux distributions (Ubuntu, CentOS, Debian, RHEL, AlmaLinux) are fully supported. Since we rely on standard UNIX shell interaction via SSH, compatibility is nearly universal.' 
                : 'Tüm popüler POSIX uyumlu Linux dağıtımları (Ubuntu, CentOS, Debian, RHEL, AlmaLinux) desteklenmektedir. Sistemin temelinde standart UNIX komut seti ve SSH etkileşimi olduğu için uyumluluk son derece yüksektir.'}</p>
            </div>
          </details>
          
          <details className="group border border-border-color rounded-xl bg-bg-card overflow-hidden">
            <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg hover:bg-bg-section transition">
              {locale === 'en' ? `How many servers can I monitor?` : `Kaç sunucu izleyebilirim?`}
              <span className="text-accent text-2xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 pb-6 text-text-secondary leading-relaxed pt-2">
              <p>{locale === 'en' 
                ? 'Our backend architecture is built with Node.js and a scalable Prisma ORM layer. It is horizontally scalable, meaning you can easily monitor hundreds or even thousands of servers without latency bottlenecks depending on your backend hosting.' 
                : 'Sistemimiz Node.js ve ölçeklenebilir Prisma ORM katmanı ile geliştirilmiştir. Asenkron (non-blocking) mimarisi sayesinde, backend sunucunuzun kapasitesine bağlı olarak aynı anda yüzlerce hatta binlerce sunucuyu gecikmesiz (latency olmadan) izleyebilirsiniz.'}</p>
            </div>
          </details>
          
          <details className="group border border-border-color rounded-xl bg-bg-card overflow-hidden">
            <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg hover:bg-bg-section transition">
              {locale === 'en' ? `Is my data safe?` : `Verilerim güvende mi?`}
              <span className="text-accent text-2xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 pb-6 text-text-secondary leading-relaxed pt-2">
              <p>{locale === 'en' 
                ? 'Yes. All SSH credentials are fully encrypted and salted using bcrypt and secure hashing algorithms. Log streaming connects directly to your frontend via Socket.io in real-time, ensuring sensitive server logs are never persisted to disk by default.' 
                : 'Evet, son derece güvendedir. SSH şifreleriniz ve anahtarlarınız bcrypt gibi güvenilir algoritmalarla şifrelenir. Ayrıca canlı log okuma özelliği Socket.io ile doğrudan tarayıcınıza WebSocket üzerinden aktarılır, bu sayede kritik log dosyalarınız izniniz dışında backend disklerine kaydedilmez.'}</p>
            </div>
          </details>
        </div>
      </div>
      <CtaBand dict={dict.cta} />
    </div>
  );
}
