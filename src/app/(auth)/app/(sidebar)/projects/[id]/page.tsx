'use client';

import React, { Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProject } from '@/actions';
import { TabOverview } from './_components/overview';
import {
  FolderOpen,
  Loader2,
  Layers,
  Calculator,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Badge, Skeleton } from '@/components';
import { PROJECT_STATUS_MAP } from '@/config';

const TabFallback = () => <Skeleton className="h-64 w-full rounded-xl" />;

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

const PROJECT_TABS = [
  { value: 'overview', label: 'Thông tin', icon: <FolderOpen size={14} /> },
  { value: 'positions', label: 'Thiết kế', icon: <Layers size={14} /> },
  { value: 'quotations', label: 'Báo giá', icon: <Calculator size={14} /> },
  { value: 'contracts', label: 'Hợp đồng', icon: <FileText size={14} /> },
  { value: 'production', label: 'Sản xuất', icon: <CheckCircle2 size={14} /> },
];

const VALID_TABS = new Set(PROJECT_TABS.map((t) => t.value));

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

function ProjectDetailContent({ projectId }: { projectId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab = rawTab && VALID_TABS.has(rawTab) ? rawTab : 'overview';

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
    enabled: Boolean(projectId),
  });

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
          className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200/70">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-primary font-lexend tracking-tight capitalize truncate">
              {project.name}
            </h1>
            {project.status && (
              <Badge variant={statusConfig.variant} size="sm" className="font-medium rounded">
                {statusConfig.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal mt-0.5 flex-wrap">
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

        <div className="inline-flex p-1 bg-slate-100/90 rounded-md border border-slate-200/70 gap-1 overflow-x-auto shrink-0">
          {PROJECT_TABS.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleSelectTab(tab.value)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <TabOverview projectId={projectId} project={project} onSelectTab={handleSelectTab} />
      )}
      {activeTab === 'positions' && <TabPositions projectId={projectId} />}
      {activeTab === 'quotations' && <TabQuotations projectId={projectId} />}
      {activeTab === 'contracts' && <TabContracts projectId={projectId} />}
      {activeTab === 'production' && <TabProduction projectId={projectId} />}
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
