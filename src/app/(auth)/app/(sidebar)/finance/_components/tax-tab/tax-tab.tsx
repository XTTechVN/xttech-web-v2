'use client';

import React, { useMemo, useState } from 'react';
import { FileCode2, FileSpreadsheet, Receipt, ShieldAlert } from 'lucide-react';
import { Tabs, type TabItem } from '@/components';
import type { Account } from '@/types';
import { CitB4Section } from './cit-b4-section';
import { TaxInvoicesSection } from './tax-invoices-section';
import { TAX_SUBTABS, type TaxSubTabKey } from './tax-tab.constants';
import { VatLedgerSection } from './vat-ledger-section';

export interface TaxTabProps {
  accounts: Account[];
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

const TAX_SUBTAB_ICONS: Record<TaxSubTabKey, React.ReactNode> = {
  invoices: <FileCode2 size={14} />,
  vat_ledger: <Receipt size={14} />,
  cit_b4: <ShieldAlert size={14} />,
};

export function TaxTab({
  accounts,
  refreshSignal = 0,
  onOpenVoucherDetail,
}: TaxTabProps) {
  const [subTab, setSubTab] = useState<TaxSubTabKey>('invoices');

  const tabItems: TabItem[] = useMemo(
    () =>
      TAX_SUBTABS.map((t) => ({
        value: t.value,
        label: t.label,
        icon: TAX_SUBTAB_ICONS[t.value],
      })),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quản lý Thuế GTGT, Hóa đơn Điện tử XML &amp; Chi phí Loại trừ TNDN (B4)
            </h3>
            <p className="text-xs text-slate-500">
              Tải XML chuẩn Tổng cục Thuế, đối chiếu bảng kê GTGT Đầu vào/Ra và kiểm soát chỉ tiêu B4 quyết toán TNDN
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pb-0.5">
          <Tabs
            tabs={tabItems}
            activeTab={subTab}
            onChange={(val) => setSubTab(val as TaxSubTabKey)}
            variant="pill"
            size="sm"
          />
        </div>
      </div>

      {subTab === 'invoices' && (
        <TaxInvoicesSection
          accounts={accounts}
          refreshSignal={refreshSignal}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      {subTab === 'vat_ledger' && (
        <VatLedgerSection
          refreshSignal={refreshSignal}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      {subTab === 'cit_b4' && (
        <CitB4Section
          refreshSignal={refreshSignal}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}
    </div>
  );
}
