'use client';

import React, { Suspense } from 'react';
import { RulesContent } from './_components/rules-content';

export default function RulesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải danh sách quy chế...
        </div>
      }
    >
      <RulesContent />
    </Suspense>
  );
}