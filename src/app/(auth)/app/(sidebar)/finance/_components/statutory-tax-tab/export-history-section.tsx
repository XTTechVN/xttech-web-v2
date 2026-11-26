'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, FileCode2, History, ShieldCheck } from 'lucide-react';
import { Alert, Badge, Button, ConfirmActionModal, Switch } from '@/components';
import { getStatutoryFormConfigs, updateStatutoryFormConfig } from '@/actions';
import { STATUTORY_FILING_STATUS_MAP } from '@/config/finance';
import type {
  FinanceUserPermission,
  StatutoryFiling,
  StatutoryFormConfig,
} from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';

const XmlPreviewModal = dynamic(
  () => import('./modals/xml-preview-modal').then((m) => m.XmlPreviewModal),
  { ssr: false },
);

export interface ExportHistorySectionProps {
  filings: StatutoryFiling[];
  myPerm: FinanceUserPermission | null;
  busyKey: string | null;
  onDownloadExcel: (filing: StatutoryFiling) => Promise<void> | void;
  onExportXml: (filing: StatutoryFiling) => Promise<void> | void;
}

function getXmlBlockReason(
  filing: StatutoryFiling,
  cfg: StatutoryFormConfig | undefined,
  myPerm: FinanceUserPermission | null,
): string | null {
  if (!myPerm?.canExportStatutory) return 'Bạn không có quyền xuất hồ sơ BCTC / XML.';
  if (!cfg?.xmlExportEnabled) return 'Chưa bật công tắc Xuất XML cho mẫu biểu này.';
  if (filing.status === 'stale') return 'Tờ khai đã lỗi thời (Stale), cần tính lại.';
  if (!['approved', 'exported', 'filed'].includes(filing.status)) {
    return 'Cần duyệt tờ khai trước khi xuất XML HTKK.';
  }
  if (
    filing.formCode === '05_KK_TNCN' &&
    filing.reconciliations.some((r) => r.gateCode === 'RC-06' && r.status !== 'passed')
  ) {
    return 'Chặn cứng: Cổng đối chiếu RC-06 (05/KK-TNCN ↔ TK 334/3335) chưa khớp.';
  }
  return null;
}

