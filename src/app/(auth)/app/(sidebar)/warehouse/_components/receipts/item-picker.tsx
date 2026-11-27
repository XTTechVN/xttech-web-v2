'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { DrawerBody, DrawerHeader, SearchField, SideDrawer, Tag } from '@/components-remake';
import type { WarehouseItem } from '@/types';
import { cn } from '@/utils/cn';
import { includesSearchText } from '@/utils';
import { toDisplayUnit } from '../../_utils/unit-mapping';
import { num } from '../format';

interface Props {
  label: string;
  items: WarehouseItem[];
  selectedId?: number;
  /** Nội dung hiện trên nút khi chưa chọn từ kho (dòng nhập tay) */
  fallback?: string;
  onPick: (item: WarehouseItem) => void;
}

// Nút chọn vật tư trong kho: bấm mở drawer con có ô tìm kiếm theo mã hoặc tên
export function ItemPicker({ label, items, selectedId, fallback, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const current = items.find((i) => i.id === selectedId);
  const shown = useMemo(() => {
    const kw = search.trim();
    return kw ? items.filter((i) => includesSearchText(i.itemName, kw) || includesSearchText(i.itemCode, kw)) : items;
  }, [items, search]);

  const close = () => {
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-control border border-slate-200 bg-white px-3 text-left text-sm active:bg-slate-50 md:hover:bg-slate-50"
      >
        <span className={cn('min-w-0 flex-1 truncate', current || fallback ? 'text-slate-900' : 'text-slate-500')}>
          {current ? `${current.itemCode} · ${current.itemName}` : fallback || 'Chọn vật tư trong kho'}
        </span>
        <ChevronRight size={16} className="flex-none text-slate-400" />
      </button>

      <SideDrawer isOpen={open} onClose={close} label="Chọn vật tư">
        <DrawerHeader compact title="Chọn vật tư" onClose={close} />
        <DrawerBody>
          <div className="flex flex-col gap-3 pt-4">
            <SearchField value={search} onChange={setSearch} label="Tìm vật tư" placeholder="Tìm theo mã hoặc tên..." />
            {shown.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Không có vật tư khớp từ khóa.</p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-block border border-slate-200/80">
                {shown.map((i) => (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(i);
                        close();
                      }}
                      className="flex min-h-14 w-full cursor-pointer items-center gap-2 px-3 py-2 text-left active:bg-slate-50 md:hover:bg-slate-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">{i.itemName}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Tag tone="blue">{i.itemCode}</Tag>
                          <span className="truncate">
                            Khả dụng {num(i.availableStock)} {toDisplayUnit(i.unit)}
                          </span>
                        </span>
                      </span>
                      {i.id === selectedId && <Check size={16} className="flex-none text-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DrawerBody>
      </SideDrawer>
    </>
  );
}
