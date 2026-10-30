'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { approveQuotation, getQuotationOverview } from '@/actions';
import { Badge, Button, Input, Skeleton } from '@/components';
import { QUOTATION_STATUS_MAP } from '@/config';
import { formatCurrency, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { QuotationOverviewItem, QuotationStatus } from '@/types';

// Thứ tự theo vòng duyệt: việc admin cần làm đứng đầu
const STATUS_FILTERS: { value: QuotationStatus | 'all'; label: string }[] = [
  { value: 'pending_approval', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt, chưa gửi' },
  { value: 'sent', label: 'Chờ khách' },
  { value: 'accepted', label: 'Khách đồng ý' },
  { value: 'rejected', label: 'Khách từ chối' },
  { value: 'draft', label: 'Nháp' },
  { value: 'all', label: 'Tất cả' },
];

const formatDateTime = (value?: string | null): string =>
  value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

/** Admin nắm toàn bộ báo giá của hệ thống, duyệt nhanh báo giá đang chờ. */
export default function QuotationsOverviewPage() {
  const [status, setStatus] = useState<QuotationStatus | 'all'>('pending_approval');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['quotation_overview', status, search],
    queryFn: () =>
      getQuotationOverview({
        status: status === 'all' ? undefined : status,
        search: search.trim() || undefined,
        limit: 200,
      }),
  });

  const approve = useMutation({
    mutationFn: (item: QuotationOverviewItem) => approveQuotation(item.projectId, item.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['quotation_overview'] });
      toast.success(`Đã duyệt báo giá ${res.code}`);
    },
    onError: (err) => showErrorToast(err, 'Không duyệt được báo giá'),
  });

  const counts = data?.statusCounts ?? {};

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800">Duyệt báo giá</h1>
          <p className="text-xs text-slate-500">
            Mọi báo giá phải được admin duyệt trước khi gửi khách. Bấm vào báo giá để xem chi tiết và trả lại nếu cần.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Tìm mã báo giá, dự án, khách hàng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.value === 'all' ? undefined : counts[filter.value];
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                status === filter.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40'
              }`}
            >
              {filter.label}
              {count ? <span className="ml-1">({count})</span> : null}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[960px] text-xs">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Báo giá</th>
              <th className="px-3 py-2">Dự án / Khách hàng</th>
              <th className="px-3 py-2 text-right">Tổng tiền</th>
              <th className="px-3 py-2 text-right">Chiết khấu</th>
              <th className="px-3 py-2 text-right">Biên lãi</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Trình / Duyệt</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-3 py-2">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && !data?.items.length && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                  Không có báo giá nào.
                </td>
              </tr>
            )}
            {data?.items.map((item) => {
              const badge = QUOTATION_STATUS_MAP[item.status] ?? { label: item.status, variant: 'default' };
              return (
                <tr key={item.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-800">
                      {item.code} (v{item.version})
                    </div>
                    <div className="text-slate-500">{item.name}</div>
                    {item.designOptionName && (
                      <div className="text-[11px] text-sky-700">Phương án: {item.designOptionName}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-700">
                      {item.projectCode} · {item.projectName}
                    </div>
                    <div className="text-slate-500">{item.customerName ?? '—'}</div>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td className="px-3 py-2 text-right">{item.discountPercent}%</td>
                  <td
                    className={`px-3 py-2 text-right font-semibold ${
                      item.effectiveMarginPercent < 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {item.effectiveMarginPercent.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                    {(item.reviewNote || item.customerNote) && (
                      <div className="mt-1 max-w-48 text-[11px] text-slate-500">
                        {item.customerNote ?? item.reviewNote}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-500">
                    <div>
                      Trình: {item.submittedByName ?? '—'} · {formatDateTime(item.submittedAt)}
                    </div>
                    <div>
                      Duyệt: {item.approvedByName ?? '—'} · {formatDateTime(item.approvedAt)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      {item.status === 'pending_approval' && (
                        <Button
                          size="xs"
                          leftIcon={<CheckCircle2 size={13} />}
                          loading={approve.isPending && approve.variables?.id === item.id}
                          disabled={approve.isPending}
                          onClick={() => approve.mutate(item)}
                        >
                          Duyệt
                        </Button>
                      )}
                      <Link href={`/app/projects/${item.projectId}?tab=quotations`}>
                        <Button size="xs" variant="outline" leftIcon={<ExternalLink size={13} />}>
                          Xem
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
