'use client';

import React from 'react';
import { Clock, History, Loader2 } from 'lucide-react';
import type { ProjectActivity } from '@/types';

interface ProjectActivitiesCardProps {
  activities: ProjectActivity[];
  isLoading: boolean;
}

export function ProjectActivitiesCard({ activities, isLoading }: ProjectActivitiesCardProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700 font-lexend flex items-center gap-1.5">
          <History size={13} className="text-primary" />
          Nhật ký hoạt động dự án
        </h3>
        <span className="text-[11px] font-medium text-slate-400">
          {activities.length} sự kiện gần nhất
        </span>
      </div>

      <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-2xs">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
            <Loader2 size={15} className="animate-spin text-primary" />
            <span>Đang tải nhật ký hoạt động...</span>
          </div>
        ) : activities.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            Chưa có ghi nhận hoạt động nào trên dự án này.
          </p>
        ) : (
          <div className="relative max-h-[340px] space-y-3 overflow-y-auto pl-5 pr-1 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[1.5px] before:bg-slate-200">
            {activities.map((item) => {
              const timeStr = item.createdAt
                ? new Date(item.createdAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '—';

              return (
                <div key={item.id} className="group relative">
                  <span className="absolute top-2 -left-[15px] h-2 w-2 rounded-full bg-primary ring-4 ring-white" />

                  <div className="flex flex-col justify-between gap-1.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-800">
                        {item.user?.fullName || 'Hệ thống'}
                      </span>
                      <span className="text-slate-600">
                        {item.actionTitle || 'Cập nhật dự án'}
                      </span>
                      {item.targetName && (
                        <span className="max-w-[220px] truncate rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
                          {item.targetName}
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} />
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

