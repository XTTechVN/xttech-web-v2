'use client';

import dynamic from 'next/dynamic';

// Modal nặng chỉ tải khi cần (không SSR) để giảm bundle ban đầu của trang chủ
export const HeroDemoModalLazy = dynamic(
  () => import('./hero-demo-modal').then((m) => m.HeroDemoModal),
  { ssr: false },
);