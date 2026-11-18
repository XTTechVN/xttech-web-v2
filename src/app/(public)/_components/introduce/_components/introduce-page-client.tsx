'use client';

import React, { useState } from 'react';
import { Modal } from '@/components';
import { HeroRegisterInlineForm } from '@/app/(public)/_components/hero/hero-register-inline-form';
import { IntroduceHeroSection } from '@/app/(public)/_components/introduce/_components/introduce-hero-section';
import { IntroduceProblemSolutionSection } from '@/app/(public)/_components/introduce/_components/introduce-problem-solution-section';
import { IntroducePlatformSection } from '@/app/(public)/_components/introduce/_components/introduce-platform-section';
import { IntroduceFeaturesSection } from '@/app/(public)/_components/introduce/_components/introduce-features-section';
import { IntroduceBenefitsSection } from '@/app/(public)/_components/introduce/_components/introduce-benefits-section';
import { IntroduceAudienceSection } from '@/app/(public)/_components/introduce/_components/introduce-audience-section';
import { IntroduceMissionSection } from '@/app/(public)/_components/introduce/_components/introduce-mission-section';
import { IntroducePricingCtaSection } from '@/app/(public)/_components/introduce/_components/introduce-pricing-cta-section';

export function IntroducePageClient() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="bg-white text-slate-900">
      <IntroduceHeroSection />
      <IntroduceProblemSolutionSection />
      <IntroducePlatformSection />
      <IntroduceFeaturesSection onOpenRegister={() => setIsRegisterModalOpen(true)} />
      <IntroduceBenefitsSection />
      <IntroduceAudienceSection />
      <IntroduceMissionSection />
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
