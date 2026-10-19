'use client';

import React, { Suspense } from 'react';
import { TrashTab } from './_components/trash-tab';

export default function TrashPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải thùng rác...
        </div>
      }
    >
      <TrashTab />
    </Suspense>
  );
}