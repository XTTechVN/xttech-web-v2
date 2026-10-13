'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { Button, Input, Modal, Select } from '@/components';
import { WarehouseItem } from '@/types';
import { createWarehouseOffcut } from '@/actions';

interface OffcutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profileItems?: WarehouseItem[];
}

export function OffcutFormModal({
  isOpen,
  onClose,
  onSuccess,
  profileItems = [],
}: OffcutFormModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [profileBarId, setProfileBarId] = useState<number>(1);
  const [colorId, setColorId] = useState<number>(1);
  const [lengthMm, setLengthMm] = useState('1500');
  const [location, setLocation] = useState('Kệ Nhôm Thừa A1');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleItemSelect = (itemIdStr: string) => {
    setSelectedItemId(itemIdStr);
    const item = profileItems.find((p) => p.id === Number(itemIdStr));
    if (item) {
      if (item.profileBarId) setProfileBarId(item.profileBarId);
      if (item.colorId) setColorId(item.colorId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const len = Number(lengthMm);
    if (!len || len < 1000) {
      toast.error('Theo quy chuẩn, chỉ thu hồi thanh nhôm thừa có chiều dài từ 1000mm (1.0m) trở lên');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWarehouseOffcut({
        profileBarId: profileBarId || 1,
        colorId: colorId || 1,
        lengthMm: len,
        location: location.trim() || undefined,
        note: note.trim() || undefined,
      });
      toast.success(`Đã thu hồi thanh nhôm thừa ${len}mm vào kho thành công!`);
      setNote('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || 'Lỗi nhập kho nhôm thừa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleNode = (
    <div className="flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-emerald-600" />
      <span>Thu Hồi Nhôm Thừa Tái Sử Dụng</span>
    </div>
  );

  const footerNode = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </Button>
      <Button type="submit" form="offcut-form" variant="primary" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Đang Nhập Kho...' : 'Xác Nhận Thu Hồi Nhôm Thừa'}
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
      <form id="offcut-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-blue-600 mt-0.5" />
            <span>
              Hệ thống thuật toán cắt nhôm (1D Cutting Stock) sẽ tự động ưu tiên quét và ghép thanh nhôm thừa này cho các đơn hàng tiếp theo để tiết kiệm nhôm nguyên cây 6m.
            </span>
          </div>

          {profileItems.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Chọn Mặt Hàng Profile Gốc (Tùy chọn)
              </label>
              <Select
                value={selectedItemId}
                onChange={(e) => handleItemSelect(e.target.value)}
                options={[
                  { value: '', label: '-- Tự nhập mã hệ / màu nhôm --' },
                  ...profileItems.map((item) => ({
                    value: item.id,
                    label: `[${item.itemCode}] ${item.itemName}`,
                  })),
                ]}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã Profile Bar ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={profileBarId}
                onChange={(e) => setProfileBarId(Number(e.target.value))}
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã Màu (Color ID) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={colorId}
                onChange={(e) => setColorId(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Chiều Dài Đoạn Thừa (mm) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                value={lengthMm}
                onChange={(e) => setLengthMm(e.target.value)}
                placeholder="1500"
                min={1000}
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                mm (&ge; 1000mm)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Vị Trí Kệ / Giá Nhôm Thừa
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Kệ A1, Giá C2..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi Chú Thu Hồi
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cắt thừa từ Lệnh SX #04..."
            />
          </div>

        </form>
    </Modal>
  );
}
