import Link from 'next/link';

interface CtaBandProps {
  dict: Record<string, string>;
}

export default function CtaBand({ dict }: CtaBandProps) {
  return (
    <section className="cta-band">
      <div className="cta-container container text-center relative z-10">
        <h2 className="text-4xl font-bold mb-6">{dict.title || 'Sunucularınızı Kontrol Altına Alın'}</h2>
        <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
          {dict.desc || 'OctopusAPM ile altyapınızı saniyeler içinde izlemeye başlayın.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/contact" className="btn btn-primary btn-large">
          {dict.demo || 'Demo Talep Et'}
        </Link>
        </div>
      </div>
    </section>
  );
}
