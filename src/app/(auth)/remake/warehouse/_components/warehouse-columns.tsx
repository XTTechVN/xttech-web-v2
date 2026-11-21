import type { GlassOrder, GlassOrderStatus, WarehouseItem, WarehouseOffcut, WarehouseReceipt } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge, type Tone } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { ITEM_TYPES, labelOf, num, REASONS, RECEIPT_STATUS } from './labels';

export const GLASS_STATUS: Record<GlassOrderStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Bản nháp', tone: 'neutral' },
  ordered: { label: 'Đã gửi nhà máy', tone: 'primary' },
  delivered: { label: 'Đã về xưởng', tone: 'success' },
  assembled: { label: 'Đã vào khung', tone: 'success' },
};

const vnDay = (s: string) => new Date(s).toLocaleDateString('vi-VN');
const Name = ({ children }: { children: React.ReactNode }) => <span className="block truncate font-medium">{children}</span>;
const Sub = ({ children }: { children: React.ReactNode }) => <span className="block truncate text-xs text-rm-muted">{children}</span>;

// ── Tồn kho
export const stockColumns: Column<WarehouseItem>[] = [
  {
    key: 'name',
    header: 'Vật tư',
    cell: (i) => (
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate font-medium">{i.itemName}</span>
        {i.isLowStock && <Badge tone="danger">Sắp hết</Badge>}
      </span>
    ),
  },
  { key: 'code', header: 'Mã', fit: true, cell: (i) => i.itemCode },
  { key: 'type', header: 'Loại', fit: true, wideOnly: true, cell: (i) => labelOf(ITEM_TYPES, i.itemType) },
  { key: 'loc', header: 'Vị trí', wideOnly: true, cell: (i) => i.location ?? '–' },
  { key: 'stock', header: 'Tồn', fit: true, align: 'right', cell: (i) => <span className="font-semibold">{num(i.currentStock)}</span> },
  { key: 'avail', header: 'Còn dùng', fit: true, align: 'right', cell: (i) => num(i.availableStock) },
];
export function StockCard({ i }: { i: WarehouseItem }) {
  return (
    <>
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{i.itemName}</span>
        {i.isLowStock && <Badge tone="danger">Sắp hết</Badge>}
      </span>
      <Sub>
        {i.itemCode} · {labelOf(ITEM_TYPES, i.itemType)}
        {i.location && ` · ${i.location}`}
      </Sub>
      <Sub>
        Tồn <b className="text-rm-text">{num(i.currentStock)}</b> · Còn dùng {num(i.availableStock)}
      </Sub>
    </>
  );
}

// ── Phiếu kho
const receiptBadge = (r: WarehouseReceipt) => <Badge tone={RECEIPT_STATUS[r.status]?.tone}>{RECEIPT_STATUS[r.status]?.label ?? r.status}</Badge>;
const receiptNote = (r: WarehouseReceipt) => r.supplierName ?? r.projectName ?? '–';
export const receiptColumns: Column<WarehouseReceipt>[] = [
  { key: 'code', header: 'Phiếu', fit: true, cell: (r) => <span className="font-medium">{r.code}</span> },
  {
    key: 'type',
    header: 'Loại',
    fit: true,
    cell: (r) => `${r.receiptType === 'import' ? 'Nhập' : 'Xuất'} · ${REASONS[r.receiptReason] ?? r.receiptReason}`,
  },
  { key: 'who', header: 'Nhà cung cấp / Dự án', cell: receiptNote },
  { key: 'items', header: 'Số mục', fit: true, align: 'right', wideOnly: true, cell: (r) => r.totalItemsCount },
  { key: 'date', header: 'Ngày', fit: true, cell: (r) => vnDay(r.createdAt) },
  { key: 'total', header: 'Tổng tiền', fit: true, align: 'right', cell: (r) => (r.totalAmount > 0 ? formatCurrency(r.totalAmount) : '–') },
  { key: 'status', header: 'Trạng thái', fit: true, cell: receiptBadge },
];
export function ReceiptCard({ r }: { r: WarehouseReceipt }) {
  return (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{r.code}</span>
        {r.totalAmount > 0 && <span className="flex-none text-sm font-semibold">{formatCurrency(r.totalAmount)}</span>}
      </span>
      <span className="flex items-center gap-2">
        {receiptBadge(r)}
        <span className="min-w-0 truncate text-xs text-rm-muted">
          {r.receiptType === 'import' ? 'Nhập' : 'Xuất'} · {REASONS[r.receiptReason] ?? r.receiptReason} · {r.totalItemsCount} mục
        </span>
      </span>
      <Sub>
        {vnDay(r.createdAt)}
        {(r.supplierName || r.projectName) && ` · ${receiptNote(r)}`}
      </Sub>
    </>
  );
}

