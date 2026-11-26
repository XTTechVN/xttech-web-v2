'use client';

import { Pencil, Star, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { Glass, GlassCategory } from '@/types';
import { formatCurrency } from '@/utils';
import { glassTypeOf } from './format';

interface Props {
  glass: Glass | null;
  categories: GlassCategory[];
  canEdit: boolean;
  canDelete: boolean;
  settingDefault: boolean;
  onClose: () => void;
  onEdit: (g: Glass) => void;
  onDelete: (g: Glass) => void;
  onSetDefault: (g: Glass) => void;
}

// Xem nhanh một quy cách; Sửa mở drawer form riêng
export function GlassDrawer({ glass: g, categories, canEdit, canDelete, settingDefault, onClose, onEdit, onDelete, onSetDefault }: Props) {
  return (
    <Drawer isOpen={!!g} onClose={onClose} label="Chi tiết quy cách">
      {g && (
        <>
          <DrawerHeader
            compact
            title="Quy cách vật tư"
            onClose={onClose}
            actions={
              <>
                {canEdit && !g.isDefault && (
                  <IconAction label="Đặt làm mặc định" disabled={settingDefault} onClick={() => onSetDefault(g)}>
                    <Star size={16} />
                  </IconAction>
                )}
                {canEdit && (
                  <IconAction label="Sửa" onClick={() => onEdit(g)}>
                    <Pencil size={16} />
                  </IconAction>
                )}
                {canDelete && (
                  <IconAction label="Xóa" danger onClick={() => onDelete(g)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{g.name}</h3>
              <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                <Tag tone="blue">{g.code || '–'}</Tag>
                <Tag tone={glassTypeOf(g).tone}>{glassTypeOf(g).label}</Tag>
                {g.isDefault && <Tag tone="amber">Mặc định</Tag>}
                {g.isActive !== false ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm khóa</Tag>}
              </p>
              <DrawerSection title="Thông tin">
                <InfoRow label="Nhóm">{categories.find((c) => c.id === g.categoryId)?.name || '–'}</InfoRow>
                <InfoRow label="Độ dày">{g.thicknessMm ? `${g.thicknessMm} mm` : '–'}</InfoRow>
                <InfoRow label="Khối lượng">{g.weightPerM2 ? `${g.weightPerM2} kg/m²` : '–'}</InfoRow>
                <InfoRow label="Đơn giá">{`${formatCurrency(g.unitPrice || 0)}/m²`}</InfoRow>
                <InfoRow label="Khổ tối đa">{g.maxWidthMm && g.maxHeightMm ? `${g.maxWidthMm} × ${g.maxHeightMm} mm` : '–'}</InfoRow>
              </DrawerSection>
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
