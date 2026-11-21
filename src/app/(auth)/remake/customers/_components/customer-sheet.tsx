'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createCustomer, deleteCustomer, getCustomerProviders, updateCustomer } from '@/actions';
import { CUSTOMER_TYPE_OPTIONS } from '@/config';
import { useCan } from '@/hooks';
import type { Customer } from '@/types';
import { BTN_DANGER, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

interface Props {
  target: Customer | 'new' | null;
  onClose: () => void;
}

// Thêm / sửa / xoá khách hàng. Chỉ gửi các ô có giá trị (API từ chối chuỗi rỗng ở email, số điện thoại).
export function CustomerSheet({ target, onClose }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const c = target && target !== 'new' ? target : null;
  const [f, setF] = useState({
    name: c?.name ?? '',
    phone: c?.phone ?? '',
    email: c?.email ?? '',
    address: c?.address ?? '',
    identifyCode: c?.identifyCode ?? '',
    type: c?.type ?? 'potential',
    providerId: c?.providerId ? String(c.providerId) : '',
  });
  const editable = c ? can('customer:update') : can('customer:create');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const providers = useQuery({ queryKey: ['customer-providers', 'all'], queryFn: () => getCustomerProviders({ limit: 100 }), enabled: !!target });
  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['customers'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));

  const save = useMutation({
    mutationFn: () => {
      const { providerId, ...rest } = f;
      const body = { ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v.trim())), providerId: providerId ? Number(providerId) : null };
      // API nhận multipart: trường `customer` chứa JSON
      const form = new FormData();
      form.append('customer', JSON.stringify(body));
      return c ? updateCustomer(c.id, form) : createCustomer(form);
    },
    onSuccess: () => done(c ? 'Đã lưu khách hàng' : 'Đã thêm khách hàng'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteCustomer(c!.id), onSuccess: () => done('Đã xoá khách hàng'), onError: fail });

  return (
    <Sheet open={!!target} onClose={onClose} title={c ? 'Khách hàng' : 'Thêm khách hàng'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tên khách hàng" id="cu-name">
          <input id="cu-name" value={f.name} onChange={set('name')} maxLength={255} required disabled={!editable} className={INPUT} />
        </Field>
        <Field label="Số điện thoại" id="cu-phone">
          <input
            id="cu-phone"
            type="tel"
            inputMode="tel"
            value={f.phone}
            onChange={set('phone')}
            maxLength={20}
            disabled={!editable}
            className={INPUT}
          />
        </Field>
        <Field label="Email" id="cu-email">
          <input id="cu-email" type="email" value={f.email} onChange={set('email')} maxLength={100} disabled={!editable} className={INPUT} />
        </Field>
        <Field label="Địa chỉ" id="cu-address">
          <input id="cu-address" value={f.address} onChange={set('address')} maxLength={255} disabled={!editable} className={INPUT} />
        </Field>
        <Field label="Mã định danh / MST" id="cu-code">
          <input id="cu-code" value={f.identifyCode} onChange={set('identifyCode')} maxLength={50} disabled={!editable} className={INPUT} />
        </Field>
        <Field label="Phân loại" id="cu-type">
          <Select
            id="cu-type"
            label="Phân loại"
            value={f.type}
            onChange={(v) => setF({ ...f, type: v })}
            options={CUSTOMER_TYPE_OPTIONS}
            disabled={!editable}
          />
        </Field>
        <Field label="Nhà cung cấp" id="cu-provider">
          <Select
            id="cu-provider"
            label="Nhà cung cấp"
            value={f.providerId}
            onChange={(v) => setF({ ...f, providerId: v })}
            options={[{ value: '', label: 'Không có' }, ...(providers.data?.items.map((p) => ({ value: String(p.id), label: p.name })) ?? [])]}
            disabled={!editable}
          />
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || !f.name.trim()} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {c && can('customer:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá khách hàng "${c.name}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá khách hàng
          </button>
        </div>
      )}
    </Sheet>
  );
}
