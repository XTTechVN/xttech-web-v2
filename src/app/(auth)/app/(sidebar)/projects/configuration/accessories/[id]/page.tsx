'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  getAccessory, 
  getAccessoryDoors, 
  getAccessoryMaterials, 
  assignAccessoryDoors, 
  revokeAccessoryDoors, 
  assignAccessoryMaterials, 
  revokeAccessoryMaterials 
} from '@/actions';
import { Loader2, Edit, Image, Plus } from 'lucide-react';
import { formatAccessoryUnit, formatMaterialUnit, formatDoorType } from '@/types';
import { Button } from '@/components';
import { AccessoryUpdateModal } from '../_components/modals';
import { AssignDoorsModal, AssignMaterialsModal } from '../_components/relation-modals';
import { BASE_MINIO_URL } from '@/config/app';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

interface AccessoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AccessoryDetailPage({ params }: AccessoryDetailPageProps) {
  const { id } = React.use(params);
  const accessoryId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDoorsModalOpen, setIsDoorsModalOpen] = useState(false);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);

  const [isSavingDoors, setIsSavingDoors] = useState(false);
  const [isSavingMaterials, setIsSavingMaterials] = useState(false);

  // Query Accessory Details
  const { data: accessory, isLoading, error } = useQuery({
    queryKey: ['accessories', accessoryId],
    queryFn: () => getAccessory(accessoryId),
    enabled: !isNaN(accessoryId),
  });

  // Query relation: Doors
  const { data: activeDoors, refetch: refetchActiveDoors, isLoading: isLoadingDoors } = useQuery({
    queryKey: ['accessory-doors', accessoryId],
    queryFn: () => getAccessoryDoors(accessoryId),
    enabled: !isNaN(accessoryId),
  });

  // Query relation: Materials
  const { data: activeMaterials, refetch: refetchActiveMaterials, isLoading: isLoadingMaterials } = useQuery({
    queryKey: ['accessory-materials', accessoryId],
    queryFn: () => getAccessoryMaterials(accessoryId),
    enabled: !isNaN(accessoryId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-500 text-xs">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !accessory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <p className="text-red-500 font-semibold text-sm mb-2">Không tìm thấy thông tin phụ kiện</p>
        <Link href="/app/projects/configuration" className="text-primary text-xs font-semibold hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const formattedUpdatedAt = accessory.updatedAt
    ? new Date(accessory.updatedAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '—';

  // Save Door relations
  const handleSaveDoors = async (selectedDoorIds: number[]) => {
    if (!activeDoors) return;
    setIsSavingDoors(true);
    try {
      const initialIds = activeDoors.items.map((d) => d.id);
      const toAssign = selectedDoorIds.filter((id) => !initialIds.includes(id));
      const toRevoke = initialIds.filter((id) => !selectedDoorIds.includes(id));

      if (toAssign.length > 0) {
        await assignAccessoryDoors(accessoryId, { doorIds: toAssign });
      }
      if (toRevoke.length > 0) {
        await revokeAccessoryDoors(accessoryId, { doorIds: toRevoke });
      }
      toast.success('Cập nhật liên kết cửa thành công');
      refetchActiveDoors();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết cửa');
    } finally {
      setIsSavingDoors(false);
    }
  };

  // Save Material relations
  const handleSaveMaterials = async (selectedMaterialIds: number[]) => {
    if (!activeMaterials) return;
    setIsSavingMaterials(true);
    try {
      const initialIds = activeMaterials.items.map((m) => m.id);
      const toAssign = selectedMaterialIds.filter((id) => !initialIds.includes(id));
      const toRevoke = initialIds.filter((id) => !selectedMaterialIds.includes(id));

      if (toAssign.length > 0) {
        await assignAccessoryMaterials(accessoryId, { materialIds: toAssign });
      }
      if (toRevoke.length > 0) {
        await revokeAccessoryMaterials(accessoryId, { materialIds: toRevoke });
      }
      toast.success('Cập nhật liên kết hệ nhôm thành công');
      refetchActiveMaterials();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết hệ nhôm');
    } finally {
      setIsSavingMaterials(false);
    }
  };

  const activeDoorIds = activeDoors?.items.map((d) => d.id) || [];
  const activeMaterialIds = activeMaterials?.items.map((m) => m.id) || [];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-bold text-slate-900">{accessory.name}</h1>
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

      {/* Khối 1: Thông tin chung (Ảnh bên trái, Text bên phải) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Ảnh minh họa */}
        <div className="w-full md:w-72 flex flex-col gap-2 shrink-0">
          <span className="text-xs text-primary font-semibold select-none">Hình ảnh minh họa</span>
          <div className="w-full aspect-square md:h-64 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
            {accessory.imagePath ? (
              <img
                src={accessory.imagePath.startsWith('http') ? accessory.imagePath : `${BASE_MINIO_URL}${accessory.imagePath}`}
                alt={accessory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Image size={32} strokeWidth={1.5} />
                <span className="text-[10px] font-medium">Chưa có ảnh</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Thông tin chi tiết */}
        <div className="flex-1 flex flex-col gap-2 w-full text-sm">
          <span className="text-xs text-primary font-semibold select-none">Thông tin sản phẩm</span>
          <div className="flex flex-col gap-3.5 text-slate-650 mt-0.5">
            <div>
              <span className="font-semibold text-slate-500">Mã phụ kiện: </span>
              <span className="text-slate-800 font-medium">{accessory.code || '—'}</span>
            </div>
          <div>
            <span className="font-semibold text-slate-500">Đơn vị tính: </span>
            <span className="text-slate-800 font-medium">{formatAccessoryUnit(accessory.unit) || '—'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-slate-100 py-3.5 my-1">
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá vốn</span>
              <span className="text-slate-700 font-semibold">{formatCurrency(accessory.costPrice)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá bán lẻ</span>
              <span className="text-primary font-bold">{formatCurrency(accessory.retailPrice)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block text-xs mb-0.5">Giá đại lý</span>
              <span className="text-teal-655 font-bold">{formatCurrency(accessory.salePrice)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-500">Thông số kỹ thuật:</span>
            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
              {accessory.specification || '—'}
            </p>
          </div>
        </div>
      </div>
    </div>

      {/* Khối 2: Biên dạng cửa áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Biên dạng cửa áp dụng phụ kiện</h2>
            <p className="text-xs text-slate-400">Danh sách các thiết kế cửa đang liên kết với phụ kiện này</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsDoorsModalOpen(true)}
            className="h-8 text-xs font-semibold hover:text-primary hover:border-primary/20"
          >
            Cấu hình liên kết
          </Button>
        </div>

        {isLoadingDoors ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : activeDoors?.items && activeDoors.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeDoors.items.map((door) => (
              <div key={door.id} className="flex flex-col gap-1 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="font-semibold text-sm text-slate-800 leading-snug">{door.name}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {door.code && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {door.code}
                    </span>
                  )}
                  {door.type && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                      {formatDoorType(door.type)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-400 italic">Chưa có liên kết với thiết kế cửa nào</p>
          </div>
        )}
      </div>

      {/* Khối 3: Hệ nhôm áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Hệ nhôm áp dụng phụ kiện</h2>
            <p className="text-xs text-slate-400">Danh sách các hệ nhôm đang liên kết với phụ kiện này</p>
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
      <AccessoryUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin phụ kiện"
        initialData={accessory}
      />

      <AssignDoorsModal
        isOpen={isDoorsModalOpen}
        onClose={() => setIsDoorsModalOpen(false)}
        activeDoorIds={activeDoorIds}
        onSave={handleSaveDoors}
        isSaving={isSavingDoors}
      />

      <AssignMaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        activeMaterialIds={activeMaterialIds}
        onSave={handleSaveMaterials}
        isSaving={isSavingMaterials}
      />
    </div>
  );
}
