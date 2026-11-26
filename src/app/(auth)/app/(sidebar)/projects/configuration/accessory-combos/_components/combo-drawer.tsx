'use client';

import { Copy, Pencil, Star, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { getDoorTypeConfig, type AccessoryCombo } from '@/types';
import { formatCurrency } from '@/utils';
import { OPENING_TYPE, applyOf } from './combo-list';

interface Props {
  combo: AccessoryCombo | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  togglingDefault: boolean;
  onClose: () => void;
  onCopy: (c: AccessoryCombo) => void;
  onEdit: (c: AccessoryCombo) => void;
  onDelete: (c: AccessoryCombo) => void;
  onToggleDefault: (c: AccessoryCombo) => void;
}

// Xem nhanh một gói combo; Sửa/Sao chép mở drawer form riêng
export function ComboDrawer({ combo: c, canCreate, canEdit, canDelete, togglingDefault, onClose, onCopy, onEdit, onDelete, onToggleDefault }: Props) {
  const doorTypes = c?.doorTypes?.filter(Boolean) ?? [];
  return (
    <Drawer isOpen={!!c} onClose={onClose} label="Chi tiết gói combo">
      {c && (
        <>
          <DrawerHeader
            compact
            title="Gói combo"
            onClose={onClose}
            actions={
              <>
                {canEdit && (
                  <IconAction label={c.isDefault ? 'Bỏ mặc định' : 'Đặt làm mặc định'} disabled={togglingDefault} onClick={() => onToggleDefault(c)}>
                    <Star size={16} className={c.isDefault ? 'fill-primary text-primary' : ''} />
                  </IconAction>
                )}
                {canCreate && (
                  <IconAction label="Sao chép" onClick={() => onCopy(c)}>
                    <Copy size={16} />
                  </IconAction>
                )}
                {canEdit && (
                  <IconAction label="Sửa" onClick={() => onEdit(c)}>
                    <Pencil size={16} />
                  </IconAction>
                )}
                {canDelete && (
                  <IconAction label="Xóa" danger onClick={() => onDelete(c)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{c.name}</h3>
              <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                <Tag tone="blue">{c.code}</Tag>
                <Tag tone={applyOf(c).tone}>{applyOf(c).label}</Tag>
                {c.isDefault && <Tag tone="amber">Mặc định</Tag>}
                {c.isActive ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm ngưng</Tag>}
              </p>
              <DrawerSection title="Thông tin">
                <InfoRow label="Hãng">{c.brand?.name || '–'}</InfoRow>
                {c.applyFor === 'huong_mo' && <InfoRow label="Kiểu mở">{(c.openingType && OPENING_TYPE[c.openingType]) || c.openingType || '–'}</InfoRow>}
                <InfoRow label="Loại cửa">{doorTypes.length ? doorTypes.map((d) => getDoorTypeConfig(d).label).join(', ') : '–'}</InfoRow>
                <InfoRow label="Tổng giá">{formatCurrency(c.totalComboPrice || 0)}</InfoRow>
                <InfoRow label="Mô tả">{c.description || '–'}</InfoRow>
              </DrawerSection>
              <DrawerSection title={`Các món (${c.comboItems?.length ?? 0})`}>
                {(c.comboItems ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Chưa có món nào.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {c.comboItems.map((it, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 [overflow-wrap:anywhere]">{it.accessoryName || '–'}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{[it.accessoryCode, it.category, it.note].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span className="flex-none whitespace-nowrap text-sm tabular-nums text-slate-700">
                          ×{it.quantity} {it.unit || ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </DrawerSection>
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
