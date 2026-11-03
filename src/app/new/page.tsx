import React from 'react';
import { Header } from '../_components';

export default function PublicNewsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Tin tức &amp; Sự kiện
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Cập nhật những thông tin, tin tức mới nhất từ hệ thống XTTech.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500 text-sm">
            Trang tin tức công khai đang được cập nhật nội dung...
          </div>
        </div>
      </main>
    </div>
  );
}

