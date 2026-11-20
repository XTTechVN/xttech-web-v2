'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { Alert, Badge, Button, Input, Skeleton, TableSearch } from '@/components';
import { getNonDeductibleReport } from '@/actions';
import { getTaxDeductibleBadge, VOUCHER_TYPE_MAP } from '@/config/finance';
import { formatCurrency, getErrorMessage, includesSearchText } from '@/utils';
import { exportNonDeductibleExcel } from '../../_utils';
import { CitEstimateCard } from '../gl-closing-tab';
import { VOUCHER_INVOICE_FLAG_MAP } from './tax-tab.constants';

interface CitB4SectionProps {
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function CitB4Section({
  refreshSignal = 0,
  onOpenVoucherDetail,
}: CitB4SectionProps) {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState<string>(() =>
    dayjs().startOf('year').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));

  const { data: report, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-cit-b4-report', fromDate, toDate, refreshSignal],
    queryFn: () => getNonDeductibleReport({ fromDate, toDate }),
  });

  const items = useMemo(() => {
    const raw = report?.items || [];
    if (!search.trim()) return raw;
    return raw.filter(
      (item) =>
        includesSearchText(item.voucherNo, search) ||
        includesSearchText(item.contactName || item.partnerName, search) ||
        includesSearchText(item.projectCode || item.projectName, search) ||
        includesSearchText(item.description, search),
    );
  }, [report?.items, search]);

  const filteredTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalAmount, 0),
    [items],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-end gap-3 flex-1">
          <div className="pb-0.5">
            <TableSearch
              placeholder="Tìm số CT, đối tượng, công trình, diễn giải..."
              value={search}
              onChange={setSearch}
              className="w-64"
            />
          </div>
          <div className="w-40">
            <Input label="Từ ngày" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} fullWidth />
          </div>
          <div className="w-40">
            <Input label="Đến ngày" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} fullWidth />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {report && (
            <Badge variant="warning" size="md">
              Tổng loại trừ B4: {formatCurrency(report.totalNonDeductibleAmount)}
            </Badge>
          )}
          {report && (
            <Button variant="outline" size="sm" onClick={() => exportNonDeductibleExcel(report)} leftIcon={<Download size={14} />}>
              Xuất Excel B4
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
        <Alert variant="danger" title="Không thể tải bảng kê chi phí loại trừ TNDN (B4)">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : report ? (
        <>
          <CitEstimateCard metrics={report} periodLabel={`${fromDate} → ${toDate}`} />

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Danh sách chứng từ chi phí không được trừ TNDN — Chỉ tiêu B4 ({items.length})
              </div>
              <span className="text-[11px] text-slate-500">
                Tổng hợp từ 1 Sổ Tài chính (không HĐ GTGT hợp lệ hoặc chi tiền mặt vượt ngưỡng)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Số CT</th>
                    <th className="p-3">Ngày ghi sổ</th>
                    <th className="p-3">Loại CT</th>
                    <th className="p-3">Tính hợp lệ &amp; Cảnh báo B4</th>
                    <th className="p-3">Đối tượng / Công trình</th>
                    <th className="p-3">Diễn giải</th>
                    <th className="p-3 text-right">Số tiền (VNĐ)</th>
                    <th className="p-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Không có chứng từ chi phí bị loại trừ B4 trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const typeMeta = VOUCHER_TYPE_MAP[item.voucherType];
                      const taxBadge = getTaxDeductibleBadge(item.isTaxDeductible);
                      const invFlag =
                        VOUCHER_INVOICE_FLAG_MAP[item.hasValidInvoice ? 'true' : 'false'];
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.voucherNo}
                          </td>
                          <td className="p-3 font-mono whitespace-nowrap">
                            {item.postingDate.slice(0, 10)}
                          </td>
                          <td className="p-3">
                            <Badge variant={typeMeta?.variant || 'default'} size="sm">
                              {typeMeta?.shortLabel || item.voucherType}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-1">
                              <Badge variant={taxBadge.variant} size="sm">
                                {taxBadge.shortLabel || taxBadge.label}
                              </Badge>
                              <Badge variant={invFlag.variant} size="sm">
                                {invFlag.label}
                              </Badge>
                              {item.nonCashWarning && (
                                <Badge variant="danger" size="sm">
                                  Tiền mặt vượt ngưỡng
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">
                              {item.contactName || item.partnerName || '---'}
                            </div>
                            {item.projectName && (
                              <div className="text-[11px] text-primary">
                                {item.projectCode || item.projectName}
                              </div>
                            )}
                          </td>
                          <td className="p-3 max-w-xs truncate">{item.description}</td>
                          <td className="p-3 font-mono tabular-nums text-right font-bold text-slate-900">
                            {formatCurrency(item.totalAmount)}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onOpenVoucherDetail(item.id)}
                              leftIcon={<Eye size={13} />}
                            >
                              Xem
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
                  <tr>
                    <td colSpan={6} className="p-3 text-right uppercase">
                      Tổng chi phí không được trừ TNDN (B4)
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right text-sm">
                      {formatCurrency(search.trim() ? filteredTotal : report.totalNonDeductibleAmount)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
