'use client';

import React from 'react';
import type { ProjectDetail } from '@/types';

interface OwnerInfoProps {
  user: ProjectDetail['user'];
}

export function OwnerInfo({ user }: OwnerInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-3.5 shadow-2xs">
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-700">Người phụ trách</h2>
        {user?.fullName && (
          <span className="font-semibold text-primary text-xs truncate max-w-[170px]" title={user.fullName as string}>
            {user.fullName as string}
          </span>
        )}
      </div>

      {user ? (
        <div className="divide-y divide-slate-100 text-xs">
          <div className="flex items-start justify-between gap-2 py-2">
            <span className="text-slate-500 shrink-0">Email nhân sự</span>
            <span className="font-medium text-slate-800 text-right break-all">
              {(user.email as string) || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 last:pb-0">
            <span className="text-slate-500 shrink-0">Mã nhân viên</span>
            <span className="font-medium text-slate-800">
              {(user.identifyCode as string) || '—'}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-xs py-3 text-center">Không có thông tin người phụ trách</p>
      )}
    </div>
  );
}
