/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  Columns,
  ListChecks,
  Building2,
  ShieldCheck,
  Layers,
  Ruler,
  PackageOpen,
  LayoutGrid,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { usePermission } from '@/hooks';
import { Skeleton } from '@/components';

const ConfigTabFallback = () => (
  <div className="p-4">
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
);

const BrandTab = dynamic(() => import('./brand'), { loading: ConfigTabFallback });
const SeriesTab = dynamic(() => import('./series'), { loading: ConfigTabFallback });
const ProfileBarsTab = dynamic(() => import('./profile-bars'), { loading: ConfigTabFallback });
const GlassGasketsTab = dynamic(() => import('./glass-gaskets'), { loading: ConfigTabFallback });
const DoorsTab = dynamic(() => import('./doors'), { loading: ConfigTabFallback });
const DoorTemplatesTab = dynamic(() => import('./door-templates'), { loading: ConfigTabFallback });
const AccessoriesTab = dynamic(() => import('./accessories'), { loading: ConfigTabFallback });
const AccessoryCombosTab = dynamic(() => import('./accessory-combos'), { loading: ConfigTabFallback });

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
    label: 'Hãng cung cấp',
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
    id: 'profile-bars',
    label: 'Thanh profile',
    component: ProfileBarsTab,
    icon: <Ruler size={16} />,
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
    id: 'door-templates',
    label: 'Mẫu cửa',
    component: DoorTemplatesTab,
    icon: <LayoutGrid size={16} />,
    roles: ALL_ROLES,
  },
  {
    id: 'accessories',
    label: 'Phụ kiện',
    component: AccessoriesTab,
    icon: <ListChecks size={16} />,
    roles: ALL_ROLES,
  },
  {
    id: 'accessory-combos',
    label: 'Combo phụ kiện',
    component: AccessoryCombosTab,
    icon: <PackageOpen size={16} />,
    roles: ALL_ROLES,
  },
];

function ProjectConfigurationContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const { hasRole } = usePermission();

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

  useEffect(() => {
    if (urlTab && availableTabs.some((t) => t.id === urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, availableTabs, activeTab]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  const currentTab = availableTabs.find((t) => t.id === activeTab) || availableTabs[0];
  const ActiveComponent = currentTab?.component || BrandTab;

  return (
    <div className="flex flex-col gap-4 text-black">
      <div className="min-h-[400px]">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

export default function ProjectConfigurationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 font-medium">
          Đang tải cấu hình dự án...
        </div>
      }
    >
      <ProjectConfigurationContent />
    </Suspense>
  );
}
