'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock, Plus, ScrollText } from 'lucide-react';
import { getDocumentRules, getDocumentRulesSummary } from '@/actions/document';
import { Button, FilterDrawer, PageHeading, SearchField, StatGrid, TabState, Tabs } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan, useDebounce } from '@/hooks';
import { DOCUMENT_TYPE_MAP, RULE_FILTER_TYPES, type GetDocumentRulesParams, type RulesScope } from '@/types';
import { RULES_QUERY_KEYS } from '@/utils';
import { RuleList } from './_components/rule-list';
import { CURRENT_STATUS_OPTIONS, RULES_PAGE_SIZE, SCOPE_BY_TAB, expandDocumentTypes, type RulesTab } from './_utils/rules-constants';

const SCOPES: { value: RulesScope; label: string }[] = [
  { value: 'company', label: 'Toàn công ty' },
  { value: 'department', label: 'Phòng ban' },
  { value: 'user', label: 'Cá nhân' },
  { value: 'mine', label: 'Gửi cho tôi' },
];
const FLAGS = [
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'expiring', label: 'Sắp hết hạn' },
];
const EMPTY_TEXT: Record<RulesTab, string> = {
  current: 'Chưa có văn bản nào khớp bộ lọc.',
  drafts: 'Bạn chưa soạn văn bản nào.',
  to_process: 'Không có văn bản nào cần bạn xử lý.',
};

// Văn bản ban hành: 3 tab (Hiện hành, Soạn thảo, Chờ xử lý); bấm dòng mở trang chi tiết
export default function RulesPage() {
  const router = useRouter();
  const { can, isReady } = useCan();
  const isManager = can('document:publish');
  const canApprove = can('document:approve');
  const [pickedTab, setTab] = useState<RulesTab>('current');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [limit, setLimit] = useState(RULES_PAGE_SIZE);
  const kw = useDebounce(search.trim(), 300);

  const canRead = isReady && can('rule:read');
  const summary = useQuery({ queryKey: RULES_QUERY_KEYS.summary, queryFn: getDocumentRulesSummary, enabled: canRead, refetchInterval: 60_000 });
  const s = summary.data;

  const tabs = useMemo(
    () => [
      { value: 'current' as const, label: s?.unreadCount ? `Hiện hành (${s.unreadCount})` : 'Hiện hành' },
      { value: 'drafts' as const, label: s?.draftCount ? `Soạn thảo (${s.draftCount})` : 'Soạn thảo' },
      ...(isManager || canApprove ? [{ value: 'to_process' as const, label: s?.pendingActionCount ? `Chờ xử lý (${s.pendingActionCount})` : 'Chờ xử lý' }] : []),
    ],
    [s, isManager, canApprove],
  );
  const tab = tabs.some((t) => t.value === pickedTab) ? pickedTab : 'current';
  const current = tab === 'current';

  const params: GetDocumentRulesParams = {
    scope: current ? ((filter.scope as RulesScope) || 'all') : SCOPE_BY_TAB[tab as Exclude<RulesTab, 'current'>],
    search: kw || undefined,
    documentTypes: current ? expandDocumentTypes(filter.type || '') : undefined,
    status: current ? filter.status || undefined : undefined,
    isRead: current && filter.flag === 'unread' ? false : undefined,
    expiringSoon: current && filter.flag === 'expiring' ? true : undefined,
    offset: 0,
    limit,
  };
  const list = useQuery({
    queryKey: RULES_QUERY_KEYS.list({ ...params }),
    queryFn: () => getDocumentRules(params),
    placeholderData: keepPreviousData,
    enabled: canRead,
  });
  const rows = list.data?.items ?? [];

  if (!isReady) return null;
  if (!can('rule:read')) return <AccessDenied />;

  const stats = [
    { label: 'Đang hiệu lực', value: s?.publishedCount ?? 0, icon: CheckCircle2 },
    { label: 'Chưa đọc', value: s?.unreadCount ?? 0, icon: AlertCircle },
    { label: 'Sắp hết hạn', value: s?.expiringSoonCount ?? 0, icon: Clock },
    { label: 'Tỷ lệ đọc (%)', value: s?.readRate ?? 100, icon: ScrollText },
  ];
  const filtered = Boolean(kw) || Object.values(filter).some(Boolean);

  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Văn bản ban hành" description="Quy chế, quy định, quy trình đang áp dụng." />
      <StatGrid items={stats} />
      <div className="mt-4 flex items-center gap-2">
        <SearchField
          value={search}
          onChange={(v) => {
            setSearch(v);
            setLimit(RULES_PAGE_SIZE);
          }}
          label="Tìm văn bản"
          placeholder="Tìm theo tiêu đề hoặc mã..."
        />
        {current && (
          <FilterDrawer
            groups={[
              { key: 'scope', label: 'Phạm vi', options: SCOPES.filter((o) => o.value !== 'user' || isManager) },
              { key: 'type', label: 'Loại văn bản', options: RULE_FILTER_TYPES.map((k) => ({ value: k, label: DOCUMENT_TYPE_MAP[k].label })) },
              { key: 'status', label: 'Trạng thái', options: CURRENT_STATUS_OPTIONS.filter((o) => o.value) },
              { key: 'flag', label: 'Lưu ý', options: FLAGS },
            ]}
            value={filter}
            onChange={(f) => {
              setFilter(f);
              setLimit(RULES_PAGE_SIZE);
            }}
          />
        )}
        {can('document:create') && (
          <Button icon={<Plus size={18} />} iconOnly="mobile" className="ml-auto flex-none" onClick={() => router.push('/app/rules/new')}>
            {isManager ? 'Soạn văn bản' : 'Soạn dự thảo'}
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} value={tab} onChange={(t) => { setTab(t); setLimit(RULES_PAGE_SIZE); }} label="Nhóm văn bản" className="mt-3 -mx-4 md:mx-0 md:px-0" />

      <div className="mt-4">
        <TabState
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          empty={rows.length === 0}
          emptyText={filtered ? 'Không có văn bản khớp bộ lọc.' : EMPTY_TEXT[tab]}
        >
          <RuleList rows={rows} onOpen={(d) => router.push(`/app/rules/${d.id}`)} />
          {list.data && list.data.total > rows.length && (
            <Button variant="outline" className="mx-auto mt-3" onClick={() => setLimit((l) => l + RULES_PAGE_SIZE)}>
              Xem thêm
            </Button>
          )}
        </TabState>
      </div>

    </div>
  );
}
