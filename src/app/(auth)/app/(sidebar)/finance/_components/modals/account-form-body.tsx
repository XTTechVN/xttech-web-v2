'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Input, Select, Switch } from '@/components';
import { createAccount, getAccounts, updateAccount } from '@/actions/finance';
import {
  ACCOUNT_CATEGORY_OPTIONS,
  ACCOUNT_NATURE_OPTIONS,
  ACCOUNTING_REGIME_MAP,
} from '@/config/finance';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type {
  Account,
  AccountCategory,
  AccountNature,
  AccountRegimeScope,
} from '@/types';

export interface AccountFormBodyProps {
  initialData?: Account | null;
  defaultParentId?: number | null;
  accounts?: Account[];
  onClose: () => void;
  onSuccess?: (account: Account) => void;
}

export function AccountFormBody({
  initialData,
  defaultParentId = null,
  accounts: passedAccounts,
  onClose,
  onSuccess,
}: AccountFormBodyProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: accountsRes } = useQuery({
    queryKey: ['finance', 'accounts', 'all'],
    queryFn: () => getAccounts({ limit: 500 }),
    enabled: !passedAccounts,
    staleTime: 60_000,
  });

  const allAccounts = useMemo(
    () => passedAccounts || accountsRes?.items || [],
    [passedAccounts, accountsRes],
  );
  const parentObj = useMemo(
    () => allAccounts.find((a) => a.id === (initialData?.parentId ?? defaultParentId)) || null,
    [allAccounts, initialData?.parentId, defaultParentId],
  );

  const [accountCode, setAccountCode] = useState(initialData?.accountCode || '');
  const [name, setName] = useState(initialData?.name || '');
  const [englishName, setEnglishName] = useState(initialData?.englishName || '');
  const [regime, setRegime] = useState<AccountRegimeScope>(
    initialData?.regime || parentObj?.regime || 'both',
  );
  const [parentId, setParentId] = useState<number | null>(
    initialData?.parentId ?? defaultParentId,
  );
  const [level, setLevel] = useState<number>(
    initialData?.level ?? (parentObj ? parentObj.level + 1 : 1),
  );
  const [nature, setNature] = useState<AccountNature>(
    initialData?.nature || parentObj?.nature || 'debit',
  );
  const [category, setCategory] = useState<AccountCategory>(
    initialData?.category || parentObj?.category || 'asset',
  );
  const [isPostable, setIsPostable] = useState(initialData?.isPostable ?? true);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [trackCustomer, setTrackCustomer] = useState(initialData?.trackCustomer ?? false);
  const [trackSupplier, setTrackSupplier] = useState(initialData?.trackSupplier ?? false);
  const [trackEmployee, setTrackEmployee] = useState(initialData?.trackEmployee ?? false);
  const [trackProject, setTrackProject] = useState(initialData?.trackProject ?? false);
  const [trackCostItem, setTrackCostItem] = useState(initialData?.trackCostItem ?? false);
  const [trackBankAccount, setTrackBankAccount] = useState(initialData?.trackBankAccount ?? false);
  const [trackItem, setTrackItem] = useState(initialData?.trackItem ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode.trim() || !name.trim()) {
      showErrorToast('Vui lòng nhập Số hiệu TK và Tên tài khoản.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        accountCode: accountCode.trim(),
        name: name.trim(),
        englishName: englishName.trim() || null,
        regime,
        parentId,
        level,
        isPostable,
        nature,
        category,
        trackCustomer,
        trackSupplier,
        trackEmployee,
        trackProject,
        trackCostItem,
        trackBankAccount,
        trackItem,
        isActive,
      };
      const saved = initialData
        ? await updateAccount(initialData.id, payload)
        : await createAccount(payload);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(initialData ? 'Đã cập nhật tài khoản kế toán' : 'Đã tạo tài khoản kế toán');
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Lỗi lưu tài khoản kế toán');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Số hiệu TK *" fullWidth disabled={Boolean(initialData?.isSystem)} value={accountCode} placeholder="VD: 11111" onChange={(e) => setAccountCode(e.target.value)} />
        <div className="sm:col-span-2">
          <Input label="Tên tài khoản *" fullWidth value={name} placeholder="VD: Tiền mặt tại quỹ" onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Tên tiếng Anh" fullWidth value={englishName} placeholder="Cash on hand" onChange={(e) => setEnglishName(e.target.value)} />
        <Select
          label="Tài khoản cha (Cấp trên)"
          fullWidth
          searchable
          value={parentId ?? ''}
          options={[
            { value: '', label: '-- Tài khoản Cấp 1 (Gốc) --' },
            ...allAccounts.filter((a) => a.id !== initialData?.id).map((a) => ({ value: a.id, label: `${a.accountCode} - ${a.name}` })),
          ]}
          onChange={(e) => {
            const pid = e.target.value ? Number(e.target.value) : null;
            const p = allAccounts.find((a) => a.id === pid);
            setParentId(pid);
            setLevel(p ? p.level + 1 : 1);
            if (p) { setNature(p.nature); setCategory(p.category); }
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Select
          label="Chế độ kế toán" fullWidth value={regime}
          options={[
            { value: 'both', label: ACCOUNTING_REGIME_MAP.both.shortLabel || 'Cả 2' },
            { value: 'tt200', label: ACCOUNTING_REGIME_MAP.tt200.shortLabel || 'TT200' },
            { value: 'tt133', label: ACCOUNTING_REGIME_MAP.tt133.shortLabel || 'TT133' },
          ]}
          onChange={(e) => setRegime(e.target.value as AccountRegimeScope)}
        />
        <Select label="Tính chất *" fullWidth value={nature} options={ACCOUNT_NATURE_OPTIONS} onChange={(e) => setNature(e.target.value as AccountNature)} />
        <Select label="Nhóm TK *" fullWidth value={category} options={ACCOUNT_CATEGORY_OPTIONS} onChange={(e) => setCategory(e.target.value as AccountCategory)} />
        <Input label="Bậc / Cấp" type="number" min={1} max={10} fullWidth value={level} onChange={(e) => setLevel(Math.max(1, Number(e.target.value) || 1))} />
      </div>

      <div className="flex flex-wrap gap-6 py-1">
        <Switch label="Cho phép định khoản chi tiết (TK lá)" checked={isPostable} onChange={(e) => setIsPostable(e.target.checked)} />
        <Switch label="Đang hoạt động" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="text-xs font-semibold text-slate-700">Theo dõi chi tiết theo đối tượng / chiều phân tích:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Checkbox label="Khách hàng" checked={trackCustomer} onChange={(e) => setTrackCustomer(e.target.checked)} />
          <Checkbox label="Nhà cung cấp" checked={trackSupplier} onChange={(e) => setTrackSupplier(e.target.checked)} />
          <Checkbox label="Nhân viên" checked={trackEmployee} onChange={(e) => setTrackEmployee(e.target.checked)} />
          <Checkbox label="Công trình" checked={trackProject} onChange={(e) => setTrackProject(e.target.checked)} />
          <Checkbox label="Khoản mục CP" checked={trackCostItem} onChange={(e) => setTrackCostItem(e.target.checked)} />
          <Checkbox label="TK Ngân hàng" checked={trackBankAccount} onChange={(e) => setTrackBankAccount(e.target.checked)} />
          <Checkbox label="Vật tư kho" checked={trackItem} onChange={(e) => setTrackItem(e.target.checked)} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting}>{initialData ? 'Lưu thay đổi' : 'Thêm tài khoản'}</Button>
      </div>
    </form>
  );
}
