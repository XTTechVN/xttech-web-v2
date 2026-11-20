'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, BookOpen, Wallet } from 'lucide-react';
import { Badge, Button, Tabs, type TabItem } from '@/components';
import { getCashbookReport } from '@/actions/finance';
import { formatCurrency } from '@/utils/currency';
import type { VoucherSummary, VoucherType } from '@/types';
import { getCurrentMonthDateRange } from '../overview-tab';
import { CASH_SUB_TABS, type CashSubTabKey } from './cash-tab.constants';
import { CashCountPanel } from './cash-count-panel';
import { CashVouchersPanel } from './cash-vouchers-panel';
import { CashbookLedgerPanel } from './cashbook-ledger-panel';

export interface CashTabProps {
  onCreateVoucher: (options?: {
    mode?: 'workshop' | 'accountant';
    voucherType?: VoucherType;
  }) => void;
  onEditVoucher: (voucher: VoucherSummary) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoidVoucher: (voucher: VoucherSummary) => void;
}

export function CashTab({
  onCreateVoucher,
  onEditVoucher,
  onOpenVoucherDetail,
  onVoidVoucher,
}: CashTabProps) {
  const [subTab, setSubTab] = useState<CashSubTabKey>('vouchers');
  const defaultRange = getCurrentMonthDateRange();

  const { data: cashbookSummary } = useQuery({
    queryKey: ['finance', 'reports', 'cashbook', defaultRange.fromDate, defaultRange.toDate],
    queryFn: () =>
      getCashbookReport({
        fromDate: defaultRange.fromDate,
        toDate: defaultRange.toDate,
      }),
  });

  const tabItems: TabItem[] = useMemo(
    () =>
      CASH_SUB_TABS.map((t) => {
        const Icon = t.icon;
        return { value: t.value, label: t.label, icon: <Icon size={14} /> };
      }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white border border-primary/25 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Wallet size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Quỹ Tiền mặt duy nhất (TK 1111)
              </h3>
              <Badge variant="primary" size="sm">
                Sổ Quỹ S07-DN
              </Badge>
              {cashbookSummary && cashbookSummary.pendingDraftCount > 0 && (
                <Badge variant="warning" size="sm">
                  {cashbookSummary.pendingDraftCount} nháp chờ ghi sổ (
                  {formatCurrency(cashbookSummary.pendingDraftAmount)})
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span>
                Thu trong tháng:{' '}
                <strong className="font-mono tabular-nums text-emerald-700">
                  +{formatCurrency(cashbookSummary?.totalReceipt ?? 0)}
                </strong>
              </span>
              <span>
                Chi trong tháng:{' '}
                <strong className="font-mono tabular-nums text-rose-600">
                  -{formatCurrency(cashbookSummary?.totalPayment ?? 0)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="sm:text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Số dư Quỹ hiện tại (Đã ghi sổ)
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-primary">
              {formatCurrency(cashbookSummary?.closingBalance ?? 0)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              leftIcon={<ArrowDownLeft size={13} />}
              onClick={() => onCreateVoucher({ mode: 'workshop', voucherType: 'cash_receipt' })}
            >
              Phiếu Thu
            </Button>
            <Button
              type="button"
              size="xs"
              variant="primary"
              leftIcon={<ArrowUpRight size={13} />}
              onClick={() => onCreateVoucher({ mode: 'workshop', voucherType: 'cash_payment' })}
            >
              Phiếu Chi
            </Button>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              leftIcon={<BookOpen size={13} />}
              onClick={() => setSubTab('cashbook')}
            >
              Sổ Quỹ S07-DN
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        tabs={tabItems}
        activeTab={subTab}
        onChange={(v) => setSubTab(v as CashSubTabKey)}
        size="sm"
      />

      {subTab === 'vouchers' && (
        <CashVouchersPanel
          onCreateVoucher={(voucherType) =>
            onCreateVoucher({ mode: 'workshop', voucherType })
          }
          onEditVoucher={onEditVoucher}
          onOpenVoucherDetail={onOpenVoucherDetail}
          onVoidVoucher={onVoidVoucher}
        />
      )}
      {subTab === 'cashbook' && (
        <CashbookLedgerPanel onOpenVoucherDetail={onOpenVoucherDetail} />
      )}
      {subTab === 'cash_counts' && (
        <CashCountPanel
          currentBookBalance={cashbookSummary?.closingBalance ?? 0}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}
    </div>
  );
}
