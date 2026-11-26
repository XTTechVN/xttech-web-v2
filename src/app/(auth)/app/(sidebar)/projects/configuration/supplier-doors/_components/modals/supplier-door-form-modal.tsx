'use client';

import React, { useState } from 'react';
import { Building2, Plus, Store } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getWarehouseSuppliers } from '@/actions';
import { Button, Input, Modal, Select, Switch } from '@/components';
import { SupplierFormModal } from '@/components/warehouse/modals/supplier-form-modal';
import type { SupplierDoor, SupplierDoorImage, WarehouseSupplier } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { SUPPLIER_DOOR_TYPE_OPTIONS } from '../../_constants/supplier-doors.constants';
import {
  type NewSupplierImagePreview,
  SupplierDoorImagesField,
} from '../supplier-door-images-field';
import { submitSupplierDoorForm } from './supplier-door-submit';

export interface SupplierDoorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SupplierDoor | null;
}

export function SupplierDoorFormModal(props: SupplierDoorFormModalProps) {
  const modalKey = `${props.initialData?.id ?? 'new'}-${props.isOpen ? 'open' : 'closed'}`;
  return <SupplierDoorFormModalInner key={modalKey} {...props} />;
}

function SupplierDoorFormModalInner({ isOpen, onClose, initialData }: SupplierDoorFormModalProps) {
  const isEdit = Boolean(initialData);
  const initialImages = initialData?.images ?? [];
  const defaultPrimary =
    initialImages.find((img) => img.isPrimary)?.id ?? initialImages[0]?.id ?? null;

  const [supplierId, setSupplierId] = useState<string>(
    initialData?.supplierId ? String(initialData.supplierId) : '',
  );
  const [code, setCode] = useState(initialData?.code ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [doorType, setDoorType] = useState(initialData?.doorType ?? 'composite_wood');
  const [referenceCostPerSqm, setReferenceCostPerSqm] = useState(
    initialData?.referenceCostPerSqm ? String(initialData.referenceCostPerSqm) : '',
  );
  const [specification, setSpecification] = useState(initialData?.specification ?? '');
  const [isActive, setIsActive] = useState(initialData ? initialData.isActive : true);
  const [existingImages, setExistingImages] = useState<SupplierDoorImage[]>(initialImages);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<number | null>(defaultPrimary);
  const [newImages, setNewImages] = useState<NewSupplierImagePreview[]>([]);
  const [newPrimaryIdx, setNewPrimaryIdx] = useState<number>(0);
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);

  const { data: suppliersData } = useQuery({
    queryKey: ['warehouse-suppliers', 'door_set'],
    queryFn: () => getWarehouseSuppliers({ supplier_type: 'door_set', is_active: true, limit: 200 }),
    enabled: isOpen,
  });

  const suppliersList = suppliersData?.items ?? [];

  const { mutate: saveMutation, isPending } = useMutation({
    mutationFn: () =>
      submitSupplierDoorForm({
        initialData,
        supplierId,
        code,
        name,
        doorType,
        specification,
        referenceCostPerSqm,
        isActive,
        existingImages,
        deletedImageIds,
        primaryImageId,
        newFiles: newImages.map((item) => item.file),
        newPrimaryIdx,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-doors'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-doors-stats'] });
      toast.success(isEdit ? 'Cập nhật mẫu cửa NCC thành công' : 'Thêm mẫu cửa NCC thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Không thể lưu mẫu cửa NCC'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    const mapped = selected.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...mapped]);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error('Vui lòng chọn nhà cung cấp');
    if (!code.trim()) return toast.error('Vui lòng nhập mã mẫu cửa');
    if (!name.trim()) return toast.error('Vui lòng nhập tên mẫu cửa');
    saveMutation();
  };

  const handleQuickSupplierSuccess = (created?: WarehouseSupplier) => {
    queryClient.invalidateQueries({ queryKey: ['warehouse-suppliers'] });
    if (created?.id) setSupplierId(String(created.id));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <span>{isEdit ? `Sửa Mẫu Cửa NCC: ${initialData?.code}` : 'Thêm Mẫu Cửa Nhập Nguyên Bộ'}</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Hủy bỏ
            </Button>
            <Button type="submit" form="supplier-door-form" variant="primary" size="sm" loading={isPending}>
              {isEdit ? 'Lưu thay đổi' : 'Tạo mẫu cửa'}
            </Button>
          </div>
        }
      >
        <form id="supplier-door-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nhà cung cấp cửa nguyên bộ <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    options={[
                      { value: '', label: '-- Chọn nhà cung cấp --' },
                      ...suppliersList.map((s) => ({
                        value: String(s.id),
                        label: `${s.name}${s.phone ? ` (${s.phone})` : ''}`,
                      })),
                    ]}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-10"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsQuickSupplierOpen(true)}
                >
                  Tạo nhanh NCC
                </Button>
              </div>
              {suppliersList.length === 0 && (
                <p className="mt-1 text-xs text-amber-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Chưa có nhà cung cấp loại cửa nguyên bộ. Nhấn &ldquo;Tạo nhanh NCC&rdquo; để thêm mới.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã mẫu NCC <span className="text-red-500">*</span>
              </label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: COMP-01" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phân loại cửa
              </label>
              <Select value={doorType} onChange={(e) => setDoorType(e.target.value)} options={SUPPLIER_DOOR_TYPE_OPTIONS} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên mẫu cửa <span className="text-red-500">*</span>
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Cửa nhựa gỗ Composite phào nổi" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Đơn giá tham khảo (VNĐ/m²)
              </label>
              <Input
                type="number"
                min={0}
                value={referenceCostPerSqm}
                onChange={(e) => setReferenceCostPerSqm(e.target.value)}
                placeholder="0"
                className="font-mono tabular-nums text-right"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 bg-slate-50/70">
              <div>
                <p className="text-xs font-semibold text-slate-700">Trạng thái sử dụng</p>
                <p className="text-[11px] text-slate-500">{isActive ? 'Hiển thị khi chọn cửa dự án' : 'Tạm ẩn'}</p>
              </div>
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quy cách / Thông số kỹ thuật
              </label>
              <textarea
                rows={3}
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                placeholder="Độ dày cánh, chất liệu, phụ kiện đi kèm, màu film..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <SupplierDoorImagesField
            doorName={name}
            existingImages={existingImages}
            newImages={newImages}
            primaryImageId={primaryImageId}
            newPrimaryIdx={newPrimaryIdx}
            onAddFiles={handleFileChange}
            onSelectExistingPrimary={setPrimaryImageId}
            onRemoveExisting={(imgId) => {
              const nextExisting = existingImages.filter((item) => item.id !== imgId);
              setExistingImages(nextExisting);
              setDeletedImageIds((prev) => [...prev, imgId]);
              if (primaryImageId === imgId) {
                setPrimaryImageId(newImages.length === 0 ? (nextExisting[0]?.id ?? null) : null);
              }
            }}
            onSelectNewPrimary={(idx) => {
              setPrimaryImageId(null);
              setNewPrimaryIdx(idx);
            }}
            onRemoveNew={(id) => {
              const removedIdx = newImages.findIndex((item) => item.id === id);
              const nextImages = newImages.filter((item) => item.id !== id);
              setNewImages(nextImages);
              if (nextImages.length === 0) {
                setNewPrimaryIdx(0);
                if (primaryImageId === null && existingImages.length > 0) {
                  setPrimaryImageId(existingImages[0].id);
                }
              } else if (removedIdx === newPrimaryIdx || newPrimaryIdx >= nextImages.length) {
                setNewPrimaryIdx(0);
              } else if (removedIdx !== -1 && removedIdx < newPrimaryIdx) {
                setNewPrimaryIdx(newPrimaryIdx - 1);
              }
            }}
          />
        </form>
      </Modal>

      <SupplierFormModal
        isOpen={isQuickSupplierOpen}
        onClose={() => setIsQuickSupplierOpen(false)}
        onSuccess={handleQuickSupplierSuccess}
        defaultType="door_set"
      />
    </>
  );
}
