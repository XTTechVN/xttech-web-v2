'use client';

import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  ConfirmActionModal,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import { deleteAccount } from '@/actions';
import { ACCOUNT_CATEGORY_OPTIONS } from '@/config/finance';
import type { Account, AccountCategory } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';
import {
  buildAccountTree,
  collectExpandableAccountIds,
  filterAccountTree,
  flattenVisibleTree,
} from '../../_utils';
import { CoaTreeTable } from './coa-tree-table';
import { COA_ACTIVE_OPTIONS, COA_POSTABLE_OPTIONS } from './settings-tab.constants';

interface CoaTreeSectionProps {
  accounts: Account[];
  onRefreshMaster: () => Promise<void> | void;
  onCreateAccount: (parentAccount?: Account) => void;
  onEditAccount: (account: Account) => void;
}

export function CoaTreeSection({
  accounts,
  onRefreshMaster,
  onCreateAccount,
  onEditAccount,
}: CoaTreeSectionProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [postableFilter, setPostableFilter] = useState<string | undefined>();
  const [activeFilter, setActiveFilter] = useState<string | undefined>();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
    const tree = buildAccountTree(accounts);
    return new Set(tree.map((node) => node.id));
  });
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState(false);

  const tree = useMemo(() => buildAccountTree(accounts), [accounts]);

  const filteredTree = useMemo(
    () =>
      filterAccountTree(tree, search, {
        category: categoryFilter as AccountCategory | undefined,
        isPostable: postableFilter === undefined ? undefined : postableFilter === 'true',
        isActive: activeFilter === undefined ? undefined : activeFilter === 'true',
      }),
    [tree, search, categoryFilter, postableFilter, activeFilter],
  );

  const hasActiveFilter = Boolean(
    search.trim() || categoryFilter || postableFilter !== undefined || activeFilter !== undefined,
  );

  const effectiveExpandedIds = useMemo(() => {
    if (hasActiveFilter) {
      return new Set(collectExpandableAccountIds(filteredTree));
    }
    return expandedIds;
  }, [hasActiveFilter, filteredTree, expandedIds]);

  const rows = useMemo(
    () => flattenVisibleTree(filteredTree, effectiveExpandedIds),
    [filteredTree, effectiveExpandedIds],
  );

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return;
    setDeleting(true);
    try {
      await deleteAccount(deletingAccount.id);
      showSuccessToast(`Đã xóa tài khoản ${deletingAccount.accountCode}`);
      setDeletingAccount(null);
      await onRefreshMaster();
    } catch (err) {
      showErrorToast(err, 'Không thể xóa tài khoản kế toán');
    } finally {
      setDeleting(false);
    }
  };

  const filters: ITableFilterProps[] = useMemo(
    () => [
      { label: 'Phân loại', value: categoryFilter, options: ACCOUNT_CATEGORY_OPTIONS, onChange: setCategoryFilter },
      { label: 'Hạch toán', value: postableFilter, options: COA_POSTABLE_OPTIONS, onChange: setPostableFilter },
      { label: 'Trạng thái', value: activeFilter, options: COA_ACTIVE_OPTIONS, onChange: setActiveFilter },
    ],
    [categoryFilter, postableFilter, activeFilter],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch placeholder="Tìm số hiệu TK, tên tài khoản..." value={search} onChange={setSearch} className="w-64" />
          <TableFilters filters={filters} />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="xs" onClick={() => setExpandedIds(new Set(collectExpandableAccountIds(tree)))}>
            Mở rộng hết
          </Button>
          <Button variant="outline" size="xs" onClick={() => setExpandedIds(new Set())}>
            Thu gọn hết
          </Button>
          <Button variant="primary" size="sm" onClick={() => onCreateAccount()} leftIcon={<Plus size={14} />}>
            Thêm tài khoản
          </Button>
        </div>
      </div>

      <CoaTreeTable
        rows={rows}
        onToggleExpand={toggleExpand}
        onCreateAccount={onCreateAccount}
        onEditAccount={onEditAccount}
        onDeleteAccount={setDeletingAccount}
      />

      <ConfirmActionModal
        isOpen={Boolean(deletingAccount)}
        onClose={() => setDeletingAccount(null)}
        title="Xóa tài khoản kế toán"
        description={`Xác nhận xóa tài khoản ${deletingAccount?.accountCode} - ${deletingAccount?.name}?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
