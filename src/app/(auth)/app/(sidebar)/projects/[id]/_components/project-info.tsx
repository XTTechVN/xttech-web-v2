'use client';

import React from 'react';
import type { ProjectDetail } from '@/types';

interface ProjectInfoProps {
  project: ProjectDetail;
  formattedDate: string;
}

export function ProjectInfo({ project, formattedDate }: ProjectInfoProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết dự án</h2>
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tên dự án</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">{project.name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mã dự án (ID)</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">#{project.id}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa chỉ</span>
            <span className="text-sm font-medium text-slate-700 mt-1 block">{project.address || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngày khởi tạo</span>
            <span className="text-sm font-medium text-slate-700 mt-1 block">{formattedDate}</span>
          </div>
        </div>
        {project.note && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ghi chú / Mô tả</span>
            <p className="text-sm text-slate-655 mt-1 whitespace-pre-line leading-relaxed">
              {project.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
