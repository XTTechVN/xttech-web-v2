'use client';

import React from 'react';
import type { ProjectDetail } from '@/types';

interface OwnerInfoProps {
  user: ProjectDetail['user'];
}

export function OwnerInfo({ user }: OwnerInfoProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500">Người phụ trách</h2>
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        {user ? (
          <>
            <div>
              <h3 className="font-bold text-primary text-sm leading-tight">{user.fullName as string}</h3>
            </div>
            <div className="divide-y divide-slate-100 text-sm pt-1">
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