export function ExportHistorySection({
  filings,
  myPerm,
  busyKey,
  onDownloadExcel,
  onExportXml,
}: ExportHistorySectionProps) {
  const queryClient = useQueryClient();
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [confirmXmlCfg, setConfirmXmlCfg] = useState<StatutoryFormConfig | null>(null);
  const [previewFiling, setPreviewFiling] = useState<StatutoryFiling | null>(null);
  const canEditConfigs = Boolean(myPerm?.canManageSettings || myPerm?.canApproveTaxFiling);

  const { data: configs = [] } = useQuery({
    queryKey: ['finance', 'statutory', 'form-configs'],
    queryFn: getStatutoryFormConfigs,
  });

  const handleToggleConfig = async (
    cfg: StatutoryFormConfig,
    field: 'excelExportEnabled' | 'xmlExportEnabled',
  ) => {
    setUpdatingCode(`${cfg.formCode}-${cfg.circularCode}`);
    try {
      await updateStatutoryFormConfig(cfg.formCode, {
        circularCode: cfg.circularCode,
        [field]: !cfg[field],
      });
      await queryClient.invalidateQueries({ queryKey: ['finance', 'statutory'] });
      showSuccessToast(`Đã cập nhật cấu hình ${cfg.formCode} (${cfg.circularCode})`);
      setConfirmXmlCfg(null);
    } catch (err) {
      showErrorToast(err, 'Không thể cập nhật cấu hình mẫu biểu');
    } finally {
      setUpdatingCode(null);
    }
  };

  const previewConfig = previewFiling
    ? configs.find(
        (c) =>
          c.formCode === previewFiling.formCode &&
          c.circularCode === previewFiling.circularCode,
      )
    : undefined;
  const previewBlockReason = previewFiling
    ? getXmlBlockReason(previewFiling, previewConfig, myPerm)
    : null;

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <History size={16} className="text-primary" />
          <span>Lịch sử bản xuất, XML HTKK &amp; Mã kiểm toàn vẹn (SHA-256)</span>
        </div>
        {filings.length === 0 ? (
          <div className="p-6 text-center text-slate-400 border border-slate-100 rounded-lg">
            Chưa có tờ khai hoặc BCTC nào trong kỳ được tính toán.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Mẫu biểu &amp; Lần khai</th>
                  <th className="p-2.5">Thông tư / HTKK</th>
                  <th className="p-2.5">Trạng thái</th>
                  <th className="p-2.5">Snapshot SHA-256</th>
                  <th className="p-2.5 text-right">Kết xuất Excel / XML HTKK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filings.map((f) => {
                  const statusMeta =
                    STATUTORY_FILING_STATUS_MAP[f.status] ?? STATUTORY_FILING_STATUS_MAP.draft;
                  const cfg = configs.find(
                    (c) => c.formCode === f.formCode && c.circularCode === f.circularCode,
                  );
                  const xmlBlockReason = getXmlBlockReason(f, cfg, myPerm);
                  return (
                    <tr key={f.id}>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{f.formCode}</span>
                          <Badge
                            variant={f.declarationKind === 'supplemental' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {f.declarationKind === 'supplemental'
                              ? `Bổ sung lần ${f.supplementalSeq}`
                              : 'Lần đầu'}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2.5 font-mono">
                        {f.circularCode} (HTKK {f.targetHtkkVersion})
                      </td>
                      <td className="p-2.5">
                        <Badge variant={statusMeta.variant} size="sm">
                          {statusMeta.shortLabel || statusMeta.label}
                        </Badge>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">
                        {f.exportSha256 ? `${f.exportSha256.slice(0, 16)}...` : 'Chưa xuất'}
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            disabled={!myPerm?.canExportStatutory}
                            onClick={() => onDownloadExcel(f)}
                            leftIcon={<Download size={12} />}
                          >
                            Excel
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setPreviewFiling(f)}
                            leftIcon={<Eye size={12} />}
                          >
                            Xem trước XML
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="xs"
                            disabled={Boolean(xmlBlockReason)}
                            title={xmlBlockReason || 'Xuất file XML chuẩn HTKK'}
                            loading={busyKey === `xml-${f.id}`}
                            onClick={() => onExportXml(f)}
                            leftIcon={<FileCode2 size={12} />}
                          >
                            Xuất XML HTKK
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck size={16} className="text-primary" />
          <span>Ký duyệt mở khóa Kết xuất Excel &amp; XML HTKK (Kế toán trưởng)</span>
        </div>

        {!canEditConfigs && (
          <Alert variant="info" title="Chỉ Kế toán trưởng hoặc Quản trị tài chính có quyền mở khóa kết xuất">
            Việc bật Xuất XML HTKK cần xác nhận sau khi đã kiểm thử đọc vào phần mềm HTKK.
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {configs.map((cfg) => (
            <div
              key={cfg.id}
              className="rounded-lg border border-slate-200 p-3 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-slate-900">{cfg.formCode} — {cfg.circularCode}</div>
                <div className="text-[11px] text-slate-500">
                  Hiệu lực từ {cfg.effectiveFrom} • HTKK {cfg.targetHtkkVersion}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  label="Excel"
                  checked={cfg.excelExportEnabled}
                  disabled={!canEditConfigs || updatingCode === `${cfg.formCode}-${cfg.circularCode}`}
                  onChange={() => handleToggleConfig(cfg, 'excelExportEnabled')}
                />
                <Switch
                  label="XML HTKK"
                  checked={cfg.xmlExportEnabled}
                  disabled={!canEditConfigs || updatingCode === `${cfg.formCode}-${cfg.circularCode}`}
                  onChange={() => {
                    if (!cfg.xmlExportEnabled) {
                      setConfirmXmlCfg(cfg);
                    } else {
                      void handleToggleConfig(cfg, 'xmlExportEnabled');
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmActionModal
        isOpen={Boolean(confirmXmlCfg)}
        onClose={() => setConfirmXmlCfg(null)}
        variant="primary"
        confirmText="Xác nhận bật Xuất XML HTKK"
        title={`Mở khóa Xuất XML HTKK cho ${confirmXmlCfg?.formCode || ''}`}
        description="Lưu ý: Hãy đảm bảo đã kiểm thử nạp thử nghiệm file XML mẫu trên phần mềm HTKK (5.8.4) khớp toàn bộ thẻ chỉ tiêu trước khi kích hoạt xuất chính thức."
        loading={Boolean(updatingCode)}
        onConfirm={() => {
          if (confirmXmlCfg) void handleToggleConfig(confirmXmlCfg, 'xmlExportEnabled');
        }}
      />

      <XmlPreviewModal
        isOpen={Boolean(previewFiling)}
        filingId={previewFiling?.id ?? null}
        canDownloadXml={previewBlockReason === null}
        downloadBlockedReason={previewBlockReason}
        onClose={() => setPreviewFiling(null)}
      />
    </div>
  );
}
