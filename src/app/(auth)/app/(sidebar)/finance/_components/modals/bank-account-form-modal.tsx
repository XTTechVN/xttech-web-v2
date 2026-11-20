'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, CurrencyInput, Input, Modal, Select, Switch } from '@/components';
import {
  createBankAccount,
  getAccounts,
  updateBankAccount,
} from '@/actions/finance';
import { VIETNAM_BANKS } from '@/config/finance';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type { BankAccount } from '@/types';

export interface BankAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BankAccount | null;
  onSuccess?: (bank: BankAccount) => void;
}

function BankAccountFormBody({
  initialData,
  onClose,
  onSuccess,
}: Omit<BankAccountFormModalProps, 'isOpen'>) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: accountsRes } = useQuery({
    queryKey: ['finance', 'accounts', 'all'],
    queryFn: () => getAccounts({ limit: 500 }),
    staleTime: 60_000,
  });

  const bankGlAccounts = useMemo(
    () =>
      (accountsRes?.items || []).filter(
        (a) => a.isPostable && a.isActive && a.accountCode.startsWith('112'),
      ),
    [accountsRes],
  );

  const [code, setCode] = useState(initialData?.code || '');
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '');
  const [bankCode, setBankCode] = useState(initialData?.bankCode || 'VCB');
  const [bankName, setBankName] = useState(
    initialData?.bankName ||
      VIETNAM_BANKS.find((b) => b.code === 'VCB')?.shortName ||
      'Vietcombank',
  );
  const [branchName, setBranchName] = useState(initialData?.branchName || '');
  const [accountHolder, setAccountHolder] = useState(initialData?.accountHolder || '');
  const [glAccountId, setGlAccountId] = useState<number>(
    initialData?.glAccountId || bankGlAccounts[0]?.id || 0,
  );
  const [openingBalance, setOpeningBalance] = useState<number>(
    initialData?.openingBalance ?? 0,
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const effectiveGlId = glAccountId || bankGlAccounts[0]?.id || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !accountNumber.trim() || !bankName.trim() || !accountHolder.trim() || !effectiveGlId) {
      showErrorToast('Vui lòng nhập đầy đủ Mã, Số TK, Ngân hàng, Chủ TK và TK kế toán 112x.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        code: code.trim(),
        accountNumber: accountNumber.trim(),
        bankCode: bankCode.trim(),
        bankName: bankName.trim(),
        branchName: branchName.trim() || null,
        accountHolder: accountHolder.trim(),
        glAccountId: effectiveGlId,
        openingBalance,
        isActive,
      };
      const saved = initialData
        ? await updateBankAccount(initialData.id, payload)
        : await createBankAccount(payload);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(
        initialData ? 'Đã cập nhật tài khoản ngân hàng' : 'Đã thêm tài khoản ngân hàng',
      );
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Lỗi lưu tài khoản ngân hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Mã gợi nhớ *"
          fullWidth
          value={code}
          placeholder="VD: VCB_CTY"
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Số tài khoản ngân hàng *"
            fullWidth
            value={accountNumber}
            placeholder="0071001234567"
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Ngân hàng *"
          fullWidth
          searchable
          value={bankCode}
          options={VIETNAM_BANKS.map((b) => ({
            value: b.code,
            label: `${b.code} - ${b.shortName}`,
          }))}
          onChange={(e) => {
            const nextCode = e.target.value;
            const meta = VIETNAM_BANKS.find((b) => b.code === nextCode);
            setBankCode(nextCode);
            if (meta) setBankName(meta.shortName);
          }}
        />
        <Input
          label="Tên ngân hàng *"
          fullWidth
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        />
        <Input
          label="Chi nhánh"
          fullWidth
          value={branchName}
          placeholder="CN TP.HCM"
          onChange={(e) => setBranchName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Chủ tài khoản *"
          fullWidth
          value={accountHolder}
          placeholder="CÔNG TY TNHH XTTECH"
          onChange={(e) => setAccountHolder(e.target.value)}
        />
        <Select
          label="TK Kế toán đối ứng (112*) *"
          fullWidth
          value={effectiveGlId || ''}
          options={bankGlAccounts.map((a) => ({
            value: a.id,
            label: `${a.accountCode} - ${a.name}`,
          }))}
          onChange={(e) => setGlAccountId(Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <CurrencyInput
          label="Số dư đầu kỳ (VNĐ)"
          fullWidth
          value={openingBalance || ''}
          className="font-mono tabular-nums text-right"
          onChange={setOpeningBalance}
        />
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mt-2 sm:mt-5">
          <Switch
            label="Đang hoạt động"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting}>
          {initialData ? 'Lưu thay đổi' : 'Thêm TK Ngân hàng'}
        </Button>
      </div>
    </form>
  );
}

export function BankAccountFormModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: BankAccountFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        initialData
          ? `Sửa TK Ngân hàng ${initialData.accountNumber}`
          : 'Thêm Tài Khoản Ngân Hàng'
      }
    >
      {isOpen && (
        <BankAccountFormBody
          key={initialData?.id ?? 'new'}
          initialData={initialData}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
