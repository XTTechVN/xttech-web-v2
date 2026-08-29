'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMaterial,
  getMaterialAccessories,
  getMaterialExtraOptions,
  getMaterialFormulas,
  assignMaterialAccessories,
  revokeMaterialAccessories,
  assignMaterialExtraOptions,
  revokeMaterialExtraOptions,
  assignMaterialFormulas,
  revokeMaterialFormulas,
} from '@/actions';
import { Loader2, Edit, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { formatMaterialUnit, EXTRA_OPTION_UNIT_MAP, type ExtraOptionUnit, formatAccessoryUnit } from '@/types';
import { Button } from '@/components';
import { MaterialUpdateModal } from '../_components/modals';
import {
  AssignAccessoriesModal,
  AssignExtraOptionsModal,
  AssignFormulasModal,
} from '../_components/relation-modals';
import { toast } from 'react-hot-toast';

interface MaterialDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = React.use(params);
  const materialId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Modal states for relations
  const [isAccessoriesModalOpen, setIsAccessoriesModalOpen] = useState(false);
  const [isExtraOptionsModalOpen, setIsExtraOptionsModalOpen] = useState(false);
  const [isFormulasModalOpen, setIsFormulasModalOpen] = useState(false);

  // Saving states for relations
  const [isSavingAccessories, setIsSavingAccessories] = useState(false);
  const [isSavingExtraOptions, setIsSavingExtraOptions] = useState(false);
  const [isSavingFormulas, setIsSavingFormulas] = useState(false);

  // 1. Fetch Material Info
  const { data: material, isLoading: isLoadingMaterial, error, } = useQuery({
    queryKey: ['materials', materialId],
    queryFn: () => getMaterial(materialId),
    enabled: !isNaN(materialId),
  });

  // 2. Fetch Active Accessories
  const {
    data: activeAccessories,
    isLoading: isLoadingAccessories,
    refetch: refetchAccessories,
  } = useQuery({
    queryKey: ['material-accessories', materialId],
    queryFn: () => getMaterialAccessories(materialId, { limit: 9999 }),
    enabled: !isNaN(materialId),
  });

  // 3. Fetch Active Extra Options
  const {
    data: activeExtraOptions,
    isLoading: isLoadingExtraOptions,
    refetch: refetchExtraOptions,
  } = useQuery({
    queryKey: ['material-extra-options', materialId],
    queryFn: () => getMaterialExtraOptions(materialId, { limit: 9999 }),
    enabled: !isNaN(materialId),
  });

  // 4. Fetch Active Formulas
  const {
    data: activeFormulas,
    isLoading: isLoadingFormulas,
    refetch: refetchFormulas,
  } = useQuery({
    queryKey: ['material-formulas', materialId],
    queryFn: () => getMaterialFormulas(materialId, { limit: 9999 }),
    enabled: !isNaN(materialId),
  });

  // Save Accessories relations
  const handleSaveAccessories = async (selectedIds: number[]) => {
    if (!activeAccessories) return;
    setIsSavingAccessories(true);
    try {
      const initialIds = activeAccessories.items.map((a) => a.id);
      const toAssign = selectedIds.filter((id) => !initialIds.includes(id));
      const toRevoke = initialIds.filter((id) => !selectedIds.includes(id));

      if (toAssign.length > 0) {
        await assignMaterialAccessories(materialId, { accessoryIds: toAssign });
      }
      if (toRevoke.length > 0) {
        await revokeMaterialAccessories(materialId, { accessoryIds: toRevoke });
      }
      toast.success('Cập nhật liên kết phụ kiện thành công');
      refetchAccessories();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết phụ kiện');
    } finally {
      setIsSavingAccessories(false);
    }
  };

  // Save Extra Options relations
  const handleSaveExtraOptions = async (selectedIds: number[]) => {
    if (!activeExtraOptions) return;
    setIsSavingExtraOptions(true);
    try {
      const initialIds = activeExtraOptions.items.map((o) => o.id);
      const toAssign = selectedIds.filter((id) => !initialIds.includes(id));
      const toRevoke = initialIds.filter((id) => !selectedIds.includes(id));

      if (toAssign.length > 0) {
        await assignMaterialExtraOptions(materialId, { extraOptionIds: toAssign });
      }
      if (toRevoke.length > 0) {
        await revokeMaterialExtraOptions(materialId, { extraOptionIds: toRevoke });
      }
      toast.success('Cập nhật liên kết tùy chọn phát sinh thành công');
      refetchExtraOptions();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết tùy chọn phát sinh');
    } finally {
      setIsSavingExtraOptions(false);
    }
  };

  // Save Formulas relations
  const handleSaveFormulas = async (selectedIds: number[]) => {
    if (!activeFormulas) return;
    setIsSavingFormulas(true);
    try {
      const initialIds = activeFormulas.items.map((f) => f.id);
      const toAssign = selectedIds.filter((id) => !initialIds.includes(id));
      const toRevoke = initialIds.filter((id) => !selectedIds.includes(id));

      if (toAssign.length > 0) {
        await assignMaterialFormulas(materialId, { formulaIds: toAssign });
      }
      if (toRevoke.length > 0) {
        await revokeMaterialFormulas(materialId, { formulaIds: toRevoke });
      }
      toast.success('Cập nhật liên kết công thức thành công');
      refetchFormulas();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết công thức');
    } finally {
      setIsSavingFormulas(false);
    }
  };

  if (isLoadingMaterial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-500 text-xs">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <p className="text-red-500 font-semibold text-sm mb-2">Không tìm thấy thông tin hệ nhôm</p>
        <Link href="/app/projects/configuration" className="text-primary text-xs font-semibold hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const formattedUpdatedAt = material.updatedAt
    ? new Date(material.updatedAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '—';

  const activeAccessoryIds = activeAccessories?.items.map((a) => a.id) || [];
  const activeExtraOptionIds = activeExtraOptions?.items.map((o) => o.id) || [];
  const activeFormulaIds = activeFormulas?.items.map((f) => f.id) || [];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-bold text-slate-900">{material.name}</h1>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit size={14} />}
            onClick={() => setIsEditOpen(true)}
            className="h-8 px-3 text-xs font-semibold hover:text-primary hover:border-primary/30 shrink-0"
          >
            Chỉnh sửa
          </Button>
        </div>
        <p className="text-xs text-slate-400">Cập nhật ngày {formattedUpdatedAt}</p>
      </div>

      <hr className="border-slate-100" />

      {/* Khối 1: Thông tin chung */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-2 text-sm">
        <span className="text-xs text-primary font-semibold select-none">Thông tin sản phẩm</span>
        <div className="flex flex-col gap-3.5 text-slate-650 mt-0.5">
          <div>
            <span className="font-semibold text-slate-500">Mã hệ nhôm: </span>
            <span className="text-slate-800 font-medium">{material.code || '—'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Đơn vị tính: </span>
            <span className="text-slate-800 font-medium">{formatMaterialUnit(material.unit) || '—'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-slate-100 py-3.5 my-1">
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá vốn</span>
              <span className="text-slate-700 font-semibold">{formatCurrency(material.costPrice)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá bán lẻ</span>
              <span className="text-primary font-bold">{formatCurrency(material.retailPrice)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá đại lý</span>
              <span className="text-teal-655 font-bold">{formatCurrency(material.salePrice)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-500">Thông số kỹ thuật:</span>
            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
              {material.specification || '—'}
            </p>
          </div>
          {material.description && (
            <div className="flex flex-col gap-1 mt-1 border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-500">Mô tả chi tiết:</span>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                {material.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Khối 2: Phụ kiện áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Phụ kiện áp dụng</h2>
            <p className="text-xs text-slate-400">Danh sách các phụ kiện đang liên kết với hệ nhôm này</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsAccessoriesModalOpen(true)}
            className="h-8 text-xs font-semibold hover:text-primary hover:border-primary/20"
          >
            Cấu hình liên kết
          </Button>
        </div>

        {isLoadingAccessories ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : activeAccessories?.items && activeAccessories.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeAccessories.items.map((acc) => (
              <div key={acc.id} className="flex flex-col gap-1 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="font-semibold text-sm text-slate-800 leading-snug">{acc.name}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {acc.code && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {acc.code}
                    </span>
                  )}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                    ĐVT: {formatAccessoryUnit(acc.unit)}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary">
                    {formatCurrency(acc.retailPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-400 italic">Chưa có liên kết với phụ kiện nào</p>
          </div>
        )}
      </div>

      {/* Khối 3: Tùy chọn phát sinh áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Tùy chọn phát sinh áp dụng</h2>
            <p className="text-xs text-slate-400">Danh sách các tùy chọn phát sinh đang liên kết với hệ nhôm này</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsExtraOptionsModalOpen(true)}
            className="h-8 text-xs font-semibold hover:text-primary hover:border-primary/20"
          >
            Cấu hình liên kết
          </Button>
        </div>

        {isLoadingExtraOptions ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : activeExtraOptions?.items && activeExtraOptions.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeExtraOptions.items.map((opt) => (
              <div key={opt.id} className="flex flex-col gap-1 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="font-semibold text-sm text-slate-800 leading-snug">{opt.name}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {opt.code && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {opt.code}
                    </span>
                  )}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                    ĐVT: {EXTRA_OPTION_UNIT_MAP[opt.unit as ExtraOptionUnit] || opt.unit}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary">
                    {formatCurrency(opt.retailPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-400 italic">Chưa có liên kết với tùy chọn phát sinh nào</p>
          </div>
        )}
      </div>

      {/* Khối 4: Công thức áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Công thức áp dụng</h2>
            <p className="text-xs text-slate-400">Danh sách các công thức đang liên kết với hệ nhôm này</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsFormulasModalOpen(true)}
            className="h-8 text-xs font-semibold hover:text-primary hover:border-primary/20"
          >
            Cấu hình liên kết
          </Button>
        </div>

        {isLoadingFormulas ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : activeFormulas?.items && activeFormulas.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeFormulas.items.map((f) => (
              <div key={f.id} className="flex flex-col gap-1 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="font-semibold text-sm text-slate-800 leading-snug">{f.name}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {f.code && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {f.code}
                    </span>
                  )}
                  {f.doorType && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                      Cửa: {f.doorType === 'cd' ? 'Cửa đi' : f.doorType === 'cs' ? 'Cửa sổ' : 'Khác'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-400 italic">Chưa có liên kết với công thức nào</p>
          </div>
        )}
      </div>

      {/* Update Info Modal */}
      <MaterialUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin hệ nhôm"
        initialData={material}
      />

      {/* Relation Modals */}
      <AssignAccessoriesModal
        isOpen={isAccessoriesModalOpen}
        onClose={() => setIsAccessoriesModalOpen(false)}
        activeAccessoryIds={activeAccessoryIds}
        onSave={handleSaveAccessories}
        isSaving={isSavingAccessories}
      />

      <AssignExtraOptionsModal
        isOpen={isExtraOptionsModalOpen}
        onClose={() => setIsExtraOptionsModalOpen(false)}
        activeExtraOptionIds={activeExtraOptionIds}
        onSave={handleSaveExtraOptions}
        isSaving={isSavingExtraOptions}
      />

      <AssignFormulasModal
        isOpen={isFormulasModalOpen}
        onClose={() => setIsFormulasModalOpen(false)}
        activeFormulaIds={activeFormulaIds}
        onSave={handleSaveFormulas}
        isSaving={isSavingFormulas}
      />
    </div>
  );
}
