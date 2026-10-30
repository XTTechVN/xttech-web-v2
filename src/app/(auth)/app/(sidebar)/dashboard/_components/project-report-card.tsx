'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { getReportOverview } from '@/actions';
import { DOOR_STATUS_MAP, PROJECT_STATUS_MAP } from '@/config';
import type { ProjectStatus } from '@/types';

const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

/** Báo cáo tổng hợp dự án: doanh thu, công nợ, dự án theo trạng thái, cửa theo tiến độ, bảo hành. */
export default function ProjectReportCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['report-overview'],
    queryFn: () => getReportOverview(),
    refetchInterval: 120000,
    retry: false,
  });

  // Vai trò không có quyền xem báo cáo (403) thì ẩn thẻ này
  if (isError) return null;

  const maxPositions = Math.max(1, ...Object.values(data?.positionsByStatus ?? {}));

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <BarChart3 size={16} className="text-primary" /> Báo cáo dự án
      </div>

      {isLoading || !data ? (
        <div className="py-6 text-center text-xs text-slate-400">Đang tải báo cáo...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <div className="text-[10px] uppercase text-slate-400">Giá trị hợp đồng</div>
              <div className="text-sm font-bold text-slate-900">{formatVnd(data.contractValue)}</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2.5">
              <div className="text-[10px] uppercase text-emerald-600">Đã thu</div>
              <div className="text-sm font-bold text-emerald-700">{formatVnd(data.collected)}</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5">
              <div className="text-[10px] uppercase text-amber-600">Còn phải thu</div>
              <div className="text-sm font-bold text-amber-700">{formatVnd(data.outstanding)}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-500">Dự án theo trạng thái ({data.totalProjects})</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.projectsByStatus).map(([status, count]) => (
                <span key={status} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700">
                  {PROJECT_STATUS_MAP[status as ProjectStatus]?.label ?? status}: <b>{count}</b>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-500">Bộ cửa theo tiến độ (toàn công ty)</div>
            {Object.entries(data.positionsByStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className="flex items-center gap-2 text-[11px]">
                  <span className="w-28 shrink-0 text-slate-600">{DOOR_STATUS_MAP[status]?.label ?? status}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(count / maxPositions) * 100}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right font-semibold text-slate-700">
                    {count} · {data.areaM2ByStatus[status as keyof typeof data.areaM2ByStatus]} m²
                  </span>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-2 text-[11px] text-slate-600">
            <span>Dự án đang bảo hành: <b>{data.warranty.activeProjects}</b></span>
            <span>Bảo hành sắp tới (7 ngày): <b>{data.warranty.upcomingVisits7d}</b></span>
            <span className={data.warranty.overdueVisits > 0 ? 'font-semibold text-red-600' : ''}>
              Quá hạn: <b>{data.warranty.overdueVisits}</b>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
