'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, FileText, Receipt } from 'lucide-react';
import type { ProjectLedgerSummary } from '@/types';
import { formatCurrency } from '@/utils';

interface LedgerCardProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}

function LedgerCard({ label, value, hint, icon, tone }: LedgerCardProps) {
  return (
    <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${tone}`}>{label}</span>
        {icon}
      </div>
      <div className={`text-base font-bold mt-1 ${tone}`}>{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>
    </div>
  );
}

export function LedgerSummary({ ledger }: { ledger?: ProjectLedgerSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <LedgerCard
        label="Giá trị hợp đồng hiệu lực"
        value={formatCurrency(ledger?.totalContractValue)}
        hint="Chỉ tính hợp đồng đã ký"
        icon={<FileText size={15} className="text-slate-400" />}
        tone="text-slate-800"
      />
      <LedgerCard
        label="Số tiền đã thu"
        value={formatCurrency(ledger?.totalCollected)}
        hint={ledger?.isFullyPaid ? 'Đã thu đủ 100%' : 'Đang thu theo từng đợt'}
        icon={<CheckCircle2 size={15} className="text-emerald-500" />}
        tone="text-emerald-600"
      />
      <LedgerCard
        label="Số tiền còn lại"
        value={formatCurrency(ledger?.remainingDebt)}
        hint="Cần thu theo các đợt thi công"
        icon={<AlertCircle size={15} className="text-amber-500" />}
        tone="text-amber-600"
      />
      <LedgerCard
        label="Lượt thu tiền"
        value={`${ledger?.totalTransactionsCount ?? 0} lần thu`}
        hint="Tổng số lần đã thu tiền"
        icon={<Receipt size={15} className="text-primary" />}
        tone="text-primary"
      />
    </div>
  );
}
