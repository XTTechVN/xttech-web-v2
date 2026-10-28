'use client';

import React, { useState } from 'react';
import ServiceBanner from './service-banner';
import PricingTabs from './pricing-tabs';
import InforBanner from './infor-banner';
import PricingSection from './pricing';
import Combo from './combo';

const PricingPageWrapper = () => {
  const [activeMainTab, setActiveMainTab] = useState('bang-gia');

  return (
    <div className="w-full">
      {/* Service Banner - luôn cố định, chứa 2 tab chính */}
      <ServiceBanner
        activeMainTab={activeMainTab}
        onMainTabChange={setActiveMainTab}
      />

      {/* Tab Content */}
      {activeMainTab === 'bang-gia' && (
        <div>
          <PricingTabs />
        </div>
      )}

      {activeMainTab === 'trien-khai' && (
        <div>
          <InforBanner />
          <PricingSection />
          <Combo/>
        </div>
      )}
    </div>
  );
};

export default PricingPageWrapper;
