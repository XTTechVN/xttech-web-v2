'use client';

import React, { useMemo, useState } from 'react';
import { Tabs, type TabItem } from '@/components';
import type {
  AutoPostingTemplate,
  ParsedEinvoiceXml,
  PartnerType,
  TaxInvoice,
  VoucherAttachment,
  VoucherType,
} from '@/types';
import {
  DEFAULT_NON_CASH_VAT_THRESHOLD,
  VOUCHER_EDITOR_TABS,
  type VoucherDraftLine,
  type VoucherEditorTabKey,
  type VoucherMasterLookups,
} from './voucher-editor.constants';
import {
  analyzeVoucherDraftLines,
  recomputeAllLinesDeductibility,
  syncChangedLinesDeductibility,
} from './voucher-form-helpers';
import { AccountantVoucherHeader } from './accountant-voucher-header';
import { HasValidInvoiceSelector } from './tax-mode-selector';
import { AccountantLinesGrid } from './accountant-lines-grid';
import { AccountantInvoiceTab } from './accountant-invoice-tab';
import { VoucherAttachmentsTab } from './voucher-attachments-tab';

export interface AccountantHeaderState {
  voucherType: VoucherType;
  voucherDate: string;
  postingDate: string;
  hasValidInvoice: boolean;
  bankAccountId: number | null;
  autoPostingTemplateId: number | null;
  partnerType: PartnerType;
  customerId: number | null;
  supplierId: number | null;
  employeeId: string | null;
  contactName: string;
  contactAddress: string;
  projectId: number | null;
  departmentId: number | null;
  description: string;
}

export interface AccountantVoucherFormProps {
  header: AccountantHeaderState;
  lines: VoucherDraftLine[];
  lookups: VoucherMasterLookups;
  linkedInvoices: TaxInvoice[];
  availableInvoices: TaxInvoice[];
  existingAttachments: VoucherAttachment[];
  pendingFiles: File[];
  vatLineTotal: number;
  grandTotal: number;
  disabled?: boolean;
  onChangeHeader: (patch: Partial<AccountantHeaderState>) => void;
  onChangeLines: (nextLines: VoucherDraftLine[]) => void;
  onApplyTemplate: (template: AutoPostingTemplate) => void;
  onLinkInvoice: (invoice: TaxInvoice) => void;
  onUnlinkInvoice: (invoiceId: number) => void;
  onGenerateVatLineFromInvoice: (invoice: TaxInvoice) => void;
  onOpenCreateInvoice?: (prefill?: ParsedEinvoiceXml | null) => void;
  onAddFiles: (files: File[]) => void;
  onRemovePendingFile: (index: number) => void;
  onRemoveExistingAttachment: (index: number) => void;
}

