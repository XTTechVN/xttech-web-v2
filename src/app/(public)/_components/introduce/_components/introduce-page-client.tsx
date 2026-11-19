'use client';

import React, { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Modal } from '@/components';
import { HeroRegisterInlineForm } from '@/app/(public)/_components';
import { IntroduceHeroSection } from './introduce-hero-section';
import { IntroduceVideoSection } from './introduce-video-section';
import { IntroduceValuesSection } from './introduce-values-section';
import { IntroduceBenefitsSection } from './introduce-benefits-section';
import { IntroduceAudienceSection } from './introduce-audience-section';
import { IntroduceMilestonesSection } from './introduce-milestones-section';
import { IntroducePricingCtaSection } from './introduce-pricing-cta-section';

export function IntroducePageClient() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-white text-slate-900">
        <IntroduceHeroSection />
        <IntroduceVideoSection />
        <IntroduceValuesSection />
        <IntroduceBenefitsSection />
        <IntroduceAudienceSection />
        <IntroduceMilestonesSection />
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
    </MotionConfig>
  );
}
