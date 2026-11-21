'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCustomer, getCustomerLogs } from '@/actions';
import {
  CUSTOMER_LOG_CHANNEL_OPTIONS,
  CUSTOMER_LOG_STATUS_OPTIONS,
  CUSTOMER_LOG_TYPE_OPTIONS,
  getCustomerLogChannelLabel,
  getCustomerLogStatusLabel,
  getCustomerLogTypeLabel,
  getCustomerTypeLabel,
} from '@/config';
import { useCan } from '@/hooks';
import type { CustomerLog } from '@/types';
import { Badge, type Tone } from '../../_components/badge';
import { BTN_LINE } from '../../_components/form';
import { BackLink, PageHeader } from '../../_components/page-header';
import { Select } from '../../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { CustomerSheet } from '../_components/customer-sheet';
import { LogSheet } from '../_components/log-sheet';

const STATUS_TONE: Record<string, Tone> = { completed: 'success', pending: 'warning', failed: 'danger' };
const day = (s: string) => new Date(s).toLocaleDateString('vi-VN');
const ALL = { value: '', label: 'Tất cả' };

// Chi tiết khách hàng: thông tin liên hệ và nhật ký tương tác.
export default function RemakeCustomerDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const { can } = useCan();
  const [edit, setEdit] = useState(false);
  const [log, setLog] = useState<CustomerLog | 'new' | null>(null);
  const [flt, setFlt] = useState({ channel: '', type: '', status: '' });
  const customer = useQuery({ queryKey: ['customer', id], queryFn: () => getCustomer(id) });
  const logs = useQuery({
    queryKey: ['customer-logs', id, flt],
    queryFn: () =>
      getCustomerLogs(id, { offset: 0, limit: 100, channel: flt.channel || undefined, type: flt.type || undefined, status: flt.status || undefined }),
  });
  const c = customer.data;
  const items = logs.data?.items ?? [];
  const rows = c
    ? ([
        ['Điện thoại', c.phone],
        ['Email', c.email],
        ['Địa chỉ', c.address],
        ['Mã định danh', c.identifyCode],
        ['Phụ trách', c.staff?.fullName ?? c.staff?.username],
        ['Nhà cung cấp', c.provider?.name],
      ] as const)
    : [];

  return (
    <>
      <BackLink href="/remake/customers" label="Khách hàng" />
      {customer.isLoading && <ListSkeleton />}
      {customer.isError && (
        <ErrorState
          title="Không tải được khách hàng"
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => customer.refetch()}
        />
      )}
      {c && (
        <>
          <PageHeader title={c.name} description={getCustomerTypeLabel(c.type)} />
          <dl className="mb-4 divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-3 px-rm-gutter py-2 text-sm">
                <dt className="w-28 flex-none text-rm-muted">{k}</dt>
                <dd className="min-w-0 flex-1 [overflow-wrap:anywhere]">{v || '–'}</dd>
              </div>
            ))}
          </dl>
          {can('customer:update') && (
            <button type="button" onClick={() => setEdit(true)} className={`${BTN_LINE} mb-6 w-full md:w-auto md:px-6`}>
              Sửa thông tin
            </button>
          )}

          <div className="mb-2 flex items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">Lịch sử tương tác · {logs.data?.meta?.total ?? 0}</h2>
            {can('customer:update') && (
              <button
                type="button"
                onClick={() => setLog('new')}
                className="h-rm-tap flex-none px-2 text-sm font-medium text-rm-primary md:h-rm-control"
              >
                Thêm
              </button>
            )}
          </div>
          <div className="mb-3 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
            <Select
              id="lf-channel"
              label="Kênh"
              value={flt.channel}
              onChange={(v) => setFlt({ ...flt, channel: v })}
              options={[ALL, ...CUSTOMER_LOG_CHANNEL_OPTIONS]}
            />
            <Select
              id="lf-type"
              label="Mức quan tâm"
              value={flt.type}
              onChange={(v) => setFlt({ ...flt, type: v })}
              options={[ALL, ...CUSTOMER_LOG_TYPE_OPTIONS]}
            />
            <Select
              id="lf-status"
              label="Kết quả"
              value={flt.status}
              onChange={(v) => setFlt({ ...flt, status: v })}
              options={[ALL, ...CUSTOMER_LOG_STATUS_OPTIONS]}
            />
          </div>
          {logs.isLoading && <ListSkeleton rows={3} />}
          {logs.isError && (
            <ErrorState title="Không tải được tương tác" description="Thử lại sau." actionLabel="Thử lại" onAction={() => logs.refetch()} />
          )}
          {logs.data && items.length === 0 && <EmptyState title="Chưa có tương tác" description="Ghi lại lần liên hệ đầu tiên." />}
          {items.length > 0 && (
            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
              {items.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setLog(l)}
                    className="block min-h-rm-row w-full px-rm-gutter py-2 text-left active:bg-rm-bg md:hover:bg-rm-bg"
                  >
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">{getCustomerLogChannelLabel(l.channel)}</span>
                      <Badge tone={STATUS_TONE[l.status]}>{getCustomerLogStatusLabel(l.status)}</Badge>
                      <Badge>{getCustomerLogTypeLabel(l.type)}</Badge>
                    </span>
                    <span className="block truncate text-xs text-rm-muted">
                      {day(l.createdAt)}
                      {l.nextFollowDate && ` · hẹn ${day(l.nextFollowDate)}`}
                    </span>
                    {l.note && <span className="mt-1 line-clamp-2 block text-xs [overflow-wrap:anywhere]">{l.note}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <CustomerSheet key={edit ? `e-${c.id}` : 'none'} target={edit ? c : null} onClose={() => setEdit(false)} />
          <LogSheet key={log === 'new' ? 'log-new' : `log-${log?.id ?? 'none'}`} customerId={id} target={log} onClose={() => setLog(null)} />
        </>
      )}
    </>
  );
}
