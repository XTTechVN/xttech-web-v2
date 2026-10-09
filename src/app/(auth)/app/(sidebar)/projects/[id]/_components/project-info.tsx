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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500">Chi tiết dự án</h2>
        <Badge variant={statusConfig.variant} size="sm">
          {statusConfig.label}
        </Badge>
      </div>

      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Tên dự án</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">{project.name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Mã dự án (Code)</span>
            <span className="text-sm font-mono font-bold text-primary mt-1 block">
              {project.code || `DA-${project.id}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Địa chỉ</span>
            <span className="text-sm font-medium text-slate-700 mt-1 block">{project.address || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Ngày khởi tạo</span>
            <span className="text-sm font-medium text-slate-700 mt-1 block">{formattedDate}</span>
          </div>
        </div>

        {/* Cấu hình nhôm mặc định */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block mb-2">Cấu hình nhôm mặc định</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block">Hãng nhôm</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                {project.defaultBrand?.name || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Hệ nhôm</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                {project.defaultSeries?.name || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Màu nhôm</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                {project.defaultColor?.name || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Tiến độ thời gian</span>
              <span className="text-xs font-medium text-slate-700 mt-0.5 block">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '—'} ➔{' '}
                {project.targetDate ? new Date(project.targetDate).toLocaleDateString('vi-VN') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics quy mô */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
          <div className="p-2.5 rounded-lg bg-primary/5">
            <span className="text-[10px] font-bold text-primary block">TỔNG VỊ TRÍ CỬA</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block">
              {project.totalPositions ?? 0} bộ
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/5">
            <span className="text-[10px] font-bold text-primary block">TỔNG DIỆN TÍCH</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block">
              {(project.totalAreaM2 ?? 0).toFixed(2)} m2
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/5">
            <span className="text-[10px] font-bold text-primary block">TỔNG TRỌNG LƯỢNG NHÔM</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block">
              {(project.totalAluminumKg ?? 0).toFixed(1)} kg
            </span>
          </div>
        </div>

        {project.note && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">Ghi chú / Yêu cầu công trình</span>
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
              {project.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

