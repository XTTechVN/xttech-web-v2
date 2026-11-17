'use client';

import React, { useState } from 'react';
import { Modal } from '@/components';
import { HeroRegisterInlineForm } from '../../hero/hero-register-inline-form';
import { IntroduceHeroSection } from './introduce-hero-section';
import { IntroduceProblemSolutionSection } from './introduce-problem-solution-section';
import { IntroduceFeaturesSection } from './introduce-features-section';
import { IntroduceBenefitsSection } from './introduce-benefits-section';
import { IntroduceAudienceSection } from './introduce-audience-section';
import { IntroducePricingCtaSection } from './introduce-pricing-cta-section';

export function IntroducePageClient() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="bg-white text-slate-900">
      <IntroduceHeroSection onOpenRegister={() => setIsRegisterModalOpen(true)} />
      <IntroduceProblemSolutionSection />
      <IntroduceFeaturesSection />
      <IntroduceBenefitsSection />
      <IntroduceAudienceSection />
      <IntroducePricingCtaSection onOpenRegister={() => setIsRegisterModalOpen(true)} />

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        size="md"
        title="Đăng ký sử dụng XTTECH XMS Fab"
        className="max-w-lg border border-primary/20"
        bodyClassName="p-5 sm:p-6"
      >
        <HeroRegisterInlineForm
          variant="modal"
          isOpen={isRegisterModalOpen}
          onBack={() => setIsRegisterModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
