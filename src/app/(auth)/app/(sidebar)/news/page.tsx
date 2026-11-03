'use client';

import React from 'react';
import { Newspaper, Plus } from 'lucide-react';
import { Button } from '@/components';

export default function AdminNewsPage() {
  return (
    <div className="w-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Newspaper size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
              Quản lý tin tức
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tạo và quản lý các bài viết tin tức, thông báo nội bộ và truyền thông
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          className="rounded-xl px-3"
        >
          Thêm bài viết mới
        </Button>
      </div>

      {/* Content placeholder / management area */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Newspaper size={40} className="text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-600">Trang quản trị tin tức</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Chức năng quản trị bài viết, duyệt tin và xuất bản trong hệ thống quản trị.
        </p>
      </div>
    </div>
  );
}
