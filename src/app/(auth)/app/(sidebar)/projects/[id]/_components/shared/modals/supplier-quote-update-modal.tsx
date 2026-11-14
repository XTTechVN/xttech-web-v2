'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BadgeDollarSign, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWarehouseSuppliers, updateSupplierPositionQuote } from '@/actions';
import { Button, Input, Modal, Select, Switch } from '@/components';
import { POSITION_COST_STATUS_MAP, POSITION_VISUAL_MODE_MAP } from '@/config';
import type { PositionCostStatus, PositionVisualMode, ProjectDoorPosition } from '@/types';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';

export interface SupplierQuoteUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  position: ProjectDoorPosition | null;
  onSaved?: (updated: ProjectDoorPosition) => void;
}

export function SupplierQuoteUpdateModal(props: SupplierQuoteUpdateModalProps) {
  const modalKey = `${props.position?.id ?? 'none'}-${props.isOpen ? 'open' : 'closed'}`;
  return <SupplierQuoteUpdateInner key={modalKey} {...props} />;
}

function SupplierQuoteUpdateInner({
  isOpen,
  onClose,
  projectId,
  position,
  onSaved,
}: SupplierQuoteUpdateModalProps) {
  const [supplierId, setSupplierId] = useState<string>(
    position?.supplierId ? String(position.supplierId) : '',
  );
  const [supplierCostPrice, setSupplierCostPrice] = useState<string>(
    position?.supplierCostPrice ? String(position.supplierCostPrice) : '0',
  );
  const [costStatus, setCostStatus] = useState<PositionCostStatus>(
    position?.costStatus ?? 'confirmed',
  );
  const [isInstallationIncluded, setIsInstallationIncluded] = useState<boolean>(
    position?.isInstallationIncluded ?? false,
  );
  const [visualMode, setVisualMode] = useState<PositionVisualMode>(
    position?.visualMode ?? 'custom_image',
  );
  const [description, setDescription] = useState<string>(position?.description ?? '');
  const [measureNote, setMeasureNote] = useState<string>(position?.measureNote ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeCustomImage, setRemoveCustomImage] = useState<boolean>(false);

  const { data: suppliersData } = useQuery({
    queryKey: ['warehouse-suppliers', 'door_set'],
    queryFn: () => getWarehouseSuppliers({ supplier_type: 'door_set', is_active: true, limit: 200 }),
    enabled: isOpen,
  });

  const existingCustomUrl =
    !removeCustomImage && position?.customImagePath ? getFileUrl(position.customImagePath) : null;
  const activeImageUrl = previewUrl ?? existingCustomUrl;

  const { mutate: saveQuoteMutation, isPending } = useMutation({
    mutationFn: async () => {
      if (!position) throw new Error('Không tìm thấy vị trí cửa');
      const parsedCost = Number(supplierCostPrice.replace(/[^\d.]/g, '')) || 0;
      const nextVisualMode: PositionVisualMode =
        selectedFile && visualMode !== 'custom_image' ? 'custom_image' : visualMode;

      return updateSupplierPositionQuote(projectId, position.id, {
        data: {
          supplierId: supplierId ? Number(supplierId) : null,
          supplierCostPrice: parsedCost,
          costStatus,
          isInstallationIncluded,
          visualMode: nextVisualMode,
          removeCustomImage: removeCustomImage && !selectedFile,
          description: description.trim() || null,
          measureNote: measureNote.trim() || null,
        },
        file: selectedFile,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['quotation_preview', projectId] });
      queryClient.invalidateQueries({ queryKey: ['production_progress'] });
      toast.success(`Đã cập nhật báo giá NCC cho cửa ${updated.code}`);
      onSaved?.(updated);
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Không thể cập nhật báo giá NCC'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveCustomImage(false);
    setVisualMode('custom_image');
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(supplierCostPrice.replace(/[^\d.]/g, ''));
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      toast.error('Đơn giá vốn NCC không hợp lệ');
      return;
    }
    saveQuoteMutation();
  };

  const suppliers = suppliersData?.items ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="w-5 h-5 text-primary" />
          <span>Cập nhật báo giá &amp; bản vẽ NCC — {position?.code}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Đóng
          </Button>
          <Button type="submit" form="supplier-quote-form" variant="primary" size="sm" loading={isPending}>
            Lưu báo giá NCC
          </Button>
        </div>
      }
    >
      <form id="supplier-quote-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Nhà cung cấp"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={[
              { value: '', label: '-- Chọn nhà cung cấp --' },
              ...suppliers.map((s) => ({
                value: String(s.id),
                label: `${s.name}${s.phone ? ` (${s.phone})` : ''}`,
              })),
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Giá vốn trọn bộ từ NCC (VNĐ/bộ) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={0}
              value={supplierCostPrice}
              onChange={(e) => setSupplierCostPrice(e.target.value)}
              className="font-mono tabular-nums text-right"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng thái giá vốn
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['estimated', 'confirmed'] as PositionCostStatus[]).map((statusKey) => {
                const active = costStatus === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setCostStatus(statusKey)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40'
                    }`}
                  >
                    {POSITION_COST_STATUS_MAP[statusKey].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 bg-slate-50/70">
            <div>
              <p className="text-xs font-semibold text-slate-700">NCC bao gồm lắp đặt</p>
              <p className="text-[11px] text-slate-500">
                {isInstallationIncluded ? 'Không cộng thêm công lắp nội bộ' : 'Tính thêm chi phí lắp đặt'}
              </p>
            </div>
            <Switch
              checked={isInstallationIncluded}
              onChange={(e) => setIsInstallationIncluded(e.target.checked)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Chế độ hiển thị hình ảnh trên báo giá / QR
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['custom_image', 'catalog_image', 'cad'] as PositionVisualMode[]).map((modeKey) => {
                const active = visualMode === modeKey;
                return (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => setVisualMode(modeKey)}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {POSITION_VISUAL_MODE_MAP[modeKey]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Ảnh bản vẽ / báo giá chính thức từ NCC
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold cursor-pointer hover:bg-primary/10">
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh NCC gửi</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {activeImageUrl ? (
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center max-h-56 overflow-hidden">
                <img src={activeImageUrl} alt={position?.code || 'Ảnh báo giá NCC'} className="max-h-48 object-contain rounded" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setRemoveCustomImage(true);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs"
                  title="Xóa ảnh báo giá riêng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-6 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                <ImageIcon className="w-5 h-5" />
                <span>Chưa có ảnh riêng từ NCC (dùng ảnh catalog hoặc phác thảo 2D)</span>
              </div>
            )}
          </div>

          <Input
            label="Tên / Quy cách cửa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả quy cách chốt với nhà cung cấp"
          />

          <Input
            label="Ghi chú khảo sát / đặt hàng"
            value={measureNote}
            onChange={(e) => setMeasureNote(e.target.value)}
            placeholder="Ghi chú kích thước ô chờ, chiều mở..."
          />
        </div>
      </form>
    </Modal>
  );
}
