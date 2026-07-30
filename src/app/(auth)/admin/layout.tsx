'use client';

import React, { useState } from 'react';
import { Sidebar, Header } from '@/components';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Wallet, Menu, MessageSquare } from 'lucide-react';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/utils/query';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const user = {
    name: 'Nguyễn Văn Anh',
    role: 'Quản trị viên',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
  };

  const sections = [
    {
      title: 'Quản lý',
      items: [
        { id: 'attendances', label: 'Điểm danh', icon: <FileText size={18} /> },
        { id: 'quotation', label: 'Báo giá', icon: <Wallet size={18} /> },
        { id: 'suggestions', label: 'Đề xuất, góp ý', icon: <MessageSquare size={18} /> },
      ],
    },
  ];

  // Xác định mục đang active dựa trên URL hiện tại
  let activeId = '';
  if (pathname.includes('/admin/attendances')) {
    activeId = 'attendances';
  } else if (pathname.includes('/admin/quotation')) {
    activeId = 'quotation';
  }

  const handleItemSelect = (id: string) => {
    if (id === 'attendances') {
      router.push('/admin/attendances');
    } else if (id === 'quotation') {
      router.push('/admin/quotation');
    }
  };

  // Xác định tiêu đề hiển thị trên Header tương ứng với trang hiện tại
  let title = 'Hệ thống Quản trị';
  if (activeId === 'attendances') {
    title = 'Quản lý Điểm danh';
  } else if (activeId === 'quotation') {
    title = 'Quản lý Báo giá';
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-screen bg-white relative overflow-hidden">
        {/* 1. Sidebar hiển thị trên Desktop */}
        <Sidebar
          sections={sections}
          activeId={activeId}
          variant="light"
          className="hidden md:flex h-full rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-none bg-white shrink-0"
          onItemSelect={(item) => handleItemSelect(item.id)}
          user={user}
        />

        {/* 2. Sidebar Drawer trên Mobile */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileOpen(false)} />
            <Sidebar
              sections={sections}
              activeId={activeId}
              variant="light"
              className="relative h-full w-72 rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-2xl bg-white z-10 animate-in slide-in-from-left duration-300"
              onItemSelect={(item) => {
                handleItemSelect(item.id);
                setIsMobileOpen(false);
              }}
              user={user}
            />
          </div>
        )}

        {/* 3. Vùng nội dung chính */}
        <div className="flex-1 h-full bg-slate-50 flex flex-col min-w-0">
          <Header
            className="border-x-0 border-t-0 bg-white"
            title={
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer shadow-xs"
                >
                  <Menu size={18} />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">{title}</h1>
              </div>
            }
            notificationBadge={null}
            messageBadge={null}
          />

          {/* Nội dung trang con */}
          <div className="flex-1 p-4 overflow-y-auto">{children}</div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
