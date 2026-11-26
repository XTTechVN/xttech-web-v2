'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AlertTriangle, FileSpreadsheet, RefreshCw, Save } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  CurrencyInput,
  Input,
  Select,
  Skeleton,
} from '@/components';
import { getFiscalYearConfigs, upsertFiscalYearConfig } from '@/actions';
import {
  OVERHEAD_ALLOCATION_BASIS_MAP,
  OVERHEAD_ALLOCATION_BASIS_OPTIONS,
} from '@/config/finance';
import type { FiscalYearConfig, OverheadAllocationBasis } from '@/types';
import { formatCurrency, getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import { ComparativeBaselinesModal } from '../modals';

function FiscalYearEditorForm({
  config,
  year,
  onOpenBaselines,
}: {
  config: FiscalYearConfig | null;
  year: number;
  onOpenBaselines: () => void;
}) {
  const queryClient = useQueryClient();
  const initialBasis: OverheadAllocationBasis =
    config?.overheadAllocationBasis || 'direct_cost_621_622';
  const [basis, setBasis] = useState<OverheadAllocationBasis>(initialBasis);
  const [priorRevenue, setPriorRevenue] = useState<number>(config?.priorYearRevenue ?? 0);
  const [citRate, setCitRate] = useState<string>(String(config?.citRatePercent ?? 20));
  const [lossCarryforward, setLossCarryforward] = useState<number>(
    config?.lossCarryforwardAmount ?? 0,
  );
  const [openingVatCredit22, setOpeningVatCredit22] = useState<number>(
    config?.openingVatCredit22 ?? 0,
  );
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const isBasisModified = Boolean(config) && basis !== initialBasis;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedReason = reason.trim();
    if (isBasisModified && cleanedReason.length < 5) {
      showErrorToast('Khi đổi tiêu thức phân bổ 627 cần nhập lý do tối thiểu 5 ký tự để lưu Nhật ký Kiểm toán.');
      return;
    }
    setSaving(true);
    try {
      await upsertFiscalYearConfig(year, {
        overheadAllocationBasis: basis,
        priorYearRevenue: priorRevenue > 0 ? priorRevenue : null,
        citRatePercent: Number(citRate) || 20,
        lossCarryforwardAmount: lossCarryforward,
        openingVatCredit22,
        reason: cleanedReason || undefined,
      });
      setReason('');
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(`Đã lưu cấu hình năm tài chính ${year}`);
    } catch (err) {
      showErrorToast(err, 'Không thể lưu cấu hình năm tài chính');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Cấu hình Tiêu thức Phân bổ 627/154 &amp; Tham số TNDN Năm {year}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Tiêu thức phân bổ chi phí sản xuất chung được khóa cố định theo năm tài chính để đảm bảo nhất quán giá thành công trình.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={OVERHEAD_ALLOCATION_BASIS_MAP[initialBasis].variant} size="sm">
            {OVERHEAD_ALLOCATION_BASIS_MAP[initialBasis].shortLabel}
          </Badge>
          {config?.basisChangedMidYear && (
            <Badge variant="warning" size="sm">
              Đã đổi tiêu thức giữa năm
            </Badge>
          )}
        </div>
      </div>

      {config?.basisChangedMidYear && config.basisChangeDisclosure && (
        <Alert
          variant="warning"
          title="Thuyết minh thay đổi chính sách phân bổ giữa năm"
          icon={<AlertTriangle size={15} />}
        >
          {config.basisChangeDisclosure}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Tiêu thức phân bổ chi phí chung (TK 627 / 154) *"
          value={basis}
          onChange={(e) => setBasis(e.target.value as OverheadAllocationBasis)}
          options={OVERHEAD_ALLOCATION_BASIS_OPTIONS}
          disabled={saving}
          fullWidth
        />
        <Input
          label="Thuế suất TNDN áp dụng (%) — tham khảo năm"
          type="number"
          min={0}
          max={50}
          step={0.5}
          value={citRate}
          onChange={(e) => setCitRate(e.target.value)}
          disabled={saving}
          fullWidth
        />
        <CurrencyInput
          label="Tổng doanh thu năm liền kề trước (VNĐ)"
          value={priorRevenue}
          onChange={setPriorRevenue}
          disabled={saving}
          fullWidth
        />
        <CurrencyInput
          label="Số lỗ kết chuyển từ các năm trước (VNĐ)"
          value={lossCarryforward}
          onChange={setLossCarryforward}
          disabled={saving}
          fullWidth
        />
        <CurrencyInput
          label="Thuế GTGT còn được khấu trừ kỳ trước chuyển sang — Chỉ tiêu [22] (VNĐ)"
          value={openingVatCredit22}
          onChange={setOpeningVatCredit22}
          disabled={saving}
          fullWidth
        />
      </div>

      {priorRevenue > 0 && (
        <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
          Doanh thu năm trước: <strong>{formatCurrency(priorRevenue)}</strong> — theo Luật TNDN 67/2025/QH15: ≤ 3 tỷ (15%), &gt; 3–50 tỷ (17%), &gt; 50 tỷ (20%).
        </div>
      )}

      <Input
        label={
          isBasisModified
            ? 'Lý do thay đổi tiêu thức phân bổ (Bắt buộc ≥ 5 ký tự) *'
            : 'Ghi chú điều chỉnh cấu hình (Tùy chọn)'
        }
        value={reason}
        placeholder="VD: Thống nhất phân bổ theo chi phí NVL + Nhân công trực tiếp từ kỳ kế toán..."
        onChange={(e) => setReason(e.target.value)}
        disabled={saving}
        fullWidth
      />

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenBaselines}
          leftIcon={<FileSpreadsheet size={14} />}
        >
          Số liệu so sánh năm trước (B01 / B02 / B03)
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save size={14} />}>
          Lưu cấu hình Năm {year}
        </Button>
      </div>
    </form>
  );
}

export function FiscalYearConfigSection() {
  const currentYear = dayjs().year();
  const [year, setYear] = useState<number>(currentYear);
  const [baselinesModalOpen, setBaselinesModalOpen] = useState(false);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance', 'fiscal-year-configs', year],
    queryFn: () => getFiscalYearConfigs({ fiscalYear: year }),
  });

  const activeConfig = useMemo(
    () => (data?.items || []).find((c) => c.fiscalYear === year) || null,
    [data?.items, year],
  );

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
    value: String(y),
    label: `Năm tài chính ${y}`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="w-56">
          <Select
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            options={yearOptions}
            fullWidth
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
        >
          Làm mới
        </Button>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải cấu hình năm tài chính">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <FiscalYearEditorForm
          key={`${year}-${activeConfig?.updatedAt || 'new'}`}
          config={activeConfig}
          year={year}
          onOpenBaselines={() => setBaselinesModalOpen(true)}
        />
      )}

      <ComparativeBaselinesModal
        isOpen={baselinesModalOpen}
        fiscalYear={year}
        onClose={() => setBaselinesModalOpen(false)}
      />
    </div>
  );
}
