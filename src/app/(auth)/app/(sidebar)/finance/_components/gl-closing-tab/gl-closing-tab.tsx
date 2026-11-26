'use client';

import React, { useMemo, useState } from 'react';
import { BookOpenCheck, Calculator, FileSpreadsheet, Lock, Split } from 'lucide-react';
import { Tabs, type TabItem } from '@/components';
import type { AccountingRegime } from '@/types';
import { ClosingWizardSection } from './closing-wizard-section';
import { GL_SUBTABS, type GlSubTabKey } from './gl-closing-tab.constants';
import { JournalVouchersSection } from './journal-vouchers-section';
import { OverheadAllocationPanel } from './overhead-allocation-panel';
import { PeriodLocksSection } from './period-locks-section';

export interface GlClosingTabProps {
  accountingRegime?: AccountingRegime;
  refreshSignal?: number;
  onCreateJournalVoucher: () => void;
  onOpenOpeningBalance: () => void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoucherChanged?: () => void;
}

const GL_ICONS: Record<GlSubTabKey, React.ReactNode> = {
  journal: <FileSpreadsheet size={14} />,
  overhead_allocation: <Split size={14} />,
  closing: <Calculator size={14} />,
  period_locks: <Lock size={14} />,
};

export function GlClosingTab({
  accountingRegime = 'tt99',
  refreshSignal = 0,
  onCreateJournalVoucher,
  onOpenOpeningBalance,
  onOpenVoucherDetail,
  onVoucherChanged,
}: GlClosingTabProps) {
  const [subTab, setSubTab] = useState<GlSubTabKey>('journal');

  const tabItems: TabItem[] = useMemo(
    () =>
      GL_SUBTABS.map((t) => ({
        value: t.value,
        label: t.label,
        icon: GL_ICONS[t.value],
      })),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BookOpenCheck size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kế toán Tổng hợp, Giá thành Công trình &amp; Kết chuyển 911 → 4212
            </h3>
            <p className="text-xs text-slate-500">
              Quản lý chứng từ nghiệp vụ khác (PKT), số dư đầu kỳ, kết chuyển cuối kỳ 911 → 4212 &amp; dự toán TNDN/B4 và khóa kỳ kế toán
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pb-0.5">
          <Tabs
            tabs={tabItems}
            activeTab={subTab}
            onChange={(val) => setSubTab(val as GlSubTabKey)}
            variant="pill"
            size="sm"
          />
        </div>
      </div>

      {subTab === 'journal' && (
        <JournalVouchersSection
          accountingRegime={accountingRegime}
          refreshSignal={refreshSignal}
          onCreateJournalVoucher={onCreateJournalVoucher}
          onOpenOpeningBalance={onOpenOpeningBalance}
          onOpenVoucherDetail={onOpenVoucherDetail}
          onVoucherChanged={onVoucherChanged}
        />
      )}

      {subTab === 'overhead_allocation' && (
        <OverheadAllocationPanel
          onOpenVoucherDetail={onOpenVoucherDetail}
          onAllocated={onVoucherChanged}
        />
      )}

      {subTab === 'closing' && (
        <ClosingWizardSection
          onOpenVoucherDetail={onOpenVoucherDetail}
          onClosingExecuted={onVoucherChanged}
        />
      )}

      {subTab === 'period_locks' && (
        <PeriodLocksSection refreshSignal={refreshSignal} />
      )}
    </div>
  );
}
