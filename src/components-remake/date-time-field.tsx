'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './button';
import { CalendarPanel, MonthPanel } from './calendar-panel';
import { datePart, formatValue, maskInput, parseInput, PLACEHOLDER, timePart, todayIso, type DateTimeMode } from './date-time-utils';
import { Drawer } from './drawer';
import { DrawerBody, DrawerFooter, DrawerHeader } from './drawer-parts';
import { isTopLayer, popLayer, pushLayer } from './layers';
import { TimePanel } from './time-panel';

interface Props {
  label: string;
  /** Ẩn nhãn nhìn thấy (vẫn đọc được bằng trình đọc màn hình) */
  hideLabel?: boolean;
  /** date: ngày · time: giờ phút · datetime: cả hai · month: tháng/năm */
  mode?: DateTimeMode;
  /** YYYY-MM-DD · HH:MM · YYYY-MM-DDTHH:MM · YYYY-MM; rỗng khi chưa chọn hoặc chưa gõ xong */
  value: string;
  onChange: (value: string) => void;
  /** Giới hạn ngày chọn được (YYYY-MM-DD) */
  min?: string;
  max?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

type Kind = 'date' | 'time';
const MENU_W: Record<Kind, number> = { date: 296, time: 224 };
const MENU_H: Record<Kind, number> = { date: 400, time: 300 };
const ICON_BTN =
  'flex h-full w-10 flex-none cursor-pointer items-center justify-center text-slate-500 active:text-primary disabled:cursor-not-allowed md:hover:text-primary';

// Ô ngày giờ: mặc định là ô gõ (tự chèn dấu / và :); bấm icon lịch hoặc đồng hồ mới mở lựa chọn.
// Từ 768px là menu thả xuống dưới ô; điện thoại là ngăn kéo từ đáy.
export function DateTimeField({ label, hideLabel, mode = 'date', value, onChange, min, max, error, disabled, className }: Props) {
  const id = useId();
  const [text, setText] = useState(() => formatValue(mode, value));
  const [prev, setPrev] = useState(value);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState<{ kind: Kind; sheet: boolean } | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, up: false });
  const fieldRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Giá trị đổi từ bên ngoài (chọn trong lịch, form reset) thì cập nhật chữ trong ô; đang gõ dở thì giữ nguyên
  if (value !== prev) {
    setPrev(value);
    if (!(focused && value === '') && parseInput(mode, text) !== value) setText(formatValue(mode, value));
  }

  const hasDate = mode !== 'time';
  const hasTime = mode === 'time' || mode === 'datetime';
  const inRange = (iso: string) => {
    const d = datePart(iso);
    return mode === 'time' || ((!min || d >= min) && (!max || d <= max));
  };
  const typed = parseInput(mode, text);
  const invalid = text.length === PLACEHOLDER[mode].length && (typed === null || !inRange(typed));

  const onType = (raw: string) => {
    const masked = maskInput(mode, raw);
    setText(masked);
    const iso = parseInput(mode, masked);
    onChange(iso && inRange(iso) ? iso : '');
  };

  const show = (kind: Kind) => {
    const el = fieldRef.current;
    if (!el || disabled) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return setOpen({ kind, sheet: true });
    const r = el.getBoundingClientRect();
    const up = window.innerHeight - r.bottom < MENU_H[kind] && r.top > MENU_H[kind];
    setPos({ top: up ? r.top - 4 : r.bottom + 4, left: Math.max(8, Math.min(r.left, window.innerWidth - MENU_W[kind] - 8)), up });
    setOpen({ kind, sheet: false });
  };

  useEffect(() => {
    if (!open || open.sheet) return;
    const layer = pushLayer();
    const close = () => setOpen(null);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !fieldRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && isTopLayer(layer) && close();
    const onScroll = (e: Event) => !menuRef.current?.contains(e.target as Node) && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      popLayer(layer);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const pickDate = (d: string) => {
    onChange(mode === 'datetime' ? `${d}T${timePart(value, mode) || '00:00'}` : d);
    setOpen(null);
  };
  const pickTime = (hhmm: string) => onChange(mode === 'datetime' ? `${datePart(value) || todayIso()}T${hhmm}` : hhmm);

  const panel = (kind: Kind) =>
    kind === 'time' ? (
      <TimePanel value={timePart(value, mode)} onChange={pickTime} />
    ) : mode === 'month' ? (
      <MonthPanel
        value={value}
        onPick={(ym) => {
          onChange(ym);
          setOpen(null);
        }}
      />
    ) : (
      <CalendarPanel value={datePart(value)} min={min} max={max} onPick={pickDate} />
    );

  const title = open?.kind === 'time' ? `Chọn giờ – ${label}` : `${mode === 'month' ? 'Chọn tháng' : 'Chọn ngày'} – ${label}`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-xs font-medium text-slate-500'}>
        {label}
      </label>
      <div
        ref={fieldRef}
        className={cn(
          'flex h-11 min-w-0 items-center rounded-control border transition md:h-10',
          invalid || error
            ? 'border-red-500 bg-white focus-within:ring-2 focus-within:ring-red-500/20'
            : 'border-transparent bg-slate-100 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20',
          disabled && 'opacity-60',
        )}
      >
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={text}
          placeholder={PLACEHOLDER[mode]}
          aria-invalid={invalid || !!error}
          onChange={(e) => onType(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (text && text.length !== PLACEHOLDER[mode].length) setText(formatValue(mode, value));
          }}
          className="h-full min-w-0 flex-1 bg-transparent pl-3 text-base tabular-nums text-slate-900 outline-none placeholder:text-slate-400 md:text-sm"
        />
        {hasDate && (
          <button
            type="button"
            disabled={disabled}
            aria-label={mode === 'month' ? 'Chọn tháng' : 'Chọn ngày'}
            aria-haspopup="dialog"
            onClick={() => show('date')}
            className={ICON_BTN}
          >
            <CalendarDays size={16} />
          </button>
        )}
        {hasTime && (
          <button type="button" disabled={disabled} aria-label="Chọn giờ" aria-haspopup="dialog" onClick={() => show('time')} className={ICON_BTN}>
            <Clock size={16} />
          </button>
        )}
      </div>
      {(invalid || error) && (
        <p role="alert" className="text-xs text-red-600">
          {error ?? (typed && !inRange(typed) ? 'Ngày nằm ngoài khoảng cho phép' : 'Giá trị không hợp lệ')}
        </p>
      )}

      {open &&
        !open.sheet &&
        createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label={title}
            style={{ top: pos.top, left: pos.left, width: MENU_W[open.kind], transform: pos.up ? 'translateY(-100%)' : undefined }}
            className="fixed z-[60] rounded-control border border-slate-200 bg-white p-3 text-slate-900 shadow-lg"
          >
            {panel(open.kind)}
          </div>,
          document.body,
        )}

      <Drawer sheet isOpen={!!open?.sheet} onClose={() => setOpen(null)} label={title}>
        <DrawerHeader compact title={title} onClose={() => setOpen(null)} />
        <DrawerBody>
          <div className="pt-3 text-slate-900">{open && panel(open.kind)}</div>
        </DrawerBody>
        <DrawerFooter>
          <Button className="w-full" onClick={() => setOpen(null)}>
            Xong
          </Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}
