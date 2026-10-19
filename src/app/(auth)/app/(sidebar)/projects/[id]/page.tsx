'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProject, getProjectQuotations } from '@/actions';
import {
  TabOverview,
  TabPositions,
  TabQuotations,
  TabContracts,
  TabProduction,
} from './_components';
import { 
  FolderOpen, 
  Loader2,
  Layers,
  Calculator,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components';
import { PROJECT_STATUS_MAP } from '@/config';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const projectId = Number(id);

  const [activeTab, setActiveTab] = useState<string>('overview');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });

  const { data: quotationsData } = useQuery({
    queryKey: ['project_quotations', projectId],
    queryFn: () => getProjectQuotations(projectId),
    enabled: !!projectId,
  });

  const quotations = quotationsData?.items || [];

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

  const projectTabs = [
    { value: 'overview', label: 'Thông tin', icon: <FolderOpen size={14} /> },
    { value: 'positions', label: 'Thiết kế', icon: <Layers size={14} /> },
    { value: 'quotations', label: 'Báo giá', icon: <Calculator size={14} /> },
    { value: 'contracts', label: 'Hợp đồng', icon: <FileText size={14} /> },
    { value: 'production', label: 'Sản xuất', icon: <CheckCircle2 size={14} /> },
  ];

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      {/* Header Bar: Tên dự án & Tên khách (trái) + Segmented Tabs (phải) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200/70">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-primary font-lexend tracking-tight capitalize truncate">
              {project.name}
            </h1>
            {project.status && (
              <Badge 
                variant={(PROJECT_STATUS_MAP[project.status] || { variant: 'default' }).variant} 
                size="sm"
                className="font-medium rounded"
              >
                {(PROJECT_STATUS_MAP[project.status] || { label: project.status }).label}
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

        {/* 5 Segmented Tabs di chuyển sang phải */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-md border border-slate-200/70 gap-1 overflow-x-auto shrink-0">
          {projectTabs.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {tab.icon && (
                  <span className={`shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Thông tin */}
      {activeTab === 'overview' && (
        <TabOverview projectId={projectId} project={project} />
      )}

      {/* Tab 2: Thiết kế */}
      {activeTab === 'positions' && (
        <TabPositions projectId={projectId} />
      )}

      {/* Tab 3: Báo giá */}
      {activeTab === 'quotations' && (
        <TabQuotations projectId={projectId} />
      )}

      {/* Tab 4: Hợp đồng */}
      {activeTab === 'contracts' && (
        <TabContracts projectId={projectId} quotations={quotations} />
      )}

      {/* Tab 5: Sản xuất */}
      {activeTab === 'production' && (
        <TabProduction projectId={projectId} />
      )}
    </div>
  );
}
