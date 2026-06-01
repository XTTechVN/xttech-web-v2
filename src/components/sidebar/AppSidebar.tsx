'use client';

import {
  AlertCircle,
  Camera,
  Home,
  Map,
  Monitor,
  User,
  Clock,
  Server,
  Shield,
  Key,
  Bell,
  Folder,
  Layers,
  Lock,
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import SidebarCategory from './SidebarCategory';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { APP_VERSION } from '@/config/app';

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const appRoutes = [
    // Trang chủ
    {
      category: 'Trang chủ',
      items: [
        {
          path: '/app',
          label: 'Tổng quan',
          icon: <Home size={16} />,
        },
      ],
    },
    {
      category: 'Cảnh báo & sự kiện',
      items: [
        {
          path: '/app/event',
          label: 'Cảnh báo',
          icon: <AlertCircle size={16} />,
        },
        {
          path: '/app/event/access',
          label: 'Cảnh báo ra vào',
          icon: <Bell size={16} />,
        },
        {
          path: '/app/event/safety',
          label: 'Cảnh báo ATLĐ',
          icon: <Bell size={16} />,
        },
        {
          path: '/app/event/violation',
          label: 'Cảnh báo vi phạm',
          icon: <AlertCircle size={16} />,
        },
        {
          path: '/app/event/vehicle',
          label: 'Cảnh báo phương tiện',
          icon: <AlertCircle size={16} />,
        },
      ],
    },
    // Camera
    {
      category: 'Camera',
      items: [
        {
          path: '/app/camera',
          label: 'Danh sách camera',
          icon: <Camera size={16} />,
        },
        {
          path: '/app/camera/map',
          label: 'Bản đồ camera',
          icon: <Map size={16} />,
        },
      ],
    },
    // Giám sát
    {
      category: 'Giám sát',
      items: [
        {
          path: '/app/monitor/live',
          label: 'Live',
          icon: <Monitor size={16} />,
        },
        {
          path: '/app/monitor/timeline',
          label: 'Smart Playback',
          icon: <Clock size={16} />,
        },
      ],
    },
    // Truy vết
    {
      category: 'Truy vết',
      items: [
        {
          path: '/app/tracing',
          label: 'Truy vết đối tượng',
          icon: <User size={16} />,
        },
      ],
    },
    // Máy chủ AI
    {
      category: 'Máy chủ AI',
      items: [
        {
          path: '/app/workers',
          label: 'Danh sách máy chủ',
          icon: <Server size={16} />,
        },
      ],
    },
    // Hệ thống
    {
      category: 'Hệ thống',
      items: [
        {
          path: '/app/system/users',
          label: 'Quản lý người dùng',
          icon: <User size={16} />,
        },
        {
          path: '/app/system/roles',
          label: 'Quản lý vai trò',
          icon: <Shield size={16} />,
        },
        {
          path: '/app/system/permissions',
          label: 'Quản lý quyền hạn',
          icon: <Key size={16} />,
        },
        {
          path: '/app/projects',
          label: 'Quản lý dự án',
          icon: <Folder size={16} />,
        },
        {
          path: '/app/system/user-projects',
          label: 'Phân quyền dự án',
          icon: <Lock size={16} />,
        },
      ],
    },
  ];

  return (
    <div className="bg-gray-100 min-h-full p-4 flex flex-col space-y-8">
      <div className="flex-1 space-y-4">
        {appRoutes.map((route) => (
          <SidebarCategory key={route.category} title={route.category}>
            {route.items.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                onClick={() => router.push(item.path)}
                isActive={pathname === item.path}
              >
                {item.label}
              </SidebarItem>
            ))}
          </SidebarCategory>
        ))}
      </div>

      <p className="mt-auto text-xs text-gray-500 font-semibold text-center">
        Vifence AI v{APP_VERSION}
      </p>
    </div>
  );
}