export function AccountantVoucherForm({
  header,
  lines,
  lookups,
  linkedInvoices,
  availableInvoices,
  existingAttachments,
  pendingFiles,
  vatLineTotal,
  grandTotal,
  disabled = false,
  onChangeHeader,
  onChangeLines,
  onApplyTemplate,
  onLinkInvoice,
  onUnlinkInvoice,
  onGenerateVatLineFromInvoice,
  onOpenCreateInvoice,
  onAddFiles,
  onRemovePendingFile,
  onRemoveExistingAttachment,
}: AccountantVoucherFormProps) {
  const [activeTab, setActiveTab] = useState<VoucherEditorTabKey>('lines');

  const nonCashThreshold =
    lookups.setting?.nonCashVatThreshold ?? DEFAULT_NON_CASH_VAT_THRESHOLD;

  const lineFlags = useMemo(
    () => analyzeVoucherDraftLines(lines, lookups.accounts, header.voucherType),
    [lines, lookups.accounts, header.voucherType],
  );

  const hasProjectContext = useMemo(
    () => Boolean(header.projectId) || lines.some((l) => Boolean(l.projectId)),
    [header.projectId, lines],
  );

  const has811WithProject = useMemo(() => {
    const accMap = new Map(lookups.accounts.map((a) => [a.id, a.accountCode]));
    return lines.some((l) => {
      const dCode = accMap.get(l.debitAccountId) || '';
      return dCode.startsWith('811') && Boolean(l.projectId ?? header.projectId);
    });
  }, [lines, lookups.accounts, header.projectId]);

  const handleHeaderPatch = (patch: Partial<AccountantHeaderState>) => {
    onChangeHeader(patch);
    if (patch.hasValidInvoice !== undefined || patch.voucherType !== undefined) {
      onChangeLines(
        recomputeAllLinesDeductibility({
          lines,
          accounts: lookups.accounts,
          voucherType: patch.voucherType ?? header.voucherType,
          hasValidInvoice: patch.hasValidInvoice ?? header.hasValidInvoice,
          grandTotal,
          nonCashVatThreshold: nonCashThreshold,
        }),
      );
    }
  };

  const handleLinesChange = (nextLines: VoucherDraftLine[]) => {
    onChangeLines(
      syncChangedLinesDeductibility({
        prevLines: lines,
        nextLines,
        accounts: lookups.accounts,
        voucherType: header.voucherType,
        hasValidInvoice: header.hasValidInvoice,
        grandTotal,
        nonCashVatThreshold: nonCashThreshold,
      }),
    );
  };

  const tabItems: TabItem[] = useMemo(
    () =>
      VOUCHER_EDITOR_TABS.map((t) => {
        const Icon = t.icon;
        const suffix =
          t.value === 'lines'
            ? ` (${lines.length})`
            : t.value === 'invoice'
              ? ` (${linkedInvoices.length})`
              : ` (${existingAttachments.length + pendingFiles.length})`;
        return { value: t.value, label: `${t.label}${suffix}`, icon: <Icon size={14} /> };
      }),
    [lines.length, linkedInvoices.length, existingAttachments.length, pendingFiles.length],
  );

  return (
    <div className="space-y-4">
      <AccountantVoucherHeader
        header={header}
        lookups={lookups}
        disabled={disabled}
        onChangeHeader={handleHeaderPatch}
      />

      <HasValidInvoiceSelector
        hasValidInvoice={header.hasValidInvoice}
        onChange={(hasValidInvoice) => handleHeaderPatch({ hasValidInvoice })}
        voucherType={header.voucherType}
        totalAmount={grandTotal}
        nonCashVatThreshold={nonCashThreshold}
        nonInvoiceMediumThreshold={lookups.setting?.nonInvoiceMediumThreshold ?? 500_000}
        nonInvoiceLargeThreshold={lookups.setting?.nonInvoiceLargeThreshold ?? 2_000_000}
        hasVatInputLine={lineFlags.hasVatInputLine}
        hasLinkedInvoices={linkedInvoices.length > 0}
        hasCostAccountLine={lineFlags.hasCostAccountLine}
        hasArchFix6ExemptLine={lineFlags.hasArchFix6ExemptLine}
        hasProjectContext={hasProjectContext}
        has811WithProject={has811WithProject}
        disabled={disabled}
      />

      <Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(val) => setActiveTab(val as VoucherEditorTabKey)}
        size="sm"
      />

      {activeTab === 'lines' && (
        <AccountantLinesGrid
          lines={lines}
          lookups={lookups}
          voucherType={header.voucherType}
          disabled={disabled}
          onChangeLines={handleLinesChange}
          onApplyTemplate={onApplyTemplate}
        />
      )}

      {activeTab === 'invoice' && (
        <AccountantInvoiceTab
          hasValidInvoice={header.hasValidInvoice}
          hasVatInputLine={lineFlags.hasVatInputLine}
          voucherType={header.voucherType}
          vatLineTotal={vatLineTotal}
          linkedInvoices={linkedInvoices}
          availableInvoices={availableInvoices}
          onLinkInvoice={onLinkInvoice}
          onUnlinkInvoice={onUnlinkInvoice}
          onGenerateVatLineFromInvoice={onGenerateVatLineFromInvoice}
          onOpenCreateInvoice={onOpenCreateInvoice}
          disabled={disabled}
        />
      )}

      {activeTab === 'attachments' && (
        <VoucherAttachmentsTab
          existingAttachments={existingAttachments}
          pendingFiles={pendingFiles}
          onAddFiles={onAddFiles}
          onRemovePendingFile={onRemovePendingFile}
          onRemoveExistingAttachment={onRemoveExistingAttachment}
          disabled={disabled}
        />
      )}
    </div>
  );
}
