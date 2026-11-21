'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createBrand, deleteBrand, getAccessories, getDoorSeriesList, updateBrand } from '@/actions';
import { useCan } from '@/hooks';
import type { Brand } from '@/types';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { BrandColors } from './brand-colors';

export const BRAND_TYPES = [
  { value: 'aluminum', label: 'Nhôm' },
  { value: 'accessory', label: 'Phụ kiện' },
  { value: 'both', label: 'Nhôm và phụ kiện' },
];
export const ACTIVE = [
  { value: '1', label: 'Đang dùng' },
  { value: '0', label: 'Ngừng' },
];

// Thêm / sửa / xoá hãng cung cấp (7 ô).
export function BrandSheet({ target, onClose }: { target: Brand | 'new' | null; onClose: () => void }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const b = target && target !== 'new' ? target : null;
  const [code, setCode] = useState(b?.code ?? '');
  const [name, setName] = useState(b?.name ?? '');
  const [type, setType] = useState(b?.brandType ?? 'aluminum');
  const [country, setCountry] = useState(b?.originCountry ?? '');
  const [website, setWebsite] = useState(b?.website ?? '');
  const [order, setOrder] = useState(String(b?.sortOrder ?? 0));
  const [active, setActive] = useState(b?.isActive === false ? '0' : '1');
  const [colors, setColors] = useState(false);
  const kind = b?.brandType;
  const series = useQuery({
    queryKey: ['door-series', 'of-brand', b?.id],
    queryFn: () => getDoorSeriesList({ brandId: b!.id, limit: 200 }),
    enabled: !!b && kind !== 'accessory',
  });
  const accessories = useQuery({
    queryKey: ['accessories', 'of-brand', b?.id],
    queryFn: () => getAccessories({ brandId: b!.id, limit: 1 }),
    enabled: !!b && kind !== 'aluminum',
  });
  const editable = b ? can('catalog:update') : can('catalog:create');

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['brands'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = {
        code: code.trim(),
        name: name.trim(),
        brandType: type,
        originCountry: country.trim() || null,
        website: website.trim() || null,
        sortOrder: Number(order) || 0,
        isActive: active === '1',
      };
      return b ? updateBrand(b.id, body) : createBrand(body);
    },
    onSuccess: () => done(b ? 'Đã lưu hãng' : 'Đã thêm hãng'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteBrand(b!.id), onSuccess: () => done('Đã xoá hãng'), onError: fail });
  const input = (id: string, v: string, set: (s: string) => void, mode?: 'numeric' | 'url') => (
    <input id={id} value={v} onChange={(e) => set(e.target.value)} disabled={!editable} inputMode={mode} className={INPUT} />
  );

  return (
    <Sheet open={!!target} onClose={onClose} title={b ? b.name : 'Thêm hãng'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Mã hãng" id="br-code">
          {input('br-code', code, setCode)}
        </Field>
        <Field label="Tên hãng" id="br-name">
          {input('br-name', name, setName)}
        </Field>
        <Field label="Loại hãng" id="br-type">
          <Select id="br-type" label="Loại hãng" value={type} onChange={setType} options={BRAND_TYPES} disabled={!editable} />
        </Field>
        <Field label="Xuất xứ" id="br-country">
          {input('br-country', country, setCountry)}
        </Field>
        <Field label="Website" id="br-web">
          {input('br-web', website, setWebsite, 'url')}
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Thứ tự" id="br-order">
            {input('br-order', order, setOrder, 'numeric')}
          </Field>
          <Field label="Trạng thái" id="br-active">
            <Select id="br-active" label="Trạng thái" value={active} onChange={setActive} options={ACTIVE} disabled={!editable} />
          </Field>
        </div>
        {editable && (
          <button type="submit" disabled={save.isPending || !code.trim() || !name.trim()} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {b && (
        <dl className="mx-rm-gutter mb-4 space-y-2 border-t border-rm-line pt-3 text-sm">
          {kind !== 'accessory' && (
            <div>
              <dt className="text-xs text-rm-muted">Hệ nhôm của hãng ({series.data?.items.length ?? '…'})</dt>
              <dd>{series.data?.items.length ? series.data.items.map((x) => x.name).join(', ') : 'Chưa có'}</dd>
            </div>
          )}
          {kind !== 'aluminum' && (
            <div>
              <dt className="text-xs text-rm-muted">Phụ kiện của hãng</dt>
              <dd>{accessories.data ? `${accessories.data.meta.total} phụ kiện` : '…'}</dd>
            </div>
          )}
        </dl>
      )}
      {b && b.brandType !== 'accessory' && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button type="button" onClick={() => setColors(true)} className={`${BTN_LINE} w-full`}>
            Hệ màu và giá sơn
          </button>
        </div>
      )}
      {b && <BrandColors brand={colors ? b : null} onClose={() => setColors(false)} />}

      {b && can('catalog:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá hãng "${b.name}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá hãng
          </button>
        </div>
      )}
    </Sheet>
  );
}
