'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createWarehouseItem, deleteWarehouseItem, updateWarehouseItem } from '@/actions';
import { useCan } from '@/hooks';
import type { WarehouseItem, WarehouseItemType } from '@/types';
import { BTN_DANGER, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { ITEM_TYPES, UNITS } from './labels';

interface Props {
  target: WarehouseItem | 'new' | null;
  onClose: () => void;
}

// Thêm / sửa / xoá vật tư (7 ô). Số lượng tồn chỉ đổi qua phiếu nhập / xuất.
export function ItemSheet({ target, onClose }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const it = target && target !== 'new' ? target : null;
  const [code, setCode] = useState(it?.itemCode ?? '');
  const [name, setName] = useState(it?.itemName ?? '');
  const [type, setType] = useState<string>(it?.itemType ?? 'accessory');
  const [unit, setUnit] = useState(it?.unit ?? 'pcs');
  const [min, setMin] = useState(String(it?.minStockLevel ?? 0));
  const [price, setPrice] = useState(String(it?.costPrice ?? 0));
  const [location, setLocation] = useState(it?.location ?? '');
  const editable = it ? can('warehouse_item:update') : can('warehouse_item:create');

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['wh-items'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = {
        itemCode: code.trim(),
        itemName: name.trim(),
        itemType: type as WarehouseItemType,
        unit,
        minStockLevel: Number(min) || 0,
        costPrice: Number(price) || 0,
        location: location.trim() || null,
      };
      return it ? updateWarehouseItem(it.id, body) : createWarehouseItem(body);
    },
    onSuccess: () => done(it ? 'Đã lưu vật tư' : 'Đã thêm vật tư'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteWarehouseItem(it!.id), onSuccess: () => done('Đã xoá vật tư'), onError: fail });
  const text = (id: string, v: string, set: (s: string) => void, extra = '') => (
    <input
      id={id}
      value={v}
      onChange={(e) => set(e.target.value)}
      disabled={!editable}
      className={INPUT}
      {...(extra ? { inputMode: 'decimal' as const } : {})}
    />
  );

  return (
    <Sheet open={!!target} onClose={onClose} title={it ? it.itemCode : 'Thêm vật tư'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Mã vật tư" id="wi-code">
          {text('wi-code', code, setCode)}
        </Field>
        <Field label="Tên vật tư" id="wi-name">
          {text('wi-name', name, setName)}
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Loại" id="wi-type">
            <Select id="wi-type" label="Loại" value={type} onChange={setType} options={ITEM_TYPES} disabled={!editable} />
          </Field>
          <Field label="Đơn vị" id="wi-unit">
            <Select id="wi-unit" label="Đơn vị" value={unit} onChange={setUnit} options={UNITS} disabled={!editable} />
          </Field>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Tồn tối thiểu" id="wi-min">
            {text('wi-min', min, setMin, 'n')}
          </Field>
          <Field label="Giá vốn (đ)" id="wi-price">
            {text('wi-price', price, setPrice, 'n')}
          </Field>
        </div>
        <Field label="Vị trí kho" id="wi-loc">
          {text('wi-loc', location, setLocation)}
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || !code.trim() || !name.trim()} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {it && can('warehouse_item:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá vật tư "${it.itemName}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá vật tư
          </button>
        </div>
      )}
    </Sheet>
  );
}
