'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Sparkles, UserCheck, Users, Building } from 'lucide-react';
import { Tabs, type TabItem } from '@/components';
import type {
  Account,
  AutoPostingTemplate,
  BankAccount,
  CostItem,
} from '@/types';
import { AR_AP_SUBTABS, type ArApSubTabKey } from './ar-ap-tab.constants';
import { EmployeeAdvanceSection } from './employee-advance-section';
import { PartnerAgingSection } from './partner-aging-section';
import { SourceQueueSection } from './source-queue-section';

export interface ArApTabProps {
  accounts: Account[];
  bankAccounts: BankAccount[];
  costItems: CostItem[];
  autoPostingTemplates: AutoPostingTemplate[];
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoucherChanged?: () => void;
}

const SUBTAB_ICONS: Record<ArApSubTabKey, React.ReactNode> = {
  source_queue: <Sparkles size={14} />,
  receivable: <UserCheck size={14} />,
  payable: <Building size={14} />,
  advance: <Users size={14} />,
};

export function ArApTab({
  accounts,
  bankAccounts,
  costItems,
  autoPostingTemplates,
  refreshSignal = 0,
  onOpenVoucherDetail,
  onVoucherChanged,
}: ArApTabProps) {
  const [subTab, setSubTab] = useState<ArApSubTabKey>('source_queue');

  const tabItems: TabItem[] = useMemo(
    () =>
      AR_AP_SUBTABS.map((t) => ({
        value: t.value,
        label: t.label,
        icon: SUBTAB_ICONS[t.value],
      })),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ArrowLeftRight size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Công nợ 131 / 331 / 141 &amp; Hàng chờ Hạch toán Bán tự động
              </h3>
              <p className="text-xs text-slate-500">
                Kiểm duyệt nguồn tiền từ Hợp đồng, Phiếu kho, Đơn đặt kính thành Chứng từ nháp và theo dõi tuổi nợ trên Sổ Tài chính
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-0.5">
          <Tabs
            tabs={tabItems}
            activeTab={subTab}
            onChange={(val) => setSubTab(val as ArApSubTabKey)}
            variant="pill"
            size="sm"
          />
        </div>
      </div>

      {subTab === 'source_queue' && (
        <SourceQueueSection
          accounts={accounts}
          bankAccounts={bankAccounts}
          costItems={costItems}
          templates={autoPostingTemplates}
          refreshSignal={refreshSignal}
          onOpenVoucherDetail={onOpenVoucherDetail}
          onVoucherImported={onVoucherChanged}
        />
      )}

      {subTab === 'receivable' && (
        <PartnerAgingSection
          key="receivable"
          kind="receivable"
          refreshSignal={refreshSignal}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      {subTab === 'payable' && (
        <PartnerAgingSection
          key="payable"
          kind="payable"
          refreshSignal={refreshSignal}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      {subTab === 'advance' && (
        <EmployeeAdvanceSection
          refreshSignal={refreshSignal}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}
    </div>
  );
}
