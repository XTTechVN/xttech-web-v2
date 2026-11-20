'use client';

import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BookCheck, Save } from 'lucide-react';
import { Alert, Button } from '@/components';
import {
  createVoucher,
  postVoucher,
  updateVoucher,
  uploadVoucherAttachments,
} from '@/actions/finance';
import { getLocalDateString } from '@/hooks/use-local-today';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type {
  AutoPostingTemplate,
  ParsedEinvoiceXml,
  TaxInvoice,
  VoucherAttachment,
  VoucherDetail,
  VoucherType,
} from '@/types';
import {
  AccountantVoucherForm,
  buildLineFromAutoTemplate,
  buildVatDraftLineFromInvoice,
  buildVoucherSubmitPayload,
  computeDraftTotals,
  convertAccountantToWorkshopState,
  convertWorkshopToAccountantDraft,
  createEmptyDraftLine,
  createInitialAccountantHeader,
  createInitialWorkshopState,
  DEFAULT_NON_CASH_VAT_THRESHOLD,
  mapVoucherLinesToDraft,
  resolveTemplateDescription,
  useVoucherLookups,
  VoucherModeSwitcher,
  WorkshopVoucherForm,
  type AccountantHeaderState,
  type VoucherDraftLine,
  type VoucherEditorMode,
  type WorkshopFormState,
} from '../voucher-editor';
import { TaxInvoiceFormModal } from './tax-invoice-form-modal';

export interface VoucherFormBodyProps {
  initialData: VoucherDetail | null;
  defaultMode: VoucherEditorMode;
  defaultVoucherType: VoucherType;
  defaultBankAccountId: number | null;
  defaultHasValidInvoice: boolean;
  onClose: () => void;
  onSuccess?: (voucher: VoucherDetail) => void;
}

