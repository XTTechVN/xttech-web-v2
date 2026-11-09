'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';
import { Button, Input, Modal, Select, Switch, type SelectOption } from '@/components';
import { SupplierType, WarehouseSupplier } from '@/types';
import { createWarehouseSupplier, updateWarehouseSupplier } from '@/actions';
import { SUPPLIER_TYPE_MAP } from '@/config';
import { showErrorToast } from '@/utils';

export interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSupplier?: WarehouseSupplier) => void;
  initialData?: WarehouseSupplier | null;
}

const SUPPLIER_TYPE_OPTIONS: SelectOption[] = Object.entries(SUPPLIER_TYPE_MAP)
  .filter(([key]) => key !== 'glass')
  .map(([key, label]) => ({
    value: key,
    label,
  }));

export function SupplierFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: SupplierFormModalProps) {
  const [name, setName] = useState('');
  const [supplierType, setSupplierType] = useState<SupplierType>('aluminum');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSupplierType(initialData.supplierType);
      setPhone(initialData.phone);
      setContactName(initialData.contactName || '');
      setAddress(initialData.address || '');
      setTaxCode(initialData.taxCode || '');
      setBankAccount(initialData.bankAccount || '');
      setIsActive(initialData.isActive !== false);
    } else {
      setName('');
      setSupplierType('aluminum');
      setPhone('');
      setContactName('');
      setAddress('');
      setTaxCode('');
      setBankAccount('');
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }
    if (!phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        supplierType,
        phone: phone.trim(),
        contactName: contactName.trim() || undefined,
        address: address.trim() || undefined,
        taxCode: taxCode.trim() || undefined,
        bankAccount: bankAccount.trim() || undefined,
        isActive,
      };

      if (initialData) {
        const updated = await updateWarehouseSupplier(initialData.id, payload);
        toast.success('Cập nhật thông tin nhà cung cấp thành công');
        onSuccess(updated);
      } else {
        const created = await createWarehouseSupplier(payload);
        toast.success('Thêm nhà cung cấp mới thành công');
        onSuccess(created);
      }

      onClose();
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi lưu nhà cung cấp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleNode = (
    <div className="flex items-center gap-2">
      <Building2 className="w-5 h-5 text-indigo-600" />
      <span>{initialData ? `Sửa Nhà Cung Cấp: ${initialData.code}` : 'Thêm Nhà Cung Cấp Mới'}</span>
    </div>
  );

  const footerNode = (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
        Hủy Bỏ
      </Button>
      <Button type="submit" form="supplier-form" variant="primary" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Đang Lưu...' : initialData ? 'Lưu Thay Đổi' : 'Lưu Nhà Cung Cấp'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleNode}
      size="md"
      footer={footerNode}
    >
      <form id="supplier-form" onSubmit={handleSubmit} className="space-y-4">
        {initialData && (
          <div
            className={`p-3 rounded-lg border transition-colors flex items-center justify-between ${
              isActive ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Trạng Thái Hợp Tác
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {isActive ? 'Đang Hợp Tác' : 'Ngừng Hợp Tác'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isActive
                  ? 'Cho phép đặt hàng và lập phiếu nhập/xuất kho từ NCC này.'
                  : 'Tạm khóa phát sinh giao dịch mới với NCC này.'}
              </p>
            </div>
            <div className="pl-3">
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tên Nhà Cung Cấp / Công Ty <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Cty TNHH Nhôm Xingfa Việt Nam"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Phân Loại Nhà Cung Cấp <span className="text-red-500">*</span>
            </label>
            <Select
              value={supplierType}
              onChange={(e) => setSupplierType(e.target.value as SupplierType)}
              options={SUPPLIER_TYPE_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Số Điện Thoại Liên Hệ <span className="text-red-500">*</span>
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987654321"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Người Đại Diện / Kinh Doanh
            </label>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mã Số Thuế
            </label>
            <Input
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              placeholder="0101234567"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Địa Chỉ Văn Phòng / Kho Xưởng
          </label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="KCN Quang Minh, Mê Linh, Hà Nội"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tài Khoản Ngân Hàng Thanh Toán
          </label>
          <Input
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="1903xxx - Techcombank chi nhánh Thăng Long"
          />
        </div>
      </form>
    </Modal>
  );
}
