'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, RefreshCw } from 'lucide-react';
import { Alert, Badge, Button, Drawer, Skeleton, TableSearch } from '@/components';
import { getProjectPnlDrilldown } from '@/actions';
import { PROJECT_PNL_METRIC_MAP, REPORT_VIEW_MODE_MAP } from '@/config/finance';
import type { ProjectPnlDrilldownMetric, ReportViewMode } from '@/types';
import { formatCurrency, getErrorMessage, includesSearchText } from '@/utils';
import { DrilldownGlTable } from './drilldown-gl-table';
import { DrilldownPaymentTable } from './drilldown-payment-table';

export interface ProjectPnlDrilldownTarget {
  projectId: number;
  metric: ProjectPnlDrilldownMetric;
}

interface ProjectPnlDrilldownDrawerProps {
  target: ProjectPnlDrilldownTarget | null;
  fromDate: string;
  toDate: string;
  reportViewMode: ReportViewMode;
  refreshSignal?: number;
  onClose: () => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function ProjectPnlDrilldownDrawer({
  target,
  fromDate,
  toDate,
  reportViewMode,
  refreshSignal = 0,
  onClose,
  onOpenVoucherDetail,
}: ProjectPnlDrilldownDrawerProps) {
  const [search, setSearch] = useState('');

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      'finance',
      'project-pnl-drilldown',
      target?.projectId,
      target?.metric,
      fromDate,
      toDate,
      reportViewMode,
      refreshSignal,
    ],
    queryFn: () =>
      getProjectPnlDrilldown({
        projectId: target!.projectId,
        metric: target!.metric,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        reportViewMode,
      }),
    enabled: Boolean(target),
  });

  const filteredItems = useMemo(() => {
    const raw = data?.items || [];
    if (!search.trim()) return raw;
    return raw.filter(
      (item) =>
        includesSearchText(item.documentNo, search) ||
        includesSearchText(item.description, search) ||
        includesSearchText(item.accountCode, search) ||
        includesSearchText(item.contraAccountCode, search) ||
        includesSearchText(item.partnerName, search) ||
        includesSearchText(item.costItemName, search) ||
        includesSearchText(item.contractCode, search) ||
        includesSearchText(item.bankReference, search),
    );
  }, [data?.items, search]);

  const filteredTotal = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.amount, 0),
    [filteredItems],
  );

  const metricMeta = target ? PROJECT_PNL_METRIC_MAP[target.metric] : undefined;
  const viewModeMeta = REPORT_VIEW_MODE_MAP[reportViewMode];
  const hasSearch = Boolean(search.trim());

  return (
    <Drawer
      isOpen={Boolean(target)}
      onClose={handleClose}
      size="4xl"
      zIndexClass="z-40"
      className="bg-slate-50"
      bodyClassName="space-y-3"
      ariaLabel="Chi tiết truy vết Lãi/Lỗ Công trình"
      icon={
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <FileSearch size={18} />
        </div>
      }
      title={
        target && (
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              {metricMeta?.label || target.metric}
            </h3>
            <Badge variant={metricMeta?.variant || 'default'} size="sm">
              {metricMeta?.shortLabel || target.metric}
            </Badge>
            {target.metric !== 'collected' && (
              <Badge variant={viewModeMeta?.variant || 'default'} size="sm">
                {viewModeMeta?.shortLabel || reportViewMode}
              </Badge>
            )}
          </div>
        )
      }
      subtitle={
        data
          ? `${data.projectCode} — ${data.projectName}${data.customerName ? ` • ${data.customerName}` : ''}`
          : metricMeta?.description
      }
      subHeader={
        target && (
          <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <TableSearch
              placeholder={
                target.metric === 'collected'
                  ? 'Tìm mã GD, mã HĐ, tham chiếu NH, ghi chú...'
                  : 'Tìm số CT, TK, TK ĐƯ, đối tượng, diễn giải...'
              }
              value={search}
              onChange={setSearch}
              className="w-full sm:w-80"
            />
            <div className="flex items-center gap-2.5 shrink-0">
              {data && (
                <div className="text-xs text-slate-600">
                  Tổng cộng:{' '}
                  <span className="font-mono font-bold text-primary text-sm tabular-nums">
                    {formatCurrency(data.totalAmount)}
                  </span>
                </div>
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
        )
      }
    >
      {target && (
        <>
          {data?.isCumulative ? (
            <Alert variant="info" title="Số liệu thu tiền lũy kế theo hợp đồng">
              Cột <strong>Đã thu</strong> tổng hợp toàn bộ giao dịch thu/hoàn tiền gắn công trình
              từ trước đến nay (không giới hạn theo kỳ {fromDate || 'Từ đầu'} →{' '}
              {toDate || 'Hiện tại'}), khớp trực tiếp với cột Đã thu trên bảng Lãi/Lỗ Công trình.
            </Alert>
          ) : (
            <div className="text-[11px] text-slate-500">
              Kỳ đang xem:{' '}
              <span className="font-mono font-semibold text-slate-700">
                {fromDate || 'Từ đầu'}
              </span>{' '}
              →{' '}
              <span className="font-mono font-semibold text-slate-700">
                {toDate || 'Hiện tại'}
              </span>{' '}
              • Bấm vào <strong>Số CT</strong> để mở xem hoặc ghi sổ/bỏ ghi sổ chứng từ gốc.
            </div>
          )}

          {isError && (
            <Alert variant="danger" title="Không thể tải chi tiết truy vết">
              {getErrorMessage(error)}
            </Alert>
          )}

          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : data ? (
            data.metric === 'collected' ? (
              <DrilldownPaymentTable
                items={filteredItems}
                filteredTotal={filteredTotal}
                overallTotal={data.totalAmount}
                hasSearch={hasSearch}
              />
            ) : (
              <DrilldownGlTable
                items={filteredItems}
                filteredTotal={filteredTotal}
                overallTotal={data.totalAmount}
                hasSearch={hasSearch}
                onOpenVoucherDetail={onOpenVoucherDetail}
              />
            )
          ) : null}
        </>
      )}
    </Drawer>
  );
}
