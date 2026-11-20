'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  FileSpreadsheet,
  LayoutDashboard,
  Settings,
  Wallet,
} from 'lucide-react';
import { Tabs, type TabItem } from '@/components';
import {
  getAccounts,
  getAutoPostingTemplates,
  getBankAccounts,
  getCostItems,
  getFinanceSetting,
} from '@/actions';
import { FINANCE_TABS_META } from '@/config/finance';
import type { FinanceTabKey } from '@/types';
import { ArApTab } from '../ar-ap-tab';
import { BankTab } from '../bank-tab';
import { CashTab } from '../cash-tab';
import { GlClosingTab } from '../gl-closing-tab';
import { OverviewTab } from '../overview-tab';
import { ReportsTab } from '../reports-tab';
import { SettingsTab } from '../settings-tab';
import { TaxTab } from '../tax-tab';
import { FinanceHeader } from './finance-header';
import { FinanceModalsHost } from './finance-modals-host';
import type { FinanceModalsState } from './finance-modals-state';

interface FinanceWorkspaceProps {
  activeTab: FinanceTabKey;
  onChangeTab: (tab: FinanceTabKey) => void;
}

const TAB_ICON_COMPONENTS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={15} />,
  Wallet: <Wallet size={15} />,
  Building2: <Building2 size={15} />,
  ArrowLeftRight: <ArrowLeftRight size={15} />,
  BookOpenCheck: <BookOpenCheck size={15} />,
  FileSpreadsheet: <FileSpreadsheet size={15} />,
  BarChart3: <BarChart3 size={15} />,
  Settings: <Settings size={15} />,
};

const INITIAL_MODALS_STATE: FinanceModalsState = {
  voucherForm: { isOpen: false },
  detailVoucherId: null,
  voidVoucher: null,
  accountModal: { isOpen: false },
  bankAccountModal: { isOpen: false },
  costItemModal: { isOpen: false },
  autoPostingModal: { isOpen: false },
  openingBalanceModal: { isOpen: false, mountKey: 0 },
  taxInvoiceModal: { isOpen: false },
  jetpayModal: { isOpen: false },
};

