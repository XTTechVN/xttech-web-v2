'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Input, Select, Switch } from '@/components';
import {
  createAutoPostingTemplate,
  getAccounts,
  getCostItems,
  updateAutoPostingTemplate,
} from '@/actions/finance';
import {
  ACCOUNTING_REGIME_OPTIONS,
  CASHFLOW_CODE_OPTIONS,
  VOUCHER_TYPE_OPTIONS,
} from '@/config/finance';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type {
  AccountingRegime,
  AutoPostingTemplate,
  VoucherType,
} from '@/types';

export interface AutoPostingFormBodyProps {
  initialData?: AutoPostingTemplate | null;
  defaultRegime?: AccountingRegime;
  onClose: () => void;
  onSuccess?: (template: AutoPostingTemplate) => void;
}

export function AutoPostingFormBody({
  initialData,
  defaultRegime = 'tt99',
  onClose,
  onSuccess,
}: AutoPostingFormBodyProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: accountsRes } = useQuery({
    queryKey: ['finance', 'accounts', 'all'],
    queryFn: () => getAccounts({ limit: 500 }),
    staleTime: 60_000,
  });
  const { data: costItemsRes } = useQuery({
    queryKey: ['finance', 'cost-items', 'all'],
    queryFn: () => getCostItems({ limit: 200 }),
    staleTime: 60_000,
  });

  const accountOptions = useMemo(
    () =>
      (accountsRes?.items || [])
        .filter((a) => a.isPostable && a.isActive)
        .map((a) => ({ value: a.id, label: `${a.accountCode} - ${a.name}` })),
    [accountsRes],
  );

  const [code, setCode] = useState(initialData?.code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [voucherType, setVoucherType] = useState<VoucherType>(
    initialData?.voucherType || 'cash_payment',
  );
  const [regime, setRegime] = useState<AccountingRegime>(
    initialData?.regime || defaultRegime,
  );
  const [debitAccountId, setDebitAccountId] = useState<number>(
    initialData?.debitAccountId || 0,
  );
  const [creditAccountId, setCreditAccountId] = useState<number>(
    initialData?.creditAccountId || 0,
  );
  const [defaultCostItemId, setDefaultCostItemId] = useState<number | null>(
    initialData?.defaultCostItemId ?? null,
  );
  const [defaultHasValidInvoice, setDefaultHasValidInvoice] = useState<boolean>(
    initialData?.defaultHasValidInvoice ?? false,
  );
  const [defaultCashflowCode, setDefaultCashflowCode] = useState<string>(
    initialData?.defaultCashflowCode || '',
  );
  const [requiresProject, setRequiresProject] = useState(initialData?.requiresProject ?? false);
  const [workshopVisible, setWorkshopVisible] = useState(initialData?.workshopVisible ?? true);
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 10);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !debitAccountId || !creditAccountId) {
      showErrorToast('Vui lòng nhập Mã, Tên mẫu và chọn đủ TK Nợ / TK Có.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        code: code.trim(),
        name: name.trim(),
        voucherType,
        regime,
        debitAccountId,
        creditAccountId,
        defaultCostItemId,
        defaultHasValidInvoice,
        defaultCashflowCode: defaultCashflowCode || null,
        requiresProject,
        workshopVisible,
        sortOrder,
        isActive,
      };
      const saved = initialData
        ? await updateAutoPostingTemplate(initialData.id, payload)
        : await createAutoPostingTemplate(payload);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(
        initialData ? 'Đã cập nhật mẫu định khoản' : 'Đã tạo mẫu định khoản nhanh',
      );
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Lỗi lưu mẫu định khoản');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Mã mẫu *" fullWidth value={code} placeholder="VD: CHI_COM_THO" onChange={(e) => setCode(e.target.value)} />
        <div className="sm:col-span-2">
          <Input label="Tên lý do / Nghiệp vụ hiển thị *" fullWidth value={name} placeholder="VD: Chi tiền cơm thợ & sinh hoạt xưởng" onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Loại chứng từ *" fullWidth value={voucherType}
          options={VOUCHER_TYPE_OPTIONS.filter((v) => v.value !== 'closing_entry' && v.value !== 'opening_balance')}
          onChange={(e) => setVoucherType(e.target.value as VoucherType)}
        />
        <Select label="Thông tư *" fullWidth value={regime} options={ACCOUNTING_REGIME_OPTIONS} onChange={(e) => setRegime(e.target.value as AccountingRegime)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select label="TK Nợ mặc định *" fullWidth searchable placeholder="Chọn TK Nợ..." value={debitAccountId || ''} options={accountOptions} onChange={(e) => setDebitAccountId(Number(e.target.value))} />
        <Select label="TK Có mặc định *" fullWidth searchable placeholder="Chọn TK Có..." value={creditAccountId || ''} options={accountOptions} onChange={(e) => setCreditAccountId(Number(e.target.value))} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Select
            label="Khoản mục chi phí mặc định" fullWidth searchable value={defaultCostItemId ?? ''}
            options={[{ value: '', label: '-- Không gắn --' }, ...(costItemsRes?.items || []).filter((c) => c.isActive).map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` }))]}
            onChange={(e) => setDefaultCostItemId(e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <Input label="Thứ tự sắp xếp" type="number" fullWidth value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
      </div>

      <Select
        label="Mã dòng tiền B03-DN mặc định (Tùy chọn)"
        fullWidth
        searchable
        value={defaultCashflowCode}
        options={[
          { value: '', label: '-- Tự động xác định theo TK đối ứng --' },
          ...CASHFLOW_CODE_OPTIONS,
        ]}
        onChange={(e) => setDefaultCashflowCode(e.target.value)}
      />

      <div className="flex flex-wrap gap-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <Checkbox label="Mặc định có Hóa đơn GTGT hợp lệ" checked={defaultHasValidInvoice} onChange={(e) => setDefaultHasValidInvoice(e.target.checked)} />
        <Checkbox label="Hiển thị tại Chế độ Xưởng (Thủ quỹ dùng nhanh)" checked={workshopVisible} onChange={(e) => setWorkshopVisible(e.target.checked)} />
        <Checkbox label="Bắt buộc chọn Công trình" checked={requiresProject} onChange={(e) => setRequiresProject(e.target.checked)} />
        <Switch label="Đang hoạt động" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting}>{initialData ? 'Lưu thay đổi' : 'Thêm mẫu định khoản'}</Button>
      </div>
    </form>
  );
}
