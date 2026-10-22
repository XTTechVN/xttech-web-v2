'use client';

import React, { useState } from 'react';
import { Loader2, Pencil, Check, X } from 'lucide-react';
import type { ProjectDetail, ProjectUpdate } from '@/types';

interface ProjectProgressCardProps {
  project: ProjectDetail;
  updatingField: string | null;
  onUpdate: (field: string, payload: Partial<ProjectUpdate>) => void;
}

export function ProjectProgressCard({
  project,
  updatingField,
  onUpdate,
}: ProjectProgressCardProps) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const customer = project.customer;
  const user = project.user;
  const staff = customer?.staff as { fullName?: string; phoneNumber?: string } | null | undefined;
  const providerName = customer?.provider?.name;

  const handleSaveNote = () => {
    setIsEditingNote(false);
    const trimmed = noteInput.trim();
    if (trimmed !== (project.note || '')) {
      onUpdate('note', { note: trimmed });
    }
  };

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-slate-700 font-lexend block">
        Tiến độ &amp; Phụ trách
      </h3>

      <div className="bg-white rounded-md border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Mã công trình</span>
          <span className="font-mono font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/70 text-[11px]">
            {project.code || `DA-${project.id}`}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Thời gian thi công</span>
          <span className="font-semibold text-slate-800">
            {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '—'}
            {' → '}
            {project.targetDate ? new Date(project.targetDate).toLocaleDateString('vi-VN') : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Địa chỉ công trình</span>
          <span className="text-slate-800 font-semibold truncate max-w-[180px]" title={project.address || ''}>
            {project.address || 'Chưa cập nhật'}
          </span>
        </div>

        {user && (
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
            <span className="text-slate-500">Khởi tạo dự án</span>
            <div className="text-right">
              <span className="font-semibold text-slate-800 block">{user.fullName}</span>
              {user.phoneNumber && (
                <a href={`tel:${user.phoneNumber}`} className="text-[11px] text-slate-500 hover:text-primary block">
                  {user.phoneNumber}
                </a>
              )}
            </div>
          </div>
        )}

        {staff?.fullName && (
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
            <span className="text-slate-500">Kinh doanh</span>
            <div className="text-right">
              <span className="font-semibold text-slate-800 block">{staff.fullName}</span>
              {staff.phoneNumber && (
                <a href={`tel:${staff.phoneNumber}`} className="text-[11px] text-slate-500 hover:text-primary block">
                  {staff.phoneNumber}
                </a>
              )}
            </div>
          </div>
        )}

        {providerName && (
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
            <span className="text-slate-500">Đơn vị cung ứng</span>
            <span className="font-medium text-slate-700">{providerName}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500 shrink-0">Ghi chú</span>
          {isEditingNote ? (
            <div className="flex items-center gap-1 max-w-[210px]">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNote();
                  if (e.key === 'Escape') setIsEditingNote(false);
                }}
                autoFocus
                placeholder="Nhập ghi chú..."
                className="w-full text-xs font-semibold text-primary px-1.5 py-0.5 border border-primary/40 rounded focus:outline-none focus:ring-1 focus:ring-primary/30 bg-slate-50"
              />
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={updatingField === 'note'}
                className="p-1 text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer"
                title="Lưu"
              >
                {updatingField === 'note' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                title="Hủy"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNoteInput(project.note || '');
                setIsEditingNote(true);
              }}
              className="group flex items-center gap-1.5 text-right hover:bg-slate-100/80 px-1.5 py-0.5 -mr-1.5 rounded transition-colors max-w-[200px] cursor-pointer"
              title="Bấm để sửa ghi chú"
            >
              <span className="font-semibold text-primary truncate text-xs" title={project.note || 'Thêm ghi chú'}>
                {project.note || <span className="text-slate-400 italic font-normal">Thêm ghi chú...</span>}
              </span>
              <Pencil
                size={10}
                className="text-slate-400 group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

