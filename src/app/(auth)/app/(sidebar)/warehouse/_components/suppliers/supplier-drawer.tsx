'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { SUPPLIER_TYPE_MAP } from '@/config';
import type { WarehouseSupplier } from '@/types';
import { SUPPLIER_FORM_ID, SupplierForm } from './supplier-form';
import { SupplierActivity } from './supplier-activity';

interface Props {
  supplier: WarehouseSupplier | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (s: WarehouseSupplier) => void;
}

// Xem nhanh một nhà cung cấp kèm lịch sử cung ứng; Sửa diễn ra ngay trong drawer này
export function SupplierDrawer({ supplier: s, canEdit, canDelete, onClose, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Drawer isOpen={!!s} onClose={close} label="Chi tiết nhà cung cấp" width={560}>
      {s && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa nhà cung cấp' : 'Nhà cung cấp'}
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
                    <IconAction label="Xóa" danger onClick={() => onDelete(s)}>
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
                <SupplierForm key={s.id} initial={s} onDone={close} onPendingChange={setPending} />
              ) : (
                <>
                  <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{s.name}</h3>
                  <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                    <Tag tone="blue">{s.code}</Tag>
                    <Tag tone="violet">{SUPPLIER_TYPE_MAP[s.supplierType] ?? s.supplierType}</Tag>
                    {s.isActive ? <Tag tone="green">Hoạt động</Tag> : <Tag>Ngừng hợp tác</Tag>}
                  </p>
                  <DrawerSection title="Thông tin">
                    <InfoRow label="Điện thoại">
                      <a href={`tel:${s.phone}`} className="text-primary">
                        {s.phone}
                      </a>
                    </InfoRow>
                    <InfoRow label="Người liên hệ">{s.contactName || '–'}</InfoRow>
                    <InfoRow label="Mã số thuế">{s.taxCode || '–'}</InfoRow>
                    <InfoRow label="Địa chỉ">{s.address || '–'}</InfoRow>
                    <InfoRow label="Tài khoản NH">{s.bankAccount || '–'}</InfoRow>
                  </DrawerSection>
                  <DrawerSection title="Cung ứng">
                    <SupplierActivity supplier={s} />
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
                <Button type="submit" form={SUPPLIER_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
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
