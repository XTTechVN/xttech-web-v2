'use client';

import { Sheet } from '../../_components/sheet';
import {
  createAccessoryCategory,
  createGlassCategory,
  deleteAccessoryCategory,
  deleteGlassCategory,
  getAccessoryCategories,
  getGlassCategories,
  updateAccessoryCategory,
  updateGlassCategory,
} from '@/actions';
import type { AccessoryCategory, GlassCategory, MaterialType } from '@/types';
import { ACTIVE } from './brand-sheet';
import { EntityTab, type EntityConfig } from './entity-tab';

const MATERIALS: { value: MaterialType; label: string }[] = [
  { value: 'glass', label: 'Kính' },
  { value: 'panel', label: 'Tấm' },
  { value: 'screen_mesh', label: 'Lưới' },
];

// Quản lý nhóm phụ kiện: thêm / sửa / xoá, cần quyền danh mục.
export function AccessoryCategoryManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cfg: EntityConfig<AccessoryCategory> = {
    queryKey: 'accessory-categories',
    noun: 'nhóm phụ kiện',
    load: async () => (await getAccessoryCategories({ limit: 500 })).items,
    title: (c) => c.name,
    sub: (c) => `${c.code} · thứ tự ${c.sortOrder ?? 0}`,
    inactive: (c) => c.isActive === false,
    fields: [
      { key: 'name', label: 'Tên nhóm', required: true },
      { key: 'code', label: 'Mã nhóm', required: true, half: true },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', half: true },
      { key: 'description', label: 'Mô tả' },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE },
    ],
    toForm: (c) => ({
      name: c?.name ?? '',
      code: c?.code ?? '',
      sortOrder: String(c?.sortOrder ?? 0),
      description: c?.description ?? '',
      isActive: c?.isActive === false ? '0' : '1',
    }),
    save: (f, c) => {
      const data = {
        name: f.name.trim(),
        code: f.code.trim(),
        sortOrder: Number(f.sortOrder) || 0,
        description: f.description.trim() || undefined,
        isActive: f.isActive === '1',
      };
      return c ? updateAccessoryCategory(c.id, data) : createAccessoryCategory(data);
    },
    remove: (c) => deleteAccessoryCategory(c.id),
  };
  return (
    <Sheet open={open} onClose={onClose} title="Nhóm phụ kiện">
      <div className="p-rm-gutter">
        <EntityTab cfg={cfg} compact />
      </div>
    </Sheet>
  );
}

// Quản lý nhóm kính (kính / tấm / lưới muỗi).
export function GlassCategoryManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cfg: EntityConfig<GlassCategory> = {
    queryKey: 'glass-categories',
    noun: 'nhóm kính',
    load: async () => (await getGlassCategories({ limit: 500 })).items,
    title: (c) => c.name,
    sub: (c) => `${c.code} · ${MATERIALS.find((m) => m.value === c.materialType)?.label ?? '–'}`,
    inactive: (c) => c.isActive === false,
    fields: [
      { key: 'name', label: 'Tên nhóm', required: true },
      { key: 'code', label: 'Mã nhóm', required: true, half: true },
      { key: 'materialType', label: 'Thuộc loại', type: 'select', options: MATERIALS, half: true },
      { key: 'description', label: 'Mô tả / ứng dụng' },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', half: true },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE, half: true },
    ],
    toForm: (c) => ({
      name: c?.name ?? '',
      code: c?.code ?? '',
      materialType: c?.materialType ?? 'glass',
      description: c?.description ?? '',
      sortOrder: String(c?.sortOrder ?? 0),
      isActive: c?.isActive === false ? '0' : '1',
    }),
    save: (f, c) => {
      const data = {
        name: f.name.trim(),
        code: f.code.trim(),
        materialType: f.materialType as MaterialType,
        description: f.description.trim() || undefined,
        sortOrder: Number(f.sortOrder) || 0,
        isActive: f.isActive === '1',
      };
      return c ? updateGlassCategory(c.id, data) : createGlassCategory(data);
    },
    remove: (c) => deleteGlassCategory(c.id),
  };
  return (
    <Sheet open={open} onClose={onClose} title="Nhóm kính">
      <div className="p-rm-gutter">
        <EntityTab cfg={cfg} compact />
      </div>
    </Sheet>
  );
}
