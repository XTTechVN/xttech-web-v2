'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  BarChart3,
  FolderKanban,
  PieChart as PieChartIcon,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { getReportOverview } from '@/actions';
import { getDoorStageLabel, getProjectStageLabel } from '@/config';
import type { ProgressStepCode, ReportOverview } from '@/types';
import { cn } from '@/utils';
import ProjectReportChart, {
  type ProjectChartItem,
  type ProjectChartType,
  type ProjectDataMode,
} from './project-report-chart';

const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const CHART_SWITCH_OPTIONS: Array<{
  type: ProjectChartType;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { type: 'bar', label: 'Cột', icon: BarChart3 },
  { type: 'pie', label: 'Tròn', icon: PieChartIcon },
  { type: 'area', label: 'Sóng', icon: Activity },
];

export interface ProjectReportCardProps {
  data?: ReportOverview;
}

/** Báo cáo tổng hợp dự án: doanh thu, công nợ, dự án theo trạng thái, cửa theo tiến độ, bảo hành. */
export default function ProjectReportCard({ data: externalData }: ProjectReportCardProps = {}) {
  const [chartType, setChartType] = useState<ProjectChartType>('bar');
  const [dataMode, setDataMode] = useState<ProjectDataMode>('doors');

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['report-overview'],
    queryFn: () => getReportOverview(),
    enabled: !externalData,
    refetchInterval: 120000,
    retry: false,
  });

  const data = externalData ?? queryData;

  const { doorsItems, projectsItems, totalDoors, totalAreaM2, collectedPct, outstandingPct } =
    useMemo(() => {
      if (!data) {
        return {
          doorsItems: [] as ProjectChartItem[],
          projectsItems: [] as ProjectChartItem[],
          totalDoors: 0,
          totalAreaM2: 0,
          collectedPct: 0,
          outstandingPct: 0,
        };
      }
      const posEntries = Object.entries(data.positionsByStatus ?? {}).sort(
        ([codeA], [codeB]) => getDoorStageLabel(codeA).order - getDoorStageLabel(codeB).order
      );
      const doorsSum = posEntries.reduce((acc, [, c]) => acc + (c || 0), 0);
      const areaSum = Object.values(data.areaM2ByStatus ?? {}).reduce((a, v) => a + (Number(v) || 0), 0);
      const builtDoors: ProjectChartItem[] = posEntries.map(([code, count]) => {
        const info = getDoorStageLabel(code);
        return {
          key: code,
          label: info.label,
          shortLabel: info.shortLabel,
          count: count || 0,
          areaM2: Number(data.areaM2ByStatus?.[code as ProgressStepCode] ?? 0),
          percent: doorsSum > 0 ? ((count || 0) / doorsSum) * 100 : 0,
        };
      });

      const projEntries = Object.entries(data.projectsByStatus ?? {}).sort(
        ([statusA], [statusB]) =>
          getProjectStageLabel(statusA).order - getProjectStageLabel(statusB).order
      );
      const projSum = data.totalProjects || projEntries.reduce((acc, [, c]) => acc + (c || 0), 0);
      const builtProjects: ProjectChartItem[] = projEntries.map(([status, count]) => {
        const info = getProjectStageLabel(status);
        return {
          key: status,
          label: info.label,
          shortLabel: info.shortLabel,
          count: count || 0,
          percent: projSum > 0 ? ((count || 0) / projSum) * 100 : 0,
        };
      });

      const cPct = data.contractValue > 0 ? Math.min(100, Math.round((data.collected / data.contractValue) * 100)) : 0;
      const oPct = data.contractValue > 0 ? Math.max(0, 100 - cPct) : 0;
      return {
        doorsItems: builtDoors,
        projectsItems: builtProjects,
        totalDoors: doorsSum,
        totalAreaM2: areaSum,
        collectedPct: cPct,
        outstandingPct: oPct,
      };
    }, [data]);

  if (!externalData && isError) return null;

  const activeItems = dataMode === 'doors' ? doorsItems : projectsItems;
  const activeTotalCount = dataMode === 'doors' ? totalDoors : (data?.totalProjects ?? 0);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 min-w-0">
      {/* 1. Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <FolderKanban size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Báo cáo dự án</h2>
              {data && (
                <>
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 font-mono tabular-nums">
                    {data.totalProjects} công trình
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary font-mono tabular-nums">
                    {totalDoors} bộ cửa · {totalAreaM2.toFixed(2)} m²
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Tổng hợp dòng tiền hợp đồng, tiến độ sản xuất cửa và bảo hành toàn công ty
            </span>
          </div>
        </div>

        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
          {CHART_SWITCH_OPTIONS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setChartType(type)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-150',
                chartType === type
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50/60 text-xs text-slate-400">
          Đang tải báo cáo dự án...
        </div>
      ) : (
        <>
          {/* 2. Dải 3 Thẻ Doanh thu & Thanh Tiến độ Dòng tiền */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-[11px] font-medium text-slate-500">Giá trị hợp đồng</div>
                <div className="mt-1 font-mono text-sm sm:text-base font-bold tabular-nums text-slate-900">
                  {formatVnd(data.contractValue)}
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-medium text-primary">Đã thu</span>
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-primary">
                    {collectedPct}%
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm sm:text-base font-bold tabular-nums text-primary">
                  {formatVnd(data.collected)}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-medium text-slate-600">Còn phải thu</span>
                  <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-slate-700">
                    {outstandingPct}%
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm sm:text-base font-bold tabular-nums text-slate-800">
                  {formatVnd(data.outstanding)}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${collectedPct}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>
                    Đã thanh toán: <strong className="font-mono tabular-nums text-slate-900">{collectedPct}%</strong> ({formatVnd(data.collected)})
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>
                    Công nợ còn lại: <strong className="font-mono tabular-nums text-slate-800">{outstandingPct}%</strong> ({formatVnd(data.outstanding)})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Dải Chip Giai đoạn Công trình */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-700">Giai đoạn công trình ({data.totalProjects})</div>
            {projectsItems.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {projectsItems.map((item) => (
                  <span
                    key={item.key}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{item.label}:</span>
                    <strong className="font-mono tabular-nums text-slate-900">{item.count}</strong>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400">Chưa có công trình phát sinh trạng thái</div>
            )}
          </div>

          {/* 4. Thanh Tab Chuyển đổi Dữ liệu Biểu đồ & Khu vực Recharts */}
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setDataMode('doors')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold transition-colors duration-150',
                    dataMode === 'doors' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Tiến độ bộ cửa (Bộ &amp; m²)
                </button>
                <button
                  type="button"
                  onClick={() => setDataMode('projects')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold transition-colors duration-150',
                    dataMode === 'projects' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Giai đoạn công trình
                </button>
              </div>
              <span className="text-[11px] text-slate-500">
                {dataMode === 'doors'
                  ? `Tổng cộng ${totalDoors} bộ cửa (${totalAreaM2.toFixed(2)} m²)`
                  : `Tổng cộng ${data.totalProjects} dự án`}
              </span>
            </div>

            <ProjectReportChart
              chartType={chartType}
              dataMode={dataMode}
              items={activeItems}
              totalCount={activeTotalCount}
              totalAreaM2={dataMode === 'doors' ? totalAreaM2 : undefined}
            />
          </div>

          {/* 5. Footer Bảo hành */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Dự án đang bảo hành: <strong className="font-mono tabular-nums text-slate-900">{data.warranty.activeProjects}</strong>
              </span>
              <span>
                Bảo hành sắp tới (7 ngày): <strong className="font-mono tabular-nums text-slate-900">{data.warranty.upcomingVisits7d}</strong>
              </span>
              <span className={data.warranty.overdueVisits > 0 ? 'font-semibold text-red-600' : undefined}>
                Quá hạn: <strong className="font-mono tabular-nums">{data.warranty.overdueVisits}</strong>
              </span>
            </div>
            {data.warranty.overdueVisits === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <ShieldCheck size={13} />
                <span>Đúng hạn 100%</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">
                <ShieldAlert size={13} />
                <span>Cần xử lý {data.warranty.overdueVisits} lịch quá hạn</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
