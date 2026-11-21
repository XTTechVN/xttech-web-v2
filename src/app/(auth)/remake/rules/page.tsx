'use client';

import { useDeferredValue, useState } from 'react';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getDocumentRules, getDocumentRulesSummary } from '@/actions';
import { useCan } from '@/hooks';
import type { GetDocumentRulesParams, RulesScope } from '@/types';
import { cn } from '@/utils/cn';
import { DataList } from '../_components/data-list';
import { INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { DocumentCard, documentColumns } from '../documents/_components/document-columns';
import { FilterSheet, EMPTY_FILTERS, type Filters } from './_components/filter-sheet';

type Tab = 'current' | 'drafts' | 'to_process';
const PAGE = 20;
const CHIPS: [RulesScope, string][] = [
  ['all', 'Tất cả'],
  ['company', 'Toàn công ty'],
  ['department', 'Phòng ban'],
  ['mine', 'Gửi cho tôi'],
];
const EMPTY: Record<Tab, [string, string]> = {
  current: ['Chưa có văn bản ban hành', 'Văn bản đã ban hành áp dụng cho bạn sẽ hiện ở đây.'],
  drafts: ['Bạn chưa soạn văn bản nào', 'Bấm dấu + để soạn văn bản mới.'],
  to_process: ['Không có văn bản cần bạn xử lý', 'Văn bản chờ duyệt hoặc ban hành sẽ hiện ở đây.'],
};

// Văn bản ban hành: 3 tab bật theo quyền (Chờ xử lý → Hiện hành → Dự thảo), lọc theo phạm vi, loại, trạng thái.
export default function RemakeRulesPage() {
  const router = useRouter();
  const { can, isReady } = useCan();
  const [picked, setTab] = useState<Tab | null>(null);
  const [chip, setChip] = useState<RulesScope>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sheet, setSheet] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(search.trim());

  const canProcess = can('document:approve') || can('document:publish');
  const canDraft = can('document:publish');
  const tabs = [
    ...(canProcess ? [['to_process', 'Chờ xử lý'] as const] : []),
    ['current', 'Hiện hành'] as const,
    ...(canDraft ? [['drafts', 'Soạn thảo'] as const] : []),
  ];
  const tab: Tab = picked && tabs.some(([v]) => v === picked) ? picked : tabs[0][0];
  const current = tab === 'current';

  const summary = useQuery({
    queryKey: ['rules', 'summary'],
    queryFn: getDocumentRulesSummary,
    enabled: isReady && can('rule:read'),
    refetchInterval: 60_000,
  });
  const count: Record<Tab, number> = {
    current: summary.data?.unreadCount ?? 0,
    drafts: summary.data?.draftCount ?? 0,
    to_process: summary.data?.pendingActionCount ?? 0,
  };

  const params: GetDocumentRulesParams = {
    scope: current ? chip : tab,
    search: q || undefined,
    documentTypes: current && filters.type ? (filters.type === 'announcement' ? 'announcement,notice' : filters.type) : undefined,
    status: current ? filters.status || undefined : undefined,
    isRead: current && filters.unread ? false : undefined,
    expiringSoon: current && filters.expiring ? true : undefined,
    offset: 0,
    limit,
  };
  const list = useQuery({
    queryKey: ['rules', 'list', params],
    queryFn: () => getDocumentRules(params),
    placeholderData: keepPreviousData,
    enabled: isReady && can('rule:read'),
  });
  const items = list.data?.items ?? [];
  const activeFilters = [filters.type, filters.status, filters.unread, filters.expiring].filter(Boolean).length;

  if (!isReady) return <ListSkeleton />;
  if (!can('rule:read')) return <EmptyState title="Bạn chưa có quyền xem văn bản ban hành" description="Liên hệ quản trị viên để được cấp quyền." />;

  const reset = (fn: () => void) => () => {
    fn();
    setLimit(PAGE);
  };

  return (
    <>
      <PageHeader
        title="Văn bản ban hành"
        description="Quy chế, quy định, quy trình đang áp dụng."
        actionLabel={canDraft ? 'Soạn văn bản' : undefined}
        onAction={() => router.push('/remake/rules/new')}
      />

      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Nhóm văn bản"
          className="-mx-rm-gutter mb-3 flex gap-5 overflow-x-auto border-b border-rm-line px-rm-gutter md:mx-0 md:px-0"
        >
          {tabs.map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={tab === v}
              onClick={reset(() => setTab(v))}
              className={cn(
                'flex h-rm-tap flex-none items-center gap-2 border-b-2 text-sm font-medium',
                tab === v ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
              )}
            >
              {label}
              {count[v] > 0 && <span className="rounded-full bg-rm-danger px-1.5 text-xs text-white">{count[v] > 99 ? '99+' : count[v]}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex items-center gap-2 bg-rm-bg px-rm-gutter pb-2 pt-1">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm văn bản"
            placeholder="Tiêu đề hoặc mã"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(PAGE);
            }}
            className={`${INPUT} pl-10`}
          />
        </div>
        {current && (
          <button
            type="button"
            aria-label={`Lọc${activeFilters ? ` (${activeFilters})` : ''}`}
            onClick={() => setSheet(true)}
            className={cn(
              'relative flex size-11 flex-none items-center justify-center rounded-rm border border-rm-line bg-rm-surface md:size-rm-control',
              activeFilters > 0 && 'border-rm-primary text-rm-primary',
            )}
          >
            <SlidersHorizontal size={18} />
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-rm-primary px-1.5 text-xs text-rm-on-primary">{activeFilters}</span>
            )}
          </button>
        )}
      </div>

      {current && (
        <div role="group" aria-label="Phạm vi áp dụng" className="-mx-rm-gutter mb-3 flex gap-2 overflow-x-auto px-rm-gutter md:mx-0 md:px-0">
          {(can('document:publish') ? [...CHIPS.slice(0, 3), ['user', 'Cá nhân'] as [RulesScope, string], CHIPS[3]] : CHIPS).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={chip === v}
              onClick={reset(() => setChip(v))}
              className={cn(
                'h-9 flex-none rounded-rm px-3 text-sm',
                chip === v ? 'bg-rm-primary text-rm-on-primary' : 'border border-rm-line bg-rm-surface',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {list.isLoading && <ListSkeleton />}
      {list.isError && (
        <ErrorState
          title="Không tải được danh sách"
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => list.refetch()}
        />
      )}
      {list.data && items.length === 0 && (
        <EmptyState
          title={q || activeFilters || chip !== 'all' ? 'Không tìm thấy văn bản' : EMPTY[tab][0]}
          description={q || activeFilters || chip !== 'all' ? 'Thử từ khoá hoặc bộ lọc khác.' : EMPTY[tab][1]}
          actionLabel={q || activeFilters || chip !== 'all' ? 'Bỏ bộ lọc' : undefined}
          onAction={() => {
            setSearch('');
            setFilters(EMPTY_FILTERS);
            setChip('all');
          }}
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Văn bản ban hành"
          rows={items}
          rowKey={(d) => d.id}
          columns={documentColumns}
          card={(d) => <DocumentCard d={d} />}
          href={(d) => `/remake/rules/${d.id}`}
        />
      )}
      {list.data && list.data.total > items.length && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm
        </button>
      )}

      <FilterSheet
        open={sheet}
        onClose={() => setSheet(false)}
        value={filters}
        onApply={(f) => {
          setFilters(f);
          setLimit(PAGE);
        }}
      />
    </>
  );
}
