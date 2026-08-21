'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Heading } from '@/components';
import { StatCards, SuggestionTable, SuggestionModal } from './_components';
import useAuthStore from '@/stores/useAuthStore';

function SuggestionsPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const { user } = useAuthStore();
  const isManager = user?.roles?.some((role) => role.code === 'admin' || role.code === 'hr' ||  role.code === 'super') ?? false;

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
    <div ref={containerRef} className="w-full flex flex-col gap-4">

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
