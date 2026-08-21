'use client';

import React, { useRef, Suspense } from 'react';
import { Heading } from '@/components';
import { RoleTable } from './_components';

function RolesPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-4">
      {/* Roles Data Grid / Table */}
      <RoleTable />
    </div>
  );
}

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-100 text-slate-500">
          Đang tải dữ liệu...
        </div>
      }
    >
      <RolesPageContent />
    </Suspense>
  );
}
