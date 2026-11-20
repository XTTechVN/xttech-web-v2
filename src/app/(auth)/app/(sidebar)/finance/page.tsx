'use client';

import React, { Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FinanceTabKey } from '@/types';
import { FinanceWorkspace, resolveFinanceTabKey } from './_components';

function FinancePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = resolveFinanceTabKey(searchParams.get('tab'));

  const handleChangeTab = useCallback(
    (nextTab: FinanceTabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', nextTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return <FinanceWorkspace activeTab={activeTab} onChangeTab={handleChangeTab} />;
}

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-400">
          Đang tải phân hệ Tài chính - Kế toán...
        </div>
      }
    >
      <FinancePageContent />
    </Suspense>
  );
}
