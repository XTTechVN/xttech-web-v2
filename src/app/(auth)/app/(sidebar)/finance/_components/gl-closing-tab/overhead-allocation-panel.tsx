'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Calculator, Eye, Play, Split } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  ConfirmActionModal,
  Input,
  Select,
  Skeleton,
} from '@/components';
import {
  executeOverheadAllocation,
  previewOverheadAllocation,
} from '@/actions';
import { OVERHEAD_ALLOCATION_BASIS_MAP } from '@/config/finance';
import type {
  OverheadAllocationPreview,
  OverheadAllocationRun,
} from '@/types';
import { formatCurrency, showErrorToast, showSuccessToast } from '@/utils';
import { MONTH_LABELS } from './gl-closing-tab.constants';
import { OverheadAllocationPreviewPanel } from './overhead-allocation-preview-panel';

export interface OverheadAllocationPanelProps {
  onOpenVoucherDetail: (voucherId: number) => void;
  onAllocated?: () => void;
}

export function OverheadAllocationPanel({
  onOpenVoucherDetail,
  onAllocated,
}: OverheadAllocationPanelProps) {
  const queryClient = useQueryClient();
  const now = dayjs();
  const [year, setYear] = useState<number>(now.year());
  const [month, setMonth] = useState<number>(now.month() + 1);
  const [postingDate, setPostingDate] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<OverheadAllocationPreview | null>(null);
  const [lastRun, setLastRun] = useState<OverheadAllocationRun | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const yearOptions = [now.year() - 1, now.year(), now.year() + 1].map((y) => ({
    value: String(y),
    label: `Năm ${y}`,
  }));
  const monthOptions = MONTH_LABELS.map((m) => ({
    value: String(m.month),
    label: m.name,
  }));

  const handlePreview = async () => {
    setLoadingPreview(true);
    setLastRun(null);
    try {
      const res = await previewOverheadAllocation({ year, month });
      setPreview(res);
    } catch (err) {
      showErrorToast(err, 'Không thể tính toán xem trước phân bổ chi phí chung');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const run = await executeOverheadAllocation({
        year,
        month,
        postingDate: postingDate || undefined,
        description: description.trim() || undefined,
      });
      setLastRun(run);
      setConfirmOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(
        `Đã phân bổ chi phí chung kỳ ${month}/${year} (${run.voucherNo || `#${run.id}`})`,
      );
      await handlePreview();
      onAllocated?.();
    } catch (err) {
      showErrorToast(err, 'Không thể thực thi phân bổ chi phí chung');
    } finally {
      setExecuting(false);
    }
  };

  const totalPool =
    (preview?.totalPoolDeductible ?? 0) + (preview?.totalPoolNonDeductible ?? 0);
  const canExecute =
    Boolean(preview) &&
    totalPool > 0 &&
    !preview?.alreadyAllocatedRunId &&
    !loadingPreview;

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-slate-700">
            <Split size={16} className="text-primary shrink-0" />
            <span>
              Phân bổ Chi phí sản xuất chung chưa gắn công trình (<strong>TK 627*</strong> TT99 hoặc <strong>TK 154 chung</strong> TT133) sang <strong>TK 154 từng công trình</strong>, tách 2 nhóm Được trừ / B4.
            </span>
          </div>
          {preview && (
            <Badge
              variant={OVERHEAD_ALLOCATION_BASIS_MAP[preview.allocationBasis]?.variant || 'primary'}
              size="sm"
            >
              {OVERHEAD_ALLOCATION_BASIS_MAP[preview.allocationBasis]?.shortLabel}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            label="Năm tài chính"
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            options={yearOptions}
            fullWidth
          />
          <Select
            label="Tháng phân bổ"
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
            options={monthOptions}
            fullWidth
          />
          <Input
            label="Ngày ghi sổ (Mặc định cuối tháng)"
            type="date"
            value={postingDate}
            onChange={(e) => setPostingDate(e.target.value)}
            fullWidth
          />
          <Input
            label="Diễn giải PKT phân bổ"
            placeholder={`Phân bổ CPC T${month}/${year}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            loading={loadingPreview}
            onClick={handlePreview}
            leftIcon={<Calculator size={14} />}
          >
            Xem trước Phân bổ
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!canExecute}
            onClick={() => setConfirmOpen(true)}
            leftIcon={<Play size={14} />}
          >
            Thực thi Phân bổ 627 / 154
          </Button>
        </div>
      </div>

      {lastRun?.voucherId && (
        <Alert variant="success" title="Đã tạo chứng từ Phân bổ Chi phí chung">
          <div className="flex flex-wrap items-center gap-2">
            <span>Chứng từ PKT phân bổ:</span>
            <button
              type="button"
              onClick={() => onOpenVoucherDetail(lastRun.voucherId!)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800 font-mono font-bold hover:bg-emerald-100 cursor-pointer"
            >
              <Eye size={12} />
              {lastRun.voucherNo || `#${lastRun.voucherId}`}
            </button>
          </div>
        </Alert>
      )}

      {loadingPreview ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : preview ? (
        <OverheadAllocationPreviewPanel preview={preview} />
      ) : null}

      <ConfirmActionModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        variant="primary"
        confirmText="Thực thi Phân bổ"
        title={`Xác nhận Phân bổ Chi phí chung Tháng ${month}/${year}`}
        description={`Hệ thống sẽ sinh 1 chứng từ Tổng hợp (PB) phân bổ ${formatCurrency(totalPool)} chi phí sản xuất chung theo tiêu thức năm tài chính, giữ nguyên phân tách chi phí Được trừ và B4.`}
        loading={executing}
        onConfirm={handleExecute}
      />
    </div>
  );
}
