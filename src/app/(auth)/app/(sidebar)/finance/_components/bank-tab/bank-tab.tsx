'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, type TabItem } from '@/components';
import { getBankAccounts } from '@/actions/finance';
import type { BankAccount, VoucherSummary, VoucherType } from '@/types';
import { JetpayPreviewModal } from '../modals';
import { BANK_SUB_TABS, type BankSubTabKey } from './bank-tab.constants';
import { BankAccountCards } from './bank-account-cards';
import { JetpayBankingBanner } from './jetpay-banking-banner';
import { BankVouchersPanel } from './bank-vouchers-panel';
import { BankLedgerPanel } from './bank-ledger-panel';

export interface BankTabProps {
  onCreateVoucher: (options?: {
    mode?: 'workshop' | 'accountant';
    voucherType?: VoucherType;
    bankAccountId?: number;
  }) => void;
  onEditVoucher: (voucher: VoucherSummary) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoidVoucher: (voucher: VoucherSummary) => void;
  onOpenJetpayPreview?: (actionTitle: string, bank?: BankAccount | null) => void;
}

export function BankTab({
  onCreateVoucher,
  onEditVoucher,
  onOpenVoucherDetail,
  onVoidVoucher,
  onOpenJetpayPreview,
}: BankTabProps) {
  const [subTab, setSubTab] = useState<BankSubTabKey>('vouchers');
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [localJetpay, setLocalJetpay] = useState<{
    open: boolean;
    title: string;
    bank: BankAccount | null;
  }>({ open: false, title: '', bank: null });

  const { data: banksRes } = useQuery({
    queryKey: ['finance', 'bank-accounts', 'all'],
    queryFn: () => getBankAccounts({ isActive: true, limit: 100 }),
  });

  const banks = useMemo(() => banksRes?.items || [], [banksRes]);
  const selectedBank = useMemo(
    () => banks.find((b) => b.id === selectedBankId) || null,
    [banks, selectedBankId],
  );

  const tabItems: TabItem[] = useMemo(
    () =>
      BANK_SUB_TABS.map((t) => {
        const Icon = t.icon;
        return { value: t.value, label: t.label, icon: <Icon size={14} /> };
      }),
    [],
  );

  const handleJetpayClick = (actionTitle: string, bank?: BankAccount | null) => {
    if (onOpenJetpayPreview) {
      onOpenJetpayPreview(actionTitle, bank);
    } else {
      setLocalJetpay({ open: true, title: actionTitle, bank: bank || null });
    }
  };

  return (
    <div className="space-y-4">
      <JetpayBankingBanner selectedBank={selectedBank} onOpenPreview={handleJetpayClick} />

      <BankAccountCards
        banks={banks}
        selectedBankId={selectedBankId}
        onSelectBank={setSelectedBankId}
        onQuickCreate={(voucherType, bankAccountId) =>
          onCreateVoucher({ mode: 'accountant', voucherType, bankAccountId })
        }
        onOpenLedger={(bank) => {
          setSelectedBankId(bank.id);
          setSubTab('ledger');
        }}
      />

      <Tabs
        tabs={tabItems}
        activeTab={subTab}
        onChange={(v) => setSubTab(v as BankSubTabKey)}
        size="sm"
      />

      {subTab === 'vouchers' ? (
        <BankVouchersPanel
          banks={banks}
          selectedBankId={selectedBankId}
          onSelectBankId={setSelectedBankId}
          onCreateVoucher={(voucherType, bankAccountId) =>
            onCreateVoucher({ mode: 'accountant', voucherType, bankAccountId })
          }
          onEditVoucher={onEditVoucher}
          onOpenVoucherDetail={onOpenVoucherDetail}
          onVoidVoucher={onVoidVoucher}
        />
      ) : (
        <BankLedgerPanel
          banks={banks}
          selectedBankId={selectedBankId}
          onSelectBankId={setSelectedBankId}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      {!onOpenJetpayPreview && (
        <JetpayPreviewModal
          isOpen={localJetpay.open}
          onClose={() => setLocalJetpay((prev) => ({ ...prev, open: false }))}
          actionTitle={localJetpay.title}
          bankAccount={localJetpay.bank}
        />
      )}
    </div>
  );
}
