'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Download,
  FilePlus2,
  GitCompare,
} from 'lucide-react';
import { Alert, Badge, Button, Select } from '@/components';
import { STATUTORY_FILING_STATUS_MAP } from '@/config/finance';
import type {
  FinanceUserPermission,
  StatutoryFiling,
  StatutoryFormCode,
  StatutoryFormConfig,
  StatutoryIndicatorItem,
} from '@/types';
import { DECLARATION_FORM_OPTIONS } from './statutory-tax-tab.constants';
import { TaxDeclarationTable } from './tax-declaration-table';

const IndicatorDrilldownDrawer = dynamic(
  () => import('./indicator-drilldown-drawer').then((m) => m.IndicatorDrilldownDrawer),
  { ssr: false },
);

const SupplementalDiffModal = dynamic(
  () => import('./modals/supplemental-diff-modal').then((m) => m.SupplementalDiffModal),
  { ssr: false },
);

export interface TaxDeclarationEditorProps {
  formCode: StatutoryFormCode;
  filing: StatutoryFiling | null;
  formConfig: StatutoryFormConfig | null;
  myPerm: FinanceUserPermission | null;
  busyKey: string | null;
  onChangeFormCode: (code: StatutoryFormCode) => void;
  onCompute: (manualOverrides: Record<string, number>) => Promise<void> | void;
  onReconcile: (filingId: number) => Promise<void> | void;
  onApprove: (filingId: number) => Promise<void> | void;
  onExport: (filing: StatutoryFiling) => Promise<void> | void;
  onCreateSupplemental: (formCode: StatutoryFormCode) => Promise<void> | void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function TaxDeclarationEditor({
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
  onCreateSupplemental,
  onOpenVoucherDetail,
}: TaxDeclarationEditorProps) {
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>(
    filing?.manualOverrides || {},
  );
  const [drilldown, setDrilldown] = useState<StatutoryIndicatorItem | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);

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

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-80">
            <Select
              label="Chọn mẫu tờ khai thuế"
              value={formCode}
              options={DECLARATION_FORM_OPTIONS}
              onChange={(e) => onChangeFormCode(e.target.value as StatutoryFormCode)}
              fullWidth
            />
          </div>
          {filing && (
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              <Badge variant={statusMeta.variant} size="md">{statusMeta.label}</Badge>
              {filing.declarationKind === 'supplemental' && (
                <Badge variant="warning" size="sm">Bổ sung lần {filing.supplementalSeq}</Badge>
              )}
              <Badge variant="primary" size="sm">{filing.circularCode}</Badge>
              <Badge variant="default" size="sm">HTKK {filing.targetHtkkVersion}</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isLockedFiled}
            loading={busyKey === `compute-${formCode}`}
            onClick={() => onCompute(manualOverrides)}
            leftIcon={<Calculator size={14} />}
          >
            Tính toán &amp; Lưu nháp
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
              Duyệt tờ khai
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
              Xuất Excel
            </Button>
          )}
          {filing?.declarationKind === 'supplemental' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDiffOpen(true)}
              leftIcon={<GitCompare size={14} />}
            >
              Xem bảng chênh lệch 01/KHBS
            </Button>
          )}
          {isLockedFiled && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={busyKey === `supp-${formCode}`}
              onClick={() => onCreateSupplemental(formCode)}
              leftIcon={<FilePlus2 size={14} />}
            >
              Lập tờ khai bổ sung (01/KHBS)
            </Button>
          )}
        </div>
      </div>

      {filing?.status === 'stale' && (
        <Alert variant="warning" title="Tờ khai đã cũ do dữ liệu nguồn thay đổi" icon={<AlertTriangle size={15} />}>
          {filing.staleReason || 'Vui lòng bấm "Tính toán & Lưu nháp" để cập nhật lại số liệu mới nhất.'}
        </Alert>
      )}

      {filing?.hasDraftPitWarning && (
        <Alert variant="warning" title="Nháp — Cần đối chiếu bảng lương" icon={<AlertTriangle size={15} />}>
          Bảng kê khấu trừ thuế TNCN vẫn còn dòng trạng thái nháp. Hãy xác nhận tại tab Bảng kê TNCN trước khi duyệt 05/KK-TNCN.
        </Alert>
      )}

      {!filing ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          Chưa có tờ khai {formCode} cho kỳ này. Bấm <strong>&quot;Tính toán &amp; Lưu nháp&quot;</strong> để tổng hợp tự động.
        </div>
      ) : (
        <TaxDeclarationTable
          indicators={filing.indicators}
          manualOverrides={manualOverrides}
          isLockedFiled={isLockedFiled}
          onChangeOverride={(code, val) =>
            setManualOverrides((prev) => ({ ...prev, [code]: val }))
          }
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

      <SupplementalDiffModal
        isOpen={diffOpen}
        filingId={filing?.id ?? null}
        onClose={() => setDiffOpen(false)}
      />
    </div>
  );
}
