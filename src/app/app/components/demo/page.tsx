'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components';
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Bell,
  MessageSquare,
  GitBranch,
  Menu,
} from 'lucide-react';

export default function DemoDashboardPage() {
  const [activeMenu, setActiveMenu] = useState('activity');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const user = {
    name: 'Nguyễn Văn Anh',
    role: 'Quản trị viên',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
  };

  const sections = [
    {
      title: 'Hệ thống',
      items: [
        { id: 'activity', label: 'Hoạt động', icon: <LayoutDashboard size={18} /> },
        { id: 'billing', label: 'Tài khoản & Chi phí', icon: <Wallet size={18} /> },
        { id: 'reports', label: 'Báo cáo', icon: <FileText size={18} /> },
        { id: 'notifications', label: 'Thông báo', icon: <Bell size={18} />, badge: 4 },
      ],
    },
    {
      title: 'Ứng dụng liên kết',
      items: [
        { id: 'slack', label: 'Slack Channel', icon: <MessageSquare size={18} /> },
        { id: 'github', label: 'GitHub Repo', icon: <GitBranch size={18} /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-screen bg-white relative overflow-hidden">
      {/* 1. Sidebar hiển thị mặc định trên Desktop (md breakpoint trở lên) */}
      <Sidebar
        sections={sections}
        activeId={activeMenu}
        variant="light"
        className="hidden md:flex h-full rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-none bg-white shrink-0"
        onItemSelect={setActiveMenu}
        user={user}
      />

      {/* 2. Sidebar trên Mobile (Ẩn mặc định, hiển thị dạng Drawer/Overlay khi isMobileOpen = true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop mờ nền sau */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sidebar Drawer bay từ lề trái */}
          <Sidebar
            sections={sections}
            activeId={activeMenu}
            variant="light"
            className="relative h-full w-72 rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-2xl bg-white z-10 animate-in slide-in-from-left duration-300"
            onItemSelect={(id) => {
              setActiveMenu(id);
              setIsMobileOpen(false); // Tự động đóng Sidebar trên Mobile sau khi click chọn tab
            }}
            user={user}
          />
        </div>
      )}

      {/* 3. Vùng hiển thị nội dung chính */}
      <div className="flex-1 h-full bg-slate-50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto min-w-0">
        <header className="flex items-center gap-4 shrink-0">
          {/* Nút Hamburger menu (chỉ hiển thị trên Mobile) */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer shadow-xs"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            Nội dung: {sections.flatMap((s) => s.items).find((i) => i.id === activeMenu)?.label}
          </h1>
        </header>

        <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs">
          <p className="text-slate-500">
            Trang đang chọn: <span className="font-semibold text-slate-700">{activeMenu}</span>
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Hãy thử thu nhỏ kích thước trình duyệt về giao diện điện thoại (Mobile Viewport) để kiểm
            nghiệm Drawer Sidebar đóng/mở tự động.
          </p>
        </div>
      </div>
    </div>
  );
}
