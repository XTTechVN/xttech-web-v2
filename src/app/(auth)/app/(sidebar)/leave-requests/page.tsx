'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { StatCards, LeaveRequestTable, LeaveRequestModal } from './_components';
import { usePermission } from '@/hooks';

function LeaveRequestsPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const { user, isManager } = usePermission();

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

      {/* Leave Requests Data Grid / Table */}
      <LeaveRequestTable isManager={isManager} currentUserId={user?.id} />

      {/* Modals & Dialogs (Create / Edit / Detail / Review / Delete) */}
      <LeaveRequestModal isManager={isManager} currentUserId={user?.id} />
    </div>
  );
}

export default function LeaveRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-[400px] text-slate-500">
          Đang tải dữ liệu nghỉ phép...
        </div>
      }
    >
      <LeaveRequestsPageContent />
    </Suspense>
  );
}
