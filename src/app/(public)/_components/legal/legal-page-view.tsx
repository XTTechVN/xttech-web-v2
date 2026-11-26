'use client';

import React from 'react';
import {
  LEGAL_POLICIES,
  type LegalPolicyKey,
} from '../../_constants/legal-policies.constants';
import { LegalHeroBanner } from './legal-hero-banner';
import { LegalSectionList } from './legal-section-list';

interface LegalPageViewProps {
  policyKey: LegalPolicyKey;
}

export const LegalPageView = ({ policyKey }: LegalPageViewProps) => {
  const policy = LEGAL_POLICIES[policyKey];

  const handlePrintDocument = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] pb-16 text-slate-900 selection:bg-[#E6F2F4] selection:text-[#045863]">
      <LegalHeroBanner policy={policy} />
      <LegalSectionList
        policy={policy}
        onPrintDocument={handlePrintDocument}
      />
    </div>
  );
};
