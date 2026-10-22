'use client';

import React from 'react';
import { DollarSign, Receipt, RotateCcw } from 'lucide-react';
import { Button } from '@/components';
import { PAYMENT_METHOD_MAP } from '@/config';
import type { PaymentTransactionItem, ProjectLedgerSummary } from '@/types';
import { formatCurrency } from '@/utils';

interface TransactionHistoryProps {
  transactions: PaymentTransactionItem[];
  ledger?: ProjectLedgerSummary;
  isLoading: boolean;
  canCollect: boolean;
  onCollect: () => void;
  onReverse: (transaction: PaymentTransactionItem) => void;
}

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

function CollectionProgress({ ledger }: { ledger?: ProjectLedgerSummary }) {
  const total = ledger?.totalContractValue ?? 0;
  const collected = ledger?.totalCollected ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((collected / total) * 100)) : 0;

  return (
    <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">Tiến độ thanh toán</span>
        <span className="font-bold text-emerald-600">{percent}%</span>
      </div>
      <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
        <span>Đã thu: {formatCurrency(collected)}</span>
        <span>Còn lại: {formatCurrency(ledger?.remainingDebt)}</span>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
  onReverse,
}: {
  transaction: PaymentTransactionItem;
  onReverse: (transaction: PaymentTransactionItem) => void;
}) {
  const isNegative = transaction.amount < 0;
  const canReverse = transaction.amount > 0 && !transaction.reversalOfId;

  return (
    <div
      className={`p-3 text-xs flex items-start justify-between gap-3 ${
        isNegative ? 'bg-red-50/40 text-red-700' : 'hover:bg-slate-50/60'
      }`}
    >
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-800">{transaction.transactionCode}</span>
          <span className="text-[11px] text-slate-400">
            {formatDateTime(transaction.transactionDate || transaction.createdAt)}
          </span>
          <span className="text-[10px] px-1 rounded bg-slate-100 text-slate-600">
            {PAYMENT_METHOD_MAP[transaction.paymentMethod] ?? transaction.paymentMethod}
          </span>
        </div>
        {transaction.note && <p className="text-slate-600 text-[11px] truncate">{transaction.note}</p>}
        {transaction.bankReference && (
          <span className="text-[10px] text-slate-400 block">
            Mã GD ngân hàng: {transaction.bankReference}
          </span>
        )}
      </div>
      <div className="text-right shrink-0 space-y-1">
        <div className={`font-bold text-xs ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
          {transaction.amount > 0 ? `+${formatCurrency(transaction.amount)}` : formatCurrency(transaction.amount)}
        </div>
        {canReverse && (
          <button
            type="button"
            title="Hoàn tiền cho khoản này"
            onClick={() => onReverse(transaction)}
            className="px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[10px] font-medium cursor-pointer transition-colors inline-flex items-center gap-1 border-0"
          >
            <RotateCcw size={10} /> Hoàn tiền
          </button>
        )}
      </div>
    </div>
  );
}

export function TransactionHistory({
  transactions,
  ledger,
  isLoading,
  canCollect,
  onCollect,
  onReverse,
}: TransactionHistoryProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-4 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            Lịch sử thanh toán
            <span className="px-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
              {transactions.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Danh sách các lần thu tiền và hoàn tiền</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<DollarSign size={14} />}
          disabled={!canCollect}
          title={canCollect ? undefined : 'Cần có hợp đồng đã ký để thu tiền'}
          onClick={onCollect}
          className="h-7 text-xs font-semibold px-2.5"
        >
          Tạo phiếu thu
        </Button>
      </div>

      <CollectionProgress ledger={ledger} />

      {isLoading && (
        <p className="text-xs text-slate-400 text-center py-6">Đang tải lịch sử thanh toán...</p>
      )}
      {!isLoading && transactions.length === 0 && (
        <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
          <Receipt size={22} className="mx-auto text-slate-300 mb-1.5" />
          Chưa có lượt thu tiền nào.
        </div>
      )}
      {!isLoading && transactions.length > 0 && (
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden max-h-[460px] overflow-y-auto">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} onReverse={onReverse} />
          ))}
        </div>
      )}
    </div>
  );
}
