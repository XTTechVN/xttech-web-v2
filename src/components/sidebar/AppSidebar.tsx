'use client';

import {
  AlertCircle,
  Camera,
  Home,
  Map,
  Monitor,
  User,
  Video,
  Clock,
  Settings,
  Image,
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
        {
          path: '/app/alert',
          label: 'Cảnh báo',
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
          icon: <User size={16} />,
        },
      ],
    },
    // Cài đặt
    {
      category: 'Cài đặt',
      items: [
        {
          path: '/app/settings/system',
          label: 'Cài đặt hệ thống',
          icon: <Settings size={16} />,
        },
        {
          path: '/app/settings/monitor',
          label: 'Cài đặt màn hình',
          icon: <Monitor size={16} />,
        },
      ],
    },
  ];

  return (
    <div className="bg-gray-100 h-full p-4 flex flex-col">
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
