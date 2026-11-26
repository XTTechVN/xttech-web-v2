'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Badge, Button, Heading } from '@/components';
import { ACCOUNTING_REGIME_MAP } from '@/config/finance';
import type { AccountingRegime, VoucherType } from '@/types';
import type { VoucherEditorMode } from '../voucher-editor';

interface FinanceHeaderProps {
  activeRegime: AccountingRegime;
  refreshing: boolean;
  onCreateVoucher: (mode: VoucherEditorMode, voucherType: VoucherType) => void;
  onRefreshAll: () => void;
}

export function FinanceHeader({
  activeRegime,
  refreshing,
  onCreateVoucher,
  onRefreshAll,
}: FinanceHeaderProps) {
  const regimeMeta = ACCOUNTING_REGIME_MAP[activeRegime] ?? ACCOUNTING_REGIME_MAP.tt99;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Heading size="h1" className="text-2xl font-bold tracking-tight text-slate-900">
            Tài chính, Kế toán &amp; Thuế
          </Heading>
          <Badge variant={regimeMeta.variant} size="md">
            {regimeMeta.shortLabel}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          1 Sổ Tài chính • 1 Quỹ TK 1111 • Sổ cái S03b-DN, Hóa đơn điện tử XML &amp; Kết chuyển 911 → 4212
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateVoucher('workshop', 'cash_receipt')}
          leftIcon={<Plus size={14} />}
        >
          Phiếu Thu
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateVoucher('workshop', 'cash_payment')}
          leftIcon={<Plus size={14} />}
        >
          Phiếu Chi
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onCreateVoucher('accountant', 'general_journal')}
          leftIcon={<Plus size={14} />}
        >
          Chứng từ Kế toán
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshAll}
          leftIcon={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />}
        >
          Làm mới
        </Button>
      </div>
    </div>
  );
}
