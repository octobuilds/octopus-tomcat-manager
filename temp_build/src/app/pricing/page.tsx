import { getDictionary } from '@/lib/getDictionary';
import PricingContent from './PricingContent';

export default async function PricingPage() {
  const dict = await getDictionary();
  return (
    <div className="bg-[var(--bg-main)] pt-32 pb-24">
      <div className="container">
        <PricingContent dict={dict} />
      </div>
    </div>
  );
}
