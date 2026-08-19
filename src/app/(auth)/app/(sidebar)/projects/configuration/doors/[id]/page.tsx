'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getDoor } from '@/actions';
import { Loader2, Edit, Image } from 'lucide-react';
import { formatDoorType } from '@/types';
import { Button } from '@/components';
import { DoorUpdateModal } from '../_components/modals';
import { BASE_MINIO_URL } from '@/config/app';

interface DoorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DoorDetailPage({ params }: DoorDetailPageProps) {
  const { id } = React.use(params);
  const doorId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: door, isLoading, error } = useQuery({
    queryKey: ['door', doorId],
    queryFn: () => getDoor(doorId),
    enabled: !isNaN(doorId),
  });

  if (isLoading) {
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

      <DoorUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin biên dạng cửa"
        initialData={door}
      />
    </div>
  );
}
