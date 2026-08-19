'use client';

import React from 'react';
import type { ProjectDetail } from '@/types';

interface OwnerInfoProps {
  user: ProjectDetail['user'];
}

export function OwnerInfo({ user }: OwnerInfoProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Người phụ trách</h2>
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs space-y-4">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-250 text-slate-750 flex items-center justify-center font-bold text-sm shrink-0">
                {(user.fullName as string)?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{user.fullName as string}</h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">@{user.username as string}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100 text-sm pt-2">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Email nhân sự</span>
                <span className="font-semibold text-slate-800 break-all text-right max-w-[160px]">{(user.email as string) || '—'}</span>
              </div>
              <div className="flex justify-between py-2.5 last:pb-0">
                <span className="text-slate-500">Mã nhân viên</span>
                <span className="font-semibold text-slate-800">{(user.identifyCode as string) || '—'}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-xs py-2 text-center">Không có thông tin người phụ trách</p>
        )}
      </div>
    </div>
  );
}
