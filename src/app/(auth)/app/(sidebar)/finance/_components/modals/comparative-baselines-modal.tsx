'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save } from 'lucide-react';
import { Alert, Button, CurrencyInput, Input, Modal, Select, Skeleton } from '@/components';
import { getComparativeBaselines, upsertComparativeBaselines } from '@/actions';
import type { ComparativeBaselineFormCode, ComparativeBaselineItem } from '@/types';
import { getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import {
  COMPARATIVE_BASELINE_FORM_OPTIONS,
  COMPARATIVE_BASELINE_PRESETS,
} from './modals.constants';

export interface ComparativeBaselinesModalProps {
  isOpen: boolean;
  fiscalYear: number;
  onClose: () => void;
}

interface BaselineDraftRow {
  indicatorCode: string;
  label: string;
  amount: number;
  note: string;
}

function BaselinesEditorBody({
  fiscalYear,
  formCode,
  initialItems,
  onClose,
}: {
  fiscalYear: number;
  formCode: ComparativeBaselineFormCode;
  initialItems: ComparativeBaselineItem[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [newCode, setNewCode] = useState('');

  const [rows, setRows] = useState<BaselineDraftRow[]>(() => {
    const presets = COMPARATIVE_BASELINE_PRESETS[formCode] || [];
    const presetMap = new Map(presets.map((p) => [p.indicatorCode, p.label]));
    const byCode = new Map(initialItems.map((it) => [it.indicatorCode, it]));

    const seeded: BaselineDraftRow[] = presets.map((p) => {
      const found = byCode.get(p.indicatorCode);
      return {
        indicatorCode: p.indicatorCode,
        label: p.label,
        amount: found?.amount ?? 0,
        note: found?.note || '',
      };
    });

    const extra: BaselineDraftRow[] = initialItems
      .filter((it) => !presetMap.has(it.indicatorCode))
      .map((it) => ({
        indicatorCode: it.indicatorCode,
        label: `Chỉ tiêu [${it.indicatorCode}]`,
        amount: it.amount ?? 0,
        note: it.note || '',
      }));

    return [...seeded, ...extra];
  });

  const handleAddCustomIndicator = () => {
    const cleaned = newCode.trim();
    if (!cleaned) return;
    if (rows.some((r) => r.indicatorCode === cleaned)) {
      showErrorToast(`Chỉ tiêu [${cleaned}] đã tồn tại trong danh sách.`);
      return;
    }
    setRows((prev) => [
      ...prev,
      { indicatorCode: cleaned, label: `Chỉ tiêu [${cleaned}]`, amount: 0, note: '' },
    ]);
    setNewCode('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertComparativeBaselines({
        fiscalYear,
        formCode,
        items: rows.map((r) => ({
          indicatorCode: r.indicatorCode,
          amount: Math.round(r.amount || 0),
          note: r.note.trim() || null,
        })),
      });
      await queryClient.invalidateQueries({
        queryKey: ['finance', 'comparative-baselines', fiscalYear],
      });
      showSuccessToast(`Đã lưu số liệu so sánh năm trước (${formCode}) cho năm ${fiscalYear}`);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Không thể lưu số liệu so sánh năm trước');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <Alert variant="info" title={`Số liệu cột "Năm trước" / "Số đầu năm" cho BCTC năm ${fiscalYear}`}>
        Dùng khi doanh nghiệp chuyển từ phần mềm khác sang XTTECH (chưa có sổ cái năm {fiscalYear - 1} trên hệ thống) để Bảng cân đối, KQKD và Lưu chuyển tiền tệ có cột so sánh hợp lệ.
      </Alert>

      <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[46vh] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="p-2.5 w-24">Mã số</th>
              <th className="p-2.5">Tên chỉ tiêu</th>
              <th className="p-2.5 w-48 text-right">Số tiền kỳ trước (VNĐ)</th>
              <th className="p-2.5 w-44">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.indicatorCode} className="hover:bg-slate-50/70">
                <td className="p-2 font-mono font-bold text-primary">
                  {row.indicatorCode}
                </td>
                <td className="p-2 text-slate-800 font-medium">{row.label}</td>
                <td className="p-2">
                  <CurrencyInput
                    value={row.amount || ''}
                    className="h-8 text-xs font-mono tabular-nums text-right"
                    disabled={saving}
                    onChange={(val) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.indicatorCode === row.indicatorCode ? { ...r, amount: val } : r,
                        ),
                      )
                    }
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={row.note}
                    placeholder="Ghi chú..."
                    className="h-8 text-xs"
                    disabled={saving}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.indicatorCode === row.indicatorCode
                            ? { ...r, note: e.target.value }
                            : r,
                        ),
                      )
                    }
                    fullWidth
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
        <div className="flex items-end gap-1.5">
          <Input
            label="Thêm mã chỉ tiêu khác"
            value={newCode}
            placeholder="VD: 131, 211..."
            onChange={(e) => setNewCode(e.target.value)}
            className="w-44"
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={!newCode.trim()}
            onClick={handleAddCustomIndicator}
            leftIcon={<Plus size={14} />}
          >
            Thêm
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Đóng
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSave}
            leftIcon={<Save size={14} />}
          >
            Lưu số liệu so sánh
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ComparativeBaselinesModal({
  isOpen,
  fiscalYear,
  onClose,
}: ComparativeBaselinesModalProps) {
  const [formCode, setFormCode] = useState<ComparativeBaselineFormCode>('B01_DN');

  const { data, isLoading, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ['finance', 'comparative-baselines', fiscalYear, formCode],
    queryFn: () => getComparativeBaselines({ fiscalYear, formCode }),
    enabled: isOpen,
  });

  const items = useMemo(() => data?.items || [], [data?.items]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Số liệu So sánh Năm trước (BCTC ${fiscalYear})`}
    >
      {isOpen && (
        <div className="space-y-3">
          <div className="w-full sm:w-80">
            <Select
              label="Chọn mẫu biểu BCTC"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value as ComparativeBaselineFormCode)}
              options={COMPARATIVE_BASELINE_FORM_OPTIONS}
              fullWidth
            />
          </div>

          {isError && (
            <Alert variant="danger" title="Không thể tải số liệu so sánh">
              {getErrorMessage(error)}
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <BaselinesEditorBody
              key={`${fiscalYear}-${formCode}-${dataUpdatedAt}`}
              fiscalYear={fiscalYear}
              formCode={formCode}
              initialItems={items}
              onClose={onClose}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
