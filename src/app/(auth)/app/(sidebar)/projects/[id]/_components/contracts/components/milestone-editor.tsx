'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components';
import type { ContractMilestoneInput } from '@/types';
import { formatCurrency, formatMoneyInput, onlyDigits } from '@/utils';

export const DEFAULT_MILESTONES: ContractMilestoneInput[] = [
  { milestoneOrder: 1, installmentName: 'Tạm ứng đợt 1 (Ký hợp đồng)', percentage: 40, dueDate: '' },
  {
    milestoneOrder: 2,
    installmentName: 'Thanh toán đợt 2 (Giao hàng đến chân công trình)',
    percentage: 40,
    dueDate: '',
  },
  { milestoneOrder: 3, installmentName: 'Quyết toán đợt 3 (Nghiệm thu bàn giao)', percentage: 20, dueDate: '' },
];

export const sumPercentage = (milestones: ContractMilestoneInput[]): number =>
  Number(milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0).toFixed(2));

export const sumAmount = (milestones: ContractMilestoneInput[], totalAmount: number): number =>
  milestones.reduce((sum, m) => {
    const amount =
      m.expectedAmount !== undefined
        ? Number(m.expectedAmount)
        : Math.round((totalAmount * (Number(m.percentage) || 0)) / 100);
    return sum + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

const CELL_INPUT =
  'w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-800 transition-colors';

interface MilestoneEditorProps {
  milestones: ContractMilestoneInput[];
  totalAmount: number;
  onChange: (milestones: ContractMilestoneInput[]) => void;
}

export function MilestoneEditor({ milestones, totalAmount, onChange }: MilestoneEditorProps) {
  const totalPercentage = sumPercentage(milestones);
  const totalExpectedAmount = sumAmount(milestones, totalAmount);

  const isPercentageValid = Math.abs(totalPercentage - 100) <= 0.05;
  const isAmountValid = totalAmount > 0 && Math.abs(totalExpectedAmount - totalAmount) <= 1000;
  const isValidTotal = isPercentageValid || isAmountValid;

  const updateRow = (index: number, patch: Partial<ContractMilestoneInput>) =>
    onChange(milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const handlePercentageChange = (index: number, rawVal: string) => {
    const pct = rawVal === '' ? 0 : parseFloat(rawVal);
    const safePct = Number.isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct));
    const amount = totalAmount > 0 ? Math.round((totalAmount * safePct) / 100) : 0;
    updateRow(index, {
      percentage: safePct,
      expectedAmount: amount,
    });
  };

  const handleAmountChange = (index: number, rawVal: string) => {
    const digits = onlyDigits(rawVal);
    const amount = digits === '' ? 0 : parseInt(digits, 10);
    const pct = totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0;
    updateRow(index, {
      expectedAmount: amount,
      percentage: Math.min(100, pct),
    });
  };

  const addRow = () => {
    const remainingPct = Math.max(0, Number((100 - totalPercentage).toFixed(2)));
    const remainingAmt = Math.max(0, totalAmount - totalExpectedAmount);
    onChange([
      ...milestones,
      {
        milestoneOrder: milestones.length + 1,
        installmentName: '',
        percentage: remainingPct,
        expectedAmount: remainingAmt,
        dueDate: '',
      },
    ]);
  };

  const removeRow = (index: number) =>
    onChange(
      milestones.filter((_, i) => i !== index).map((m, i) => ({ ...m, milestoneOrder: i + 1 })),
    );

  return (
    <div className="space-y-2.5 pt-3 border-t border-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-800">Các đợt thanh toán</span>
          <span className="text-[11px] text-slate-400 block">
            Nhập tỷ lệ % hoặc số tiền trực tiếp (tự động quy đổi qua lại)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-2 transition-colors ${
              isValidTotal
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span>
              Tổng: <b className="font-bold">{totalPercentage}%</b>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              <b className="font-bold">{formatCurrency(totalExpectedAmount)}</b> / {formatCurrency(totalAmount)}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus size={13} />}
            onClick={addRow}
            className="h-7 text-xs px-2.5 font-semibold"
          >
            Thêm đợt
          </Button>
        </div>
      </div>

      <div className="border border-slate-200/80 rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500">
          <div className="col-span-1 text-center">Đợt</div>
          <div className="col-span-4">Tên đợt thanh toán</div>
          <div className="col-span-2">Tỷ lệ (%)</div>
          <div className="col-span-3">Số tiền (VNĐ)</div>
          <div className="col-span-2">Hạn thanh toán</div>
        </div>
        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
          {milestones.map((m, index) => {
            const currentAmount =
              m.expectedAmount !== undefined
                ? m.expectedAmount
                : Math.round((totalAmount * (Number(m.percentage) || 0)) / 100);

            return (
              <div key={index} className="grid grid-cols-12 gap-2.5 px-3 py-2.5 items-center">
                <div className="col-span-1 text-center font-bold text-slate-700 text-xs">#{index + 1}</div>
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="VD: Thanh toán đợt..."
                    value={m.installmentName}
                    onChange={(e) => updateRow(index, { installmentName: e.target.value })}
                    className={CELL_INPUT}
                  />
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={m.percentage === 0 ? '' : m.percentage}
                      placeholder="0"
                      onChange={(e) => handlePercentageChange(index, e.target.value)}
                      className={`${CELL_INPUT} pr-5 font-bold`}
                    />
                    <span className="absolute right-1.5 top-1.5 text-slate-400 text-xs pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={currentAmount > 0 ? formatMoneyInput(String(currentAmount)) : ''}
                      placeholder="0 đ"
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      className={`${CELL_INPUT} pr-6 font-semibold text-right text-emerald-700`}
                    />
                    <span className="absolute right-2 top-1.5 text-slate-400 text-[11px] pointer-events-none">
                      đ
                    </span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <input
                    type="date"
                    value={m.dueDate ?? ''}
                    onChange={(e) => updateRow(index, { dueDate: e.target.value })}
                    className={`${CELL_INPUT} text-slate-600`}
                  />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors shrink-0 bg-transparent border-0"
                      title="Xóa đợt này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isValidTotal && (
        <p className="text-[11px] text-amber-600 font-medium">
          * Tổng các đợt thanh toán phải bằng 100% hoặc khớp giá trị hợp đồng ({formatCurrency(totalAmount)}).
        </p>
      )}
    </div>
  );
}
