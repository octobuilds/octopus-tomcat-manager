import { getDictionary } from '@/lib/getDictionary';
import ContactForm from '@/components/ContactForm';

export default async function ContactPage() {
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32 pb-24 min-h-screen flex flex-col">
      <div className="container flex-grow">
        
        <div className="section-header text-center mb-16">
          <span className="section-label text-accent uppercase tracking-widest font-bold text-sm mb-3 inline-block">
            İLETİŞİM
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bizimle İletişime Geçin
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Sorularınız mı var? Ekibimiz size yardımcı olmaktan mutluluk duyar.
          </p>
        </div>

        <div className="contact-grid grid md:grid-cols-[1fr_1.2fr] gap-16 max-w-5xl mx-auto">
          
          {/* Left Info */}
          <div className="contact-info">
            <h3 className="text-2xl font-bold mb-4">Bize Ulaşın</h3>
            <p className="text-text-secondary mb-8 leading-relaxed">
              OctopusAPM hakkında sorularınız, özel talepleriniz veya kurumsal çözümler için bizimle iletişime geçin.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent text-xl">✉</div>
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider">E-POSTA</div>
                  <div className="text-text-main font-medium">support@octopusapm.com</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent text-xl">🕐</div>
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider">ÇALIŞMA SAATLERİ</div>
                  <div className="text-text-main font-medium">Pazartesi - Cuma, 09:00 - 18:00</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent text-xl">💬</div>
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider">YANIT SÜRESİ</div>
                  <div className="text-text-main font-medium">24 saat içinde</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="contact-form-card bg-bg-card border border-border-color p-8 md:p-10 rounded-2xl shadow-sm">
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  );
}
