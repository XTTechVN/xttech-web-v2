'use client';

import React from 'react';
import type { Account, VoucherDetail, VoucherSummary } from '@/types';
import {
  AccountFormModal,
  AutoPostingFormModal,
  BankAccountFormModal,
  CostItemFormModal,
  JetpayPreviewModal,
  OpeningBalanceModal,
  TaxInvoiceFormModal,
  VoidVoucherModal,
  VoucherDetailModal,
  VoucherFormModal,
} from '../modals';
import type { FinanceModalsState } from './finance-modals-state';

interface FinanceModalsHostProps {
  state: FinanceModalsState;
  accounts: Account[];
  onCloseVoucherForm: () => void;
  onCloseDetail: () => void;
  onEditFromDetail: (voucher: VoucherDetail) => void;
  onVoidFromDetail: (voucher: VoucherSummary | VoucherDetail) => void;
  onCloseVoid: () => void;
  onCloseAccount: () => void;
  onCloseBankAccount: () => void;
  onCloseCostItem: () => void;
  onCloseAutoPosting: () => void;
  onCloseOpeningBalance: () => void;
  onCloseTaxInvoice: () => void;
  onCloseJetpay: () => void;
  onDataMutated: () => Promise<void> | void;
}

export function FinanceModalsHost({
  state,
  accounts,
  onCloseVoucherForm,
  onCloseDetail,
  onEditFromDetail,
  onVoidFromDetail,
  onCloseVoid,
  onCloseAccount,
  onCloseBankAccount,
  onCloseCostItem,
  onCloseAutoPosting,
  onCloseOpeningBalance,
  onCloseTaxInvoice,
  onCloseJetpay,
  onDataMutated,
}: FinanceModalsHostProps) {
  return (
    <>
      <VoucherFormModal
        isOpen={state.voucherForm.isOpen}
        onClose={onCloseVoucherForm}
        voucherId={state.voucherForm.voucherId}
        initialData={state.voucherForm.initialData}
        defaultMode={state.voucherForm.defaultMode}
        defaultVoucherType={state.voucherForm.defaultVoucherType}
        defaultBankAccountId={state.voucherForm.defaultBankAccountId}
        defaultHasValidInvoice={state.voucherForm.defaultHasValidInvoice}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <VoucherDetailModal
        isOpen={Boolean(state.detailVoucherId)}
        onClose={onCloseDetail}
        voucherId={state.detailVoucherId}
        onEdit={onEditFromDetail}
        onVoid={onVoidFromDetail}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <VoidVoucherModal
        isOpen={Boolean(state.voidVoucher)}
        onClose={onCloseVoid}
        voucher={state.voidVoucher}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <AccountFormModal
        isOpen={state.accountModal.isOpen}
        onClose={onCloseAccount}
        initialData={state.accountModal.initialData}
        defaultParentId={state.accountModal.defaultParentId}
        accounts={accounts}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <BankAccountFormModal
        isOpen={state.bankAccountModal.isOpen}
        onClose={onCloseBankAccount}
        initialData={state.bankAccountModal.initialData}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <CostItemFormModal
        isOpen={state.costItemModal.isOpen}
        onClose={onCloseCostItem}
        initialData={state.costItemModal.initialData}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <AutoPostingFormModal
        isOpen={state.autoPostingModal.isOpen}
        onClose={onCloseAutoPosting}
        initialData={state.autoPostingModal.initialData}
        defaultRegime={state.autoPostingModal.defaultRegime}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <OpeningBalanceModal
        key={`opening-${state.openingBalanceModal.mountKey}`}
        isOpen={state.openingBalanceModal.isOpen}
        onClose={onCloseOpeningBalance}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <TaxInvoiceFormModal
        isOpen={state.taxInvoiceModal.isOpen}
        onClose={onCloseTaxInvoice}
        initialData={state.taxInvoiceModal.initialData}
        defaultDirection={state.taxInvoiceModal.defaultDirection}
        defaultVoucherId={state.taxInvoiceModal.defaultVoucherId}
        prefillXml={state.taxInvoiceModal.prefillXml}
        onSuccess={() => {
          onDataMutated();
        }}
      />

      <JetpayPreviewModal
        isOpen={state.jetpayModal.isOpen}
        onClose={onCloseJetpay}
        actionTitle={state.jetpayModal.actionTitle}
        bankAccount={state.jetpayModal.bankAccount}
      />
    </>
  );
}
