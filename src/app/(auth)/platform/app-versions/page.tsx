'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { getAppVersions, getLatestAppVersion } from '@/actions';
import { Badge } from '@/components';
import { useCan, useDebounce } from '@/hooks';
import type { AppVersionItem } from '@/types';
import { LoadMore } from '../_components/load-more';
import { ListState, PageHeader } from '../_components/page-parts';
import { ReleaseDrawer } from './_components/release-drawer';
import { VersionDrawer } from './_components/version-drawer';
import { dateOf, platformOf } from './_components/version-utils';

const PAGE = 20;
const FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
];

// Phiên bản ứng dụng di động: chỉ quản trị nền tảng (org system) xem và phát hành; doanh nghiệp không có chức năng này.
export default function PlatformAppVersionsPage() {
  const { can, isReady } = useCan();
  const canRead = can('app_version:read');
  const canCreate = can('app_version:create');
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<AppVersionItem | null>(null);
  const [releasing, setReleasing] = useState(false);
  const term = useDebounce(search.trim(), 300);

  const list = useQuery({
    queryKey: ['app-versions', term, platform, limit],
    queryFn: () => getAppVersions({ limit, search: term || undefined, platform: platform || undefined }),
    placeholderData: (prev) => prev,
    enabled: isReady && canRead,
  });
  const latest = useQuery({
    queryKey: ['app-versions', 'latest', 'android'],
    queryFn: () => getLatestAppVersion('android'),
    enabled: isReady && canRead,
    retry: false,
  });

  const items = list.data?.items ?? [];
  const total = list.data?.meta?.total ?? items.length;
  const latestCode = latest.data?.versionCode;
  const isLatest = (v: AppVersionItem) => v.platform === 'android' && v.versionCode === latestCode;
  const filtered = !!(term || platform);

  if (!isReady) return <ListState kind="loading" />;
  if (!canRead)
    return (
      <div className="p-4 md:p-6">
        <ListState kind="empty" emptyText="Bạn chưa có quyền xem phiên bản ứng dụng." />
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <PageHeader title="Phiên bản ứng dụng" description="Các bản app di động đã phát hành cho nhân viên." />
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setReleasing(true)}
            aria-label="Phát hành bản mới"
            className="inline-flex h-11 min-w-11 flex-none items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white active:scale-95"
          >
            <Plus size={18} aria-hidden="true" />
            <span className="hidden md:inline">Phát hành bản mới</span>
          </button>
        )}
      </div>

      <div className="sticky top-14 z-10 -mx-4 flex flex-col gap-2 bg-gray-50 px-4 py-1 md:static md:mx-0 md:bg-transparent md:px-0">
        <label htmlFor="av-search" className="sr-only">
          Tìm phiên bản
        </label>
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="av-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Số phiên bản"
            className="h-11 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
          />
        </div>
        <div role="group" aria-label="Lọc theo nền tảng" className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={platform === f.value}
              onClick={() => setPlatform(f.value)}
              className={`h-11 flex-none rounded-md border px-4 text-sm font-medium active:scale-95 ${
                platform === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {latest.data && total > 0 && (
        <p className="text-sm text-gray-500">
          Android mới nhất: <span className="font-medium text-gray-900">v{latest.data.versionName}</span> · {total} bản đã phát hành
        </p>
      )}

      {list.isLoading && <ListState kind="loading" />}
      {list.isError && <ListState kind="error" onRetry={() => list.refetch()} />}
      {list.data && items.length === 0 && (
        <ListState
          kind="empty"
          emptyText={
            filtered
              ? 'Không tìm thấy phiên bản nào khớp bộ lọc.'
              : canCreate
                ? 'Chưa có bản phát hành. Phát hành bản đầu tiên để nhân viên cập nhật.'
                : 'Chưa có bản nào được phát hành.'
          }
        />
      )}
      {items.length > 0 && (
        <>
          <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {items.map((v, i) => (
              <li key={v.id} className="motion-safe:animate-rise" style={{ animationDelay: `${Math.min(i % PAGE, 5) * 50}ms` }}>
                <button
                  type="button"
                  onClick={() => setSelected(v)}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left transition-colors active:bg-gray-50 [@media(hover:hover)]:hover:bg-gray-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 truncate text-sm font-semibold text-gray-900">v{v.versionName}</span>
                      <span className="flex-none text-xs text-gray-500">Build {v.versionCode}</span>
                      {isLatest(v) && (
                        <Badge size="sm" variant="success" className="flex-none">
                          Mới nhất
                        </Badge>
                      )}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {platformOf(v.platform)} · {dateOf(v.createdAt)}
                      {v.changelog?.[0] ? ` · ${v.changelog[0]}` : ''}
                    </span>
                  </span>
                  <Badge size="sm" variant={v.forceUpdate ? 'danger' : 'default'} className="flex-none">
                    {v.forceUpdate ? 'Bắt buộc' : 'Tùy chọn'}
                  </Badge>
                  <ChevronRight size={18} className="flex-none text-gray-400" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <LoadMore visible={items.length} total={total} loading={list.isFetching} onClick={() => setLimit((l) => l + PAGE)} />
        </>
      )}

      {selected && <VersionDrawer version={selected} latest={isLatest(selected)} onClose={() => setSelected(null)} />}
      {releasing && canCreate && <ReleaseDrawer onClose={() => setReleasing(false)} />}
    </div>
  );
}
