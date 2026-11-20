'use client';

import React from 'react';
import { MotionConfig } from 'motion/react';
import { IntroduceAudienceSection } from './introduce-audience-section';
import { IntroduceBenefitsSection } from './introduce-benefits-section';
import { IntroduceHeroSection } from './introduce-hero-section';
import { IntroduceMissionVisionSection } from './introduce-mission-vision-section';
import { IntroduceVideoSection } from './introduce-video-section';

export function IntroducePageClient() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-white text-slate-900">
        <IntroduceHeroSection />
        <IntroduceVideoSection />
        <IntroduceMissionVisionSection />
        <IntroduceBenefitsSection />
        <IntroduceAudienceSection />
      </div>
    </MotionConfig>
  );
}
