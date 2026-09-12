'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  CalendarOff,
  ClockAlert,
  CalendarCheck,
  Building2,
  Users,
  Lightbulb,
  BarChart3,
} from 'lucide-react';

interface QuickActionItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  badge?: number;
}

interface QuickActionsGridProps {
  pendingLeavesCount?: number;
  pendingAdjustmentsCount?: number;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  pendingLeavesCount = 0,
  pendingAdjustmentsCount = 0,
}) => {
  const actions: QuickActionItem[] = [
    {
      id: 'live-map',
      title: 'Bản đồ Live',
      href: '/app/live-map',
      icon: <MapPin size={22} />,
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80',
      textColor: 'text-emerald-600',
    },
    {
      id: 'leave-requests',
      title: 'Nghỉ phép',
      href: '/app/leave-requests',
      icon: <CalendarOff size={22} />,
      bgColor: 'bg-amber-50 hover:bg-amber-100/80',
      textColor: 'text-amber-600',
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
    },
    {
      id: 'adjustments',
      title: 'Khiếu nại',
      href: '/app/attendances/adjustments',
      icon: <ClockAlert size={22} />,
      bgColor: 'bg-blue-50 hover:bg-blue-100/80',
      textColor: 'text-blue-600',
      badge: pendingAdjustmentsCount > 0 ? pendingAdjustmentsCount : undefined,
    },
    {
      id: 'payroll',
      title: 'Bảng công',
      href: '/app/attendances/payroll',
      icon: <CalendarCheck size={22} />,
      bgColor: 'bg-purple-50 hover:bg-purple-100/80',
      textColor: 'text-purple-600',
    },
    {
      id: 'projects',
      title: 'Dự án',
      href: '/app/projects',
      icon: <Building2 size={22} />,
      bgColor: 'bg-cyan-50 hover:bg-cyan-100/80',
      textColor: 'text-cyan-600',
    },
    {
      id: 'employees',
      title: 'Nhân sự',
      href: '/app/employees',
      icon: <Users size={22} />,
      bgColor: 'bg-indigo-50 hover:bg-indigo-100/80',
      textColor: 'text-indigo-600',
    },
    {
      id: 'suggestions',
      title: 'Góp ý',
      href: '/app/suggestions',
      icon: <Lightbulb size={22} />,
      bgColor: 'bg-rose-50 hover:bg-rose-100/80',
      textColor: 'text-rose-600',
    },
    {
      id: 'reports',
      title: 'Báo cáo',
      href: '/app/attendances/reports',
      icon: <BarChart3 size={22} />,
      bgColor: 'bg-teal-50 hover:bg-teal-100/80',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Tiện ích doanh nghiệp
        </h2>
        <span className="text-[11px] text-gray-400 font-medium">8 tính năng</span>
      </div>

      <div className="grid grid-cols-4 gap-3 pt-1">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95 transition"
          >
            <div
              className={`relative w-13 h-13 rounded-2xl flex items-center justify-center transition shadow-xs ${action.bgColor} ${action.textColor}`}
            >
              {action.icon}
              {action.badge !== undefined && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                  {action.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-gray-700 text-center line-clamp-1 group-hover:text-primary transition">
              {action.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
