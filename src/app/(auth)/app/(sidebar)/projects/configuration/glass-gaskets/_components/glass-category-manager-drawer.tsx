'use client';

import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, SectionAdd, Tabs, Tag } from '@/components-remake';
import type { GlassCategory } from '@/types';
import { getCategoryMaterialType } from './glass-category-sidebar';

type MaterialType = 'glass' | 'panel' | 'screen_mesh';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: GlassCategory[];
  onAdd: () => void;
  onEdit: (c: GlassCategory) => void;
  onDelete: (c: GlassCategory) => void;
}

const LABELS: Record<MaterialType, string> = { glass: 'Kính', panel: 'Tấm', screen_mesh: 'Lưới' };
const ROW_BTN = 'flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-500 active:bg-slate-100 md:size-9 md:hover:bg-slate-100';

// Quản lý nhóm chủng loại: danh sách theo loại chính; thêm/sửa mở drawer con
export function GlassCategoryManagerDrawer({ isOpen, onClose, categories, onAdd, onEdit, onDelete }: Props) {
  const [tab, setTab] = useState<MaterialType>('glass');

  const byType = useMemo(() => {
    const map: Record<MaterialType, GlassCategory[]> = { glass: [], panel: [], screen_mesh: [] };
    categories.forEach((c) => map[getCategoryMaterialType(c)].push(c));
    (Object.keys(map) as MaterialType[]).forEach((k) => map[k].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' })));
    return map;
  }, [categories]);

  const rows = byType[tab];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Quản lý nhóm chủng loại" width={520}>
      <DrawerHeader compact title="Nhóm chủng loại" onClose={onClose} />
      <Tabs
        label="Loại vật tư"
        value={tab}
        onChange={setTab}
        tabs={(Object.keys(LABELS) as MaterialType[]).map((k) => ({ value: k, label: `${LABELS[k]} (${byType[k].length})` }))}
      />
      <DrawerBody>
        <div className="py-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">{rows.length} nhóm</p>
            <SectionAdd label="Thêm nhóm" onClick={onAdd} />
          </div>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Chưa có nhóm nào trong loại này.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((c) => (
                <li key={c.id} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900" title={c.name}>
                      {c.name}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Tag tone="blue">{c.code}</Tag>
                      {c.isActive === false && <Tag>Khóa</Tag>}
                    </p>
                    {c.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.description}</p>}
                  </div>
                  <button type="button" aria-label={`Sửa nhóm ${c.name}`} className={ROW_BTN} onClick={() => onEdit(c)}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" aria-label={`Xóa nhóm ${c.name}`} className={`${ROW_BTN} md:hover:text-red-600`} onClick={() => onDelete(c)}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DrawerBody>
    </Drawer>
  );
}
