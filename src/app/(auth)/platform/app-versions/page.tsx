'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button, FilterDrawer, PageHeading, SearchField, Tag, type FilterGroup } from '@/components-remake';
import { DataTable, type Column } from '@/components-remake/data-table';
import { AccessDenied } from '@/components/access-denied';
import { getAppVersions, getLatestAppVersion } from '@/actions';
import { useDebounce } from '@/hooks';
import type { AppVersionItem } from '@/types';
import { ListState, LoadMore } from '../_components/states';
import { ReleaseDrawer } from './_components/release-drawer';
import { VersionDrawer } from './_components/version-drawer';
import { dateOf, platformOf } from './_components/version-utils';
import { usePlatformCan } from '../_components/use-platform-can';

const PAGE = 20;
const GROUPS: FilterGroup[] = [
  {
    key: 'platform',
    label: 'Nền tảng',
    options: [
      { value: 'android', label: 'Android' },
      { value: 'ios', label: 'iOS' },
    ],
  },
];

// Phiên bản ứng dụng di động: chỉ quản trị nền tảng xem và phát hành
export default function PlatformAppVersionsPage() {
  const { can, isReady } = usePlatformCan();
  const canRead = can('app_version:read');
  const canCreate = can('app_version:create');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const platform = filters.platform ?? '';
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
  const isLatest = (v: AppVersionItem) => v.platform === 'android' && v.versionCode === latest.data?.versionCode;
  const filtered = !!(term || platform);

  if (!isReady)
    return (
      <div className="p-4 md:p-6">
        <ListState kind="loading" />
      </div>
    );
  if (!canRead) return <AccessDenied />;

  const columns: Column<AppVersionItem>[] = [
    { key: 'version', header: 'Phiên bản', render: (v) => <span className="font-medium text-slate-900">v{v.versionName}</span> },
    { key: 'build', header: 'Build', className: 'tabular-nums', render: (v) => v.versionCode },
    { key: 'platform', header: 'Nền tảng', render: (v) => platformOf(v.platform) },
    { key: 'date', header: 'Phát hành', wide: true, render: (v) => dateOf(v.createdAt) },
    {
      key: 'state',
      header: 'Trạng thái',
      render: (v) => (
        <span className="flex gap-1.5">
          {isLatest(v) && <Tag tone="green">Mới nhất</Tag>}
          <Tag tone={v.forceUpdate ? 'red' : 'slate'}>{v.forceUpdate ? 'Bắt buộc' : 'Tùy chọn'}</Tag>
        </span>
      ),
    },
  ];

  let body;
  if (list.isLoading) body = <ListState kind="loading" />;
  else if (list.isError) body = <ListState kind="error" onRetry={() => list.refetch()} />;
  else if (items.length === 0)
    body = (
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
    );
  else
    body = (
      <div className="flex flex-col gap-3">
        <DataTable
          caption="Phiên bản ứng dụng"
          rows={items}
          rowKey={(v) => v.id}
          columns={columns}
          onOpen={setSelected}
          card={(v) => (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  v{v.versionName} <span className="font-normal text-slate-500">· Build {v.versionCode}</span>
                </p>
                <p className="truncate text-xs text-slate-500">
                  {platformOf(v.platform)} · {dateOf(v.createdAt)}
                </p>
              </div>
              {isLatest(v) && <Tag tone="green">Mới nhất</Tag>}
              <Tag tone={v.forceUpdate ? 'red' : 'slate'}>{v.forceUpdate ? 'Bắt buộc' : 'Tùy chọn'}</Tag>
            </div>
          )}
        />
        <LoadMore visible={items.length} total={total} loading={list.isFetching} onClick={() => setLimit((l) => l + PAGE)} />
      </div>
    );

  return (
    <div className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
      <PageHeading
        className="mb-0"
        title="Phiên bản ứng dụng"
        description={
          latest.data && total > 0
            ? `Android mới nhất v${latest.data.versionName} · ${total} bản đã phát hành`
            : 'Các bản app di động đã phát hành cho nhân viên.'
        }
      />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm phiên bản" placeholder="Số phiên bản" />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={GROUPS} value={filters} onChange={setFilters} />
          {canCreate && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setReleasing(true)}>
              Phát hành bản mới
            </Button>
          )}
        </div>
      </div>
      {body}
      <VersionDrawer version={selected} latest={selected ? isLatest(selected) : false} onClose={() => setSelected(null)} />
      {canCreate && <ReleaseDrawer isOpen={releasing} onClose={() => setReleasing(false)} />}
    </div>
  );
}
