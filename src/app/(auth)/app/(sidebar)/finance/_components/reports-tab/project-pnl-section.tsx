'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw } from 'lucide-react';
import { Alert, Badge, Button, Select, Skeleton, TableSearch } from '@/components';
import { getProjectPnlReport, getProjects } from '@/actions';
import { REPORT_VIEW_MODE_MAP } from '@/config/finance';
import type { ProjectPnlDrilldownMetric, ProjectPnlRow, ReportViewMode } from '@/types';
import { cn, formatCurrency, getErrorMessage, includesSearchText } from '@/utils';
import { exportProjectPnlExcel } from '../../_utils';
import {
  ProjectPnlDrilldownDrawer,
  type ProjectPnlDrilldownTarget,
} from './project-pnl-drilldown';

interface ProjectPnlSectionProps {
  fromDate: string;
  toDate: string;
  reportViewMode: ReportViewMode;
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function ProjectPnlSection({
  fromDate,
  toDate,
  reportViewMode,
  refreshSignal = 0,
  onOpenVoucherDetail,
}: ProjectPnlSectionProps) {
  const [projectId, setProjectId] = useState('');
  const [search, setSearch] = useState('');
  const [drilldownTarget, setDrilldownTarget] = useState<ProjectPnlDrilldownTarget | null>(
    null,
  );

  const { data: projectsRes } = useQuery({
    queryKey: ['finance-projects-lookup'],
    queryFn: () => getProjects({ limit: 100 }).catch(() => null),
    staleTime: 60_000,
  });

  const { data: report, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-project-pnl', fromDate, toDate, reportViewMode, projectId, refreshSignal],
    queryFn: () =>
      getProjectPnlReport({
        fromDate,
        toDate,
        reportViewMode,
        projectId: projectId ? Number(projectId) : undefined,
      }),
  });

  const rows = useMemo(() => {
    const raw = report?.rows || [];
    if (!search.trim()) return raw;
    return raw.filter(
      (r) =>
        includesSearchText(r.projectCode, search) ||
        includesSearchText(r.projectName, search) ||
        includesSearchText(r.customerName, search),
    );
  }, [report, search]);

  const totalNonDeductibleCost = useMemo(
    () => rows.reduce((sum, r) => sum + r.nonDeductibleCost, 0),
    [rows],
  );

