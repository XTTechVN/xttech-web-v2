'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { SupplierDoor } from '@/types';
import { getFileUrl } from '@/utils';
import { getSupplierDoorTypeLabel } from '../_constants/supplier-doors.constants';
import { costPerSqm } from './supplier-door-list';

interface Props {
  door: SupplierDoor | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (d: SupplierDoor) => void;
  onDelete: (d: SupplierDoor) => void;
}

// Xem nhanh một mẫu cửa NCC; Sửa mở drawer form riêng
export function SupplierDoorDrawer({ door: d, canEdit, canDelete, onClose, onEdit, onDelete }: Props) {
  return (
    <Drawer isOpen={!!d} onClose={onClose} label="Chi tiết mẫu cửa nhà cung cấp">
      {d && (
        <>
          <DrawerHeader
            compact
            title="Mẫu cửa nhà cung cấp"
            onClose={onClose}
            actions={
              <>
                {canEdit && (
                  <IconAction label="Sửa" onClick={() => onEdit(d)}>
                    <Pencil size={16} />
                  </IconAction>
                )}
                {canDelete && (
                  <IconAction label="Xóa" danger onClick={() => onDelete(d)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{d.name}</h3>
              <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                <Tag tone="blue">{d.code}</Tag>
                <Tag tone="violet">{getSupplierDoorTypeLabel(d.doorType)}</Tag>
                {d.isActive ? <Tag tone="green">Đang sử dụng</Tag> : <Tag>Tạm ngưng</Tag>}
              </p>
              <DrawerSection title="Thông tin">
                <InfoRow label="Nhà cung cấp">{d.supplier?.name || '–'}</InfoRow>
                <InfoRow label="Điện thoại">{d.supplier?.phone || '–'}</InfoRow>
                <InfoRow label="Đơn giá">{costPerSqm(d.referenceCostPerSqm)}</InfoRow>
                <InfoRow label="Quy cách">{d.specification || '–'}</InfoRow>
              </DrawerSection>
              {d.images?.length > 0 && (
                <DrawerSection title={`Hình ảnh (${d.images.length})`}>
                  <ul className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
                    {d.images.map((img) => (
                      <li key={img.id} className="aspect-square overflow-hidden rounded-control border border-slate-200 bg-slate-50">
                        <img src={getFileUrl(img.imageUrl)} alt={d.name} loading="lazy" className="size-full object-cover" />
                      </li>
                    ))}
                  </ul>
                </DrawerSection>
              )}
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
