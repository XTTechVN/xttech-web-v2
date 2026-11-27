'use client';

import React, { Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProject } from '@/actions';
import { TabOverview } from './_components/overview';
import { Loader2 } from 'lucide-react';
import { Badge, Skeleton } from '@/components';
import { Tabs } from '@/components-remake';
import { PROJECT_STATUS_MAP } from '@/config';

const TabFallback = () => <Skeleton className="h-64 w-full rounded-block" />;

const TabPositions = dynamic(
  () => import('./_components/positions').then((m) => m.TabPositions),
  { loading: TabFallback },
);
const TabQuotations = dynamic(
  () => import('./_components/quotations').then((m) => m.TabQuotations),
  { loading: TabFallback },
);
const TabContracts = dynamic(
  () => import('./_components/contracts').then((m) => m.TabContracts),
  { loading: TabFallback },
);
const TabProduction = dynamic(
  () => import('./_components/production').then((m) => m.TabProduction),
  { loading: TabFallback },
);

const TabAcceptance = dynamic(
  () => import('./_components/acceptance').then((m) => m.TabAcceptance),
  { loading: TabFallback },
);
const TabWarranty = dynamic(
  () => import('./_components/warranty').then((m) => m.TabWarranty),
  { loading: TabFallback },
);

const PROJECT_TABS = [
  { value: 'overview', label: 'Thông tin' },
  { value: 'positions', label: 'Thiết kế' },
  { value: 'quotations', label: 'Báo giá' },
  { value: 'contracts', label: 'Hợp đồng' },
  { value: 'production', label: 'Sản xuất' },
  { value: 'acceptance', label: 'Nghiệm thu' },
  { value: 'warranty', label: 'Bảo hành' },
];

// Mỗi tab cần quyền xem riêng; tab Thông tin chỉ cần quyền xem dự án (đã chặn ở menu)
const TAB_PERMISSIONS: Record<string, string[]> = {
  positions: ['project_door_position:read', 'door:read'],
  quotations: ['quotation:read'],
  contracts: ['contract:read'],
  production: ['production_order:read', 'door_progress:read'],
  acceptance: ['acceptance:read'],
  warranty: ['warranty:read'],
};

const VALID_TABS = new Set(PROJECT_TABS.map((t) => t.value));

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

function ProjectDetailContent({ projectId }: { projectId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can, canAny, isReady } = useCan();
  const visibleTabs = PROJECT_TABS.filter((t) => !TAB_PERMISSIONS[t.value] || canAny(TAB_PERMISSIONS[t.value]));

  const rawTab = searchParams.get('tab');
  const activeTab = rawTab && VALID_TABS.has(rawTab) && visibleTabs.some((t) => t.value === rawTab) ? rawTab : 'overview';

  const handleSelectTab = useCallback(
    (nextTab: string) => {
      if (!VALID_TABS.has(nextTab)) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', nextTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: isReady && can('project:read') && Boolean(projectId),
  });

  if (!isReady) return <TabFallback />;
  if (!can('project:read')) return <AccessDenied />;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-500 text-xs">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
        <p className="text-slate-600 mb-4 text-sm font-medium">Không tìm thấy dự án</p>
        <Link
          href="/app/projects"
          className="px-4 py-2 bg-primary text-white rounded-control text-xs font-semibold hover:brightness-110 transition-all"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusConfig = PROJECT_STATUS_MAP[project.status] || {
    label: project.status,
    variant: 'default' as const,
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-primary font-lexend tracking-tight capitalize truncate">
              {project.name}
            </h1>
            {project.status && (
              <Badge variant={statusConfig.variant} size="md" className="font-medium rounded">
                {statusConfig.label}
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-normal text-slate-500">
            {project.customer?.name && (
              <span className="text-slate-700 font-medium">{project.customer.name}</span>
            )}
            {(project.customer?.address || project.address) && (
              <>
                <span className="text-slate-300">-</span>
                <span>{project.customer?.address || project.address}</span>
              </>
            )}
            {project.customer?.phone && (
              <>
                <span className="text-slate-300">-</span>
                <a
                  href={`tel:${project.customer.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {project.customer.phone}
                </a>
              </>
            )}
          </div>
        </div>

      </div>

      <Tabs
        tabs={visibleTabs.map((t) => ({ value: t.value, label: t.label }))}
        value={activeTab}
        onChange={handleSelectTab}
        label="Các giai đoạn của dự án"
        className="my-2 px-0"
      />

      {activeTab === 'overview' && (
        <TabOverview projectId={projectId} project={project} onSelectTab={handleSelectTab} />
      )}
      {activeTab === 'positions' && <TabPositions projectId={projectId} />}
      {activeTab === 'quotations' && <TabQuotations projectId={projectId} />}
      {activeTab === 'contracts' && <TabContracts projectId={projectId} />}
      {activeTab === 'production' && <TabProduction projectId={projectId} />}
      {activeTab === 'acceptance' && <TabAcceptance projectId={projectId} />}
      {activeTab === 'warranty' && <TabWarranty projectId={projectId} />}
    </div>
  );
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = React.use(params);
  const projectId = Number(id);

  return (
    <Suspense fallback={<TabFallback />}>
      <ProjectDetailContent projectId={projectId} />
    </Suspense>
  );
}
