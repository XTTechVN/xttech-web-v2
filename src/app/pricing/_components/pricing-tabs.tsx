'use client';

import React, { useState } from 'react';
import { Layers, HardHat, Briefcase } from 'lucide-react';
import AluminumPricingSection from './aluminum-pricing';
import BuiderSpicing from './builder-pricing';
import BusinessPricing from './business-pricing';

const TABS = [
  {
    id: 'aluminum',
    label: 'Xưởng Nhôm & Nội Thất',
    shortLabel: 'Nhôm & Nội Thất',
    icon: Layers,
    component: AluminumPricingSection,
  },
  {
    id: 'builder',
    label: 'Xây dựng & Đội thợ',
    shortLabel: 'Xây dựng',
    icon: HardHat,
    component: BuiderSpicing,
  },
  {
    id: 'business',
    label: 'HCNS, Kế Toán, Kinh doanh',
    shortLabel: 'HCNS & KD',
    icon: Briefcase,
    component: BusinessPricing,
  },
];

const PricingTabs = () => {
  const [activeTab, setActiveTab] = useState('aluminum');

  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Tab Buttons */}
      <div className="w-full bg-white px-20 pt-6 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? 'bg-primary text-white shadow-md scale-[1.02]'
                      : 'bg-[#F4F5F0] text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Pricing Section */}
      <div className="transition-all duration-300">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default PricingTabs;
