'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarRange,
  FolderTree,
  History,
  Layers,
  Settings,
  ShieldCheck,
  Tag,
  Wallet,
  Zap,
} from 'lucide-react';
import { Tabs, type TabItem } from '@/components';
import type {
  Account,
  AutoPostingTemplate,
  BankAccount,
  CostItem,
  FinanceSetting,
} from '@/types';
import { AuditLogsSection } from './audit-logs-section';
import { CoaTreeSection } from './coa-tree-section';
import { CostItemsSection } from './cost-items-section';
import { FiscalYearConfigSection } from './fiscal-year-config-section';
import { FundsBanksSection } from './funds-banks-section';
import { RegimeSettingsSection } from './regime-settings-section';
import { SETTINGS_SUBTABS, type SettingsSubTabKey } from './settings-tab.constants';
import { TaxpayerProfileSection } from './taxpayer-profile-section';
import { TemplatesSection } from './templates-section';
import { UserPermissionsSection } from './user-permissions-section';

export interface SettingsTabProps {
  setting: FinanceSetting | null;
  accounts: Account[];
  bankAccounts: BankAccount[];
  costItems: CostItem[];
  autoPostingTemplates: AutoPostingTemplate[];
  onRefreshMaster: () => Promise<void> | void;
  onOpenOpeningBalance: () => void;
  onCreateAccount: (parentAccount?: Account) => void;
  onEditAccount: (account: Account) => void;
  onCreateBankAccount: () => void;
  onEditBankAccount: (bank: BankAccount) => void;
  onCreateCostItem: () => void;
  onEditCostItem: (item: CostItem) => void;
  onCreateAutoPosting: () => void;
  onEditAutoPosting: (template: AutoPostingTemplate) => void;
}

const SETTINGS_ICONS: Record<SettingsSubTabKey, React.ReactNode> = {
  regime: <Layers size={14} />,
  taxpayer_profile: <Building2 size={14} />,
  permissions: <ShieldCheck size={14} />,
  fiscal_years: <CalendarRange size={14} />,
  coa: <FolderTree size={14} />,
  templates: <Zap size={14} />,
  funds_banks: <Wallet size={14} />,
  cost_items: <Tag size={14} />,
  audit_logs: <History size={14} />,
};

export function SettingsTab({
  setting,
  accounts,
  bankAccounts,
  costItems,
  autoPostingTemplates,
  onRefreshMaster,
  onOpenOpeningBalance,
  onCreateAccount,
  onEditAccount,
  onCreateBankAccount,
  onEditBankAccount,
  onCreateCostItem,
  onEditCostItem,
  onCreateAutoPosting,
  onEditAutoPosting,
}: SettingsTabProps) {
  const [subTab, setSubTab] = useState<SettingsSubTabKey>('regime');

  const tabItems: TabItem[] = useMemo(
    () =>
      SETTINGS_SUBTABS.map((t) => ({
        value: t.value,
        label: t.label,
        icon: SETTINGS_ICONS[t.value],
      })),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Settings size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Thiết lập Chế độ Kế toán &amp; Danh mục Tài chính Chuẩn
            </h3>
            <p className="text-xs text-slate-500">
              Quản lý Thông tư 99/133, Hồ sơ Người nộp thuế, Hệ thống Tài khoản phân cấp, Quỹ tiền mặt TK 1111, Ngân hàng, Khoản mục &amp; Mẫu định khoản
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pb-0.5">
          <Tabs
            tabs={tabItems}
            activeTab={subTab}
            onChange={(val) => setSubTab(val as SettingsSubTabKey)}
            variant="pill"
            size="sm"
          />
        </div>
      </div>

      {subTab === 'regime' && (
        <RegimeSettingsSection
          key={setting?.updatedAt || 'default-setting'}
          setting={setting}
          onRefreshMaster={onRefreshMaster}
          onOpenOpeningBalance={onOpenOpeningBalance}
        />
      )}

      {subTab === 'taxpayer_profile' && (
        <TaxpayerProfileSection
          key={setting?.updatedAt || 'default-taxpayer'}
          setting={setting}
          onRefreshMaster={onRefreshMaster}
        />
      )}

      {subTab === 'permissions' && <UserPermissionsSection />}

      {subTab === 'fiscal_years' && <FiscalYearConfigSection />}

      {subTab === 'coa' && (
        <CoaTreeSection
          accounts={accounts}
          onRefreshMaster={onRefreshMaster}
          onCreateAccount={onCreateAccount}
          onEditAccount={onEditAccount}
        />
      )}

      {subTab === 'templates' && (
        <TemplatesSection
          templates={autoPostingTemplates}
          onRefreshMaster={onRefreshMaster}
          onCreateAutoPosting={onCreateAutoPosting}
          onEditAutoPosting={onEditAutoPosting}
        />
      )}

      {subTab === 'funds_banks' && (
        <FundsBanksSection
          bankAccounts={bankAccounts}
          onRefreshMaster={onRefreshMaster}
          onCreateBankAccount={onCreateBankAccount}
          onEditBankAccount={onEditBankAccount}
        />
      )}

      {subTab === 'cost_items' && (
        <CostItemsSection
          costItems={costItems}
          onRefreshMaster={onRefreshMaster}
          onCreateCostItem={onCreateCostItem}
          onEditCostItem={onEditCostItem}
        />
      )}

      {subTab === 'audit_logs' && <AuditLogsSection />}
    </div>
  );
}
