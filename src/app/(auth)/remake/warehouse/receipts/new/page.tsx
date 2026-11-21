'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createWarehouseReceipt, getWarehouseItems, getWarehouseSuppliers } from '@/actions';
import { useCan } from '@/hooks';
import type { ReceiptReason, ReceiptType, WarehouseItem } from '@/types';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../../_components/form';
import { BackLink, PageHeader } from '../../../_components/page-header';
import { Select } from '../../../_components/select';
import { REASONS, UNITS, labelOf } from '../../_components/labels';

interface Line {
  itemId: string;
  qty: string;
  price: string;
}
const IMPORT = ['purchase', 'offcut_return', 'adjustment'];
const EXPORT = ['production_issue', 'rework_issue', 'adjustment', 'scrap'];
const reasons = (t: string) => (t === 'import' ? IMPORT : EXPORT).map((v) => ({ value: v, label: REASONS[v] }));

// Tạo phiếu nhập / xuất kho: có danh sách vật tư con nên là trang riêng.
export default function RemakeNewReceiptPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { can } = useCan();
  const [type, setType] = useState<ReceiptType>('import');
  const [reason, setReason] = useState('purchase');
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');
  const [now, setNow] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ itemId: '', qty: '', price: '' }]);
  const items = useQuery({ queryKey: ['wh-items', 'all'], queryFn: () => getWarehouseItems({ limit: 200, offset: 0 }) });
  const suppliers = useQuery({ queryKey: ['wh-suppliers', 'all'], queryFn: () => getWarehouseSuppliers({ limit: 100, offset: 0 }) });
  const list: WarehouseItem[] = items.data?.items ?? [];
  const patch = (i: number, p: Partial<Line>) => setLines(lines.map((l, k) => (k === i ? { ...l, ...p } : l)));
  const valid = lines.length > 0 && lines.every((l) => l.itemId && Number(l.qty) > 0);

  const save = useMutation({
    mutationFn: () =>
      createWarehouseReceipt({
        receiptType: type,
        receiptReason: reason as ReceiptReason,
        supplierId: type === 'import' && supplier ? Number(supplier) : undefined,
        note: note.trim() || undefined,
        approveImmediately: now && can('warehouse_receipt:approve'),
        items: lines.map((l) => {
          const it = list.find((x) => String(x.id) === l.itemId)!;
          return {
            itemId: it.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            unit: it.unit,
            quantity: Number(l.qty),
            unitPrice: l.price ? Number(l.price) : undefined,
          };
        }),
      }),
    onSuccess: () => {
      toast.success('Đã tạo phiếu kho');
      qc.invalidateQueries({ queryKey: ['wh-receipts'] });
      qc.invalidateQueries({ queryKey: ['wh-items'] });
      qc.invalidateQueries({ queryKey: ['wh-kpi'] });
      router.push('/remake/warehouse');
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <>
      <BackLink href="/remake/warehouse" label="Kho vật tư" />
      <PageHeader title="Tạo phiếu kho" description="Nhập hoặc xuất vật tư." />
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
          <Field label="Loại phiếu" id="nr-type">
            <Select
              id="nr-type"
              label="Loại phiếu"
              value={type}
              onChange={(v) => {
                setType(v as ReceiptType);
                setReason(v === 'import' ? 'purchase' : 'production_issue');
              }}
              options={[
                { value: 'import', label: 'Nhập kho' },
                { value: 'export', label: 'Xuất kho' },
              ]}
            />
          </Field>
          <Field label="Lý do" id="nr-reason">
            <Select id="nr-reason" label="Lý do" value={reason} onChange={setReason} options={reasons(type)} />
          </Field>
          {type === 'import' && (
            <Field label="Nhà cung cấp" id="nr-sup">
              <Select
                id="nr-sup"
                label="Nhà cung cấp"
                value={supplier}
                onChange={setSupplier}
                options={[{ value: '', label: 'Không chọn' }, ...(suppliers.data?.items ?? []).map((s) => ({ value: String(s.id), label: s.name }))]}
              />
            </Field>
          )}
          <Field label="Ghi chú" id="nr-note">
            <input id="nr-note" value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Vật tư ({lines.length})</legend>
          <ul className="flex flex-col gap-3">
            {lines.map((l, i) => {
              const it = list.find((x) => String(x.id) === l.itemId);
              return (
                <li key={i} className="rounded-rm-xl border border-rm-edge bg-rm-surface p-3">
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <Select
                        id={`nr-item-${i}`}
                        label="Vật tư"
                        value={l.itemId}
                        onChange={(v) => patch(i, { itemId: v })}
                        options={list.map((x) => ({ value: String(x.id), label: `${x.itemCode} · ${x.itemName}` }))}
                      />
                    </div>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        aria-label="Bỏ dòng vật tư"
                        onClick={() => setLines(lines.filter((_, k) => k !== i))}
                        className="flex size-rm-tap flex-none items-center justify-center rounded-rm text-rm-danger active:bg-rm-danger-soft"
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                    <input
                      aria-label={`Số lượng${it ? ` (${labelOf(UNITS, it.unit)})` : ''}`}
                      placeholder={`Số lượng${it ? ` (${labelOf(UNITS, it.unit).toLowerCase()})` : ''}`}
                      inputMode="decimal"
                      value={l.qty}
                      onChange={(e) => patch(i, { qty: e.target.value.replace(/[^\d.]/g, '') })}
                      className={INPUT}
                    />
                    <input
                      aria-label="Đơn giá"
                      placeholder="Đơn giá (đ)"
                      inputMode="numeric"
                      value={l.price}
                      onChange={(e) => patch(i, { price: e.target.value.replace(/\D/g, '') })}
                      className={INPUT}
                    />
                  </div>
                  {it && type === 'export' && <p className="mt-1 text-xs text-rm-muted">Tồn hiện có: {it.currentStock}</p>}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setLines([...lines, { itemId: '', qty: '', price: '' }])}
            className={`${BTN_LINE} mt-3 w-full md:w-auto md:px-6`}
          >
            Thêm dòng
          </button>
        </fieldset>

        {can('warehouse_receipt:approve') && (
          <label className="flex min-h-rm-tap items-center gap-3 text-sm">
            <input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} className="size-5 accent-[var(--rm-primary)]" />
            Duyệt luôn (cập nhật tồn kho ngay)
          </label>
        )}
        <button type="submit" disabled={save.isPending || !valid} className={`${BTN_PRIMARY} md:w-auto md:self-start md:px-8`}>
          {save.isPending ? 'Đang tạo…' : 'Tạo phiếu'}
        </button>
      </form>
    </>
  );
}
