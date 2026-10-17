import React from 'react';
import type { ProjectDetail } from '@/types';
import { Badge } from '@/components';
import { PROJECT_STATUS_MAP } from '@/config';

interface ProjectInfoProps {
  project: ProjectDetail;
  formattedDate: string;
}

export function ProjectInfo({ project, formattedDate }: ProjectInfoProps) {
  const statusConfig = PROJECT_STATUS_MAP[project.status] || {
    label: project.status,
    variant: 'default',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-3.5 shadow-2xs">
      {/* Header: Title, Tên dự án & Trạng thái */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-slate-700">Chi tiết dự án</h2>
          <span className="font-semibold text-primary text-xs">{project.name}</span>
        </div>
        <Badge variant={statusConfig.variant} size="sm">
          {statusConfig.label}
        </Badge>
      </div>

      {/* Grid 2 cột chia các row dạng key-value giống bên phải */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 text-xs">
        {/* Cột trái: Thông tin chung */}
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Mã dự án (Code)</span>
            <span className="font-mono font-medium text-primary">
              {project.code || `DA-${project.id}`}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 py-2">
            <span className="text-slate-500 shrink-0">Địa chỉ</span>
            <span className="font-medium text-slate-700 text-right">{project.address || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Ngày khởi tạo</span>
            <span className="font-medium text-slate-700">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Tiến độ thi công</span>
            <span className="font-medium text-slate-700">
              {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '—'} ➔{' '}
              {project.targetDate ? new Date(project.targetDate).toLocaleDateString('vi-VN') : '—'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 py-2">
            <span className="text-slate-500 shrink-0">Ghi chú</span>
            <span className="font-medium text-slate-700 text-right">{project.note || '—'}</span>
          </div>
        </div>

        {/* Cột phải: Cấu hình nhôm & Quy mô */}
        <div className="divide-y divide-slate-100 border-t md:border-t-0 border-slate-100">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Hãng nhôm</span>
            <span className="font-medium text-slate-800">{project.defaultBrand?.name || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Hệ nhôm</span>
            <span className="font-medium text-slate-800">{project.defaultSeries?.name || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Màu nhôm</span>
            <span className="font-medium text-slate-800">{project.defaultColor?.name || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Tổng vị trí cửa</span>
            <span className="font-semibold text-slate-800">{project.totalPositions ?? 0} bộ</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Tổng diện tích</span>
            <span className="font-semibold text-slate-800">{(project.totalAreaM2 ?? 0).toFixed(2)} m²</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Trọng lượng nhôm</span>
            <span className="font-semibold text-slate-800">{(project.totalAluminumKg ?? 0).toFixed(1)} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

