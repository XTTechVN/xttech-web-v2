'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, CalendarClock, Users } from 'lucide-react';

import { getDepartment } from '@/actions';

const TABS = [
  {
    id: 'positions',
    label: 'Vị trí & Chức danh',
    icon: <Briefcase size={16} />,
  },
  {
    id: 'members',
    label: 'Nhân sự phòng ban',
    icon: <Users size={16} />,
  },
  {
    id: 'shifts',
    label: 'Ca làm việc',
    icon: <CalendarClock size={16} />,
  },
];

export default function DepartmentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const departmentId = Number(params.id);

  // Lấy thông tin phòng ban hiện tại
  const { data: departmentDetail } = useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => getDepartment(departmentId),
    enabled: !!departmentId,
  });

  // Xác định tab đang active dựa trên pathname
  const activeTab = pathname.includes('/shifts')
    ? 'shifts'
    : pathname.includes('/members')
    ? 'members'
    : 'positions';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'positions') {
      router.push(`/app/departments/${departmentId}/positions`);
    } else if (tabId === 'members') {
      router.push(`/app/departments/${departmentId}/members`);
    } else if (tabId === 'shifts') {
      router.push(`/app/departments/${departmentId}/shifts`);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-black w-full">
      {/* Tab Navigation 3 Tabs */}
      <div className="flex overflow-x-auto scrollbar-none gap-3 p-1">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-primary hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-100 w-full">{children}</div>
    </div>
  );
}
