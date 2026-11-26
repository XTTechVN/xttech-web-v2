'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Download,
  GitCompare,
  Wand2,
} from 'lucide-react';
import { Alert, Badge, Button, Select, Switch } from '@/components';
import { STATUTORY_FILING_STATUS_MAP } from '@/config/finance';
import type {
  FinanceUserPermission,
  StatutoryFiling,
  StatutoryFormCode,
  StatutoryFormConfig,
  StatutoryIndicatorItem,
} from '@/types';
import { BctcStatementTable } from './bctc-statement-table';
import { BCTC_FORM_OPTIONS } from './statutory-tax-tab.constants';

const IndicatorDrilldownDrawer = dynamic(
  () => import('./indicator-drilldown-drawer').then((m) => m.IndicatorDrilldownDrawer),
  { ssr: false },
);

export interface BctcStatementsSectionProps {
  formCode: StatutoryFormCode;
  filing: StatutoryFiling | null;
  formConfig: StatutoryFormConfig | null;
  myPerm: FinanceUserPermission | null;
  busyKey: string | null;
  onChangeFormCode: (code: StatutoryFormCode) => void;
  onCompute: () => Promise<void> | void;
  onReconcile: (filingId: number) => Promise<void> | void;
  onApprove: (filingId: number) => Promise<void> | void;
  onExport: (filing: StatutoryFiling) => Promise<void> | void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onBackfillCashflow?: () => Promise<void> | void;
}

export function BctcStatementsSection({
  formCode,
  filing,
  formConfig,
  myPerm,
  busyKey,
  onChangeFormCode,
  onCompute,
  onReconcile,
  onApprove,
  onExport,
  onOpenVoucherDetail,
  onBackfillCashflow,
}: BctcStatementsSectionProps) {
  const [hideZeroRows, setHideZeroRows] = useState(true);
  const [drilldown, setDrilldown] = useState<StatutoryIndicatorItem | null>(null);

  const statusMeta = filing
    ? STATUTORY_FILING_STATUS_MAP[filing.status] ?? STATUTORY_FILING_STATUS_MAP.draft
    : STATUTORY_FILING_STATUS_MAP.not_started;

  const isLockedFiled = filing?.status === 'filed';
  const allRcPassed =
    Boolean(filing?.reconciliations?.length) &&
    Boolean(filing?.reconciliations.every((r) => r.status === 'passed'));
  const canApprove =
    Boolean(myPerm?.canApproveTaxFiling) &&
    Boolean(filing?.id) &&
    filing?.status === 'reconciled' &&
    allRcPassed;
  const canExport =
    Boolean(myPerm?.canExportStatutory) &&
    Boolean(filing?.id) &&
    Boolean(formConfig?.excelExportEnabled) &&
    (filing?.status === 'approved' || filing?.status === 'exported');

  const supportsHideZero =
    formCode === 'B01_DN' || formCode === 'B02_DN' || formCode === 'B03_DN';

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-80">
            <Select
              label="Chọn mẫu Báo cáo tài chính"
              value={formCode}
              options={BCTC_FORM_OPTIONS}
              onChange={(e) => onChangeFormCode(e.target.value as StatutoryFormCode)}
              fullWidth
            />
          </div>
          {supportsHideZero && (
            <div className="pb-1.5">
              <Switch
                label="Ẩn chỉ tiêu = 0 theo TT99"
                checked={hideZeroRows}
                onChange={(e) => setHideZeroRows(e.target.checked)}
              />
            </div>
          )}
          {filing && (
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              <Badge variant={statusMeta.variant} size="md">
                {statusMeta.label}
              </Badge>
              <Badge variant="primary" size="sm">
                {filing.circularCode}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {formCode === 'B03_DN' && !isLockedFiled && onBackfillCashflow && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={busyKey === 'backfill-cashflow'}
              onClick={onBackfillCashflow}
              leftIcon={<Wand2 size={14} />}
            >
              Tự gắn mã dòng tiền
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isLockedFiled}
            loading={busyKey === `compute-${formCode}`}
            onClick={onCompute}
            leftIcon={<Calculator size={14} />}
          >
            Tính toán BCTC
          </Button>
          {filing && !isLockedFiled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={busyKey === `reconcile-${filing.id}`}
              onClick={() => onReconcile(filing.id)}
              leftIcon={<GitCompare size={14} />}
            >
              Đối chiếu chéo
            </Button>
          )}
          {canApprove && filing && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={busyKey === `approve-${filing.id}`}
              onClick={() => onApprove(filing.id)}
              leftIcon={<CheckCircle2 size={14} />}
            >
              Duyệt BCTC
            </Button>
          )}
          {canExport && filing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={busyKey === `export-${filing.id}`}
              onClick={() => onExport(filing)}
              leftIcon={<Download size={14} />}
            >
              Xuất Excel TT99
            </Button>
          )}
        </div>
      </div>

      {filing?.status === 'stale' && (
        <Alert
          variant="warning"
          title="Báo cáo tài chính đã cũ do Sổ cái thay đổi"
          icon={<AlertTriangle size={15} />}
        >
          {filing.staleReason || 'Vui lòng bấm "Tính toán BCTC" để tổng hợp lại số liệu mới nhất.'}
        </Alert>
      )}

      {!formConfig?.excelExportEnabled && filing?.status === 'approved' && (
        <Alert variant="info" title="Chưa mở khóa xuất Excel cho mẫu này">
          Kế toán trưởng cần xác nhận bật công tắc xuất Excel tại tab &quot;Lịch sử bản xuất&quot; trước khi kết xuất hồ sơ BCTC chính thức.
        </Alert>
      )}

      {!filing ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          Chưa có dữ liệu {formCode} cho kỳ này. Bấm <strong>&quot;Tính toán BCTC&quot;</strong> để tổng hợp từ Sổ cái hợp nhất.
        </div>
      ) : (
        <BctcStatementTable
          formCode={formCode}
          indicators={filing.indicators}
          hideZeroRows={hideZeroRows}
          onDrilldown={setDrilldown}
        />
      )}

      <IndicatorDrilldownDrawer
        isOpen={Boolean(drilldown)}
        filingId={filing?.id ?? null}
        indicatorCode={drilldown?.code ?? null}
        indicatorLabel={drilldown?.label}
        onClose={() => setDrilldown(null)}
        onOpenVoucherDetail={onOpenVoucherDetail}
      />
    </div>
  );
}
