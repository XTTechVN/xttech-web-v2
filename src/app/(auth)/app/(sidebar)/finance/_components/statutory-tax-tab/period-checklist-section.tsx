'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Download,
  FileCheck2,
  FilePlus2,
  GitCompare,
  Lock,
} from 'lucide-react';
import { Alert, Badge, Button, Input } from '@/components';
import { STATUTORY_FILING_STATUS_MAP } from '@/config/finance';
import type {
  FinanceUserPermission,
  StatutoryFormCode,
  StatutoryPeriodChecklistItem,
} from '@/types';

export interface PeriodChecklistSectionProps {
  checklist: StatutoryPeriodChecklistItem[];
  myPerm: FinanceUserPermission | null;
  busyKey: string | null;
  onOpenDeclaration: (formCode: StatutoryFormCode) => void;
  onCompute: (formCode: StatutoryFormCode) => Promise<void> | void;
  onReconcile: (filingId: number) => Promise<void> | void;
  onApprove: (filingId: number) => Promise<void> | void;
  onExport: (item: StatutoryPeriodChecklistItem) => Promise<void> | void;
  onMarkFiled: (filingId: number, taxFilingRef: string) => Promise<void> | void;
  onCreateSupplemental: (formCode: StatutoryFormCode) => Promise<void> | void;
}

export function PeriodChecklistSection({
  checklist,
  myPerm,
  busyKey,
  onOpenDeclaration,
  onCompute,
  onReconcile,
  onApprove,
  onExport,
  onMarkFiled,
  onCreateSupplemental,
}: PeriodChecklistSectionProps) {
  const [markingFilingId, setMarkingFilingId] = useState<number | null>(null);
  const [taxFilingRef, setTaxFilingRef] = useState('');

  const staleItems = checklist.filter((i) => i.isStale);

  return (
    <div className="space-y-4 text-xs">
      {staleItems.length > 0 && (
        <Alert
          variant="warning"
          title={`Có ${staleItems.length} hồ sơ bị lỗi thời do Sổ cái / Hóa đơn thay đổi`}
          icon={<AlertTriangle size={15} />}
        >
          {staleItems
            .map((i) => `${i.formCode}: ${i.staleReason || 'Dữ liệu nguồn thay đổi'}`)
            .join(' • ')}
        </Alert>
      )}

      {markingFilingId !== null && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <Input
              label="Mã giao dịch nộp thuế / Số tiếp nhận CQT (tùy chọn)"
              value={taxFilingRef}
              placeholder="VD: GD-1102026-00981"
              onChange={(e) => setTaxFilingRef(e.target.value)}
              fullWidth
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMarkingFilingId(null);
                setTaxFilingRef('');
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={busyKey === `mark-${markingFilingId}`}
              onClick={async () => {
                await onMarkFiled(markingFilingId, taxFilingRef.trim());
                setMarkingFilingId(null);
                setTaxFilingRef('');
              }}
              leftIcon={<Lock size={14} />}
            >
              Xác nhận Đã nộp &amp; Khóa kỳ
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mẫu biểu</th>
                <th className="p-3">Thông tư / HTKK</th>
                <th className="p-3">Hạn nộp</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-center">Đối chiếu</th>
                <th className="p-3 text-right">Thao tác quy trình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checklist.map((item) => {
                const statusMeta =
                  STATUTORY_FILING_STATUS_MAP[item.status] ??
                  STATUTORY_FILING_STATUS_MAP.not_started;
                const canApprove =
                  Boolean(myPerm?.canApproveTaxFiling) &&
                  Boolean(item.filingId) &&
                  item.status === 'reconciled' &&
                  item.reconciledOk &&
                  !item.isStale;
                const canExport =
                  Boolean(myPerm?.canExportStatutory) &&
                  Boolean(item.filingId) &&
                  item.excelExportEnabled &&
                  (item.status === 'approved' || item.status === 'exported') &&
                  !item.isStale;
                const canMark =
                  Boolean(myPerm?.canMarkTaxFiled) &&
                  Boolean(item.filingId) &&
                  (item.status === 'exported' || item.status === 'approved') &&
                  !item.isStale;

                return (
                  <tr key={item.formCode} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.formCode}</div>
                      <div className="text-[11px] text-slate-500">{item.formName}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-semibold text-primary">
                        {item.circularCode}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        HTKK {item.targetHtkkVersion}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{item.deadlineDate}</td>
                    <td className="p-3 text-center">
                      <Badge variant={statusMeta.variant} size="sm">
                        {statusMeta.shortLabel || statusMeta.label}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      {item.status === 'not_started' ? (
                        <span className="text-slate-400">---</span>
                      ) : item.reconciledOk ? (
                        <Badge variant="success" size="sm">
                          Khớp
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          Cần KT
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          loading={busyKey === `compute-${item.formCode}`}
                          onClick={() => onCompute(item.formCode)}
                          leftIcon={<Calculator size={12} />}
                        >
                          {item.filingId ? 'Tính lại' : 'Lập hồ sơ'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => onOpenDeclaration(item.formCode)}
                        >
                          Chi tiết
                        </Button>
                        {item.filingId && item.status !== 'filed' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            loading={busyKey === `reconcile-${item.filingId}`}
                            onClick={() => onReconcile(item.filingId as number)}
                            leftIcon={<GitCompare size={12} />}
                          >
                            Đối chiếu
                          </Button>
                        )}
                        {canApprove && (
                          <Button
                            type="button"
                            variant="primary"
                            size="xs"
                            loading={busyKey === `approve-${item.filingId}`}
                            onClick={() => onApprove(item.filingId as number)}
                            leftIcon={<CheckCircle2 size={12} />}
                          >
                            Duyệt
                          </Button>
                        )}
                        {canExport && (
                          <Button
                            type="button"
                            variant="primary"
                            size="xs"
                            loading={busyKey === `export-${item.filingId}`}
                            onClick={() => onExport(item)}
                            leftIcon={<Download size={12} />}
                          >
                            Xuất Excel
                          </Button>
                        )}
                        {canMark && (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setMarkingFilingId(item.filingId as number)}
                            leftIcon={<FileCheck2 size={12} />}
                          >
                            Đã nộp
                          </Button>
                        )}
                        {item.status === 'filed' &&
                          (item.formCode === '01_GTGT' ||
                            item.formCode === '05_KK_TNCN' ||
                            item.formCode === '03_TNDN') && (
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              loading={busyKey === `supp-${item.formCode}`}
                              onClick={() => onCreateSupplemental(item.formCode)}
                              leftIcon={<FilePlus2 size={12} />}
                            >
                              Lập BS (01/KHBS)
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
