'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Drawer } from './drawer';
import { SideDrawer } from './side-drawer';
import { DrawerBody, DrawerHeader } from './drawer-parts';
import { isTopLayer, popLayer, pushLayer } from './layers';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Thêm dòng đầu để bỏ chọn (giá trị rỗng) */
  clearLabel?: string;
  /** Từ 768px chọn trong drawer con thay vì menu thả xuống (chỉ dùng bên trong một Drawer); điện thoại luôn là ngăn kéo từ đáy */
  side?: boolean;
}

const MENU_MAX = 240;

function OptionList({ options, value, onPick }: { options: SelectOption[]; value: string; onPick: (v: string) => void }) {
  return (
    <ul role="listbox">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <li key={o.value} role="option" aria-selected={on}>
            <button
              type="button"
              onClick={() => onPick(o.value)}
              className={cn(
                'flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-left text-sm active:bg-slate-100 md:min-h-10 md:hover:bg-slate-50',
                on ? 'font-medium text-primary' : 'text-slate-700',
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">{o.label}</span>
                {o.hint && <span className="block truncate text-xs font-normal text-slate-500">{o.hint}</span>}
              </span>
              {on && <Check size={16} className="flex-none" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Ô chọn: từ 768px mở menu thả xuống ngay dưới ô; điện thoại mở ngăn kéo từ đáy.
export function Select({ label, value, options, onChange, placeholder = 'Chọn...', loading, disabled, clearLabel, side }: SelectProps) {
  const [open, setOpen] = useState<'menu' | 'sheet' | 'side' | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, up: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const all = clearLabel ? [{ value: '', label: clearLabel }, ...options] : options;
  const current = options.find((o) => o.value === value);

  const show = () => {
    const el = triggerRef.current;
    if (!el) return;
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    if (!desktop) return setOpen('sheet');
    if (side) return setOpen('side');
    const r = el.getBoundingClientRect();
    const up = window.innerHeight - r.bottom < MENU_MAX && r.top > MENU_MAX;
    setPos({ top: up ? r.top - 4 : r.bottom + 4, left: r.left, width: r.width, up });
    setOpen('menu');
  };

  const pick = (v: string) => {
    setOpen(null);
    if (v !== value) onChange(v);
  };

  useEffect(() => {
    if (open !== 'menu') return;
    const layer = pushLayer();
    const close = () => setOpen(null);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) close();
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

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open !== null}
        onClick={show}
        className={cn(
          'flex h-11 w-full cursor-pointer items-center gap-2 rounded-control border px-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60 md:h-10',
          open ? 'border-primary bg-white ring-2 ring-primary/20' : 'border-transparent bg-slate-100 md:hover:bg-slate-200/70',
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', current ? 'text-slate-900' : 'text-slate-400')}>
          {loading ? 'Đang tải...' : (current?.label ?? placeholder)}
        </span>
        {side ? (
          <ChevronRight size={16} className="flex-none text-slate-400" />
        ) : (
          <ChevronDown size={16} className={cn('flex-none text-slate-400 transition-transform', open === 'menu' && 'rotate-180')} />
        )}
      </button>

      {open === 'menu' &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left, width: pos.width, transform: pos.up ? 'translateY(-100%)' : undefined }}
            className="fixed z-[60] max-h-60 overflow-y-auto rounded-control border border-slate-200 bg-white py-1 shadow-lg"
          >
            {all.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">Không có lựa chọn nào</p>
            ) : (
              <OptionList options={all} value={value} onPick={pick} />
            )}
          </div>,
          document.body,
        )}

      <SideDrawer isOpen={open === 'side'} onClose={() => setOpen(null)} label={label}>
        <DrawerHeader compact title={label} onClose={() => setOpen(null)} />
        <DrawerBody>
          <OptionList options={all} value={value} onPick={pick} />
        </DrawerBody>
      </SideDrawer>

      <Drawer sheet isOpen={open === 'sheet'} onClose={() => setOpen(null)} label={label}>
        <DrawerHeader compact title={label} onClose={() => setOpen(null)} />
        <DrawerBody>
          {all.length === 0 ? (
            <p className="text-sm text-slate-500">Không có lựa chọn nào</p>
          ) : (
            <OptionList options={all} value={value} onPick={pick} />
          )}
        </DrawerBody>
      </Drawer>
    </div>
  );
}
