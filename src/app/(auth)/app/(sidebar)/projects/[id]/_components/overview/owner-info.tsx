'use client';

import React from 'react';
import type { ProjectDetail } from '@/types';
import { ShieldCheck, Mail, Hash } from 'lucide-react';

interface OwnerInfoProps {
  user: ProjectDetail['user'];
}

export function OwnerInfo({ user }: OwnerInfoProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'NV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-lexend">Người phụ trách</h2>
            <p className="text-[11px] text-slate-400">Giám sát kỹ thuật & Tiến độ</p>
          </div>
        </div>
      </div>

      {user ? (
        <div className="space-y-3.5">
          {/* Profile header với Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200/60">
              {getInitials(user.fullName as string)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate" title={(user.fullName as string) || ''}>
                {(user.fullName as string) || 'Chưa gán nhân sự'}
              </div>
              <div className="text-[11px] text-slate-500">
                Quản lý dự án / Kỹ thuật
              </div>
            </div>
          </div>

          {/* Danh sách thông tin liên hệ gọn gàng */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            {/* Email */}
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <div className="min-w-0 truncate">
                <a
                  href={`mailto:${user.email}`}
                  className="font-medium text-slate-800 hover:text-primary transition-colors truncate block"
                  title={(user.email as string) || ''}
                >
                  {(user.email as string) || '—'}
                </a>
              </div>
            </div>

            {/* Mã nhân sự */}
            <div className="flex items-center gap-2.5 text-slate-600">
              <Hash size={14} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-mono text-slate-700 text-xs">
                  {(user.identifyCode as string) || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-xs py-4 text-center">Chưa phân công nhân sự quản lý</p>
      )}
    </div>
  );
}
