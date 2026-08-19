'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getAccessory } from '@/actions';
import { Loader2, Edit, Image } from 'lucide-react';
import { formatAccessoryUnit } from '@/types';
import { Button } from '@/components';
import { AccessoryUpdateModal } from '../_components/modals';
import { BASE_MINIO_URL } from '@/config/app';
import { formatCurrency } from '@/utils';

interface AccessoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AccessoryDetailPage({ params }: AccessoryDetailPageProps) {
  const { id } = React.use(params);
  const accessoryId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: accessory, isLoading, error } = useQuery({
    queryKey: ['accessory', accessoryId],
    queryFn: () => getAccessory(accessoryId),
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

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 pb-12">
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

      <hr className="border-slate-200" />

      {/* Main Details */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side text */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block select-none">Mã phụ kiện</span>
              <span className="font-semibold text-slate-800">{accessory.code || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block select-none">Đơn vị tính</span>
              <span className="font-semibold text-slate-800">{formatAccessoryUnit(accessory.unit) || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block select-none">Đơn giá định mức</span>
              <span className="font-bold text-primary">{formatCurrency(accessory.price)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <h2 className="text-base font-semibold text-slate-800">1. Thông số kỹ thuật</h2>
            <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line">
              {accessory.specification || '—'}
            </p>
          </div>

        </div>

        {/* Right Side Image */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <span className="text-xs text-slate-400 block select-none">Ảnh minh họa</span>
          <div className="w-full h-64 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
            {accessory.imagePath ? (
              <img
                src={accessory.imagePath.startsWith('http') ? accessory.imagePath : `${BASE_MINIO_URL}${accessory.imagePath}`}
                alt={accessory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-450">
                <Image size={24} />
                <span className="text-[10px]">Chưa có ảnh</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AccessoryUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin phụ kiện"
        initialData={accessory}
      />
    </div>
  );
}