export function VoucherFormBody({
  initialData,
  defaultMode,
  defaultVoucherType,
  defaultBankAccountId,
  defaultHasValidInvoice,
  onClose,
  onSuccess,
}: VoucherFormBodyProps) {
  const queryClient = useQueryClient();
  const { lookups, availableInvoices, myPermissions } = useVoucherLookups(true);
  const today = getLocalDateString();

  const [mode, setMode] = useState<VoucherEditorMode>(defaultMode);
  const [savedVoucher, setSavedVoucher] = useState<VoucherDetail | null>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceModalState, setInvoiceModalState] = useState<{
    open: boolean;
    prefill: ParsedEinvoiceXml | null;
  }>({ open: false, prefill: null });

  const [workshopState, setWorkshopState] = useState<WorkshopFormState>(() =>
    createInitialWorkshopState({
      initialData,
      defaultVoucherType,
      defaultHasValidInvoice,
      today,
    }),
  );
  const [header, setHeader] = useState<AccountantHeaderState>(() =>
    createInitialAccountantHeader({
      initialData,
      defaultVoucherType,
      defaultBankAccountId,
      defaultHasValidInvoice,
      today,
    }),
  );
  const [lines, setLines] = useState<VoucherDraftLine[]>(() =>
    initialData?.lines?.length ? mapVoucherLinesToDraft(initialData.lines) : [createEmptyDraftLine()],
  );
  const [linkedInvoices, setLinkedInvoices] = useState<TaxInvoice[]>(() => initialData?.taxInvoices || []);
  const [existingAttachments, setExistingAttachments] = useState<VoucherAttachment[]>(() => initialData?.attachments || []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const totals = useMemo(() => computeDraftTotals(lines), [lines]);
  const voucherStatus = savedVoucher?.status || 'draft';
  const isFormDisabled =
    submitting || voucherStatus === 'posted' || voucherStatus === 'voided';
  const enforceMakerChecker = lookups.setting?.enforceMakerChecker ?? true;
  const canPostDirectly = !enforceMakerChecker && (myPermissions?.canPostVoucher ?? false);

  const handleModeSwitch = (nextMode: VoucherEditorMode) => {
    if (nextMode === mode) return;
    if (nextMode === 'accountant') {
      const converted = convertWorkshopToAccountantDraft({ workshopState, header, lookups });
      if (converted.nextLines) setLines(converted.nextLines);
      setHeader(converted.nextHeader);
    } else {
      setWorkshopState((prev) => convertAccountantToWorkshopState(prev, header, totals.grandTotal));
    }
    setMode(nextMode);
  };

  const handleWorkshopTemplate = (tpl: AutoPostingTemplate | null) => {
    setWorkshopState((prev) => ({
      ...prev,
      templateId: tpl?.id ?? null,
      voucherType:
        tpl?.voucherType === 'cash_receipt' || tpl?.voucherType === 'cash_payment'
          ? tpl.voucherType
          : prev.voucherType,
      hasValidInvoice: tpl ? tpl.defaultHasValidInvoice : prev.hasValidInvoice,
      description: resolveTemplateDescription(prev.description, prev.templateId, tpl, lookups.templates),
    }));
  };

  const handleAccountantTemplate = (tpl: AutoPostingTemplate) => {
    const nextDesc = resolveTemplateDescription(header.description, header.autoPostingTemplateId, tpl, lookups.templates);
    const nextHeader: AccountantHeaderState = { ...header, autoPostingTemplateId: tpl.id, hasValidInvoice: tpl.defaultHasValidInvoice, description: nextDesc };
    setHeader(nextHeader);
    setLines([
      buildLineFromAutoTemplate(
        tpl,
        nextHeader,
        lookups.accounts,
        lines[0]?.amount || 0,
        lookups.setting?.nonCashVatThreshold ?? DEFAULT_NON_CASH_VAT_THRESHOLD,
      ),
    ]);
  };

  const handleGenerateVatLine = (inv: TaxInvoice) => {
    if (inv.vatAmount <= 0) {
      showErrorToast('Hóa đơn không có tiền thuế GTGT.');
      return;
    }
    setLines((prev) => [...prev, buildVatDraftLineFromInvoice(inv, lookups.accounts, prev[0])]);
    showSuccessToast('Đã thêm dòng thuế GTGT vào tab Hạch toán!');
  };

  const handleSave = async (afterAction: 'draft' | 'post') => {
    const { payload, error } = buildVoucherSubmitPayload({
      mode,
      workshopState,
      header,
      lines,
      lookups,
      existingAttachments,
      linkedInvoices,
    });
    if (error || !payload) {
      showErrorToast(error || 'Dữ liệu chứng từ chưa hợp lệ');
      return;
    }
    setSubmitting(true);
    try {
      let saved = savedVoucher
        ? await updateVoucher(savedVoucher.id, payload)
        : await createVoucher(payload);
      setSavedVoucher(saved);
      if (pendingFiles.length > 0) {
        saved = await uploadVoucherAttachments(saved.id, pendingFiles);
        setSavedVoucher(saved);
        setExistingAttachments(saved.attachments || []);
        setPendingFiles([]);
      }
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      if (afterAction === 'post') {
        saved = await postVoucher(saved.id);
        setSavedVoucher(saved);
        await queryClient.invalidateQueries({ queryKey: ['finance'] });
      }
      showSuccessToast(
        afterAction === 'post'
          ? `Đã lưu và ghi sổ chứng từ ${saved.voucherNo}!`
          : `Đã lưu nháp chứng từ ${saved.voucherNo}!`,
      );
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Không thể lưu chứng từ');
    } finally {
      setSubmitting(false);
    }
  };

  const addFiles = (f: File[]) => setPendingFiles((prev) => [...prev, ...f]);
  const removePending = (idx: number) => setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeExisting = (idx: number) => setExistingAttachments((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <VoucherModeSwitcher mode={mode} onChange={handleModeSwitch} disabled={isFormDisabled} />

      {(voucherStatus === 'posted' || voucherStatus === 'voided') && (
        <Alert variant="warning" title="Chứng từ đã khóa chỉnh sửa">
          Chứng từ đang ở trạng thái <strong>{voucherStatus === 'posted' ? 'Đã ghi sổ' : 'Đã hủy'}</strong>. Vui lòng bỏ ghi sổ ở màn hình chi tiết trước khi sửa.
        </Alert>
      )}

      {mode === 'workshop' ? (
        <WorkshopVoucherForm
          state={workshopState}
          lookups={lookups}
          existingAttachments={existingAttachments}
          pendingFiles={pendingFiles}
          onChange={(p) => setWorkshopState((prev) => ({ ...prev, ...p }))}
          onSelectTemplate={handleWorkshopTemplate}
          onAddFiles={addFiles}
          onRemovePendingFile={removePending}
          onRemoveExistingAttachment={removeExisting}
          disabled={isFormDisabled}
        />
      ) : (
        <AccountantVoucherForm
          header={header}
          lines={lines}
          lookups={lookups}
          linkedInvoices={linkedInvoices}
          availableInvoices={availableInvoices}
          existingAttachments={existingAttachments}
          pendingFiles={pendingFiles}
          vatLineTotal={totals.vatTotal}
          grandTotal={totals.grandTotal}
          disabled={isFormDisabled}
          onChangeHeader={(p) => setHeader((prev) => ({ ...prev, ...p }))}
          onChangeLines={setLines}
          onApplyTemplate={handleAccountantTemplate}
          onLinkInvoice={(inv) => setLinkedInvoices((prev) => [...prev, inv])}
          onUnlinkInvoice={(id) => setLinkedInvoices((prev) => prev.filter((i) => i.id !== id))}
          onGenerateVatLineFromInvoice={handleGenerateVatLine}
          onOpenCreateInvoice={(prefill) => setInvoiceModalState({ open: true, prefill: prefill ?? null })}
          onAddFiles={addFiles}
          onRemovePendingFile={removePending}
          onRemoveExistingAttachment={removeExisting}
        />
      )}

      {enforceMakerChecker && voucherStatus === 'draft' && (
        <div className="px-3 py-2 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-800">
          Chế độ tách quyền <strong>Người lập ≠ Người ghi sổ</strong> đang bật: bạn cần <strong>Lưu nháp</strong> để kế toán khác kiểm tra và thực hiện Ghi sổ cái.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button type="button" variant="outline" size="sm" loading={submitting} disabled={isFormDisabled} leftIcon={<Save size={14} />} onClick={() => handleSave('draft')}>
          Lưu nháp
        </Button>
        <span
          title={
            enforceMakerChecker
              ? 'Chế độ Người lập ≠ Người ghi sổ đang bật: vui lòng Lưu nháp'
              : !myPermissions?.canPostVoucher
                ? 'Bạn không có quyền Ghi sổ cái'
                : undefined
          }
        >
          <Button type="button" variant="primary" size="sm" loading={submitting} disabled={isFormDisabled || !canPostDirectly} leftIcon={<BookCheck size={14} />} onClick={() => handleSave('post')}>
            Lưu &amp; Ghi sổ
          </Button>
        </span>
      </div>

      <TaxInvoiceFormModal
        isOpen={invoiceModalState.open}
        onClose={() => setInvoiceModalState({ open: false, prefill: null })}
        prefillXml={invoiceModalState.prefill}
        defaultDirection={header.voucherType === 'cash_receipt' || header.voucherType === 'bank_receipt' ? 'output' : 'input'}
        onSuccess={(created) => {
          setLinkedInvoices((prev) => [...prev, created]);
          if (created.vatAmount > 0) handleGenerateVatLine(created);
        }}
      />
    </div>
  );
}
