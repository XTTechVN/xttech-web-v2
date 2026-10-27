import { Pricing } from '../_components/pricing';
import { Header, Footer } from '../_components';
import ServiceBanner from './_components/service-banner';
import AluminumPricingSection from './_components/aluminum-pricing';
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main>
        <ServiceBanner />
        <AluminumPricingSection />
        {/* <Pricing /> */}
      </main>
      <Footer />
    </div>
  );
}
