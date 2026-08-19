'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getMaterial } from '@/actions';
import { Loader2, Edit } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { formatMaterialUnit } from '@/types';
import { Button } from '@/components';
import { MaterialUpdateModal } from '../_components/modals';

interface MaterialDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = React.use(params);
  const materialId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: material,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['material', materialId],
    queryFn: () => getMaterial(materialId),
    enabled: !isNaN(materialId),
  });

  if (isLoading) {
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

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 pb-12">
      {/* Back Button & Title */}
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

      <hr className="border-slate-200" />

      {/* Basic Properties */}
      <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm mt-1">
        <div>
          <span className="text-xs text-slate-400 block select-none">Mã hệ nhôm</span>
          <span className="font-semibold text-slate-800">{material.code || '—'}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block select-none">Đơn vị tính</span>
          <span className="font-semibold text-slate-800">{formatMaterialUnit(material.unit) || '—'}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block select-none">Đơn giá định mức</span>
          <span className="font-bold text-primary">{formatCurrency(material.price)}</span>
        </div>
      </div>

      {/* Specifications */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h2 className="text-base font-semibold text-slate-800">1. Thông số kỹ thuật</h2>
        <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line">{material.specification || '—'}</p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h2 className="text-base font-semibold text-slate-800">2. Mô tả chi tiết</h2>
        <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line">
          {material.description || 'Chưa có mô tả chi tiết cho hệ nhôm này.'}
        </p>
      </div>

      <MaterialUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin hệ nhôm"
        initialData={material}
      />
    </div>
  );
}
