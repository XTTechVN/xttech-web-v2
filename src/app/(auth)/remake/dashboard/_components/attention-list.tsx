'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { getInboxDocuments, getQuotationOverview, getSuggestions, getWarehouseItems, getWarehouseReceipts } from '@/actions';
import type { DashboardSummary } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge, type Tone } from '../../_components/badge';
import { Sheet } from '../../_components/sheet';
import { ErrorState, ListSkeleton } from '../../_components/state-views';
import { LEAVE_TYPES } from '../../leave-requests/_components/leave-sheet';
import { REASONS, UNITS, labelOf, num } from '../../warehouse/_components/labels';

interface Item {
  id: string;
  kind: string;
  tone: Tone;
  title: string;
  sub: string;
  href: string;
}

interface Source {
  key: string;
  show: boolean;
  load: () => Promise<Item[]>;
}

const RANK: Record<Tone, number> = { danger: 0, warning: 1, primary: 2, success: 3, neutral: 4 };
const PER_SOURCE = 20;
const SHOWN = 5;
const vn = (d: string) => new Date(d).toLocaleDateString('vi-VN');

function Row({ i, fill }: { i: Item; fill?: boolean }) {
  return (
    <li className={fill ? 'flex flex-1' : undefined}>
      <Link href={i.href} className="flex min-h-rm-row w-full items-center gap-3 px-rm-gutter py-2 active:bg-rm-bg md:hover:bg-rm-bg">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <Badge tone={i.tone}>{i.kind}</Badge>
            <span className="min-w-0 truncate text-sm font-medium">{i.title}</span>
          </span>
          <span className="block truncate text-xs text-rm-muted">{i.sub}</span>
        </span>
        <ChevronRight size={18} className="flex-none text-rm-muted" aria-hidden="true" />
      </Link>
    </li>
  );
}

export interface Attention {
  items: Item[];
  loading: boolean;
  failed: boolean;
}

