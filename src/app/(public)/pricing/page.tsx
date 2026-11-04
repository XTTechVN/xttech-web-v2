import { Header, Footer } from '../_components';
import PricingPageWrapper from './_components/pricing-page-wrapper';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main>
        <PricingPageWrapper />
      </main>
      <Footer />
    </div>
  );
}
