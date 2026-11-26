'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, Plus, RefreshCw, Save } from 'lucide-react';
import { Alert, Badge, Button, Skeleton } from '@/components';
import {
  bulkUpsertPitEntries,
  getPitEntries,
  syncPitEntriesFromGl,
} from '@/actions';
import type {
  FilingFrequency,
  PitEntryInput,
  PitLedgerSummary,
} from '@/types';
import { formatCurrency, getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import { PitEntriesTable } from './pit-entries-table';

const PitExcelImportModal = dynamic(
  () => import('./modals/pit-excel-import-modal').then((m) => m.PitExcelImportModal),
  { ssr: false },
);

export interface PitEntriesSectionProps {
  taxYear: number;
  periodType: FilingFrequency;
  periodIndex: number;
}

function PitTableEditor({
  summary,
  taxYear,
  periodType,
  periodIndex,
}: {
  summary: PitLedgerSummary;
  taxYear: number;
  periodType: FilingFrequency;
  periodIndex: number;
}) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<PitEntryInput[]>(() =>
    summary.items.map((item) => ({
      employeeId: item.employeeId ?? null,
      fullName: item.fullName,
      taxCode: item.taxCode ?? null,
      idNumber: item.idNumber ?? null,
      contractCategory: item.contractCategory,
      isTaxDeducted: item.isTaxDeducted,
      grossTaxableIncome: item.grossTaxableIncome,
      personalDeduction: item.personalDeduction,
      dependentCount: item.dependentCount,
      dependentDeduction: item.dependentDeduction,
      insuranceDeduction: item.insuranceDeduction,
      otherDeduction: item.otherDeduction,
      assessableIncome: item.assessableIncome,
      withheldPitAmount: item.withheldPitAmount,
      sourceVoucherIds: item.sourceVoucherIds || [],
      status: item.status,
      note: item.note ?? null,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const totalGross = rows.reduce((s, r) => s + (r.grossTaxableIncome || 0), 0);
  const totalPit = rows.reduce((s, r) => s + (r.withheldPitAmount || 0), 0);

  const updateRow = (idx: number, patch: Partial<PitEntryInput>) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const merged = { ...row, ...patch };
        const assessable = Math.max(
          0,
          (merged.grossTaxableIncome || 0) -
            (merged.personalDeduction || 0) -
            (merged.dependentDeduction || 0) -
            (merged.insuranceDeduction || 0) -
            (merged.otherDeduction || 0),
        );
        return { ...merged, assessableIncome: assessable };
      }),
    );
  };

  const handleSyncGl = async () => {
    setSyncing(true);
    try {
      await syncPitEntriesFromGl({ taxYear, periodType, periodIndex });
      await queryClient.invalidateQueries({ queryKey: ['finance', 'statutory'] });
      showSuccessToast('Đã đồng bộ bảng kê TNCN từ Sổ cái TK 334 / 3335');
    } catch (err) {
      showErrorToast(err, 'Không thể đồng bộ từ Sổ cái');
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async () => {
    if (rows.some((r) => !r.fullName.trim())) {
      showErrorToast('Vui lòng nhập đầy đủ Họ tên cho tất cả dòng nhân sự.');
      return;
    }
    setSaving(true);
    try {
      await bulkUpsertPitEntries({ taxYear, periodType, periodIndex, entries: rows });
      await queryClient.invalidateQueries({ queryKey: ['finance', 'statutory'] });
      showSuccessToast('Đã lưu bảng kê khấu trừ thuế TNCN');
    } catch (err) {
      showErrorToast(err, 'Không thể lưu bảng kê TNCN');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500">Tổng TN chịu thuế (Bảng kê)</div>
          <div className="font-mono tabular-nums font-bold text-primary text-base mt-1">
            {formatCurrency(totalGross)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500">Tổng Sổ cái TK 334* (GL)</div>
          <div className="font-mono tabular-nums font-bold text-slate-900 text-base mt-1">
            {formatCurrency(summary.gl334Total)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500">Thuế TNCN khấu trừ (Bảng kê)</div>
          <div className="font-mono tabular-nums font-bold text-primary text-base mt-1">
            {formatCurrency(totalPit)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-slate-500">TK 3335* (GL) &amp; RC-06</div>
            <div className="font-mono tabular-nums font-bold text-slate-900 text-base mt-1">
              {formatCurrency(summary.gl3335Total)}
            </div>
          </div>
          <Badge variant={summary.isMatchedWithGl ? 'success' : 'danger'} size="md">
            {summary.isMatchedWithGl ? 'Khớp RC-06' : 'Lệch GL'}
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={syncing}
            onClick={handleSyncGl}
            leftIcon={<RefreshCw size={14} />}
          >
            Đồng bộ từ Sổ cái TK 334 / 3335
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            leftIcon={<FileSpreadsheet size={14} />}
          >
            Nhập Excel Bảng lương
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                {
                  fullName: '',
                  contractCategory: 'resident_gte_3m',
                  isTaxDeducted: true,
                  grossTaxableIncome: 0,
                  personalDeduction: 11_000_000,
                  dependentCount: 0,
                  dependentDeduction: 0,
                  insuranceDeduction: 0,
                  otherDeduction: 0,
                  assessableIncome: 0,
                  withheldPitAmount: 0,
                  status: 'verified',
                },
              ])
            }
            leftIcon={<Plus size={14} />}
          >
            Thêm dòng
          </Button>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          loading={saving}
          onClick={handleSave}
          leftIcon={<Save size={14} />}
        >
          Lưu Bảng kê TNCN
        </Button>
      </div>

      <PitEntriesTable
        rows={rows}
        onUpdateRow={updateRow}
        onRemoveRow={(idx) => setRows((prev) => prev.filter((_, i) => i !== idx))}
      />

      <PitExcelImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onConfirmImport={(imported) => setRows(imported)}
      />
    </div>
  );
}

export function PitEntriesSection({
  taxYear,
  periodType,
  periodIndex,
}: PitEntriesSectionProps) {
  const { data, isLoading, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ['finance', 'statutory', 'pit-entries', taxYear, periodType, periodIndex],
    queryFn: () => getPitEntries({ taxYear, periodType, periodIndex }),
  });

  if (isError) {
    return (
      <Alert variant="danger" title="Không thể tải bảng kê khấu trừ thuế TNCN">
        {getErrorMessage(error)}
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <PitTableEditor
      key={`${taxYear}-${periodType}-${periodIndex}-${dataUpdatedAt}`}
      summary={data}
      taxYear={taxYear}
      periodType={periodType}
      periodIndex={periodIndex}
    />
  );
}
