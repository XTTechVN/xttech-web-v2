'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  getExtraOption, 
  getExtraOptionMaterials, 
  assignExtraOptionMaterials, 
  unassignExtraOptionMaterials 
} from '@/actions';
import { Loader2, Edit, Plus } from 'lucide-react';
import { EXTRA_OPTION_UNIT_MAP, formatMaterialUnit, type ExtraOptionUnit } from '@/types';
import { Button } from '@/components';
import { ExtraOptionUpdateModal } from '../_components/modals';
import { AssignOptionMaterialsModal } from '../_components/relation-modals';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

interface ExtraOptionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ExtraOptionDetailPage({ params }: ExtraOptionDetailPageProps) {
  const { id } = React.use(params);
  const extraOptionId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Query Details
  const { data: extraOption, isLoading, error } = useQuery({
    queryKey: ['extra-option', extraOptionId],
    queryFn: () => getExtraOption(extraOptionId),
    enabled: !isNaN(extraOptionId),
  });

  // Query active materials applied to this option
  const { data: activeMaterials, refetch: refetchActiveMaterials, isLoading: isLoadingMaterials } = useQuery({
    queryKey: ['extra-option-materials', extraOptionId],
    queryFn: () => getExtraOptionMaterials(extraOptionId),
    enabled: !isNaN(extraOptionId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-500 text-xs">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !extraOption) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <p className="text-red-500 font-semibold text-sm mb-2">Không tìm thấy thông tin tùy chọn phát sinh</p>
        <Link href="/app/projects/configuration" className="text-primary text-xs font-semibold hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const formattedUpdatedAt = extraOption.updatedAt
    ? new Date(extraOption.updatedAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '—';

  // Save materials relationship
  const handleSaveMaterials = async (selectedMaterialIds: number[]) => {
    if (!activeMaterials) return;
    setIsSaving(true);
    try {
      const initialIds = activeMaterials.items.map((m) => m.id);
      const toAssign = selectedMaterialIds.filter((id) => !initialIds.includes(id));
      const toRevoke = initialIds.filter((id) => !selectedMaterialIds.includes(id));

      if (toAssign.length > 0) {
        await assignExtraOptionMaterials(extraOptionId, { materialIds: toAssign });
      }
      if (toRevoke.length > 0) {
        await unassignExtraOptionMaterials(extraOptionId, { materialIds: toRevoke });
      }
      toast.success('Cập nhật liên kết hệ nhôm thành công');
      refetchActiveMaterials();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết hệ nhôm');
    } finally {
      setIsSaving(false);
    }
  };

  const activeMaterialIds = activeMaterials?.items.map((m) => m.id) || [];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-bold text-slate-900">{extraOption.name}</h1>
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
            <span className="font-semibold text-slate-500">Mã tùy chọn: </span>
            <span className="text-slate-800 font-medium">{extraOption.code || '—'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Đơn vị tính: </span>
            <span className="text-slate-800 font-medium">
              {EXTRA_OPTION_UNIT_MAP[extraOption.unit as ExtraOptionUnit] || extraOption.unit || '—'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-slate-100 py-3.5 my-1">
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá vốn</span>
              <span className="text-slate-700 font-semibold">{formatCurrency(extraOption.costPrice)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá bán lẻ</span>
              <span className="text-primary font-bold">{formatCurrency(extraOption.retailPrice)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá đại lý</span>
              <span className="text-teal-655 font-bold">{formatCurrency(extraOption.salePrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Khối 2: Hệ nhôm áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Hệ nhôm áp dụng tùy chọn phát sinh</h2>
            <p className="text-xs text-slate-400">Danh sách các hệ nhôm đang liên kết với tùy chọn phát sinh này</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsMaterialsModalOpen(true)}
            className="h-8 text-xs font-semibold hover:text-primary hover:border-primary/20"
          >
            Cấu hình liên kết
          </Button>
        </div>

        {isLoadingMaterials ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : activeMaterials?.items && activeMaterials.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeMaterials.items.map((material) => (
              <div key={material.id} className="flex flex-col gap-1 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="font-semibold text-sm text-slate-800 leading-snug">{material.name}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {material.code && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {material.code}
                    </span>
                  )}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                    ĐVT: {formatMaterialUnit(material.unit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-400 italic">Chưa có liên kết với hệ nhôm nào</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ExtraOptionUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin tùy chọn phát sinh"
        initialData={extraOption}
      />

      <AssignOptionMaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        activeMaterialIds={activeMaterialIds}
        onSave={handleSaveMaterials}
        isSaving={isSaving}
      />
    </div>
  );
}
