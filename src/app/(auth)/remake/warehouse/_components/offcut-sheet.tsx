'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createWarehouseOffcut, getBrandColors, getProfileBars } from '@/actions';
import { BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

// Thêm một đoạn nhôm thừa vào kho (thanh, màu, chiều dài, vị trí).
export function OffcutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ bar: '', color: '', len: '', loc: '', note: '' });
  const bars = useQuery({ queryKey: ['profile-bars', 'all'], queryFn: () => getProfileBars({ limit: 200 }), enabled: open });
  const colors = useQuery({ queryKey: ['brand-colors', 'all'], queryFn: () => getBrandColors({ limit: 200 }), enabled: open });
  const save = useMutation({
    mutationFn: () =>
      createWarehouseOffcut({
        profileBarId: Number(f.bar),
        colorId: Number(f.color),
        lengthMm: Number(f.len),
        location: f.loc.trim() || undefined,
        note: f.note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã thêm nhôm thừa');
      qc.invalidateQueries({ queryKey: ['wh-offcuts'] });
      qc.invalidateQueries({ queryKey: ['wh-kpi'] });
      onClose();
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={open} onClose={onClose} title="Thêm nhôm thừa">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Thanh profile" id="oc-bar">
          <Select
            id="oc-bar"
            label="Thanh profile"
            value={f.bar}
            onChange={(v) => setF({ ...f, bar: v })}
            options={(bars.data?.items ?? []).map((b) => ({ value: String(b.id), label: `${b.code} · ${b.name}` }))}
          />
        </Field>
        <Field label="Màu" id="oc-color">
          <Select
            id="oc-color"
            label="Màu"
            value={f.color}
            onChange={(v) => setF({ ...f, color: v })}
            options={(colors.data?.items ?? []).map((c) => ({ value: String(c.id), label: `${c.code} · ${c.name}` }))}
          />
        </Field>
        <Field label="Chiều dài (mm)" id="oc-len">
          <input
            id="oc-len"
            inputMode="numeric"
            value={f.len}
            onChange={(e) => setF({ ...f, len: e.target.value.replace(/\D/g, '') })}
            className={INPUT}
          />
        </Field>
        <Field label="Vị trí kho" id="oc-loc">
          <input id="oc-loc" value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })} className={INPUT} />
        </Field>
        <Field label="Ghi chú" id="oc-note">
          <input id="oc-note" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className={INPUT} />
        </Field>
        <button type="submit" disabled={save.isPending || !f.bar || !f.color || !Number(f.len)} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : 'Thêm'}
        </button>
      </form>
    </Sheet>
  );
}
