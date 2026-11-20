'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import { BookCheck, Calculator, Eye, Play } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  ConfirmActionModal,
  Input,
  Select,
  Skeleton,
} from '@/components';
import { executeClosing, getClosingPreview } from '@/actions';
import type { ClosingExecuteResponse, ClosingPreview } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';
import { CitEstimateCard } from './cit-estimate-card';
import { ClosingPreviewPanel } from './closing-preview-panel';
import { MONTH_LABELS } from './gl-closing-tab.constants';

interface ClosingWizardSectionProps {
  onOpenVoucherDetail: (voucherId: number) => void;
  onClosingExecuted?: () => void;
}

export function ClosingWizardSection({
  onOpenVoucherDetail,
  onClosingExecuted,
}: ClosingWizardSectionProps) {
  const now = dayjs();
  const [year, setYear] = useState<number>(now.year());
  const [month, setMonth] = useState<number>(now.month() + 1);
  const [postingDate, setPostingDate] = useState('');
  const [description, setDescription] = useState('');
  const [autoPost, setAutoPost] = useState(true);
  const [preview, setPreview] = useState<ClosingPreview | null>(null);
  const [lastResult, setLastResult] = useState<ClosingExecuteResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const closingCode = `KC-${year}-${String(month).padStart(2, '0')}`;

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
    setLastResult(null);
    try {
      const res = await getClosingPreview({ year, month });
      setPreview(res);
    } catch (err) {
      showErrorToast(err, 'Không thể tính toán xem trước kết chuyển cuối kỳ');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await executeClosing({
        year,
        month,
        postingDate: postingDate || undefined,
        description: description.trim() || undefined,
        autoPost,
      });
      setLastResult(res);
      setConfirmOpen(false);
      showSuccessToast(
        res.message || `Đã kết chuyển ${closingCode} (${res.closedCount} chứng từ)`,
      );
      await handlePreview();
      onClosingExecuted?.();
    } catch (err) {
      showErrorToast(err, 'Không thể thực hiện kết chuyển 911 → 4212');
    } finally {
      setExecuting(false);
    }
  };

  const citMetrics = preview ?? lastResult;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <BookCheck size={16} className="text-primary shrink-0" />
            <span>
              Quy trình Kết chuyển Hợp nhất Sổ Tài chính (<strong>911 → 4212</strong>): tổng hợp
              toàn bộ doanh thu &amp; chi phí trong kỳ, phân tách tính hợp lệ thuế TNDN (B4).
            </span>
          </div>
          <Badge variant="primary" size="sm">
            Mã kỳ: {closingCode}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select label="Năm tài chính" value={String(year)} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions} fullWidth />
          <Select label="Tháng kết chuyển" value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} options={monthOptions} fullWidth />
          <Input label="Ngày ghi sổ (Mặc định cuối tháng)" type="date" value={postingDate} onChange={(e) => setPostingDate(e.target.value)} fullWidth />
          <Input label="Diễn giải tùy chỉnh" placeholder={`Kết chuyển KQKD T${month}/${year}`} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <Checkbox
            label="Tự động Ghi sổ cái (Post GL) ngay sau khi sinh chứng từ kết chuyển"
            checked={autoPost}
            onChange={(e) => setAutoPost(e.target.checked)}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" loading={loadingPreview} onClick={handlePreview} leftIcon={<Calculator size={14} />}>
              Xem trước Kết chuyển
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={
                Boolean(preview?.isPeriodLocked) ||
                Boolean(preview?.hasUnallocatedOverhead) ||
                loadingPreview
              }
              onClick={() => setConfirmOpen(true)}
              leftIcon={<Play size={14} />}
            >
              Chạy Kết chuyển 911 → 4212
            </Button>
          </div>
        </div>
      </div>

      {lastResult && lastResult.vouchers.length > 0 && (
        <Alert variant="success" title="Kết chuyển cuối kỳ thành công">
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span>Đã tạo {lastResult.closedCount} chứng từ kết chuyển:</span>
            {lastResult.vouchers.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onOpenVoucherDetail(v.id)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800 font-mono font-bold hover:bg-emerald-100 cursor-pointer"
              >
                <Eye size={12} />
                {v.voucherNo}
              </button>
            ))}
          </div>
        </Alert>
      )}

      {citMetrics && (
        <CitEstimateCard
          metrics={citMetrics}
          periodLabel={`Tháng ${month}/${year} (${closingCode})`}
        />
      )}

      {loadingPreview ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : preview ? (
        <ClosingPreviewPanel preview={preview} onOpenVoucherDetail={onOpenVoucherDetail} />
      ) : null}

      <ConfirmActionModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        variant="primary"
        confirmText="Thực hiện kết chuyển"
        title="Xác nhận Kết chuyển Cuối kỳ (911 → 4212)"
        description={`Hệ thống sẽ tổng hợp doanh thu & chi phí tháng ${month}/${year} trên Sổ Tài chính (chứng từ ${closingCode}) và kết chuyển lãi/lỗ 911 → 4212 vào sổ cái.`}
        loading={executing}
        onConfirm={handleExecute}
      />
    </div>
  );
}
