'use client';

import React from 'react';
import { Header } from '@/components';

export function InteractiveHeaders() {
  return (
    <div className="space-y-6 border border-gray-100 p-6 rounded-lg bg-gray-50/50">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">Header tiêu chuẩn</h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
          <Header
            title="Tổng quan hệ thống"
            notificationBadge={5}
            messageBadge={2}
            onNotificationClick={() => alert('Click notification')}
            onMessageClick={() => alert('Click message')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">
          Header tùy biến tiêu đề phức tạp
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
          <Header
            title={
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-md font-bold text-primary">Giám sát máy chủ</h1>
              </div>
            }
            notificationBadge={null}
            messageBadge={undefined}
          />
        </div>
      </div>
    </div>
  );
}
