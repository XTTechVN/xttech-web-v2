'use client';

import React, { useState } from 'react';
import { AiAssistantSection } from './ai-assistant-section';
import { BenefitsSection } from './benefits-section';
import { ContactBannerSection } from './contact-banner-section';
import { PainPointsSection } from './pain-points-section';
import { PillarsSection } from './pillars-section';
import { ProjectReportsSection } from './project-reports-section';
import { HeroDemoModalLazy } from '../modals';

export const HeroStoryPillarsSection = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const openDemo = () => setIsDemoModalOpen(true);

  return (
    <>
      {/* KHỐI 1: THỰC TRẠNG DOANH NGHIỆP */}
      <PainPointsSection />

      {/* KHỐI 2: CẢI TIẾN QUẢN LÝ VỚI XTTECH */}
      <BenefitsSection />

      {/* KHỐI 3: HÀNG LOẠT BÁO CÁO THI CÔNG & DỰ ÁN (CIRCULAR CAROUSEL) */}
      <ProjectReportsSection />

      {/* KHỐI 4: CÔNG NGHỆ AI TRỢ LÝ THÔNG MINH */}
      <AiAssistantSection onOpenDemo={openDemo} />

      {/* KHỐI 5: 8 TRỤ CỘT GIẢI PHÁP CỐT LÕI XTTECH */}
      <PillarsSection />

      {/* BANNER LIÊN HỆ ĐỒNG HÀNH */}
      <ContactBannerSection onOpenDemo={openDemo} />

      {/* Modal đăng ký Demo khi bấm nút */}
      <HeroDemoModalLazy isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default HeroStoryPillarsSection;