// Gộp mọi việc cần vào kiểm tra, mỗi nguồn chỉ chạy khi có quyền; việc gấp lên trước.
export function useAttention(can: (code: string) => boolean, summary?: DashboardSummary): Attention {
  const fixed: Item[] = [
    ...(can('leave_request:read') && summary
      ? summary.recentPendingLeaves.map((l) => ({
          id: `leave-${l.id}`,
          kind: 'Nghỉ phép',
          tone: 'warning' as Tone,
          title: l.userFullName,
          sub: `${LEAVE_TYPES.find((t) => t.value === l.leaveType)?.label ?? l.leaveType} · ${vn(l.startDate)} – ${vn(l.endDate)}`,
          href: '/remake/leave-requests',
        }))
      : []),
    ...(can('attendance_request:read') && summary
      ? summary.recentPendingAdjustments.map((a) => ({
          id: `adj-${a.id}`,
          kind: 'Giải trình',
          tone: 'warning' as Tone,
          title: a.userFullName,
          sub: `${a.workDate ? `${vn(a.workDate)} · ` : ''}${a.reason}`,
          href: '/remake/adjustments',
        }))
      : []),
  ];

  const sources: Source[] = [
    {
      key: 'stock',
      show: can('warehouse_item:read'),
      load: async () =>
        (await getWarehouseItems({ limit: 200, offset: 0 })).items
          .filter((i) => i.isLowStock)
          .map((i) => ({
            id: `stock-${i.id}`,
            kind: i.currentStock <= 0 ? 'Hết hàng' : 'Sắp hết',
            tone: (i.currentStock <= 0 ? 'danger' : 'warning') as Tone,
            title: i.itemName,
            sub: `Còn ${num(i.currentStock)} ${labelOf(UNITS, i.unit).toLowerCase()} · tối thiểu ${num(i.minStockLevel)}`,
            href: '/remake/warehouse',
          })),
    },
    {
      key: 'quotation',
      show: can('quotation:approve'),
      load: async () =>
        (await getQuotationOverview({ status: 'pending_approval', limit: PER_SOURCE })).items.map((q) => ({
          id: `quo-${q.id}`,
          kind: 'Báo giá',
          tone: 'primary' as Tone,
          title: q.projectName,
          sub: `${q.customerName ? `${q.customerName} · ` : ''}${formatCurrency(q.totalAmount)}`,
          href: '/remake/quotations',
        })),
    },
    {
      key: 'receipt',
      show: can('warehouse_receipt:approve'),
      load: async () =>
        (await getWarehouseReceipts({ limit: PER_SOURCE, offset: 0, status: 'draft' })).items.map((r) => ({
          id: `rec-${r.id}`,
          kind: 'Phiếu kho',
          tone: 'primary' as Tone,
          title: r.code,
          sub: `${r.receiptType === 'import' ? 'Nhập' : 'Xuất'} · ${REASONS[r.receiptReason] ?? r.receiptReason}`,
          href: '/remake/warehouse',
        })),
    },
    {
      key: 'suggestion',
      show: can('suggestion:review'),
      load: async () =>
        (await getSuggestions({ limit: PER_SOURCE, offset: 0, status: 'pending' })).items.map((s) => ({
          id: `sug-${s.id}`,
          kind: 'Sáng kiến',
          tone: 'neutral' as Tone,
          title: s.title,
          sub: s.anonymous ? 'Ẩn danh' : (s.user?.fullName ?? s.user?.username ?? '–'),
          href: '/remake/suggestions',
        })),
    },
    {
      key: 'doc',
      show: can('document:read'),
      load: async () =>
        (await getInboxDocuments({ limit: 20 })).items
          .filter((d) => d.isRead === false)
          .map((d) => ({
            id: `doc-${d.id}`,
            kind: 'Tài liệu',
            tone: 'neutral' as Tone,
            title: d.title,
            sub: `${d.code} · chưa đọc`,
            href: '/remake/inbox',
          })),
    },
  ].filter((s) => s.show);

  const results = useQueries({ queries: sources.map((s) => ({ queryKey: ['dashboard-attention', s.key], queryFn: s.load })) });
  const loading = results.some((r) => r.isLoading);
  const failed = results.some((r) => r.isError);
  const items = [...fixed, ...results.flatMap((r) => r.data ?? [])].sort((a, b) => RANK[a.tone] - RANK[b.tone]);
  return { items, loading, failed };
}

interface ListProps {
  att: Attention;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Nhãn màu phân loại; 5 việc đầu, "Xem tất cả" mở ngăn kéo (cũng mở được từ chuông ở Trang chủ).
export function AttentionList({ att, open, onOpenChange }: ListProps) {
  const { items, loading, failed } = att;
  const top = items.slice(0, SHOWN);

  return (
    <section className="flex min-w-0 flex-col">
      <div className="mb-3 flex min-h-9 md:mb-2 items-center gap-2">
        <h2 className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold">
          Đáng chú ý{items.length > 0 && <Badge>{items.length}</Badge>}
        </h2>
        {items.length > 0 && (
          <button type="button" onClick={() => onOpenChange(true)} className="flex-none text-xs font-medium text-rm-primary">
            Xem tất cả
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col rounded-rm-xl border border-rm-edge bg-rm-surface">
        {loading && items.length === 0 && <ListSkeleton rows={3} />}
        {failed && <ErrorState title="Một số mục không tải được" description="Tải lại trang để thử lại." />}
        {!loading && !failed && items.length === 0 && <p className="px-rm-gutter py-6 text-center text-sm text-rm-muted">Không có gì cần kiểm tra</p>}
        {top.length > 0 && (
          <ul className="flex flex-1 flex-col divide-y divide-rm-line">
            {top.map((i) => (
              <Row key={i.id} i={i} fill={top.length === SHOWN} />
            ))}
          </ul>
        )}
      </div>

      <Sheet open={open} onClose={() => onOpenChange(false)} title={`Đáng chú ý (${items.length})`}>
        <ul className="divide-y divide-rm-line">
          {items.map((i) => (
            <Row key={i.id} i={i} />
          ))}
        </ul>
      </Sheet>
    </section>
  );
}
