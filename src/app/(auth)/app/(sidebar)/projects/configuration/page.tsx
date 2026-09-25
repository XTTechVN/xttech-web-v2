/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import DoorsTab from './doors';
import BrandTab from './brand';
import SeriesTab from './series';
import GlassGasketsTab from './glass-gaskets';
import AccessoriesTab from './accessories';
import { Columns, ListChecks, Building2, ShieldCheck, Layers } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePermission } from '@/hooks';

interface ConfigTab {
  id: string;
  label: string;
  component: React.ComponentType;
  icon: React.ReactNode;
  roles: string[];
}

const ALL_ROLES = ['super', 'admin', 'accountant', 'hr', 'sale', 'employee', 'technician'];

const TABS: ConfigTab[] = [
  {
    id: 'brand',
    label: 'Hãng nhôm',
    component: BrandTab,
    icon: <Building2 size={16} />,
    roles: ALL_ROLES,
  },
  {
    id: 'series',
    label: 'Hệ nhôm',
    component: SeriesTab,
    icon: <Layers size={16} />,
    roles: ALL_ROLES,
  },
  {
    id: 'glass-gaskets',
    label: 'Kính, Panel & Lưới muỗi',
    component: GlassGasketsTab,
    icon: <ShieldCheck size={16} />,
    roles: ALL_ROLES,
  },
  {
    id: 'doors',
    label: 'Biên dạng cửa',
    component: DoorsTab,
    icon: <Columns size={16} />,
    roles: ALL_ROLES,
  },
  {
    id: 'accessories',
    label: 'Phụ kiện & Combo',
    component: AccessoriesTab,
    icon: <ListChecks size={16} />,
    roles: ALL_ROLES,
  },
];

function ProjectConfigurationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const { hasRole } = usePermission();

  // Lọc các Tab mà người dùng hiện tại có quyền truy cập
  const availableTabs = useMemo(() => {
    return TABS.filter((tab) => hasRole(tab.roles));
  }, [hasRole]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (urlTab === 'aluminum') return 'brand';
    if (urlTab && TABS.some((t) => t.id === urlTab)) {
      return urlTab;
    }
    return 'brand';
  });

  // Đồng bộ khi URL search param thay đổi
  useEffect(() => {
    if (urlTab && availableTabs.some((t) => t.id === urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, availableTabs, activeTab]);

  // Đảm bảo activeTab luôn là một tab hợp lệ trong availableTabs
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  const currentTab = availableTabs.find((t) => t.id === activeTab) || availableTabs[0];
  const ActiveComponent = currentTab?.component || BrandTab;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/app/projects/configuration?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 text-black">
      {/* Tab Content */}
      <div className="min-h-[400px]">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

export default function ProjectConfigurationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Đang tải cấu hình dự án...</div>}>
      <ProjectConfigurationContent />
    </Suspense>
  );
}
