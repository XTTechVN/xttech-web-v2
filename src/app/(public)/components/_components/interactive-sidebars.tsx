'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components';
import { LayoutDashboard, FileText, Wallet, Bell, Settings, LifeBuoy, LogOut, GitBranch, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function InteractiveSidebars() {
  const [activeId, setActiveId] = useState('activity');

  const sections = [
    {
      title: 'Feature',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard size={18} />,
          subItems: [
            { id: 'activity', label: 'Activity' },
            { id: 'traffic', label: 'Traffic' },
            { id: 'statistic', label: 'Statistic' },
          ],
        },
        {
          id: 'invoices',
          label: 'Invoices',
          icon: <FileText size={18} />,
        },
        {
          id: 'wallet',
          label: 'Wallet',
          icon: <Wallet size={18} />,
        },
        {
          id: 'notification',
          label: 'Notification',
          icon: <Bell size={18} />,
        },
      ],
    },
    {
      title: 'Apps',
      showAddButton: true,
      onAddClick: () => toast.success('Thêm ứng dụng mới!'),
      items: [
        {
          id: 'slack',
          label: 'Slack',
          icon: <MessageSquare size={18} />,
        },
        {
          id: 'github',
          label: 'GitHub',
          icon: <GitBranch size={18} />,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings size={18} />,
        },
        {
          id: 'help',
          label: 'Help Center',
          icon: <LifeBuoy size={18} />,
        },
        {
          id: 'logout',
          label: 'Log Out',
          icon: <LogOut size={18} className="text-red-500" />,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap gap-8 items-start justify-center p-6 bg-slate-950 rounded-xl">
      {/* 1. Full Sidebar Demo */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 text-center">Sidebar hoàn chỉnh</h3>
        <Sidebar
          sections={sections}
          activeId={activeId}
          onItemSelect={(id) => {
            setActiveId(id);
            toast.success(`Chuyển mục: ${id}`);
          }}
          user={{
            name: 'Andrew Smith',
            role: 'Product Designer',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          }}
          cta={{
            title: "Let's start!",
            description: "Creating or adding new tasks couldn't be easier",
            buttonText: "Add New Task",
            onButtonClick: () => toast.success('Click thêm Task mới!'),
          }}
        />
      </div>

      {/* 2. Simple Sidebar Demo (No profile & CTA) */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 text-center">Sidebar rút gọn</h3>
        <Sidebar
          sections={sections}
          activeId={activeId}
          onItemSelect={(id) => {
            setActiveId(id);
            toast.success(`Chuyển mục: ${id}`);
          }}
        />
      </div>
    </div>
  );
}
