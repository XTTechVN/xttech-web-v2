'use client';

import { useState } from 'react';
import { BTN_PRIMARY, Field, INPUT } from '../../_components/form';
import { Sheet } from '../../_components/sheet';

// Hộp nhập lý do (huỷ hợp đồng, đảo bút toán).
export function ReasonSheet({
  open,
  title,
  intro,
  label,
  required,
  confirm,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  intro?: string;
  label: string;
  required?: boolean;
  confirm: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [t, setT] = useState('');
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(t.trim());
        }}
      >
        {intro && <p className="text-sm text-rm-muted">{intro}</p>}
        <Field label={label} id="rs-text">
          <input id="rs-text" value={t} onChange={(e) => setT(e.target.value)} className={INPUT} />
        </Field>
        <button type="submit" disabled={busy || (required && t.trim().length < 3)} className={BTN_PRIMARY}>
          {busy ? 'Đang lưu…' : confirm}
        </button>
      </form>
    </Sheet>
  );
}
