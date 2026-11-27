'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { formatAccessoryUnit, type Accessory, type Brand } from '@/types';
import { formatCurrency } from '@/utils';
import { accessoryImage, colorLabel } from './accessory-list';
import { CopyToOrg, SystemTag } from '../../_components/shared-catalog';

interface Props {
  accessory: Accessory | null;
  brands: Brand[];
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (a: Accessory) => void;
  onDelete: (a: Accessory) => void;
}

// Xem nhanh một phụ kiện; Sửa mở drawer form riêng
export function AccessoryDrawer({ accessory: a, brands, canEdit, canDelete, onClose, onEdit, onDelete }: Props) {
  const image = a && accessoryImage(a);
  return (
    <Drawer isOpen={!!a} onClose={onClose} label="Chi tiết phụ kiện">
      {a && (
        <>
          <DrawerHeader
            compact
            title="Phụ kiện"
            onClose={onClose}
            actions={
              <>
                {a.isSystem && <CopyToOrg variant="icon" kind="accessory" id={a.id} name={a.name} onCopied={onClose} />}
                {canEdit && !a.isSystem && (
                  <IconAction label="Sửa" onClick={() => onEdit(a)}>
                    <Pencil size={16} />
                  </IconAction>
                )}
                {canDelete && !a.isSystem && (
                  <IconAction label="Xóa" danger onClick={() => onDelete(a)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              {image && (
                <img src={image} alt={a.name} className="mb-4 h-40 w-full rounded-control border border-slate-200 bg-slate-50 object-contain" />
              )}
              <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{a.name}</h3>
              <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                {a.code && <Tag tone="blue">{a.code}</Tag>}
                {a.isSystem && <SystemTag />}
                {a.category?.name && <Tag tone="violet">{a.category.name}</Tag>}
                {a.isActive !== false ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm ngưng</Tag>}
              </p>
              <DrawerSection title="Thông tin">
                <InfoRow label="Hãng">{a.brand?.name || brands.find((b) => b.id === a.brandId)?.name || '–'}</InfoRow>
                <InfoRow label="Quy cách">{a.specification || '–'}</InfoRow>
                <InfoRow label="Đơn vị tính">{formatAccessoryUnit(a.unit) || '–'}</InfoRow>
                <InfoRow label="Màu sắc">{colorLabel(a)}</InfoRow>
                <InfoRow label="Giá nhập">{formatCurrency(a.costPrice || 0)}</InfoRow>
              </DrawerSection>
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
