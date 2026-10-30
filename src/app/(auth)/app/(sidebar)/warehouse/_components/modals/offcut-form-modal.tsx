'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Button, Input, Modal, Select } from '@/components';
import { WarehouseItem, BrandColor } from '@/types';
import { createWarehouseOffcut, getBrandColors } from '@/actions';

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
  const [brandColors, setBrandColors] = useState<BrandColor[]>([]);

  // Tải danh mục màu sắc khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    getBrandColors({ limit: 100 })
      .then((res) => {
        if (isMounted && res?.items) {
          setBrandColors(res.items);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải danh mục màu sắc:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Tự động chọn mặt hàng profile đầu tiên khi mở modal
  useEffect(() => {
    if (isOpen && profileItems.length > 0 && !selectedItemId) {
      const first = profileItems[0];
      setSelectedItemId(String(first.id));
      if (first.profileBarId) setProfileBarId(first.profileBarId);
      if (first.colorId) setColorId(first.colorId);
    }
  }, [isOpen, profileItems, selectedItemId]);

  const handleItemSelect = (itemIdStr: string) => {
    setSelectedItemId(itemIdStr);
    const item = profileItems.find((p) => p.id === Number(itemIdStr));
    if (item) {
      if (item.profileBarId) setProfileBarId(item.profileBarId);
      if (item.colorId) setColorId(item.colorId);
    }
  };

  const selectedProfileItem = useMemo(
    () => profileItems.find((p) => p.id === Number(selectedItemId)),
    [profileItems, selectedItemId]
  );

  // Danh sách lựa chọn màu sắc (kết hợp brandColors và các màu có trong kho)
  const colorOptions = useMemo(() => {
    const list: { value: number; label: string }[] = [];
    const seen = new Set<number>();

    brandColors.forEach((c) => {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        list.push({
          value: c.id,
          label: `${c.name} (${c.code})`,
        });
      }
    });

    profileItems.forEach((p) => {
      if (p.colorId && !seen.has(p.colorId)) {
        seen.add(p.colorId);
        list.push({
          value: p.colorId,
          label: p.colorName ? `${p.colorName} (#${p.colorId})` : `Màu #${p.colorId}`,
        });
      }
    });

    if (colorId && !seen.has(colorId)) {
      list.push({
        value: colorId,
        label: `Màu #${colorId}`,
      });
    }

    return list;
  }, [brandColors, profileItems, colorId]);

  const currentColor = useMemo(
    () => brandColors.find((c) => c.id === colorId),
    [brandColors, colorId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const len = Number(lengthMm);
    if (!len || len < 1000) {
      toast.error('Theo quy chuẩn, chỉ thu hồi thanh nhôm thừa có chiều dài từ 1000mm (1.0m) trở lên');
      return;
    }

    const finalProfileBarId = profileBarId || selectedProfileItem?.profileBarId;
    if (!finalProfileBarId) {
      toast.error('Vui lòng chọn mặt hàng profile để xác định mã profile bar');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWarehouseOffcut({
        profileBarId: finalProfileBarId,
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

  if (!isOpen) return null;

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

        {/* 1. Chọn mặt hàng profile gốc */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Chọn Mặt Hàng Profile Gốc <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedItemId}
            onChange={(e) => handleItemSelect(e.target.value)}
            options={
              profileItems.length > 0
                ? profileItems.map((item) => ({
                    value: item.id,
                    label: `[${item.itemCode}] ${item.itemName}${item.brandName ? ` - ${item.brandName}` : ''}`,
                  }))
                : [{ value: '', label: '-- Không có mặt hàng profile trong kho --' }]
            }
            required
          />
        </div>

        {/* 2. Grid Profile Bar (Auto-fill) & Màu Sắc (Selectbox) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mã Profile Bar (Tự Động)
            </label>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 h-[38px]">
              <span className="font-mono font-bold text-emerald-700">
                #{profileBarId || '-'}
              </span>
              <span
                className="text-[11px] font-medium text-slate-500 truncate max-w-[110px]"
                title={selectedProfileItem?.itemCode}
              >
                {selectedProfileItem?.itemCode || 'Tự điền'}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Màu Sắc Nhôm <span className="text-red-500">*</span>
              </label>
              {currentColor?.colorHex && (
                <span
                  className="inline-block w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs"
                  style={{ backgroundColor: currentColor.colorHex }}
                  title={currentColor.colorHex}
                />
              )}
            </div>
            <Select
              value={colorId}
              onChange={(e) => setColorId(Number(e.target.value))}
              options={colorOptions}
              required
            />
          </div>
        </div>

        {/* 3. Chiều dài đoạn thừa */}
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

        {/* 4. Vị trí kệ */}
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

        {/* 5. Ghi chú thu hồi */}
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
