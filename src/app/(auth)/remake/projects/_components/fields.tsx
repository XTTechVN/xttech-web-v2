'use client';

import { INPUT } from '../../_components/form';
import { cn } from '@/utils/cn';

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Ô nhập tiền: chỉ nhận chữ số, hiển thị dấu chấm ngăn cách hàng nghìn.
export function MoneyInput({
  id,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  id: string;
  value?: number | null;
  onChange: (v: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      value={value ? group(String(Math.round(value))) : ''}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, '');
        onChange(d ? Number(d) : undefined);
      }}
      className={cn(INPUT, 'text-right')}
    />
  );
}

// Ô nhập số thập phân (phần trăm…): giữ chuỗi người dùng gõ, chỉ báo số hợp lệ.
export function PercentInput({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value?: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      inputMode="decimal"
      disabled={disabled}
      value={value ?? ''}
      onChange={(e) => {
        const n = Number(e.target.value.replace(',', '.'));
        if (Number.isFinite(n) && n >= 0 && n <= 1000) onChange(n);
      }}
      className={cn(INPUT, 'text-right')}
    />
  );
}

// Khối có tiêu đề cho các nhóm trường trong form dài.
export function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter">
      <h3 className="text-sm font-semibold">{title}</h3>
      {hint && <p className="mb-3 text-xs text-rm-muted">{hint}</p>}
      <div className={cn('flex flex-col gap-3', !hint && 'mt-3')}>{children}</div>
    </section>
  );
}
