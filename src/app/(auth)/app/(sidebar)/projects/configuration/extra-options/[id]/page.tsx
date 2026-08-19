'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getExtraOption } from '@/actions';
import { Loader2, Edit } from 'lucide-react';
import { EXTRA_OPTION_UNIT_MAP, type ExtraOptionUnit } from '@/types';
import { Button } from '@/components';
import { ExtraOptionUpdateModal } from '../_components/modals';
import { formatCurrency } from '@/utils';

interface ExtraOptionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ExtraOptionDetailPage({ params }: ExtraOptionDetailPageProps) {
  const { id } = React.use(params);
  const extraOptionId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: extraOption, isLoading, error } = useQuery({
    queryKey: ['extra-option', extraOptionId],
    queryFn: () => getExtraOption(extraOptionId),
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

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 pb-12">
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

      <hr className="border-slate-200" />

      {/* Main Details */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm mt-1">
          <div>
            <span className="text-xs text-slate-400 block select-none">Mã tùy chọn</span>
            <span className="font-semibold text-slate-800">{extraOption.code || '—'}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block select-none">Đơn vị tính</span>
            <span className="font-semibold text-slate-800">
              {EXTRA_OPTION_UNIT_MAP[extraOption.unit as ExtraOptionUnit] || extraOption.unit || '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block select-none">Đơn giá</span>
            <span className="font-bold text-primary">{formatCurrency(extraOption.price)}</span>
          </div>
        </div>
      </div>

      <ExtraOptionUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin tùy chọn phát sinh"
        initialData={extraOption}
      />
    </div>
  );
}
