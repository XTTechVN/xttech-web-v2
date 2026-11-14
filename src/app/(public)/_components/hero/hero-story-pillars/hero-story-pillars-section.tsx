'use client';

import React, { useState } from 'react';
import { Modal } from '@/components';
import { AiAssistantSection } from './ai-assistant-section';
import { BenefitsSection } from './benefits-section';
import { PainPointsSection } from './pain-points-section';
import { PillarsSection } from './pillars-section';
import { ProjectReportsSection } from './project-reports-section';
import {
  HeroRegisterInlineForm,
  markRegisterInteracted,
} from '../hero-register-inline-form';

export const HeroStoryPillarsSection = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const openDemo = () => {
    markRegisterInteracted();
    setIsDemoModalOpen(true);
  };

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

      {/* Modal đăng ký trải nghiệm khi bấm nút */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        size="md"
        title="Đăng ký trải nghiệm XTTECH XMS Fab"
        className="max-w-lg border border-primary/20"
        bodyClassName="p-5 sm:p-6"
      >
        <HeroRegisterInlineForm
          variant="modal"
          onBack={() => setIsDemoModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default HeroStoryPillarsSection;
