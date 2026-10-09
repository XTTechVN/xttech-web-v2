'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjectActivities } from '@/actions';
import { Loader2, History, User } from 'lucide-react';

interface ProjectActivitiesProps {
  projectId: number;
}

export function ProjectActivities({ projectId }: ProjectActivitiesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['project_activities', projectId],
    queryFn: () => getProjectActivities(projectId, { limit: 50 }),
    enabled: !!projectId,
  });

  const activities = data?.items || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <History size={15} className="text-slate-500" />
        <h2 className="text-xs font-bold text-slate-500">
          Nhật ký hoạt động ({activities.length})
        </h2>
      </div>

      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs">
        {isLoading ? (
          <div className="py-6 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            Đang tải nhật ký...
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            Chưa có ghi nhận hoạt động nào trên dự án này.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {activities.map((item) => (
              <div key={item.id} className="relative group">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white bg-primary shadow-xs" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-800">
                      {item.actionTitle}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      {item.user?.fullName || (typeof item.actorType === 'string' ? item.actorType : 'Hệ thống')}
                    </span>
                    {item.targetName && (

                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                        {item.targetName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
