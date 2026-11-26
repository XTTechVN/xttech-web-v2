'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components';
import { AccessDenied } from '@/components/access-denied';
import { PageHeading } from '@/components-remake';
import { useCan } from '@/hooks';

const ConfigTabFallback = () => (
  <div className="p-4">
    <Skeleton className="h-96 w-full rounded-block" />
  </div>
);

const BrandTab = dynamic(() => import('./brand'), { loading: ConfigTabFallback });
const SeriesTab = dynamic(() => import('./series'), { loading: ConfigTabFallback });
const ProfileBarsTab = dynamic(() => import('./profile-bars'), { loading: ConfigTabFallback });
const GlassGasketsTab = dynamic(() => import('./glass-gaskets'), { loading: ConfigTabFallback });
const DoorsTab = dynamic(() => import('./doors'), { loading: ConfigTabFallback });
const DoorTemplatesTab = dynamic(() => import('./door-templates'), { loading: ConfigTabFallback });
const SupplierDoorsTab = dynamic(() => import('./supplier-doors'), { loading: ConfigTabFallback });
const AccessoriesTab = dynamic(() => import('./accessories'), { loading: ConfigTabFallback });
const AccessoryCombosTab = dynamic(() => import('./accessory-combos'), { loading: ConfigTabFallback });

interface ConfigTab {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
}

// Mục được chọn từ menu bên trái qua ?tab=; cổng quyền ở trang, mọi mục cùng nhóm quyền `catalog`
const TABS: ConfigTab[] = [
  { id: 'brand', title: 'Hãng cung cấp', description: 'Thương hiệu nhôm, phụ kiện và hệ màu.', component: BrandTab },
  { id: 'series', title: 'Hệ nhôm', description: 'Các hệ nhôm theo từng hãng.', component: SeriesTab },
  { id: 'profile-bars', title: 'Thanh profile', description: 'Thanh nhôm theo hệ và hãng.', component: ProfileBarsTab },
  { id: 'glass-gaskets', title: 'Kính, panel và lưới muỗi', description: 'Quy cách kính, tấm và lưới.', component: GlassGasketsTab },
  { id: 'doors', title: 'Biên dạng cửa', description: 'Biên dạng cửa và định mức vật tư.', component: DoorsTab },
  { id: 'door-templates', title: 'Mẫu cửa', description: 'Mẫu cửa dựng sẵn.', component: DoorTemplatesTab },
  { id: 'supplier-doors', title: 'Cửa nhập nhà cung cấp', description: 'Cửa mua nguyên bộ từ nhà cung cấp.', component: SupplierDoorsTab },
  { id: 'accessories', title: 'Phụ kiện, roan và keo', description: 'Phụ kiện cửa, roan và keo.', component: AccessoriesTab },
  { id: 'accessory-combos', title: 'Combo phụ kiện', description: 'Bộ phụ kiện đi cùng nhau.', component: AccessoryCombosTab },
];

function ProjectConfigurationContent() {
  const { can, isReady } = useCan();
  const urlTab = useSearchParams().get('tab');
  const tab = TABS.find((t) => t.id === (urlTab === 'aluminum' ? 'brand' : urlTab)) ?? TABS[0];
  const Active = tab.component;

  if (!isReady) return <ConfigTabFallback />;
  if (!can('catalog:read')) return <AccessDenied />;

  return (
    <div className="font-body [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <PageHeading title={tab.title} description={tab.description} />
      </div>
      <Active key={tab.id} />
    </div>
  );
}

export default function ProjectConfigurationPage() {
  return (
    <Suspense fallback={<ConfigTabFallback />}>
      <ProjectConfigurationContent />
    </Suspense>
  );
}
