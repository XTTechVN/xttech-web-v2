'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getGlobalWarrantyQueue, getProjectStats, getProjects } from '@/actions';
import { PROJECT_STATUS_OPTIONS } from '@/config';
import { useCan } from '@/hooks';
import type { Project } from '@/types';
import { Badge } from '../_components/badge';
import { DataList } from '../_components/data-list';
import { INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { Select } from '../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { WarrantyQueue } from './_components/warranty-queue';
import { ProjectSheet } from './_components/project-sheet';
import { ProjectCard, projectColumns } from './_components/project-columns';

const PAGE = 20;

// Dự án (API /projects): tìm kiếm, lọc trạng thái, thêm / sửa / xoá.
export default function RemakeProjectsPage() {
  const { can, me, scopeOf, isReady } = useCan();
  // Phạm vi "own": chỉ dự án do mình phụ trách (backend lọc theo userId như bản cũ)
  const userId = scopeOf('project:read') === 'own' ? me?.user.id : undefined;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Project | 'new' | null>(null);
  const [view, setView] = useState<'projects' | 'warranty'>('projects');
  const canWarranty = can('warranty:read');
  const badge = useQuery({
    queryKey: ['global_warranty_badge'],
    queryFn: () => getGlobalWarrantyQueue({ openOnly: true, limit: 1 }),
    enabled: canWarranty,
    staleTime: 30_000,
  });
  const newClaims = badge.data?.stats.newClaims ?? 0;
  const openCount = badge.data?.stats.totalOpen ?? 0;
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects', q, status, limit, userId],
    queryFn: () => getProjects({ limit, offset: 0, search: q || undefined, status: (status || undefined) as never, userId }),
    placeholderData: (prev) => prev,
    enabled: can('project:read'),
  });
  const stats = useQuery({
    queryKey: ['projects', 'stats', userId],
    queryFn: () => getProjectStats({ userId }),
    enabled: can('project:view_stats'),
    staleTime: 30_000,
  });
  const st = stats.data;
  const items = data?.items ?? [];
  const filtered = !!(q || status);

  if (!isReady) return <ListSkeleton />;
  if (!can('project:read')) return <EmptyState title="Bạn chưa có quyền xem dự án" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Dự án"
        description="Công trình đang theo dõi."
        actionLabel={can('project:create') && view === 'projects' ? 'Thêm dự án' : undefined}
        onAction={() => setOpen('new')}
      />

      {canWarranty && (
        <div role="tablist" aria-label="Chế độ xem" className="mb-3 flex gap-1 border-b border-rm-line">
          {(
            [
              ['projects', 'Dự án'],
              ['warranty', 'Bảo hành & Sửa chữa'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`flex h-rm-tap flex-none items-center gap-2 border-b-2 px-3 text-sm font-medium md:h-rm-control ${view === v ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted'}`}
            >
              {l}
              {v === 'warranty' && (newClaims > 0 || openCount > 0) && (
                <Badge tone={newClaims > 0 ? 'danger' : 'neutral'}>{newClaims > 0 ? `${newClaims} mới` : openCount}</Badge>
              )}
            </button>
          ))}
        </div>
      )}
      {view === 'warranty' && canWarranty ? (
        <WarrantyQueue />
      ) : (
        <>
          {st && (
            <p className="mb-3 flex flex-wrap items-center gap-2 text-xs text-rm-muted" aria-label="Thống kê dự án">
              <Badge>{st.total} dự án</Badge>
              <Badge tone="primary">{st.inProgress} đang thực hiện</Badge>
              <Badge tone="success">{st.completed} hoàn thành</Badge>
            </p>
          )}

          <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex gap-2 bg-rm-bg px-rm-gutter pb-2">
            <div className="relative min-w-0 flex-1">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
              <input
                type="search"
                aria-label="Tìm dự án"
                placeholder="Tên hoặc mã dự án"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLimit(PAGE);
                }}
                className={`${INPUT} pl-10`}
              />
            </div>
            <div className="w-36 flex-none">
              <Select
                id="pj-filter"
                label="Trạng thái"
                value={status}
                onChange={setStatus}
                options={[{ value: '', label: 'Tất cả' }, ...PROJECT_STATUS_OPTIONS]}
              />
            </div>
          </div>

          {isLoading && <ListSkeleton />}
          {isError && (
            <ErrorState title="Không tải được dự án" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
          )}
          {data && items.length === 0 && (
            <EmptyState
              title={filtered ? 'Không tìm thấy' : 'Chưa có dự án'}
              description={filtered ? 'Thử bỏ bớt bộ lọc.' : 'Thêm dự án đầu tiên.'}
            />
          )}
          {items.length > 0 && (
            <DataList
              label="Danh sách dự án"
              rows={items}
              rowKey={(p) => p.id}
              href={(p) => `/remake/projects/${p.id}`}
              columns={projectColumns(can('project:update') ? setOpen : undefined)}
              card={(p) => <ProjectCard p={p} />}
            />
          )}
          {data?.meta?.next && (
            <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
              Xem thêm
            </button>
          )}
        </>
      )}

      <ProjectSheet key={open === 'new' ? 'new' : (open?.id ?? 'none')} target={open} onClose={() => setOpen(null)} />
    </>
  );
}
