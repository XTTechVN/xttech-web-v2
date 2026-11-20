'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Badge, Button, ConfirmActionModal, TableSearch } from '@/components';
import { deleteBankAccount } from '@/actions';
import type { BankAccount } from '@/types';
import { includesSearchText, showErrorToast, showSuccessToast } from '@/utils';
import { BankAccountsTable } from './bank-accounts-table';

interface FundsBanksSectionProps {
  bankAccounts: BankAccount[];
  onRefreshMaster: () => Promise<void> | void;
  onCreateBankAccount: () => void;
  onEditBankAccount: (bank: BankAccount) => void;
}

export function FundsBanksSection({
  bankAccounts,
  onRefreshMaster,
  onCreateBankAccount,
  onEditBankAccount,
}: FundsBanksSectionProps) {
  const [search, setSearch] = useState('');
  const [deletingBank, setDeletingBank] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredBanks = useMemo(
    () =>
      bankAccounts.filter(
        (b) =>
          !search.trim() ||
          includesSearchText(b.code, search) ||
          includesSearchText(b.accountNumber, search) ||
          includesSearchText(b.bankName, search) ||
          includesSearchText(b.accountHolder, search),
      ),
    [bankAccounts, search],
  );

  const handleConfirmDelete = async () => {
    if (!deletingBank) return;
    setDeleting(true);
    try {
      await deleteBankAccount(deletingBank.id);
      showSuccessToast(`Đã xóa tài khoản ngân hàng ${deletingBank.accountNumber}`);
      setDeletingBank(null);
      await onRefreshMaster();
    } catch (err) {
      showErrorToast(err, 'Không thể xóa tài khoản ngân hàng');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-primary/25 p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Wallet size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">
                1 Quỹ Tiền mặt chung (TK 1111 — Tiền Việt Nam)
              </h4>
              <Badge variant="primary" size="sm">
                Sổ quỹ S07-DN duy nhất
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống sử dụng 1 Quỹ Tiền mặt hợp nhất gắn với Tài khoản <span className="font-mono font-semibold text-primary">1111</span> theo chuẩn Thông tư 200/133 (không tách két đa quỹ VP/Xưởng). Mọi phiếu thu/chi tiền mặt đều hạch toán vào Sổ quỹ S07-DN; chi phí có hóa đơn GTGT và chi phí không hóa đơn được phân biệt qua trạng thái Hóa đơn hợp lệ &amp; Chỉ tiêu loại trừ TNDN (B4).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <TableSearch
          placeholder="Tìm mã, số tài khoản, tên ngân hàng, chủ TK..."
          value={search}
          onChange={setSearch}
          className="w-80"
        />
        <Button variant="primary" size="sm" onClick={onCreateBankAccount} leftIcon={<Plus size={14} />}>
          Thêm TK Ngân hàng
        </Button>
      </div>

      <BankAccountsTable
        bankAccounts={filteredBanks}
        onEditBankAccount={onEditBankAccount}
        onDeleteBankAccount={setDeletingBank}
      />

      <ConfirmActionModal
        isOpen={Boolean(deletingBank)}
        onClose={() => setDeletingBank(null)}
        title="Xóa Tài khoản ngân hàng"
        description={`Xác nhận xóa tài khoản "${deletingBank?.accountNumber}" (${deletingBank?.bankName})?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
