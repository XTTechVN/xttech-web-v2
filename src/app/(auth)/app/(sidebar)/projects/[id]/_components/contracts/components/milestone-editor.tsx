'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components';
import type { ContractMilestoneInput } from '@/types';
import { formatCurrency } from '@/utils';

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
  milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

const CELL_INPUT =
  'w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-800';

interface MilestoneEditorProps {
  milestones: ContractMilestoneInput[];
  totalAmount: number;
  onChange: (milestones: ContractMilestoneInput[]) => void;
}

// Chia đợt thanh toán theo %, số tiền mỗi đợt xem trước = % × tổng báo giá
export function MilestoneEditor({ milestones, totalAmount, onChange }: MilestoneEditorProps) {
  const totalPercentage = sumPercentage(milestones);
  const isValidTotal = totalPercentage === 100;

  const updateRow = (index: number, patch: Partial<ContractMilestoneInput>) =>
    onChange(milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const addRow = () =>
    onChange([
      ...milestones,
      { milestoneOrder: milestones.length + 1, installmentName: '', percentage: 0, dueDate: '' },
    ]);

  const removeRow = (index: number) =>
    onChange(
      milestones.filter((_, i) => i !== index).map((m, i) => ({ ...m, milestoneOrder: i + 1 })),
    );

  return (
    <div className="space-y-2.5 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-800">Các đợt thanh toán</span>
          <span className="text-[11px] text-slate-400 block">
            Chia theo tỷ lệ % của giá trị báo giá, tổng phải đúng 100%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border ${
              isValidTotal
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            Tổng: {totalPercentage}%
          </span>
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
          <div className="col-span-5">Tên đợt thanh toán</div>
          <div className="col-span-3">Tỷ lệ & Số tiền dự kiến</div>
          <div className="col-span-3">Hạn thanh toán</div>
        </div>
        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
          {milestones.map((m, index) => (
            <div key={index} className="grid grid-cols-12 gap-2.5 px-3 py-2.5 items-center">
              <div className="col-span-1 text-center font-bold text-slate-700 text-xs">#{index + 1}</div>
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="VD: Thanh toán đợt..."
                  value={m.installmentName}
                  onChange={(e) => updateRow(index, { installmentName: e.target.value })}
                  className={CELL_INPUT}
                />
              </div>
              <div className="col-span-3 flex items-center gap-1.5">
                <div className="relative w-18 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={m.percentage}
                    onChange={(e) => updateRow(index, { percentage: Number(e.target.value) })}
                    className={`${CELL_INPUT} pr-5 font-bold`}
                  />
                  <span className="absolute right-1.5 top-1.5 text-slate-400 text-xs pointer-events-none">
                    %
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold truncate">
                  {formatCurrency(Math.round((totalAmount * (Number(m.percentage) || 0)) / 100))}
                </span>
              </div>
              <div className="col-span-3 flex items-center gap-1.5">
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
          ))}
        </div>
      </div>

      {!isValidTotal && (
        <p className="text-[11px] text-amber-600 font-medium">
          * Tổng tỷ lệ các đợt thanh toán phải bằng đúng 100% để lập hợp đồng.
        </p>
      )}
    </div>
  );
}
