'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { FilterDrawer, PageHeading, SearchField, Tag, type FilterGroup } from '@/components-remake';
import { DataTable, type Column } from '@/components-remake/data-table';
import { AccessDenied } from '@/components/access-denied';
import { NEWS_CATEGORY_OPTIONS, NEWS_STATUS_OPTIONS } from '@/config';
import { getAdminNewsList } from '@/actions';
import { useDebounce } from '@/hooks';
import type { NewsArticle, NewsCategory, NewsStatus } from '@/types';
import { ListState, LoadMore } from '../_components/states';
import { NewsDrawer, statusTag } from './_components/news-drawer';
import { usePlatformCan } from '../_components/use-platform-can';

const LIMIT = 20;
const GROUPS: FilterGroup[] = [
  { key: 'status', label: 'Trạng thái', options: NEWS_STATUS_OPTIONS },
  { key: 'category', label: 'Chuyên mục', options: NEWS_CATEGORY_OPTIONS },
];
const categoryLabel = (c: string) => NEWS_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;

const COLUMNS: Column<NewsArticle>[] = [
  {
    key: 'title',
    header: 'Bài viết',
    className: 'max-w-96',
    render: (a) => (
      <span className="flex items-center gap-2">
        <span className="block min-w-0 truncate font-medium text-slate-900">{a.title}</span>
        {a.isFeatured && <Tag tone="violet">Tiêu điểm</Tag>}
      </span>
    ),
  },
  { key: 'category', header: 'Chuyên mục', wide: true, render: (a) => categoryLabel(a.category) },
  { key: 'status', header: 'Trạng thái', render: statusTag },
  { key: 'views', header: 'Lượt xem', className: 'text-right tabular-nums', render: (a) => a.viewCount },
  { key: 'date', header: 'Cập nhật', wide: true, render: (a) => new Date(a.updatedAt).toLocaleDateString('vi-VN') },
];

export default function PlatformNewsPage() {
  const { can, isReady } = usePlatformCan();
  const canRead = can('news:read') || can('news:publish') || can('news:create') || can('news:update');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const status = filters.status ?? '';
  const category = filters.category ?? '';
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const term = useDebounce(search.trim(), 300);

  const q = useInfiniteQuery({
    queryKey: ['admin-news', term, status, category],
    queryFn: ({ pageParam }) =>
      getAdminNewsList({
        offset: pageParam,
        limit: LIMIT,
        search: term || undefined,
        status: (status as NewsStatus) || undefined,
        category: (category as NewsCategory) || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.meta?.next ? last.meta.offset + last.meta.limit : undefined),
    enabled: isReady && canRead,
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const total = q.data?.pages[0]?.meta?.total ?? items.length;
  const selected = items.find((a) => a.id === selectedId) ?? null;
  const filtered = !!(term || status || category);

  if (!isReady)
    return (
      <div className="p-4 md:p-6">
        <ListState kind="loading" />
      </div>
    );
  if (!canRead) return <AccessDenied />;

  let body;
  if (q.isLoading) body = <ListState kind="loading" />;
  else if (q.isError) body = <ListState kind="error" onRetry={() => q.refetch()} />;
  else if (items.length === 0) body = <ListState kind="empty" emptyText={filtered ? 'Không có bài viết khớp bộ lọc.' : 'Chưa có bài viết nào.'} />;
  else
    body = (
      <div className="flex flex-col gap-3">
        <DataTable
          caption="Danh sách bài viết"
          rows={items}
          rowKey={(a) => a.id}
          columns={COLUMNS}
          onOpen={(a) => setSelectedId(a.id)}
          card={(a) => (
            <div className="flex flex-col gap-1">
              <p className="line-clamp-2 text-sm font-medium text-slate-900 [overflow-wrap:anywhere]">{a.title}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {statusTag(a)}
                {a.isFeatured && <Tag tone="violet">Tiêu điểm</Tag>}
                <span className="text-xs text-slate-500">
                  {categoryLabel(a.category)} · {a.viewCount} lượt xem
                </span>
              </div>
            </div>
          )}
        />
        <LoadMore visible={items.length} total={total} loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()} />
      </div>
    );

  return (
    <div className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
      <PageHeading className="mb-0" title="Tin tức" description="Đăng và quản lý bài viết tin tức." />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm bài viết" placeholder="Tiêu đề, tóm tắt, đường dẫn" />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={GROUPS} value={filters} onChange={setFilters} />
          {can('news:create') && (
            <Link
              href="/platform/news/new"
              aria-label="Viết bài mới"
              className="inline-flex h-11 min-w-11 flex-none items-center justify-center gap-2 rounded-control bg-primary px-3 text-sm font-medium text-white active:scale-95 md:h-10 md:px-4"
            >
              <Plus size={18} aria-hidden="true" />
              <span className="hidden md:inline">Viết bài mới</span>
            </Link>
          )}
        </div>
      </div>
      {body}
      <NewsDrawer article={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
