'use client';

import { useState } from 'react';
import { DOCUMENT_STATUS_MAP, DOCUMENT_TYPE_MAP, RULE_FILTER_TYPES } from '@/types';
import { BTN_LINE, BTN_PRIMARY, Field } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

export interface Filters {
  type: string;
  status: string;
  unread: boolean;
  expiring: boolean;
}
export const EMPTY_FILTERS: Filters = { type: '', status: '', unread: false, expiring: false };

const TYPES = [{ value: '', label: 'Tất cả loại' }, ...RULE_FILTER_TYPES.map((k) => ({ value: k, label: DOCUMENT_TYPE_MAP[k].label }))];
const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(['published', 'superseded', 'expired'] as const).map((k) => ({ value: k, label: DOCUMENT_STATUS_MAP[k].label })),
];

interface Props {
  open: boolean;
  onClose: () => void;
  value: Filters;
  onApply: (f: Filters) => void;
}

// Bộ lọc văn bản hiện hành: loại, trạng thái, chưa đọc, sắp hết hiệu lực.
export function FilterSheet({ open, onClose, value, onApply }: Props) {
  const [f, setF] = useState(value);
  const [seen, setSeen] = useState(open);
  if (open !== seen) {
    setSeen(open);
    if (open) setF(value);
  }
  const apply = (next: Filters) => {
    onApply(next);
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Lọc văn bản">
      <div className="flex flex-col gap-4 p-rm-gutter">
        <Field label="Loại văn bản" id="rf-type">
          <Select id="rf-type" label="Loại văn bản" value={f.type} onChange={(type) => setF({ ...f, type })} options={TYPES} />
        </Field>
        <Field label="Trạng thái" id="rf-status">
          <Select id="rf-status" label="Trạng thái" value={f.status} onChange={(status) => setF({ ...f, status })} options={STATUSES} />
        </Field>
        {(
          [
            ['unread', 'Chỉ văn bản chưa đọc'],
            ['expiring', 'Chỉ văn bản sắp hết hiệu lực'],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex min-h-rm-tap cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.checked })}
              className="size-5 flex-none accent-rm-primary"
            />
            {label}
          </label>
        ))}
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
          <button type="button" onClick={() => apply(EMPTY_FILTERS)} className={BTN_LINE}>
            Bỏ lọc
          </button>
          <button type="button" onClick={() => apply(f)} className={BTN_PRIMARY}>
            Áp dụng
          </button>
        </div>
      </div>
    </Sheet>
  );
}
