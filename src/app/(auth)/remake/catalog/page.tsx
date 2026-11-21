'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCan } from '@/hooks';
import type { Brand, DoorSeries } from '@/types';
import { cn } from '@/utils/cn';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ListSkeleton } from '../_components/state-views';
import { TabAccessories } from './_components/tab-accessories';
import { TabCombos } from './_components/tab-combos';
import { TabGlass } from './_components/tab-glass';
import { TabProfileBars } from './_components/tab-profile-bars';
import { TabTemplates } from './_components/tab-templates';
import { BrandList } from './_components/brand-list';
import { BrandSheet } from './_components/brand-sheet';
import { SeriesList } from './_components/series-list';
import { SeriesSheet } from './_components/series-sheet';

const TABS = [
  { id: 'brand', label: 'Hãng cung cấp' },
  { id: 'series', label: 'Hệ nhôm' },
  { id: 'bars', label: 'Thanh profile' },
  { id: 'glass', label: 'Kính, gioăng' },
  { id: 'templates', label: 'Mẫu cửa' },
  { id: 'accessories', label: 'Phụ kiện' },
  { id: 'combos', label: 'Combo' },
];

// Danh mục vật tư: hãng cung cấp và hệ nhôm (thêm / sửa / xoá).
function Catalog() {
  const { can, isReady } = useCan();
  const router = useRouter();
  const params = useSearchParams();
  const tab = TABS.find((t) => t.id === params.get('tab'))?.id ?? 'brand';
  const active = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    active.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [tab]);
  const [brand, setBrand] = useState<Brand | 'new' | null>(null);
  const [series, setSeries] = useState<DoorSeries | 'new' | null>(null);

  if (!isReady) return <ListSkeleton />;
  if (!can('catalog:read'))
    return <EmptyState title="Bạn chưa có quyền xem danh mục vật tư" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader title="Danh mục vật tư" description="Hãng, hệ nhôm, thanh profile, kính, phụ kiện dùng khi báo giá và sản xuất." />

      <div
        role="tablist"
        aria-label="Nhóm danh mục"
        className="no-scrollbar sticky top-0 z-10 -mx-rm-gutter mb-4 flex gap-1 overflow-x-auto border-b border-rm-line bg-rm-bg px-rm-gutter"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={t.id === tab ? active : undefined}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => router.replace(`/remake/catalog?tab=${t.id}`, { scroll: false })}
            className={cn(
              'h-rm-tap flex-none border-b-2 px-3 text-sm font-medium active:bg-rm-primary-soft md:h-rm-control',
              tab === t.id ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'brand' && <BrandList onOpen={setBrand} onAdd={can('catalog:create') ? () => setBrand('new') : undefined} />}
      {tab === 'series' && <SeriesList onOpen={setSeries} onAdd={can('catalog:create') ? () => setSeries('new') : undefined} />}
      {tab === 'bars' && <TabProfileBars />}
      {tab === 'glass' && <TabGlass />}
      {tab === 'templates' && <TabTemplates />}
      {tab === 'accessories' && <TabAccessories />}
      {tab === 'combos' && <TabCombos />}

      <BrandSheet key={`brand-${brand === 'new' ? 'new' : (brand?.id ?? 'none')}`} target={brand} onClose={() => setBrand(null)} />
      <SeriesSheet key={`series-${series === 'new' ? 'new' : (series?.id ?? 'none')}`} target={series} onClose={() => setSeries(null)} />
    </>
  );
}

export default function RemakeCatalogPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Catalog />
    </Suspense>
  );
}
