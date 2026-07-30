'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Banner, StatCards, SuggestionTable, CreateSuggestionModal, SuggestionDetailModal } from './_components';

export default function SuggestionsPage() {
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
    <div ref={containerRef} className="w-full flex flex-col gap-6 pb-12">
      {/* Banner Section */}
      <Banner />

      {/* Statistical Metrics Cards */}
      <StatCards containerWidth={containerWidth} />

      {/* Section Heading (Chủ đề mới nhất) */}
      <div className="w-full h-auto bg-white rounded-2xl px-6 py-4 flex items-center border-b-2 border-[#00C4FF]/60 shadow-md shadow-slate-900/2 select-none">
        <h2 className="font-sans font-bold text-[18px] tracking-wider text-slate-800">Chủ đề mới nhất</h2>
      </div>

      {/* Suggestions Data Grid / Table */}
      <SuggestionTable />

      {/* Modals & Dialogs */}
      <CreateSuggestionModal />
      <SuggestionDetailModal />
    </div>
  );
}