// ── Nhôm thừa
export const offcutColumns: Column<WarehouseOffcut>[] = [
  { key: 'name', header: 'Thanh nhôm', cell: (o) => <Name>{o.profileBarName ?? o.profileBarCode ?? 'Thanh nhôm'}</Name> },
  { key: 'code', header: 'Mã', fit: true, cell: (o) => o.profileBarCode ?? '–' },
  { key: 'color', header: 'Màu', fit: true, cell: (o) => (o.colorName ? <Badge tone="primary">{o.colorName}</Badge> : '–') },
  { key: 'loc', header: 'Vị trí', wideOnly: true, cell: (o) => o.location ?? '–' },
  { key: 'len', header: 'Chiều dài', fit: true, align: 'right', cell: (o) => <span className="font-semibold">{num(o.lengthMm)} mm</span> },
];
export function OffcutCard({ o }: { o: WarehouseOffcut }) {
  return (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{o.profileBarName ?? o.profileBarCode ?? 'Thanh nhôm'}</span>
        <span className="flex-none text-sm font-semibold">{num(o.lengthMm)} mm</span>
      </span>
      <span className="flex items-center gap-2">
        {o.colorName && <Badge tone="primary">{o.colorName}</Badge>}
        <span className="min-w-0 truncate text-xs text-rm-muted">
          {o.profileBarCode}
          {o.location && ` · ${o.location}`}
        </span>
      </span>
    </>
  );
}

// ── Đơn đặt kính
const glassBadge = (o: GlassOrder) => <Badge tone={GLASS_STATUS[o.status]?.tone}>{GLASS_STATUS[o.status]?.label ?? o.status}</Badge>;
export const glassColumns: Column<GlassOrder>[] = [
  { key: 'code', header: 'Đơn kính', fit: true, cell: (o) => <span className="font-medium">{o.code}</span> },
  { key: 'supplier', header: 'Nhà máy', cell: (o) => o.supplierName ?? '–' },
  { key: 'panes', header: 'Số tấm', fit: true, align: 'right', cell: (o) => o.totalPanes },
  { key: 'area', header: 'Diện tích', fit: true, align: 'right', wideOnly: true, cell: (o) => `${o.totalAreaM2} m²` },
  { key: 'total', header: 'Tổng tiền', fit: true, align: 'right', cell: (o) => formatCurrency(o.totalAmount) },
  { key: 'status', header: 'Trạng thái', fit: true, cell: glassBadge },
];
export function GlassCard({ o }: { o: GlassOrder }) {
  return (
    <>
      <span className="block truncate text-sm font-medium">{o.code}</span>
      <span className="flex items-center gap-2">
        {glassBadge(o)}
        <span className="min-w-0 truncate text-xs text-rm-muted">
          {o.totalPanes} tấm · {o.totalAreaM2} m² · {formatCurrency(o.totalAmount)}
        </span>
      </span>
      {o.supplierName && <Sub>{o.supplierName}</Sub>}
    </>
  );
}
