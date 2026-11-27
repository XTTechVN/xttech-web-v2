'use client';

import { useState } from 'react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { WAREHOUSE_ITEM_TYPE_MAP } from '@/config';
import type { WarehouseItem } from '@/types';
import { toDisplayUnit } from '../../_utils/unit-mapping';
import { fmtDateTime, money, num } from '../format';
import { isLow } from './stock-list';
import { ITEM_FORM_ID, ItemForm } from './item-form';

interface Props {
  item: WarehouseItem | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (i: WarehouseItem) => void;
}

// Xem nhanh một mặt hàng; Sửa diễn ra ngay trong drawer này
export function ItemDrawer({ item: i, canEdit, canDelete, onClose, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Drawer isOpen={!!i} onClose={close} label="Chi tiết mặt hàng" width={520}>
      {i && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa mặt hàng' : 'Mặt hàng'}
            onClose={close}
            actions={
              !editing && (
                <>
                  {canEdit && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {canDelete && (
                    <IconAction label="Xóa" danger onClick={() => onDelete(i)}>
                      <Trash2 size={16} />
                    </IconAction>
                  )}
                </>
              )
            }
          />
          <DrawerBody>
            <div className="pt-4">
              {editing ? (
                <ItemForm key={i.id} initial={i} onDone={close} onPendingChange={setPending} />
              ) : (
                <>
                  <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{i.itemName}</h3>
                  <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                    <Tag tone="blue">{i.itemCode}</Tag>
                    <Tag>{WAREHOUSE_ITEM_TYPE_MAP[i.itemType] ?? i.itemType}</Tag>
                    {isLow(i) ? <Tag tone="red">Sắp hết hàng</Tag> : <Tag tone="green">Đủ tồn kho</Tag>}
                  </p>
                  <DrawerSection title="Tồn kho">
                    <InfoRow label="Tồn thực tế">
                      {num(i.currentStock)} {toDisplayUnit(i.unit)}
                    </InfoRow>
                    <InfoRow label="Đã giữ chỗ">{num(i.reservedQty)}</InfoRow>
                    <InfoRow label="Khả dụng">
                      <strong className="font-semibold">{num(i.availableStock)}</strong>
                    </InfoRow>
                    <InfoRow label="Định mức tối thiểu">{num(i.minStockLevel)}</InfoRow>
                  </DrawerSection>
                  <DrawerSection title="Thông tin">
                    {i.brandName && <InfoRow label="Hãng">{i.brandName}</InfoRow>}
                    {i.colorName && <InfoRow label="Màu sắc">{i.colorName}</InfoRow>}
                    {i.standardLengthMm > 0 && <InfoRow label="Chiều dài">{num(i.standardLengthMm)} mm</InfoRow>}
                    <InfoRow label="Giá vốn">{money(i.costPrice)}</InfoRow>
                    <InfoRow label="Vị trí kho">
                      {i.location ? (
                        <span className="inline-flex items-start gap-1">
                          <MapPin size={14} className="mt-0.5 flex-none text-slate-400" />
                          {i.location}
                        </span>
                      ) : (
                        '–'
                      )}
                    </InfoRow>
                    <InfoRow label="Cập nhật">{fmtDateTime(i.updatedAt)}</InfoRow>
                  </DrawerSection>
                </>
              )}
            </div>
          </DrawerBody>
          {editing && (
            <DrawerFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={() => setEditing(false)}>
                  Hủy
                </Button>
                <Button type="submit" form={ITEM_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                  Lưu
                </Button>
              </div>
            </DrawerFooter>
          )}
        </>
      )}
    </Drawer>
  );
}
