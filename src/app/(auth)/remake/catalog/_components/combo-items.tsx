'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAccessories, updateAccessoryCombo } from '@/actions';
import { useCan } from '@/hooks';
import type { AccessoryCombo, AccessoryComboItem } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { BTN_LINE, BTN_PRIMARY, INPUT, messageOf } from '../../_components/form';
import { Sheet } from '../../_components/sheet';

// Sửa danh sách phụ kiện trong combo: đổi số lượng, bỏ món, tìm và thêm phụ kiện (cần quyền cập nhật danh mục).
export function ComboItems({ combo, onDone }: { combo: AccessoryCombo; onDone?: () => void }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  if (!can('catalog:update')) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${BTN_LINE} w-full`}>
        Sửa phụ kiện trong combo
      </button>
      {open && (
        <ItemsSheet
          combo={combo}
          onClose={() => setOpen(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['accessory-combos'] });
            setOpen(false);
            onDone?.();
          }}
        />
      )}
    </>
  );
}

function ItemsSheet({ combo, onClose, onSaved }: { combo: AccessoryCombo; onClose: () => void; onSaved: () => void }) {
  const [items, setItems] = useState<AccessoryComboItem[]>(combo.comboItems ?? []);
  const [q, setQ] = useState('');
  const needle = q.trim();
  const found = useQuery({
    queryKey: ['accessories', 'combo-search', needle],
    queryFn: () => getAccessories({ search: needle, limit: 15 }),
    enabled: needle.length >= 2,
  });
  const total = items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
  const save = useMutation({
    mutationFn: () => updateAccessoryCombo(combo.id, { comboItems: items, totalComboPrice: total }),
    onSuccess: () => {
      toast.success('Đã lưu phụ kiện trong combo');
      onSaved();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const setQty = (id: number, v: string) =>
    setItems((l) => l.map((i) => (i.accessoryId === id ? { ...i, quantity: Math.max(0, Number(v) || 0) } : i)));
  const add = (a: { id: number; name: string; code?: string | null; unit?: string | null; costPrice: number; brandId?: number | null }) => {
    setQ('');
    setItems((l) =>
      l.some((i) => i.accessoryId === a.id)
        ? l
        : [
            ...l,
            {
              accessoryId: a.id,
              quantity: 1,
              accessoryName: a.name,
              accessoryCode: a.code ?? undefined,
              unit: a.unit ?? undefined,
              unitPrice: a.costPrice,
              brandId: a.brandId ?? undefined,
            },
          ],
    );
  };

  return (
    <Sheet open onClose={onClose} title={`Phụ kiện · ${combo.name}`}>
      <div className="flex flex-col gap-4 p-rm-gutter">
        <div>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Tìm phụ kiện để thêm"
              placeholder="Gõ tên hoặc mã phụ kiện để thêm"
              className={`${INPUT} pl-9`}
            />
          </div>
          {needle.length >= 2 && (
            <ul className="mt-1 max-h-60 divide-y divide-rm-line overflow-y-auto rounded-rm border border-rm-line bg-rm-surface text-sm">
              {found.isLoading && <li className="px-3 py-2 text-rm-muted">Đang tìm…</li>}
              {found.data?.items.length === 0 && <li className="px-3 py-2 text-rm-muted">Không thấy phụ kiện</li>}
              {found.data?.items.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => add(a)}
                    className="flex min-h-rm-tap w-full flex-col justify-center px-3 py-1 text-left active:bg-rm-bg"
                  >
                    <span className="truncate font-medium">{a.name}</span>
                    <span className="truncate text-xs text-rm-muted">
                      {a.code ?? '–'} · {formatCurrency(a.costPrice)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-rm-muted">Chưa có phụ kiện trong combo.</p>
        ) : (
          <ul className="divide-y divide-rm-line rounded-rm border border-rm-line">
            {items.map((i) => (
              <li key={i.accessoryId} className="flex items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{i.accessoryName ?? `#${i.accessoryId}`}</span>
                  <span className="block truncate text-xs text-rm-muted">{formatCurrency(i.unitPrice ?? 0)}</span>
                </span>
                <input
                  aria-label={`Số lượng ${i.accessoryName ?? i.accessoryId}`}
                  inputMode="decimal"
                  value={i.quantity}
                  onChange={(e) => setQty(i.accessoryId, e.target.value)}
                  className={`${INPUT} w-20 flex-none text-center`}
                />
                <button
                  type="button"
                  aria-label={`Bỏ ${i.accessoryName ?? i.accessoryId}`}
                  onClick={() => setItems((l) => l.filter((x) => x.accessoryId !== i.accessoryId))}
                  className="flex size-11 flex-none items-center justify-center text-rm-danger active:bg-rm-bg md:size-9"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-rm-muted">Tổng giá combo: {formatCurrency(total)}</p>
        <button type="button" disabled={save.isPending || items.some((i) => i.quantity <= 0)} onClick={() => save.mutate()} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>
    </Sheet>
  );
}
