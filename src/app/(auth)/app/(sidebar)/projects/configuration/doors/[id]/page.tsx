'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getDoor, getDoorAccessories, assignDoorAccessories, revokeDoorAccessories } from '@/actions';
import { Loader2, Edit, Image, Plus } from 'lucide-react';
import { formatDoorType, formatAccessoryUnit } from '@/types';
import { Button } from '@/components';
import { DoorUpdateModal } from '../_components/modals';
import { AssignDoorAccessoriesModal } from '../_components/relation-modals';
import { BASE_MINIO_URL } from '@/config/app';
import { formatCurrency } from '@/utils';
import { toast } from 'react-hot-toast';

interface DoorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DoorDetailPage({ params }: DoorDetailPageProps) {
  const { id } = React.use(params);
  const doorId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAccessoriesModalOpen, setIsAccessoriesModalOpen] = useState(false);
  const [isSavingAccessories, setIsSavingAccessories] = useState(false);

  // 1. Fetch Door Info
  const {
    data: door,
    isLoading: isLoadingDoor,
    error,
  } = useQuery({
    queryKey: ['doors', doorId],
    queryFn: () => getDoor(doorId),
    enabled: !isNaN(doorId),
  });

  // 2. Fetch Active Accessories
  const {
    data: activeAccessories,
    isLoading: isLoadingAccessories,
    refetch: refetchAccessories,
  } = useQuery({
    queryKey: ['door-accessories', doorId],
    queryFn: () => getDoorAccessories(doorId, { limit: 9999 }),
    enabled: !isNaN(doorId),
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
        await assignDoorAccessories(doorId, { accessoryIds: toAssign });
      }
      if (toRevoke.length > 0) {
        await revokeDoorAccessories(doorId, { accessoryIds: toRevoke });
      }
      toast.success('Cập nhật liên kết phụ kiện thành công');
      refetchAccessories();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết phụ kiện');
    } finally {
      setIsSavingAccessories(false);
    }
  };

  if (isLoadingDoor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-500 text-xs">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !door) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <p className="text-red-500 font-semibold text-sm mb-2">Không tìm thấy thông tin cửa</p>
        <Link href="/app/projects/configuration" className="text-primary text-xs font-semibold hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const formattedUpdatedAt = door.updatedAt
    ? new Date(door.updatedAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '—';

  const activeAccessoryIds = activeAccessories?.items.map((a) => a.id) || [];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-bold text-slate-900">{door.name}</h1>
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

      {/* Main Details (Ảnh bên trái, Text bên phải) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side Image */}
        <div className="w-full md:w-72 flex flex-col gap-2 shrink-0">
          <span className="text-xs text-primary font-semibold select-none">Hình ảnh minh họa</span>
          <div className="w-full aspect-square md:h-64 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
            {door.imagePath ? (
              <img
                src={door.imagePath.startsWith('http') ? door.imagePath : `${BASE_MINIO_URL}${door.imagePath}`}
                alt={door.name}
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

        {/* Right Side Text */}
        <div className="flex-1 flex flex-col gap-2 w-full text-sm">
          <span className="text-xs text-primary font-semibold select-none">Thông tin sản phẩm</span>
          <div className="flex flex-col gap-3.5 text-slate-650 mt-0.5">
            <div>
              <span className="font-semibold text-slate-500">Mã cửa: </span>
              <span className="text-slate-800 font-medium">{door.code || '—'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Phân loại: </span>
              <span className="text-slate-800 font-medium">{formatDoorType(door.type) || '—'}</span>
            </div>
            <div className="flex flex-col gap-1 mt-1 border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-500">Thông số kỹ thuật:</span>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                {door.specification || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Khối 2: Phụ kiện áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Phụ kiện áp dụng</h2>
            <p className="text-xs text-slate-400">Danh sách các phụ kiện đang liên kết với biên dạng cửa này</p>
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

      <DoorUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin biên dạng cửa"
        initialData={door}
      />

      <AssignDoorAccessoriesModal
        isOpen={isAccessoriesModalOpen}
        onClose={() => setIsAccessoriesModalOpen(false)}
        activeAccessoryIds={activeAccessoryIds}
        onSave={handleSaveAccessories}
        isSaving={isSavingAccessories}
      />
    </div>
  );
}
