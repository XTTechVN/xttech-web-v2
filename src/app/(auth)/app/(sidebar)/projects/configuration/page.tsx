/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import DoorsPage from './doors/page';
import MaterialsPage from './materials/page';
import AccessoriesPage from './accessories/page';
import ExtraOptionsPage from './extra-options/page';
import FormulasPage from './formulas/page';
import { Columns, ListChecks, Settings, Calculator, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks';

interface ConfigTab {
  id: string;
  label: string;
  component: React.ComponentType;
  icon: React.ReactNode;
  roles: string[];
}

const TABS: ConfigTab[] = [
  {
    id: 'doors',
    label: 'Biên dạng cửa',
    component: DoorsPage,
    icon: <Columns size={16} />,
    roles: ['super', 'admin', 'sale', 'accountant', 'hr'],
  },
  {
    id: 'materials',
    label: 'Hệ nhôm',
    component: MaterialsPage,
    icon: <LayoutGrid size={16} />,
    roles: ['super', 'admin', 'accountant', 'hr'],
  },
  {
    id: 'accessories',
    label: 'Phụ kiện',
    component: AccessoriesPage,
    icon: <ListChecks size={16} />,
    roles: ['super', 'admin', 'accountant', 'hr'],
  },
  {
    id: 'extra-options',
    label: 'Tùy chọn phát sinh',
    component: ExtraOptionsPage,
    icon: <Settings size={16} />,
    roles: ['super', 'admin', 'accountant', 'hr'],
  },
  {
    id: 'formulas',
    label: 'Công thức',
    component: FormulasPage,
    icon: <Calculator size={16} />,
    roles: ['super', 'admin', 'accountant', 'hr'],
  },
];

export default function ProjectConfigurationPage() {
  const router = useRouter();
  const { hasRole } = usePermission();

  // Lọc các Tab mà người dùng hiện tại có quyền truy cập
  const availableTabs = useMemo(() => {
    return TABS.filter((tab) => hasRole(tab.roles));
  }, [hasRole]);

  const [activeTab, setActiveTab] = useState<string>('doors');

  // Đảm bảo activeTab luôn là một tab hợp lệ trong availableTabs
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  const currentTab = availableTabs.find((t) => t.id === activeTab) || availableTabs[0];
  const ActiveComponent = currentTab?.component || DoorsPage;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push('/app/projects/configuration');
  };

  return (
    <div className="flex flex-col gap-4 text-black">
      {/* Tab Navigation */}
      {availableTabs.length > 1 && (
        <div className="flex overflow-x-auto scrollbar-none gap-2 sm:gap-4 p-1">
          {availableTabs.map((tab) => {
            const isActive = tab.id === (currentTab?.id || activeTab);
            return (
              <button
                key={tab.id}
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
      )}

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

