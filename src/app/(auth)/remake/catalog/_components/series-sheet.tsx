'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createDoorSeries, deleteDoorSeries, getBrands, updateDoorSeries } from '@/actions';
import { useCan } from '@/hooks';
import type { DoorSeries } from '@/types';
import { BTN_DANGER, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { ACTIVE } from './brand-sheet';

// Thêm / sửa / xoá hệ nhôm (7 ô).
export function SeriesSheet({ target, onClose }: { target: DoorSeries | 'new' | null; onClose: () => void }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const s = target && target !== 'new' ? target : null;
  const [brandId, setBrandId] = useState(s ? String(s.brandId) : '');
  const [code, setCode] = useState(s?.code ?? '');
  const [name, setName] = useState(s?.name ?? '');
  const [origin, setOrigin] = useState(s?.origin ?? '');
  const [thick, setThick] = useState(s?.aluminumThickness != null ? String(s.aluminumThickness) : '');
  const [description, setDescription] = useState(s?.description ?? '');
  const [active, setActive] = useState(s?.isActive === false ? '0' : '1');
  const editable = s ? can('catalog:update') : can('catalog:create');
  const { data: brands } = useQuery({ queryKey: ['brands', 'all'], queryFn: () => getBrands({ limit: 200 }), enabled: !!target });

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['door-series'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = {
        brandId: Number(brandId),
        code: code.trim(),
        name: name.trim(),
        origin: origin.trim() || undefined,
        aluminumThickness: thick ? Number(thick) : null,
        description: description.trim() || null,
        isActive: active === '1',
      };
      return s ? updateDoorSeries(s.id, body) : createDoorSeries(body);
    },
    onSuccess: () => done(s ? 'Đã lưu hệ nhôm' : 'Đã thêm hệ nhôm'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteDoorSeries(s!.id), onSuccess: () => done('Đã xoá hệ nhôm'), onError: fail });
  const input = (id: string, v: string, set: (x: string) => void, mode?: 'decimal') => (
    <input id={id} value={v} onChange={(e) => set(e.target.value)} disabled={!editable} inputMode={mode} className={INPUT} />
  );

  return (
    <Sheet open={!!target} onClose={onClose} title={s ? s.name : 'Thêm hệ nhôm'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Hãng" id="se-brand">
          <Select
            id="se-brand"
            label="Hãng"
            value={brandId}
            onChange={setBrandId}
            options={(brands?.items ?? []).map((b) => ({ value: String(b.id), label: b.name }))}
            disabled={!editable}
          />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Mã hệ" id="se-code">
            {input('se-code', code, setCode)}
          </Field>
          <Field label="Xuất xứ" id="se-origin">
            {input('se-origin', origin, setOrigin)}
          </Field>
        </div>
        <Field label="Tên hệ nhôm" id="se-name">
          {input('se-name', name, setName)}
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Độ dày (mm)" id="se-thick">
            {input('se-thick', thick, setThick, 'decimal')}
          </Field>
          <Field label="Trạng thái" id="se-active">
            <Select id="se-active" label="Trạng thái" value={active} onChange={setActive} options={ACTIVE} disabled={!editable} />
          </Field>
        </div>
        <Field label="Mô tả" id="se-desc">
          {input('se-desc', description, setDescription)}
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || !brandId || !code.trim() || !name.trim()} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {s && can('catalog:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá hệ nhôm "${s.name}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá hệ nhôm
          </button>
        </div>
      )}
    </Sheet>
  );
}
