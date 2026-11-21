'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createCustomerProvider, deleteCustomerProvider, updateCustomerProvider } from '@/actions';
import { useCan } from '@/hooks';
import type { CustomerProvider } from '@/types';
import { BTN_DANGER, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Sheet } from '../../_components/sheet';

interface Props {
  target: CustomerProvider | 'new' | null;
  onClose: () => void;
}

// Thêm / sửa / xoá nhà cung cấp (API bắt buộc cả tên và mã).
export function SupplierSheet({ target, onClose }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const p = target && target !== 'new' ? target : null;
  const [name, setName] = useState(p?.name ?? '');
  const [code, setCode] = useState(p?.code ?? '');
  const editable = p ? can('customer_provider:update') : can('customer_provider:create');

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['customer-providers'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), code: code.trim() };
      return p ? updateCustomerProvider(p.id, body) : createCustomerProvider(body);
    },
    onSuccess: () => done(p ? 'Đã lưu nhà cung cấp' : 'Đã thêm nhà cung cấp'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteCustomerProvider(p!.id), onSuccess: () => done('Đã xoá nhà cung cấp'), onError: fail });

  return (
    <Sheet open={!!target} onClose={onClose} title={p ? 'Nhà cung cấp' : 'Thêm nhà cung cấp'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tên nhà cung cấp" id="sp-name">
          <input
            id="sp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            required
            disabled={!editable}
            className={INPUT}
          />
        </Field>
        <Field label="Mã nhà cung cấp" id="sp-code">
          <input
            id="sp-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={100}
            required
            disabled={!editable}
            className={INPUT}
          />
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || !name.trim() || !code.trim()} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {p && can('customer_provider:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá nhà cung cấp "${p.name}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá nhà cung cấp
          </button>
        </div>
      )}
    </Sheet>
  );
}
