'use client';

import React, { useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button, Select } from '@/components';
import { formatCurrency } from '@/utils/currency';
import type { AutoPostingTemplate, VoucherType } from '@/types';
import {
  computeDraftTotals,
  createEmptyDraftLine,
  nextTempLineId,
  type VoucherDraftLine,
  type VoucherMasterLookups,
} from './voucher-editor.constants';
import { AccountantLineRow } from './accountant-line-row';

export interface AccountantLinesGridProps {
  lines: VoucherDraftLine[];
  lookups: VoucherMasterLookups;
  voucherType: VoucherType;
  disabled?: boolean;
  onChangeLines: (nextLines: VoucherDraftLine[]) => void;
  onApplyTemplate: (template: AutoPostingTemplate) => void;
}

export function AccountantLinesGrid({
  lines,
  lookups,
  voucherType,
  disabled = false,
  onChangeLines,
  onApplyTemplate,
}: AccountantLinesGridProps) {
  const activeTemplates = useMemo(
    () =>
      lookups.templates
        .filter((t) => t.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [lookups.templates],
  );

  const matchingTemplates = useMemo(() => {
    const exact = activeTemplates.filter((t) => t.voucherType === voucherType);
    return exact.length > 0 ? exact : activeTemplates;
  }, [activeTemplates, voucherType]);

  const totals = useMemo(() => computeDraftTotals(lines), [lines]);

  const handleUpdateLine = (tempId: string, patch: Partial<VoucherDraftLine>) => {
    onChangeLines(lines.map((l) => (l.tempId === tempId ? { ...l, ...patch } : l)));
  };

  const handleDuplicateLine = (source: VoucherDraftLine) => {
    onChangeLines([...lines, { ...source, tempId: nextTempLineId() }]);
  };

  const handleRemoveLine = (tempId: string) => {
    if (lines.length <= 1) return;
    onChangeLines(lines.filter((l) => l.tempId !== tempId));
  };

  const handleAddLine = () => {
    const first = lines[0];
    onChangeLines([
      ...lines,
      createEmptyDraftLine({
        description: first?.description || '',
        projectId: first?.projectId ?? null,
        departmentId: first?.departmentId ?? null,
        customerId: first?.customerId ?? null,
        supplierId: first?.supplierId ?? null,
        employeeId: first?.employeeId ?? null,
      }),
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Sparkles size={14} className="text-primary shrink-0" />
          <span>Áp dụng nhanh Mẫu định khoản:</span>
        </div>
        <div className="w-full sm:w-80">
          <Select
            fullWidth
            searchable
            disabled={disabled}
            placeholder="Chọn mẫu để tự điền Nợ/Có..."
            value=""
            options={matchingTemplates.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.debitAccountCode || '?'} → ${t.creditAccountCode || '?'})`,
            }))}
            onChange={(e) => {
              const id = Number(e.target.value);
              const tpl = matchingTemplates.find((t) => t.id === id);
              if (tpl) onApplyTemplate(tpl);
            }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {lines.map((line, idx) => (
          <AccountantLineRow
            key={line.tempId}
            line={line}
            index={idx}
            lookups={lookups}
            canDelete={lines.length > 1}
            disabled={disabled}
            onUpdate={handleUpdateLine}
            onDuplicate={handleDuplicateLine}
            onRemove={handleRemoveLine}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          leftIcon={<Plus size={14} />}
          onClick={handleAddLine}
        >
          Thêm dòng hạch toán
        </Button>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-slate-500">Tiền hàng / Gốc: </span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Thuế GTGT: </span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {formatCurrency(totals.vatTotal)}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-semibold">Tổng cộng: </span>
            <span className="font-mono tabular-nums font-bold text-primary text-sm">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
