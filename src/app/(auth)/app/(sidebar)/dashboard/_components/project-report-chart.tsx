'use client';

import React, { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export type ProjectChartType = 'bar' | 'pie' | 'area';
export type ProjectDataMode = 'doors' | 'projects';

export interface ProjectChartItem {
  key: string;
  label: string;
  shortLabel: string;
  count: number;
  areaM2?: number;
  percent: number;
}

export interface ProjectReportChartProps {
  chartType: ProjectChartType;
  dataMode: ProjectDataMode;
  items: ProjectChartItem[];
  totalCount: number;
  totalAreaM2?: number;
}

export const SYSTEM_CHART_COLORS = [
  '#045863',
  '#076b78',
  '#0c7f8e',
  '#1493a3',
  '#38a8b6',
  '#64748b',
  '#94a3b8',
] as const;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: ProjectChartItem }>;
  dataMode: ProjectDataMode;
}

const ReportChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, dataMode }) => {
  const item = payload?.[0]?.payload;
  if (!active || !item || item.key === '__empty__') return null;
  const unitLabel = dataMode === 'doors' ? 'bộ cửa' : 'công trình';

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-xs shadow-md backdrop-blur-xs">
      <div className="mb-1.5 font-semibold text-slate-900">{item.label}</div>
      <div className="space-y-1 text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <span>Số lượng:</span>
          <span className="font-mono font-bold tabular-nums text-slate-900">
            {item.count} {unitLabel}
          </span>
        </div>
        {dataMode === 'doors' && typeof item.areaM2 === 'number' && (
          <div className="flex items-center justify-between gap-4">
            <span>Khối lượng:</span>
            <span className="font-mono font-semibold tabular-nums text-primary">
              {item.areaM2.toFixed(2)} m²
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span>Tỷ trọng:</span>
          <span className="font-mono font-semibold tabular-nums text-slate-800">
            {item.percent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const BarChartView: React.FC<{ items: ProjectChartItem[]; dataMode: ProjectDataMode }> = ({
  items,
  dataMode,
}) => (
  <div className="h-60 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
      <BarChart data={items} margin={{ top: 12, right: 16, left: -12, bottom: 6 }} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="shortLabel"
          padding={{ left: 12, right: 12 }}
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickMargin={6}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
          interval={0}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={34}
        />
        <Tooltip
          cursor={{ fill: 'rgba(4, 88, 99, 0.04)' }}
          content={<ReportChartTooltip dataMode={dataMode} />}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={250}>
          {items.map((entry, idx) => (
            <Cell key={entry.key} fill={SYSTEM_CHART_COLORS[idx % SYSTEM_CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const PieChartView: React.FC<{
  items: ProjectChartItem[];
  dataMode: ProjectDataMode;
  totalCount: number;
  totalAreaM2?: number;
}> = ({ items, dataMode, totalCount, totalAreaM2 }) => {
  const nonZeroItems = items.filter((item) => item.count > 0);
  const pieData: ProjectChartItem[] =
    nonZeroItems.length > 0
      ? nonZeroItems
      : [{ key: '__empty__', label: 'Chưa có dữ liệu', shortLabel: 'Trống', count: 1, percent: 0 }];

  return (
    <div className="grid h-60 w-full min-w-0 grid-cols-1 items-center gap-3 sm:grid-cols-12">
      <div className="relative h-44 w-full min-w-0 sm:col-span-5 sm:h-60">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={nonZeroItems.length > 1 ? 2 : 0}
              animationDuration={250}
              stroke="none"
            >
              {pieData.map((entry, idx) => (
                <Cell
                  key={entry.key}
                  fill={
                    entry.key === '__empty__'
                      ? '#e2e8f0'
                      : SYSTEM_CHART_COLORS[idx % SYSTEM_CHART_COLORS.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip content={<ReportChartTooltip dataMode={dataMode} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-base font-bold leading-tight tabular-nums text-slate-900">
            {totalCount}
          </span>
          <span className="text-[10px] font-medium text-slate-500">
            {dataMode === 'doors' ? 'bộ cửa' : 'dự án'}
          </span>
          {dataMode === 'doors' && typeof totalAreaM2 === 'number' && (
            <span className="font-mono text-[10px] font-semibold tabular-nums text-primary">
              {totalAreaM2.toFixed(1)} m²
            </span>
          )}
        </div>
      </div>

      <div className="flex max-h-56 flex-col justify-center gap-1.5 overflow-y-auto pr-1 sm:col-span-7">
        {items.map((item, idx) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/80 px-2.5 py-1.5 text-xs"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: SYSTEM_CHART_COLORS[idx % SYSTEM_CHART_COLORS.length] }}
              />
              <span className="truncate font-medium text-slate-700" title={item.label}>
                {item.label}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 font-mono tabular-nums">
              <span className="font-semibold text-slate-900">{item.count}</span>
              {dataMode === 'doors' && typeof item.areaM2 === 'number' && (
                <span className="text-[11px] text-slate-500">({item.areaM2.toFixed(1)} m²)</span>
              )}
              <span className="w-11 text-right text-[11px] font-medium text-primary">
                {item.percent.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaChartView: React.FC<{ items: ProjectChartItem[]; dataMode: ProjectDataMode }> = ({
  items,
  dataMode,
}) => (
  <div className="h-60 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
      <AreaChart data={items} margin={{ top: 12, right: 20, left: -12, bottom: 6 }}>
        <defs>
          <linearGradient id="xttechReportAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#045863" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#045863" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="shortLabel"
          padding={{ left: 32, right: 32 }}
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickMargin={6}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
          interval={0}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={34}
        />
        <Tooltip content={<ReportChartTooltip dataMode={dataMode} />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#045863"
          strokeWidth={2.5}
          fill="url(#xttechReportAreaGrad)"
          animationDuration={250}
          dot={{ r: 3.5, fill: '#045863', strokeWidth: 1.5, stroke: '#ffffff' }}
          activeDot={{ r: 5, fill: '#045863', strokeWidth: 2, stroke: '#ffffff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const ProjectReportChart: React.FC<ProjectReportChartProps> = memo(
  ({ chartType, dataMode, items, totalCount, totalAreaM2 }) => {
    if (items.length === 0) {
      return (
        <div className="flex h-60 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400">
          Chưa có dữ liệu thống kê ở chế độ này
        </div>
      );
    }
    if (chartType === 'pie') {
      return (
        <PieChartView
          items={items}
          dataMode={dataMode}
          totalCount={totalCount}
          totalAreaM2={totalAreaM2}
        />
      );
    }
    if (chartType === 'area') return <AreaChartView items={items} dataMode={dataMode} />;
    return <BarChartView items={items} dataMode={dataMode} />;
  }
);

ProjectReportChart.displayName = 'ProjectReportChart';

export default ProjectReportChart;