  const projectOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả công trình' },
      ...(projectsRes?.items || []).map((p) => ({ value: String(p.id), label: `${p.code} - ${p.name}` })),
    ],
    [projectsRes?.items],
  );

  const viewModeMeta = REPORT_VIEW_MODE_MAP[reportViewMode];

  const renderDrillCell = (
    row: ProjectPnlRow,
    metric: ProjectPnlDrilldownMetric,
    value: number,
    colorClass?: string,
  ) => {
    if (value === 0) {
      return (
        <td className={cn('p-3 font-mono tabular-nums text-right', colorClass)}>
          {formatCurrency(value)}
        </td>
      );
    }
    return (
      <td className={cn('p-3 font-mono tabular-nums text-right', colorClass)}>
        <button
          type="button"
          onClick={() => setDrilldownTarget({ projectId: row.projectId, metric })}
          className="hover:underline decoration-dotted underline-offset-4 cursor-pointer"
          title="Bấm để xem chi tiết chứng từ"
        >
          {formatCurrency(value)}
        </button>
      </td>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch placeholder="Tìm mã công trình, tên công trình, khách hàng..." value={search} onChange={setSearch} className="w-64" />
          <div className="w-64">
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} options={projectOptions} searchable fullWidth />
          </div>
          <Badge variant={viewModeMeta?.variant || 'default'} size="sm">
            {viewModeMeta?.shortLabel || reportViewMode}
          </Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {report && (
            <Button variant="outline" size="sm" onClick={() => exportProjectPnlExcel(report)} leftIcon={<Download size={14} />}>
              Xuất Excel P&amp;L
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải báo cáo Lãi/Lỗ công trình">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs text-slate-500">Tổng Doanh thu Công trình</div>
              <div className="text-lg font-mono font-bold text-primary tabular-nums mt-1">{formatCurrency(report.totalRevenue)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs text-slate-500">Tổng Chi phí Trực tiếp &amp; Xưởng</div>
              <div className="text-lg font-mono font-bold text-rose-700 tabular-nums mt-1">{formatCurrency(report.totalCost)}</div>
            </div>
            <div className="bg-white rounded-xl border border-primary/30 bg-primary/5 p-3.5">
              <div className="text-xs text-primary font-semibold">Tổng Lãi / Lỗ Gộp</div>
              <div className="text-lg font-mono font-bold text-primary tabular-nums mt-1">{formatCurrency(report.totalGrossProfit)}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Công trình &amp; Khách hàng</th>
                    <th className="p-3 text-right">Doanh thu</th>
                    <th className="p-3 text-right">NVL TT</th>
                    <th className="p-3 text-right">Nhân công</th>
                    <th className="p-3 text-right">SX chung</th>
                    <th className="p-3 text-right">Thuê ngoài</th>
                    <th className="p-3 text-right">Tổng CP</th>
                    <th className="p-3 text-right">CP không được trừ (B4)</th>
                    <th className="p-3 text-right">Lãi/Lỗ gộp</th>
                    <th className="p-3 text-right">Biên LN</th>
                    <th className="p-3 text-right">Đã thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500">
                        Chưa có số liệu hạch toán theo công trình trong kỳ này.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.projectId} className="hover:bg-slate-50">
                        <td className="p-3 min-w-[200px]">
                          <div className="font-mono font-bold text-primary">{row.projectCode}</div>
                          <div className="font-semibold text-slate-900">{row.projectName}</div>
                          {row.customerName && <div className="text-[11px] text-slate-500">{row.customerName}</div>}
                        </td>
                        {renderDrillCell(row, 'revenue', row.contractRevenue, 'font-semibold text-slate-900')}
                        {renderDrillCell(row, 'direct_material', row.directMaterialCost)}
                        {renderDrillCell(row, 'direct_labor', row.directLaborCost)}
                        {renderDrillCell(row, 'factory_overhead', row.factoryOverheadCost)}
                        {renderDrillCell(row, 'subcontract', row.subcontractCost)}
                        {renderDrillCell(row, 'total_cost', row.totalCost, 'font-semibold text-rose-700')}
                        {renderDrillCell(row, 'non_deductible_cost', row.nonDeductibleCost, 'font-semibold text-amber-700')}
                        <td className="p-3 font-mono tabular-nums text-right font-bold text-emerald-700">{formatCurrency(row.grossProfit)}</td>
                        <td className="p-3 text-right">
                          <Badge variant={row.grossMarginPct >= 0 ? 'success' : 'danger'} size="sm">{row.grossMarginPct.toFixed(1)}%</Badge>
                        </td>
                        {renderDrillCell(row, 'collected', row.collectedAmount)}
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
                  <tr>
                    <td className="p-3 uppercase">Tổng cộng ({rows.length} CT)</td>
                    <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalRevenue)}</td>
                    <td colSpan={4} />
                    <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalCost)}</td>
                    <td className="p-3 font-mono tabular-nums text-right text-amber-800">{formatCurrency(totalNonDeductibleCost)}</td>
                    <td className="p-3 font-mono tabular-nums text-right text-sm">{formatCurrency(report.totalGrossProfit)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : null}

      <ProjectPnlDrilldownDrawer
        target={drilldownTarget}
        fromDate={fromDate}
        toDate={toDate}
        reportViewMode={reportViewMode}
        refreshSignal={refreshSignal}
        onClose={() => setDrilldownTarget(null)}
        onOpenVoucherDetail={onOpenVoucherDetail}
      />
    </div>
  );
}
