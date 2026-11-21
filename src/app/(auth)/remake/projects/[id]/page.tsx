'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCan } from '@/hooks';
import { getProject } from '@/actions';
import { PROJECT_STATUS_MAP } from '@/config';
import { cn } from '@/utils/cn';
import { Badge, toneOf } from '../../_components/badge';
import { BackLink, PageHeader } from '../../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { TabAcceptance } from './_components/tab-acceptance';
import { TabContracts } from './_components/tab-contracts';
import { TabDesign } from './_components/tab-design';
import { TabOverview } from './_components/tab-overview';
import { TabProduction } from './_components/tab-production';
import { TabProgress } from './_components/tab-progress';
import { TabQuotes } from './_components/tab-quotes';
import { TabWarranty } from './_components/tab-warranty';

// Mỗi tab chỉ hiện khi có quyền đọc tương ứng
const TABS = [
  { value: 'overview', label: 'Thông tin', perm: 'project:read' },
  { value: 'design', label: 'Thiết kế', perm: 'project_door_position:read' },
  { value: 'quotes', label: 'Báo giá', perm: 'quotation:read' },
  { value: 'contracts', label: 'Hợp đồng', perm: 'contract:read' },
  { value: 'production', label: 'Sản xuất', perm: 'production_order:read' },
  { value: 'progress', label: 'Tiến độ', perm: 'door_progress:read' },
  { value: 'acceptance', label: 'Nghiệm thu', perm: 'acceptance:read' },
  { value: 'warranty', label: 'Bảo hành', perm: 'warranty:read' },
];

function Detail() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const { can, isReady } = useCan();
  const params = useSearchParams();
  const tabs = TABS.filter((t) => can(t.perm));
  const tab = (tabs.find((t) => t.value === params.get('tab')) ?? tabs[0])?.value;
  const active = useRef<HTMLButtonElement>(null);
  const {
    data: p,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ['project', id], queryFn: () => getProject(id), enabled: isReady && can('project:read') });
  useEffect(() => {
    active.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [tab]);

  if (!isReady) return <ListSkeleton />;
  if (!can('project:read')) return <EmptyState title="Bạn chưa có quyền xem dự án" description="Liên hệ quản trị viên để được cấp quyền." />;
  if (isLoading) return <ListSkeleton />;
  if (isError || !p)
    return <ErrorState title="Không tải được dự án" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />;
  const s = PROJECT_STATUS_MAP[p.status];

  return (
    <>
      <BackLink href="/remake/projects" label="Dự án" />
      <PageHeader title={p.name} description={`${p.code}${p.customer?.name ? ` · ${p.customer.name}` : ''}`} />
      <div className="mb-3">
        <Badge tone={toneOf(s?.variant)}>{s?.label ?? p.status}</Badge>
      </div>
      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Mục của dự án"
          className="sticky top-0 z-10 -mx-rm-gutter mb-4 flex gap-1 overflow-x-auto border-b border-rm-line bg-rm-bg px-rm-gutter md:flex-wrap md:overflow-visible"
        >
          {tabs.map((t) => (
            <button
              key={t.value}
              ref={t.value === tab ? active : undefined}
              type="button"
              role="tab"
              aria-selected={t.value === tab}
              onClick={() => router.replace(`/remake/projects/${id}?tab=${t.value}`, { scroll: false })}
              className={cn(
                'h-rm-tap flex-none border-b-2 px-3 text-sm font-medium md:h-rm-control',
                t.value === tab ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {tab === 'overview' && <TabOverview project={p} />}
      {tab === 'design' && <TabDesign project={p} />}
      {tab === 'quotes' && <TabQuotes projectId={id} />}
      {tab === 'contracts' && <TabContracts projectId={id} />}
      {tab === 'production' && <TabProduction projectId={id} />}
      {tab === 'progress' && <TabProgress projectId={id} />}
      {tab === 'acceptance' && <TabAcceptance projectId={id} />}
      {tab === 'warranty' && <TabWarranty projectId={id} />}
    </>
  );
}

export default function RemakeProjectDetailPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Detail />
    </Suspense>
  );
}
