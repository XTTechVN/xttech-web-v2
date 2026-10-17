'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjectActivities } from '@/actions';
import { Loader2, History, Clock, ArrowRight } from 'lucide-react';

interface ProjectActivitiesProps {
  projectId: number;
}

export function ProjectActivities({ projectId }: ProjectActivitiesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['project_activities', projectId],
    queryFn: () => getProjectActivities(projectId, { limit: 20 }),
    enabled: !!projectId,
  });

  const activities = data?.items || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <History size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-lexend">Nhật ký hoạt động</h2>
            <p className="text-xs text-slate-500">Lịch sử thao tác & cập nhật dự án gần đây</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
          {activities.length} sự kiện
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-xs">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span>Đang tải lịch sử hoạt động...</span>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-slate-400 text-xs py-6 text-center">Chưa có ghi nhận hoạt động nào</p>
      ) : (
        <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
          {activities.slice(0, 10).map((item) => {
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
              <div key={item.id} className="relative group">
                {/* Timeline dot */}
                <span className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-teal-500 ring-4 ring-white" />

                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-slate-900">
                      {item.user?.fullName || 'Hệ thống'}
                    </span>
                    <span className="text-slate-600">
                      {item.actionTitle || 'Thao tác trên dự án'}
                    </span>
                    {item.targetName && (
                      <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[11px] font-medium truncate max-w-[200px]">
                        {item.targetName}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
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
  );
}
