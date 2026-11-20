'use client';

import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Alert, Button, Input, Select } from '@/components';
import { upsertOpeningBalances } from '@/actions/finance';
import { formatCurrency } from '@/utils/currency';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import { includesSearchText } from '@/utils/string';
import type {
  Account,
  BankAccount,
  Customer,
  OpeningBalanceEntry,
  OpeningBalanceInputItem,
  Project,
  VoucherDetail,
  WarehouseSupplier,
} from '@/types';
import { buildInitialOpeningRows, nextOpeningRowKey } from './modals.constants';
import {
  OpeningBalanceTable,
  type OpeningDraftRow,
} from './opening-balance-table';

export interface OpeningBalanceBodyProps {
  initialEntries: OpeningBalanceEntry[];
  accounts: Account[];
  bankAccounts: BankAccount[];
  customers: Customer[];
  suppliers: WarehouseSupplier[];
  projects: Project[];
  effectiveDate: string;
  onChangeDate: (date: string) => void;
  onClose: () => void;
  onSuccess?: (voucher: VoucherDetail) => void;
}

export function OpeningBalanceBody({
  initialEntries,
  accounts,
  bankAccounts,
  customers,
  suppliers,
  projects,
  effectiveDate,
  onChangeDate,
  onClose,
  onSuccess,
}: OpeningBalanceBodyProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addAccountId, setAddAccountId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const postableBsAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          a.isPostable &&
          a.isActive &&
          ['asset', 'liability', 'equity'].includes(a.category),
      ),
    [accounts],
  );

  const [rows, setRows] = useState<OpeningDraftRow[]>(() =>
    buildInitialOpeningRows(initialEntries, postableBsAccounts),
  );

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter(
      (r) =>
        includesSearchText(r.accountCode, search) ||
        includesSearchText(r.accountName, search),
    );
  }, [rows, search]);

  const { totalDebit, totalCredit, diff } = useMemo(() => {
    let d = 0;
    let c = 0;
    for (const r of rows) {
      d += r.debitBalance || 0;
      c += r.creditBalance || 0;
    }
    return { totalDebit: d, totalCredit: c, diff: d - c };
  }, [rows]);

  const handleAddAccountRow = () => {
    const acc = postableBsAccounts.find((a) => a.id === addAccountId);
    if (!acc) return;
    setRows((prev) => [
      ...prev,
      {
        rowKey: nextOpeningRowKey(),
        accountId: acc.id,
        accountCode: acc.accountCode,
        accountName: acc.name,
        debitBalance: 0,
        creditBalance: 0,
        bankAccountId: null,
        customerId: null,
        supplierId: null,
        projectId: null,
        note: '',
      },
    ]);
    setAddAccountId(0);
  };

  const handleSave = async () => {
    const nonZero: OpeningBalanceInputItem[] = rows
      .filter((r) => r.debitBalance > 0 || r.creditBalance > 0)
      .map((r) => ({
        accountId: r.accountId,
        debitBalance: Math.round(r.debitBalance),
        creditBalance: Math.round(r.creditBalance),
        bankAccountId: r.bankAccountId,
        customerId: r.customerId,
        supplierId: r.supplierId,
        projectId: r.projectId,
        note: r.note.trim() || null,
      }));
    if (nonZero.length === 0) {
      showErrorToast('Vui lòng nhập ít nhất một dòng số dư đầu kỳ khác 0.');
      return;
    }
    if (diff !== 0) {
      showErrorToast(
        `Tổng Nợ (${formatCurrency(totalDebit)}) phải bằng Tổng Có (${formatCurrency(totalCredit)}).`,
      );
      return;
    }
    setSubmitting(true);
    try {
      const saved = await upsertOpeningBalances({
        effectiveDate,
        description: `Số dư đầu kỳ Sổ Tài chính ngày ${effectiveDate}`,
        entries: nonZero,
      });
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast('Đã lưu và ghi sổ Số dư đầu kỳ thành công!');
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Lỗi lưu số dư đầu kỳ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
        <Input label="Ngày hiệu lực đầu kỳ *" type="date" fullWidth value={effectiveDate} onChange={(e) => onChangeDate(e.target.value)} />
        <Input label="Tìm nhanh tài khoản" fullWidth value={search} placeholder="Mã TK hoặc tên..." onChange={(e) => setSearch(e.target.value)} />
        <div className="flex items-end gap-1.5">
          <div className="flex-1">
            <Select
              label="Thêm dòng TK chi tiết"
              fullWidth
              searchable
              placeholder="Chọn TK..."
              value={addAccountId || ''}
              options={postableBsAccounts.map((a) => ({ value: a.id, label: `${a.accountCode} - ${a.name}` }))}
              onChange={(e) => setAddAccountId(Number(e.target.value))}
            />
          </div>
          <Button type="button" variant="outline" size="md" disabled={!addAccountId} onClick={handleAddAccountRow}>
            <Plus size={15} />
          </Button>
        </div>
      </div>

      {diff !== 0 && (
        <Alert variant="warning" title="Bảng cân đối đầu kỳ chưa cân">
          Chênh lệch Nợ - Có hiện tại: <strong className="font-mono">{formatCurrency(diff)}</strong>. Tổng Nợ phải bằng Tổng Có (kể cả TK 4111 Vốn góp) trước khi ghi sổ.
        </Alert>
      )}

      <OpeningBalanceTable
        rows={filteredRows}
        totalDebit={totalDebit}
        totalCredit={totalCredit}
        bankAccounts={bankAccounts}
        customers={customers}
        suppliers={suppliers}
        projects={projects}
        onUpdateRow={(key, patch) => setRows((prev) => prev.map((r) => (r.rowKey === key ? { ...r, ...patch } : r)))}
        onRemoveRow={(key) => setRows((prev) => prev.filter((r) => r.rowKey !== key))}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button type="button" variant="primary" size="sm" loading={submitting} onClick={handleSave}>
          Lưu &amp; Ghi sổ Đầu kỳ
        </Button>
      </div>
    </div>
  );
}
