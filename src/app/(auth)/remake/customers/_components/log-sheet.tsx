'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createCustomerLog, deleteCustomerLog, updateCustomerLog } from '@/actions';
import { CUSTOMER_LOG_CHANNEL_OPTIONS, CUSTOMER_LOG_STATUS_OPTIONS, CUSTOMER_LOG_TYPE_OPTIONS } from '@/config';
import type { CustomerLog } from '@/types';
import { BTN_DANGER, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

// Thêm / sửa / xoá một lượt tương tác với khách hàng (5 ô nên dùng sheet).
export function LogSheet({ customerId, target, onClose }: { customerId: number; target: CustomerLog | 'new' | null; onClose: () => void }) {
  const qc = useQueryClient();
  const log = target && target !== 'new' ? target : null;
  const [f, setF] = useState({
    channel: log?.channel ?? 'call',
    type: log?.type ?? 'pending',
    status: log?.status ?? 'pending',
    note: log?.note ?? '',
    next: log?.nextFollowDate?.slice(0, 10) ?? '',
  });
  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['customer-logs', customerId] });
    onClose();
  };
  const save = useMutation({
    mutationFn: async () => {
      const data = {
        index: log?.index ?? 0,
        channel: f.channel,
        type: f.type,
        status: f.status,
        note: f.note.trim(),
        nextFollowDate: f.next || null,
      };
      await (log ? updateCustomerLog({ customerId, logId: log.id, data }) : createCustomerLog({ customerId, data }));
    },
    onSuccess: () => done('Đã lưu lượt tương tác'),
    onError: (e) => toast.error(messageOf(e)),
  });
  const remove = useMutation({
    mutationFn: () => deleteCustomerLog({ customerId, logId: log!.id }),
    onSuccess: () => done('Đã xoá lượt tương tác'),
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={!!target} onClose={onClose} title={log ? 'Sửa tương tác' : 'Thêm tương tác'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Kênh" id="lg-channel">
          <Select
            id="lg-channel"
            label="Kênh"
            value={f.channel}
            onChange={(v) => setF({ ...f, channel: v })}
            options={CUSTOMER_LOG_CHANNEL_OPTIONS}
          />
        </Field>
        <Field label="Mức quan tâm" id="lg-type">
          <Select id="lg-type" label="Mức quan tâm" value={f.type} onChange={(v) => setF({ ...f, type: v })} options={CUSTOMER_LOG_TYPE_OPTIONS} />
        </Field>
        <Field label="Kết quả" id="lg-status">
          <Select id="lg-status" label="Kết quả" value={f.status} onChange={(v) => setF({ ...f, status: v })} options={CUSTOMER_LOG_STATUS_OPTIONS} />
        </Field>
        <Field label="Ngày hẹn tiếp" id="lg-next">
          <input id="lg-next" type="date" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} className={INPUT} />
        </Field>
        <Field label="Ghi chú" id="lg-note">
          <textarea
            id="lg-note"
            rows={4}
            value={f.note}
            onChange={(e) => setF({ ...f, note: e.target.value })}
            className="w-full rounded-rm border border-rm-line bg-rm-surface p-3 text-base outline-none focus-visible:border-rm-primary md:text-sm"
          />
        </Field>
        <button type="submit" disabled={save.isPending} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
        {log && (
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm('Xoá lượt tương tác này?') && remove.mutate()}
            className={BTN_DANGER}
          >
            Xoá
          </button>
        )}
      </form>
    </Sheet>
  );
}
