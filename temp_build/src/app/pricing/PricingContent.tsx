"use client";

import { useState, useEffect } from "react";
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useRouter } from 'next/navigation';

interface PricingContentProps {
  dict: any;
}

export default function PricingContent({ dict }: PricingContentProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [paddle, setPaddle] = useState<Paddle>();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      initializePaddle({
        environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'production' | 'sandbox') || 'production',
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      }).then((paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
          
          paddleInstance.PricePreview({
            items: [
              { quantity: 1, priceId: 'pri_01kz27309325e6n04p3e4zqhcp' },
              { quantity: 1, priceId: 'pri_01kz28391n0y2mfmeyx6wtg3cw' },
              { quantity: 1, priceId: 'pri_01kz274e6kwj95faegc73w9v6c' },
              { quantity: 1, priceId: 'pri_01kz27zx53m80b5q9fbjt63sam' }
            ]
          }).then((preview) => {
            const newPrices: Record<string, string> = {};
            preview.data.details.lineItems.forEach((item: any) => {
              newPrices[item.price.id] = item.formattedUnitTotals.total;
            });
            setPrices(newPrices);
          }).catch((err: unknown) => {
            console.warn("Paddle Price Preview Warning (Invalid Token):", err);
          });
        }
      });
    }
  }, []);

  const handleCheckout = (monthlyPriceId: string, yearlyPriceId: string) => {
    const priceId = isYearly ? yearlyPriceId : monthlyPriceId;
    if (paddle) {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
      });
    } else {
      alert("Ödeme sistemi yükleniyor, lütfen bekleyin...");
    }
  };

  // Helper function to calculate yearly prices dynamically or format them (Fallback)
  const getFallbackPrice = (priceStr: string) => {
    if (!isYearly) return priceStr;
    try {
      const isDollar = priceStr.includes('$');
      const numericPart = priceStr.replace(/[^0-9.]/g, '');
      const num = parseFloat(numericPart);
      if (isNaN(num)) return priceStr;
      const discounted = num * 0.84;
      return isDollar ? `$${discounted.toFixed(2)}` : `₺${discounted.toFixed(2)}`;
    } catch {
      return priceStr;
    }
  };

  const getStarterPrice = () => {
    if (isYearly) return prices['pri_01kz28391n0y2mfmeyx6wtg3cw'] || getFallbackPrice(dict.pricing.starter.price);
    return prices['pri_01kz27309325e6n04p3e4zqhcp'] || dict.pricing.starter.price;
  };

  const getProPrice = () => {
    if (isYearly) return prices['pri_01kz27zx53m80b5q9fbjt63sam'] || getFallbackPrice(dict.pricing.pro.price);
    return prices['pri_01kz274e6kwj95faegc73w9v6c'] || dict.pricing.pro.price;
  };

  return (
    <>
      <div className="section-header text-center">
        <span className="section-label text-accent uppercase tracking-widest font-bold text-sm mb-3 inline-block">
          {dict.nav?.pricing || "FİYATLANDIRMA"}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {dict.pricing?.title || "İhtiyacınıza Uygun Planı Seçin"}
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          {dict.pricing?.subtitle || "Esnek fiyatlandırma modelleri ile küçük projelerden kurumsal şirketlere kadar herkes için uygun."}
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <span className={`font-bold text-sm ${!isYearly ? 'text-text-main' : 'text-text-secondary'}`}>
          Aylık
        </span>
        <div 
          className="w-12 h-6 bg-border-color rounded-full relative cursor-pointer"
          onClick={() => setIsYearly(!isYearly)}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? 'left-7' : 'left-1'}`}></div>
        </div>
        <span className={`font-bold text-sm ${isYearly ? 'text-text-main' : 'text-text-secondary'}`}>
          Yıllık
        </span>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">%16 İndirim</span>
      </div>

      <div className="pricing-grid grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        
        {/* Starter */}
        <div className="price-card bg-bg-card border border-border-color p-10 rounded-2xl flex flex-col hover:-translate-y-1 hover:border-accent/30 transition-all shadow-sm">
          <h3 className="tier text-text-secondary font-bold text-sm tracking-wider uppercase mb-6">{dict.pricing.starter.name}</h3>
          <div className="price text-4xl font-black mb-4 transition-all">
            {getStarterPrice()} <span className="text-text-muted text-base font-normal">{isYearly ? '/yıl' : '/ay'}</span>
          </div>
          <p className="desc text-text-secondary text-sm mb-8 h-12">
            {dict.pricing.starter.desc}
          </p>
          
          <ul className="features-list space-y-4 mb-8 flex-1 text-sm text-text-main">
            {dict.pricing.starter.features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span> {feature}
              </li>
            ))}
            {dict.pricing.starter.disabledFeatures?.map((feature: string, i: number) => (
              <li key={`d-${i}`} className="flex items-start gap-3 text-text-muted opacity-60">
                <span className="text-text-muted font-bold">✗</span> {feature}
              </li>
            ))}
          </ul>
          
          <button 
            onClick={() => handleCheckout('pri_01kz27309325e6n04p3e4zqhcp', 'pri_01kz28391n0y2mfmeyx6wtg3cw')}
            className="btn btn-outline btn-full w-full py-3 rounded-lg border-2 border-border-light font-bold hover:bg-bg-section transition"
          >
            {dict.pricing.starter.btn}
          </button>
        </div>

        {/* Pro */}
        <div className="price-card popular relative bg-bg-card border-2 border-accent p-10 rounded-2xl flex flex-col transform md:scale-105 shadow-xl z-10">
          <div className="popular-badge absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold">
            {dict.pricing.pro.badge}
          </div>
          <h3 className="tier text-text-secondary font-bold text-sm tracking-wider uppercase mb-6">{dict.pricing.pro.name}</h3>
          <div className="price text-4xl font-black mb-4 transition-all">
            {getProPrice()} <span className="text-text-muted text-base font-normal">{isYearly ? '/yıl' : '/ay'}</span>
          </div>
          <p className="desc text-text-secondary text-sm mb-8 h-12">
            {dict.pricing.pro.desc}
          </p>
          
          <ul className="features-list space-y-4 mb-8 flex-1 text-sm text-text-main">
            {dict.pricing.pro.features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span> {feature}
              </li>
            ))}
          </ul>
          
          <button 
            onClick={() => handleCheckout('pri_01kz274e6kwj95faegc73w9v6c', 'pri_01kz27zx53m80b5q9fbjt63sam')}
            className="btn btn-primary btn-full w-full py-3 rounded-lg bg-accent text-white font-bold hover:bg-accent-hover transition"
          >
            {dict.pricing.pro.btn}
          </button>
        </div>

        {/* Advanced */}
        <div className="price-card bg-bg-card border border-border-color p-10 rounded-2xl flex flex-col hover:-translate-y-1 hover:border-accent/30 transition-all shadow-sm">
          <h3 className="tier text-text-secondary font-bold text-sm tracking-wider uppercase mb-6">{dict.pricing.advanced.name}</h3>
          <div className="price text-3xl font-black mb-4 transition-all flex items-center h-10">
            {dict.pricing.advanced.price}
          </div>
          <p className="desc text-text-secondary text-sm mb-8 h-12">
            {dict.pricing.advanced.desc}
          </p>
          
          <ul className="features-list space-y-4 mb-8 flex-1 text-sm text-text-main">
            {dict.pricing.advanced.features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span> {feature}
              </li>
            ))}
          </ul>
          
          <button 
            onClick={() => router.push('/contact')}
            className="btn btn-outline btn-full w-full py-3 rounded-lg border-2 border-border-light font-bold hover:bg-bg-section transition"
          >
            {dict.pricing.advanced.btn}
          </button>
        </div>

      </div>
    </>
  );
}
