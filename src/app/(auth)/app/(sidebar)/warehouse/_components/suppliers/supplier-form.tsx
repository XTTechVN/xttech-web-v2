'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createWarehouseSupplier, updateWarehouseSupplier } from '@/actions';
import { Input } from '@/components';
import { Chip, Select } from '@/components-remake';
import { SUPPLIER_TYPE_MAP } from '@/config';
import type { SupplierType, WarehouseSupplier } from '@/types';
import { showErrorToast } from '@/utils';
import { refreshWarehouse } from '../format';

export const SUPPLIER_FORM_ID = 'supplier-form';

// Nhà máy kính do luồng đặt kính quản lý, không thêm ở đây
const TYPE_OPTIONS = Object.entries(SUPPLIER_TYPE_MAP)
  .filter(([value]) => value !== 'glass')
  .map(([value, label]) => ({ value, label }));

interface Props {
  /** Có = sửa; không có = thêm mới */
  initial?: WarehouseSupplier;
  onDone: (supplier: WarehouseSupplier) => void;
  onPendingChange: (pending: boolean) => void;
}

export function SupplierForm({ initial, onDone, onPendingChange }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<string>(initial?.supplierType ?? 'aluminum');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [contactName, setContactName] = useState(initial?.contactName ?? '');
  const [taxCode, setTaxCode] = useState(initial?.taxCode ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [bankAccount, setBankAccount] = useState(initial?.bankAccount ?? '');
  const [active, setActive] = useState(initial ? initial.isActive !== false : true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));
  const text = (v: string) => v.trim() || undefined;

  const save = useMutation({
    mutationFn: () => {
      const data = {
        name: name.trim(),
        supplierType: type as SupplierType,
        phone: phone.trim(),
        contactName: text(contactName),
        address: text(address),
        taxCode: text(taxCode),
        bankAccount: text(bankAccount),
        isActive: active,
      };
      return initial ? updateWarehouseSupplier(initial.id, data) : createWarehouseSupplier(data);
    },
    onSuccess: (supplier) => {
      refreshWarehouse();
      toast.success(initial ? 'Đã cập nhật nhà cung cấp' : 'Đã thêm nhà cung cấp');
      onDone(supplier);
    },
    onError: (e) => showErrorToast(e, 'Không thể lưu nhà cung cấp'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Vui lòng nhập tên nhà cung cấp';
    if (!phone.trim()) next.phone = 'Vui lòng nhập số điện thoại';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={SUPPLIER_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input
        label="Tên nhà cung cấp *"
        placeholder="Ví dụ: Công ty TNHH Nhôm Xingfa Việt Nam"
        fullWidth
        value={name}
        error={errors.name}
        onChange={(e) => {
          setName(e.target.value);
          touch('name');
        }}
      />
      <Select
        side
        label="Phân loại"
        value={type}
        options={initial?.supplierType === 'glass' ? [{ value: 'glass', label: SUPPLIER_TYPE_MAP.glass }, ...TYPE_OPTIONS] : TYPE_OPTIONS}
        onChange={setType}
      />
      <Input
        label="Số điện thoại *"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0987654321"
        fullWidth
        value={phone}
        error={errors.phone}
        onChange={(e) => {
          setPhone(e.target.value);
          touch('phone');
        }}
      />
      <Input label="Người liên hệ" placeholder="Nguyễn Văn A" fullWidth value={contactName} onChange={(e) => setContactName(e.target.value)} />
      <Input label="Mã số thuế" inputMode="numeric" placeholder="0101234567" fullWidth value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
      <Input label="Địa chỉ" placeholder="Địa chỉ văn phòng hoặc kho xưởng" fullWidth value={address} onChange={(e) => setAddress(e.target.value)} />
      <Input
        label="Tài khoản ngân hàng"
        placeholder="Số tài khoản - Ngân hàng"
        fullWidth
        value={bankAccount}
        onChange={(e) => setBankAccount(e.target.value)}
      />
      {initial && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-500">Trạng thái hợp tác</span>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
            <Chip selected={active} onClick={() => setActive(true)}>
              Đang hợp tác
            </Chip>
            <Chip selected={!active} onClick={() => setActive(false)}>
              Ngừng hợp tác
            </Chip>
          </div>
        </div>
      )}
    </form>
  );
}
