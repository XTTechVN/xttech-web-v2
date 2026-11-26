'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, SectionAdd, Tag } from '@/components-remake';
import type { AccessoryCategory } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: AccessoryCategory[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onAdd: () => void;
  onEdit: (c: AccessoryCategory) => void;
  onDelete: (c: AccessoryCategory) => void;
}

const ROW_BTN = 'flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-500 active:bg-slate-100 md:size-9 md:hover:bg-slate-100';

// Quản lý danh mục phụ kiện: danh sách theo thứ tự hiển thị; thêm/sửa mở drawer con
export function AccessoryCategoryManagerDrawer({ isOpen, onClose, categories, canCreate, canUpdate, canDelete, onAdd, onEdit, onDelete }: Props) {
  const rows = [...categories].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Quản lý danh mục phụ kiện" width={520}>
      <DrawerHeader compact title="Danh mục phụ kiện" onClose={onClose} />
      <DrawerBody>
        <div className="py-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">{rows.length} danh mục</p>
            {canCreate && <SectionAdd label="Thêm danh mục" onClick={onAdd} />}
          </div>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Chưa có danh mục nào.</p>
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
                  {canUpdate && (
                    <button type="button" aria-label={`Sửa danh mục ${c.name}`} className={ROW_BTN} onClick={() => onEdit(c)}>
                      <Pencil size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button type="button" aria-label={`Xóa danh mục ${c.name}`} className={`${ROW_BTN} md:hover:text-red-600`} onClick={() => onDelete(c)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DrawerBody>
    </Drawer>
  );
}
