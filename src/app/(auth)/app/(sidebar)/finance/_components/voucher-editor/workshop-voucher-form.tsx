'use client';

import React, { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import {
  Alert,
  Badge,
  Checkbox,
  CurrencyInput,
  Input,
  Select,
  Textarea,
} from '@/components';
import { readVietnameseNumber } from '@/utils/currency';
import type {
  AutoPostingTemplate,
  PartnerType,
  VoucherAttachment,
  VoucherType,
} from '@/types';
import {
  DEFAULT_NON_CASH_VAT_THRESHOLD,
  WORKSHOP_VOUCHER_TYPES,
  type VoucherMasterLookups,
} from './voucher-editor.constants';
import { InvoiceDeductibilityBanner } from './invoice-deductibility-banner';
import { VoucherAttachmentsTab } from './voucher-attachments-tab';
import { VoucherPartnerFields } from './voucher-partner-fields';

export interface WorkshopFormState {
  voucherType: VoucherType;
  voucherDate: string;
  templateId: number | null;
  projectId: number | null;
  partnerType: PartnerType;
  customerId: number | null;
  supplierId: number | null;
  employeeId: string | null;
  contactName: string;
  amount: number;
  hasValidInvoice: boolean;
  description: string;
}

export interface WorkshopVoucherFormProps {
  state: WorkshopFormState;
  lookups: VoucherMasterLookups;
  existingAttachments: VoucherAttachment[];
  pendingFiles: File[];
  onChange: (patch: Partial<WorkshopFormState>) => void;
  onSelectTemplate: (template: AutoPostingTemplate | null) => void;
  onAddFiles: (files: File[]) => void;
  onRemovePendingFile: (index: number) => void;
  onRemoveExistingAttachment: (index: number) => void;
  disabled?: boolean;
}

export function WorkshopVoucherForm({
  state,
  lookups,
  existingAttachments,
  pendingFiles,
  onChange,
  onSelectTemplate,
  onAddFiles,
  onRemovePendingFile,
  onRemoveExistingAttachment,
  disabled = false,
}: WorkshopVoucherFormProps) {
  const workshopTemplates = useMemo(
    () =>
      lookups.templates
        .filter((t) => t.isActive && t.workshopVisible)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [lookups.templates],
  );

  const selectedTemplate = useMemo(
    () => workshopTemplates.find((t) => t.id === state.templateId) || null,
    [workshopTemplates, state.templateId],
  );

  const nonCashThreshold =
    lookups.setting?.nonCashVatThreshold ?? DEFAULT_NON_CASH_VAT_THRESHOLD;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Wallet size={15} />
          <span>Quỹ Tiền mặt duy nhất: TK {lookups.setting?.defaultCashAccountCode || '1111'}</span>
        </div>
        <Badge variant="primary" size="sm">
          1 Sổ Tài chính hợp nhất
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Loại phiếu tiền mặt *"
          fullWidth
          disabled={disabled}
          value={state.voucherType}
          options={WORKSHOP_VOUCHER_TYPES}
          onChange={(e) => onChange({ voucherType: e.target.value as VoucherType })}
        />
        <Input
          label="Ngày chi / thu *"
          type="date"
          fullWidth
          disabled={disabled}
          value={state.voucherDate}
          onChange={(e) => onChange({ voucherDate: e.target.value })}
        />
        <Select
          label="Lý do Thu / Chi thường gặp *"
          fullWidth
          searchable
          disabled={disabled}
          placeholder="Chọn lý do nhanh..."
          value={state.templateId ?? ''}
          options={workshopTemplates.map((t) => ({ value: t.id, label: t.name }))}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            onSelectTemplate(workshopTemplates.find((t) => t.id === id) || null);
          }}
        />
      </div>

      {selectedTemplate?.requiresProject && !state.projectId && (
        <Alert variant="warning" title="Lý do này yêu cầu gắn Công trình">
          Vui lòng chọn Công trình / Dự án để tổng hợp chi phí giá thành chính xác.
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label={
            selectedTemplate?.requiresProject
              ? 'Công trình / Dự án *'
              : 'Công trình / Dự án (Không bắt buộc)'
          }
          fullWidth
          searchable
          disabled={disabled}
          placeholder="Chọn công trình..."
          value={state.projectId ?? ''}
          options={[
            { value: '', label: '-- Không gắn công trình --' },
            ...lookups.projects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
          ]}
          onChange={(e) =>
            onChange({ projectId: e.target.value ? Number(e.target.value) : null })
          }
        />

        <CurrencyInput
          label="Số tiền (VNĐ) *"
          fullWidth
          disabled={disabled}
          value={state.amount || ''}
          placeholder="Nhập số tiền..."
          onChange={(val) => onChange({ amount: val })}
        />
      </div>

      {state.amount > 0 && (
        <div className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
          Bằng chữ:{' '}
          <span className="font-semibold italic text-slate-800">
            {readVietnameseNumber(Math.round(state.amount))}
          </span>
        </div>
      )}

      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
        <Checkbox
          label="Có Hóa đơn GTGT hợp lệ (Đủ điều kiện hạch toán thuế)"
          checked={state.hasValidInvoice}
          disabled={disabled}
          onChange={(e) => onChange({ hasValidInvoice: e.target.checked })}
        />
        <InvoiceDeductibilityBanner
          voucherType={state.voucherType}
          hasValidInvoice={state.hasValidInvoice}
          totalAmount={state.amount}
          nonCashVatThreshold={nonCashThreshold}
          nonInvoiceMediumThreshold={lookups.setting?.nonInvoiceMediumThreshold ?? 500_000}
          nonInvoiceLargeThreshold={lookups.setting?.nonInvoiceLargeThreshold ?? 2_000_000}
          hasProjectContext={Boolean(state.projectId)}
        />
      </div>

      <VoucherPartnerFields
        partnerType={state.partnerType}
        customerId={state.customerId}
        supplierId={state.supplierId}
        employeeId={state.employeeId}
        contactName={state.contactName}
        contactLabel={
          state.voucherType === 'cash_receipt'
            ? 'Họ tên người nộp tiền'
            : 'Họ tên người nhận tiền'
        }
        lookups={lookups}
        disabled={disabled}
        onChange={(patch) => onChange(patch)}
      />

      <Textarea
        label="Nội dung chi / thu *"
        rows={2}
        fullWidth
        disabled={disabled}
        value={state.description}
        placeholder="VD: Mua keo Apollo + vít bắn tôn công trình anh Hùng..."
        onChange={(e) => onChange({ description: e.target.value })}
      />

      <VoucherAttachmentsTab
        compact
        existingAttachments={existingAttachments}
        pendingFiles={pendingFiles}
        onAddFiles={onAddFiles}
        onRemovePendingFile={onRemovePendingFile}
        onRemoveExistingAttachment={onRemoveExistingAttachment}
        disabled={disabled}
      />
    </div>
  );
}
