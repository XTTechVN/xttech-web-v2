'use client';

import { useDeferredValue, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getSuggestions } from '@/actions';
import type { Suggestion } from '@/types';
import { useCan } from '@/hooks';
import { DataList } from '../_components/data-list';
import { INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { Select } from '../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { SuggestionSheet } from './_components/suggestion-sheet';
import { STATUS, SuggestionCard, suggestionColumns } from './_components/suggestion-columns';

const PAGE = 20;
const FILTERS = [{ value: '', label: 'Tất cả' }, ...Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))];

// Sáng kiến: phạm vi xem theo quyền `suggestion:read` (own = chỉ của mình, dept = phòng ban, org = tất cả); backend đã lọc sẵn.
function Suggestions() {
  const { can, me, scopeOf } = useCan();
  const scope = scopeOf('suggestion:read');
  const [mineOnly, setMineOnly] = useState(false);
  const userId = scope === 'own' || mineOnly ? me?.user.id : undefined;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Suggestion | 'new' | null>(null);
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['suggestions', q, status, limit, userId],
    queryFn: () => getSuggestions({ limit, offset: 0, search: q || undefined, status: (status || undefined) as never, userId }),
    placeholderData: (prev) => prev,
  });
  const counts = useQueries({
    queries: ['', 'pending', 'approve', 'reject'].map((st) => ({
      queryKey: ['suggestions-count', st, userId],
      queryFn: async () => (await getSuggestions({ limit: 1, offset: 0, status: (st || undefined) as never, userId })).meta?.total ?? 0,
    })),
  });
  const items = data?.items ?? [];
  const filtered = !!(q || status);

  return (
    <>
      <PageHeader
        title="Sáng kiến"
        description={
          scope === 'own'
            ? 'Các sáng kiến bạn đã gửi.'
            : scope === 'dept'
              ? 'Sáng kiến của bạn và phòng ban.'
              : 'Ý tưởng cải tiến và phản ánh từ nhân viên.'
        }
        actionLabel={can('suggestion:create') ? 'Gửi sáng kiến' : undefined}
        onAction={() => setOpen('new')}
      />

      {scope && scope !== 'own' && can('suggestion:create') && (
        <div role="tablist" aria-label="Phạm vi xem" className="mb-3 flex w-fit gap-1 rounded-rm bg-rm-line p-0.5">
          {[
            { v: false, label: scope === 'org' ? 'Tất cả' : 'Phòng ban' },
            { v: true, label: 'Của tôi' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="tab"
              aria-selected={mineOnly === o.v}
              onClick={() => setMineOnly(o.v)}
              className={`h-9 rounded-rm-sm px-4 text-sm font-medium ${mineOnly === o.v ? 'bg-rm-surface text-rm-text' : 'text-rm-muted'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      <div className="mb-3 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 md:grid-cols-[repeat(4,minmax(0,1fr))]">
        {['Tổng', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'].map((label, i) => (
          <div key={label} className="rounded-rm-xl border border-rm-edge bg-rm-surface px-3 py-2">
            <p className="text-lg font-semibold">{counts[i].data ?? '–'}</p>
            <p className="truncate text-xs text-rm-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex gap-2 bg-rm-bg px-rm-gutter pb-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm sáng kiến"
            placeholder="Tiêu đề hoặc nội dung"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
        <div className="w-36 flex-none">
          <Select id="sg-filter" label="Trạng thái" value={status} onChange={setStatus} options={FILTERS} />
        </div>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được sáng kiến" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState
          title={filtered ? 'Không tìm thấy' : 'Chưa có sáng kiến'}
          description={filtered ? 'Thử bỏ bớt bộ lọc.' : can('suggestion:create') ? 'Gửi ý tưởng đầu tiên.' : 'Sáng kiến được gửi sẽ hiện ở đây.'}
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách sáng kiến"
          rows={items}
          rowKey={(s) => s.id}
          columns={suggestionColumns}
          card={(s) => <SuggestionCard s={s} />}
          onOpen={setOpen}
        />
      )}
      {data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm
        </button>
      )}

      <SuggestionSheet key={open === 'new' ? 'new' : (open?.id ?? 'none')} target={open} onClose={() => setOpen(null)} />
    </>
  );
}

// Không có quyền xem thì không gọi API, báo rõ thay vì hiện danh sách trống.
export default function RemakeSuggestionsPage() {
  const { can, isReady } = useCan();
  if (!isReady) return <ListSkeleton />;
  if (!can('suggestion:read')) {
    return (
      <>
        <PageHeader title="Sáng kiến" description="Ý tưởng cải tiến và phản ánh từ nhân viên." />
        <EmptyState title="Bạn chưa có quyền xem sáng kiến" description="Liên hệ quản trị viên để được cấp quyền." />
      </>
    );
  }
  return <Suggestions />;
}
