<<<<<<< HEAD
'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Header } from '@/components';
import { StatCards, SuggestionTable, SuggestionModal } from './_components';

function SuggestionsPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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
    <div ref={containerRef} className="w-full flex flex-col gap-6 p-3">
      {/* Header Section */}
      <Header title="QUẢN LÝ ĐỀ XUẤT & SÁNG KIẾN NHÂN SỰ" className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm" />

      {/* Statistical Metrics Cards */}
      <StatCards containerWidth={containerWidth} />

      {/* Suggestions Data Grid / Table */}
      <SuggestionTable />

      {/* Modals & Dialogs */}
      <SuggestionModal />
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
=======
export default function SuggestionsPage() {
  return (
    <div className="flex w-full h-full flex-1 flex-col bg-slate-50">
      <h1 className="text-black">Suggestions Page</h1>
    </div>
  );
}
>>>>>>> b6dee1d (refactor: migrate dashboard and UI components to organized sidebar and public demo directory structures)
