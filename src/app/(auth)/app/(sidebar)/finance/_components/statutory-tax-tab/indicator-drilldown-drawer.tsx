'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, FileSearch } from 'lucide-react';
import { Alert, Badge, Drawer, Skeleton } from '@/components';
import { getStatutoryIndicatorDrilldown } from '@/actions';
import { formatCurrency, getErrorMessage } from '@/utils';
import { DRILLDOWN_SOURCE_KIND_LABELS } from './statutory-tax-tab.constants';

export interface IndicatorDrilldownDrawerProps {
  isOpen: boolean;
  filingId: number | null;
  indicatorCode: string | null;
  indicatorLabel?: string;
  onClose: () => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function IndicatorDrilldownDrawer({
  isOpen,
  filingId,
  indicatorCode,
  indicatorLabel,
  onClose,
  onOpenVoucherDetail,
}: IndicatorDrilldownDrawerProps) {
  const { data: refs = [], isLoading, isError, error } = useQuery({
    queryKey: ['finance', 'statutory', 'drilldown', filingId, indicatorCode],
    queryFn: () =>
      getStatutoryIndicatorDrilldown(filingId as number, indicatorCode as string),
    enabled: isOpen && Boolean(filingId) && Boolean(indicatorCode),
  });

  const totalAmount = refs.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      headerClassName="bg-primary/5"
      title={
        <div className="flex items-center gap-2">
          <FileSearch size={16} className="text-primary" />
          <span>
            Truy vết Chỉ tiêu [{indicatorCode}] {indicatorLabel ? `— ${indicatorLabel}` : ''}
          </span>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-slate-700 font-medium">
            Tổng chứng từ / hóa đơn cấu thành chỉ tiêu [{indicatorCode}]
          </span>
          <span className="font-mono font-bold text-primary tabular-nums text-sm">
            {formatCurrency(totalAmount)} ({refs.length} dòng)
          </span>
        </div>

        {isError && (
          <Alert variant="danger" title="Không thể tải chi tiết truy vết">
            {getErrorMessage(error)}
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : refs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-slate-200 rounded-xl">
            Không có chứng từ / hóa đơn nào phát sinh cho chỉ tiêu này trong kỳ.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Nguồn</th>
                  <th className="p-2.5">Số chứng từ / HĐ</th>
                  <th className="p-2.5">Ngày</th>
                  <th className="p-2.5">Đối tác &amp; Diễn giải</th>
                  <th className="p-2.5 text-right">Số tiền (VNĐ)</th>
                  <th className="p-2.5 text-center">Mở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refs.map((ref) => (
                  <tr key={`${ref.sourceKind}-${ref.id}`} className="hover:bg-slate-50/70">
                    <td className="p-2.5 whitespace-nowrap">
                      <Badge variant="default" size="sm">
                        {DRILLDOWN_SOURCE_KIND_LABELS[ref.sourceKind] || ref.sourceKind}
                      </Badge>
                    </td>
                    <td className="p-2.5 font-mono font-semibold text-slate-900">
                      {ref.documentNo}
                    </td>
                    <td className="p-2.5 text-slate-500">{ref.entryDate}</td>
                    <td className="p-2.5">
                      {ref.partnerName && (
                        <div className="font-semibold text-slate-800">{ref.partnerName}</div>
                      )}
                      <div className="text-slate-600">{ref.description}</div>
                    </td>
                    <td className="p-2.5 font-mono tabular-nums text-right font-semibold text-primary">
                      {formatCurrency(ref.amount)}
                    </td>
                    <td className="p-2.5 text-center">
                      {ref.voucherId ? (
                        <button
                          type="button"
                          onClick={() => onOpenVoucherDetail(ref.voucherId as number)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium cursor-pointer"
                        >
                          <ExternalLink size={12} />
                          CT
                        </button>
                      ) : (
                        <span className="text-slate-300">---</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Drawer>
  );
}
