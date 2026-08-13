'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Heading } from '@/components';
import { StatCards, SuggestionTable, SuggestionModal } from './_components';
import useAuthStore from '@/stores/useAuthStore';

function SuggestionsPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const { user } = useAuthStore();
  const isManager = user?.roles?.some((role) => role.code === 'admin' || role.code === 'hr') ?? false;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-4 p-3">
      {/* Header Section */}
      {/* <Header title="QUẢN LÝ ĐỀ XUẤT & SÁNG KIẾN NHÂN SỰ" className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm" /> */}

      <div className="flex flex-col gap-2">
        <Heading size="h1" className="text-primary text-2xl md:text-4xl">
          Quản lý đề xuất
        </Heading>
        <Heading size="h3" className="text-gray-500 text-sm md:text-lg">
          Danh sách các đề xuất sẽ đc hiển thị tại đây
        </Heading>
      </div>

      {/* Statistical Metrics Cards */}
      {isManager && <StatCards containerWidth={containerWidth} />}

      {/* Suggestions Data Grid / Table */}
      <SuggestionTable isManager={isManager} currentUserId={user?.id} />

      {/* Modals & Dialogs */}
      <SuggestionModal isManager={isManager} currentUserId={user?.id} />
    </div>
  );
}

export default function SuggestionsPage() {
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center min-h-100 text-slate-500">Đang tải dữ liệu...</div>}>
      <SuggestionsPageContent />
    </Suspense>
  );
}
