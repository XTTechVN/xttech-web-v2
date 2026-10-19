import React from 'react';
import type { ProjectDetail } from '@/types';
import { 
  Building2, 
  Layers, 
  MapPin, 
  Calendar, 
  Clock, 
  Palette, 
  FileText,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface ProjectInfoProps {
  project: ProjectDetail;
  formattedDate: string;
}

export function ProjectInfo({ project, formattedDate }: ProjectInfoProps) {
  const brandName = project.defaultBrand?.name || 'Chưa thiết lập';
  const seriesName = project.defaultSeries?.name;
  const colorName = project.defaultColor?.name || 'Tiêu chuẩn';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header card */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-lexend">
              Hồ sơ kỹ thuật & Quy chuẩn vật tư
            </h2>
            <p className="text-xs text-slate-500">
              Tiêu chuẩn cấu hình profile nhôm kính mặc định cho toàn bộ công trình
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
          {project.code || `DA-${project.id}`}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* 1. Tiêu chuẩn vật tư nhôm kính mặc định */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers size={13} className="text-primary" />
            Cấu hình vật tư tiêu chuẩn
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Hãng sản xuất */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium block">
                Hãng sản xuất
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {brandName}
              </div>
            </div>

            {/* Hệ nhôm */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium block">
                Hệ nhôm thi công
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate" title={seriesName || ''}>
                {seriesName ? `Hệ ${seriesName}` : 'Chưa chọn hệ'}
              </div>
            </div>

            {/* Màu hoàn thiện */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium block">
                Màu sắc hoàn thiện
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate flex items-center gap-1.5">
                <Palette size={14} className="text-amber-600 shrink-0" />
                {colorName}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Mặt bằng & Kế hoạch thi công */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Compass size={13} className="text-primary" />
            Hiện trường & Kế hoạch bàn giao
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/70 flex items-center justify-center text-slate-500 shrink-0 mt-0.5 shadow-2xs">
                <MapPin size={15} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 font-medium block">Địa chỉ thi công</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block leading-snug">
                  {project.address || 'Chưa cập nhật địa chỉ công trình'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/70 flex items-center justify-center text-slate-500 shrink-0 mt-0.5 shadow-2xs">
                <Clock size={15} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 font-medium block">Tiến độ dự kiến</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '—'} 
                  {' → '}
                  {project.targetDate ? new Date(project.targetDate).toLocaleDateString('vi-VN') : 'Dự kiến'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Khởi tạo: {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Ghi chú kỹ thuật nếu có */}
        {project.note && (
          <div className="bg-amber-50/60 border-l-4 border-amber-500 rounded-r-xl p-3.5 text-xs text-amber-950 flex items-start gap-3">
            <FileText size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-900 mr-1.5">Lưu ý kỹ thuật:</span>
              {project.note}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
