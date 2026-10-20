'use client';

import React, { Suspense } from 'react';
import { RulesPageContent } from './_components/rules-page-content';

export default function RulesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white items-center justify-center text-slate-500 text-xs">
          Đang tải cơ chế &amp; quy định...
        </div>
      }
    >
      <RulesPageContent />
    </Suspense>
  );
}