export function FinanceWorkspace({ activeTab, onChangeTab }: FinanceWorkspaceProps) {
  const queryClient = useQueryClient();
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [modals, setModals] = useState<FinanceModalsState>(INITIAL_MODALS_STATE);

  const { data: setting = null } = useQuery({
    queryKey: ['finance', 'settings'],
    queryFn: getFinanceSetting,
  });
  const { data: accountsRes, isFetching: fetchingAccounts } = useQuery({
    queryKey: ['finance', 'accounts', 'all'],
    queryFn: () => getAccounts({ limit: 500 }),
  });
  const { data: banksRes } = useQuery({
    queryKey: ['finance', 'bank-accounts', 'master'],
    queryFn: () => getBankAccounts({ limit: 100 }),
  });
  const { data: costItemsRes } = useQuery({
    queryKey: ['finance', 'cost-items', 'master'],
    queryFn: () => getCostItems({ limit: 200 }),
  });
  const { data: templatesRes } = useQuery({
    queryKey: ['finance', 'auto-posting-templates', 'master'],
    queryFn: () => getAutoPostingTemplates({ limit: 200 }),
  });

  const accounts = accountsRes?.items || [];
  const bankAccounts = banksRes?.items || [];
  const costItems = costItemsRes?.items || [];
  const autoPostingTemplates = templatesRes?.items || [];

  const handleRefreshAll = useCallback(async () => {
    setRefreshSignal((prev) => prev + 1);
    await queryClient.invalidateQueries({ queryKey: ['finance'] });
  }, [queryClient]);

  const tabItems: TabItem[] = useMemo(
    () =>
      FINANCE_TABS_META.map((meta) => ({
        value: meta.id,
        label: meta.shortLabel,
        icon: TAB_ICON_COMPONENTS[meta.iconKey] || null,
      })),
    [],
  );

  const activeRegime = setting?.accountingRegime || 'tt200';

  return (
    <div className="p-4 flex flex-col gap-4 text-slate-800 w-full">
      <FinanceHeader
        activeRegime={activeRegime}
        refreshing={fetchingAccounts}
        onCreateVoucher={(mode, voucherType) =>
          setModals((m) => ({
            ...m,
            voucherForm: { isOpen: true, defaultMode: mode, defaultVoucherType: voucherType },
          }))
        }
        onRefreshAll={handleRefreshAll}
      />

      <div className="border-b border-slate-200 overflow-x-auto">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={(val) => onChangeTab(val as FinanceTabKey)} />
      </div>

      <div className="min-h-[420px]">
        {activeTab === 'overview' && (
          <OverviewTab
            onCreateVoucher={(mode, voucherType) => setModals((m) => ({ ...m, voucherForm: { isOpen: true, defaultMode: mode, defaultVoucherType: voucherType } }))}
            onOpenVoucherDetail={(id) => setModals((m) => ({ ...m, detailVoucherId: id }))}
            onNavigateTab={onChangeTab}
          />
        )}
        {activeTab === 'cash' && (
          <CashTab
            onCreateVoucher={(opts) => setModals((m) => ({ ...m, voucherForm: { isOpen: true, defaultMode: opts?.mode, defaultVoucherType: opts?.voucherType } }))}
            onEditVoucher={(v) => setModals((m) => ({ ...m, voucherForm: { isOpen: true, voucherId: v.id, defaultMode: 'accountant' } }))}
            onOpenVoucherDetail={(id) => setModals((m) => ({ ...m, detailVoucherId: id }))}
            onVoidVoucher={(v) => setModals((m) => ({ ...m, voidVoucher: v }))}
          />
        )}
        {activeTab === 'bank' && (
          <BankTab
            onCreateVoucher={(opts) => setModals((m) => ({ ...m, voucherForm: { isOpen: true, defaultMode: opts?.mode, defaultVoucherType: opts?.voucherType, defaultBankAccountId: opts?.bankAccountId } }))}
            onEditVoucher={(v) => setModals((m) => ({ ...m, voucherForm: { isOpen: true, voucherId: v.id, defaultMode: 'accountant' } }))}
            onOpenVoucherDetail={(id) => setModals((m) => ({ ...m, detailVoucherId: id }))}
            onVoidVoucher={(v) => setModals((m) => ({ ...m, voidVoucher: v }))}
            onOpenJetpayPreview={(actionTitle, bankAccount) => setModals((m) => ({ ...m, jetpayModal: { isOpen: true, actionTitle, bankAccount } }))}
          />
        )}
        {activeTab === 'ar_ap' && (
          <ArApTab
            accounts={accounts}
            bankAccounts={bankAccounts}
            costItems={costItems}
            autoPostingTemplates={autoPostingTemplates}
            refreshSignal={refreshSignal}
            onOpenVoucherDetail={(id) => setModals((m) => ({ ...m, detailVoucherId: id }))}
            onVoucherChanged={handleRefreshAll}
          />
        )}
        {activeTab === 'gl_closing' && (
          <GlClosingTab
            accountingRegime={activeRegime}
            refreshSignal={refreshSignal}
            onCreateJournalVoucher={() => setModals((m) => ({ ...m, voucherForm: { isOpen: true, defaultMode: 'accountant', defaultVoucherType: 'general_journal' } }))}
            onOpenOpeningBalance={() => setModals((m) => ({ ...m, openingBalanceModal: { isOpen: true, mountKey: m.openingBalanceModal.mountKey + 1 } }))}
            onOpenVoucherDetail={(id) => setModals((m) => ({ ...m, detailVoucherId: id }))}
            onVoucherChanged={handleRefreshAll}
          />
        )}
        {activeTab === 'tax' && (
          <TaxTab
            accounts={accounts}
            refreshSignal={refreshSignal}
            onOpenVoucherDetail={(id) => setModals((m) => ({ ...m, detailVoucherId: id }))}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab
            accounts={accounts}
            refreshSignal={refreshSignal}
            onOpenVoucherDetail={(id) => setModals((m) => ({ ...m, detailVoucherId: id }))}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            setting={setting}
            accounts={accounts}
            bankAccounts={bankAccounts}
            costItems={costItems}
            autoPostingTemplates={autoPostingTemplates}
            onRefreshMaster={handleRefreshAll}
            onOpenOpeningBalance={() => setModals((m) => ({ ...m, openingBalanceModal: { isOpen: true, mountKey: m.openingBalanceModal.mountKey + 1 } }))}
            onCreateAccount={(parent) => setModals((m) => ({ ...m, accountModal: { isOpen: true, initialData: null, defaultParentId: parent?.id ?? null } }))}
            onEditAccount={(account) => setModals((m) => ({ ...m, accountModal: { isOpen: true, initialData: account } }))}
            onCreateBankAccount={() => setModals((m) => ({ ...m, bankAccountModal: { isOpen: true, initialData: null } }))}
            onEditBankAccount={(bank) => setModals((m) => ({ ...m, bankAccountModal: { isOpen: true, initialData: bank } }))}
            onCreateCostItem={() => setModals((m) => ({ ...m, costItemModal: { isOpen: true, initialData: null } }))}
            onEditCostItem={(item) => setModals((m) => ({ ...m, costItemModal: { isOpen: true, initialData: item } }))}
            onCreateAutoPosting={() => setModals((m) => ({ ...m, autoPostingModal: { isOpen: true, initialData: null, defaultRegime: activeRegime } }))}
            onEditAutoPosting={(tmpl) => setModals((m) => ({ ...m, autoPostingModal: { isOpen: true, initialData: tmpl, defaultRegime: activeRegime } }))}
          />
        )}
      </div>

      <FinanceModalsHost
        state={modals}
        accounts={accounts}
        onCloseVoucherForm={() => setModals((m) => ({ ...m, voucherForm: { isOpen: false } }))}
        onCloseDetail={() => setModals((m) => ({ ...m, detailVoucherId: null }))}
        onEditFromDetail={(voucher) => setModals((m) => ({ ...m, detailVoucherId: null, voucherForm: { isOpen: true, initialData: voucher, defaultMode: 'accountant' } }))}
        onVoidFromDetail={(voucher) => setModals((m) => ({ ...m, detailVoucherId: null, voidVoucher: voucher }))}
        onCloseVoid={() => setModals((m) => ({ ...m, voidVoucher: null }))}
        onCloseAccount={() => setModals((m) => ({ ...m, accountModal: { isOpen: false } }))}
        onCloseBankAccount={() => setModals((m) => ({ ...m, bankAccountModal: { isOpen: false } }))}
        onCloseCostItem={() => setModals((m) => ({ ...m, costItemModal: { isOpen: false } }))}
        onCloseAutoPosting={() => setModals((m) => ({ ...m, autoPostingModal: { isOpen: false } }))}
        onCloseOpeningBalance={() => setModals((m) => ({ ...m, openingBalanceModal: { ...m.openingBalanceModal, isOpen: false } }))}
        onCloseTaxInvoice={() => setModals((m) => ({ ...m, taxInvoiceModal: { isOpen: false } }))}
        onCloseJetpay={() => setModals((m) => ({ ...m, jetpayModal: { isOpen: false } }))}
        onDataMutated={handleRefreshAll}
      />
    </div>
  );
}
