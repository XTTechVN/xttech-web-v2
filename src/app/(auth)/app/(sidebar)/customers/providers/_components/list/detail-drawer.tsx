'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow } from '@/components-remake';
import type { CustomerProvider } from '@/types';
import { PROVIDER_FORM_ID, ProviderForm } from './provider-form';
import { fmtDateTime } from './format';

interface Props {
  provider: CustomerProvider | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (p: CustomerProvider) => void;
}

// Xem nhanh một nhà cung cấp; Sửa diễn ra ngay trong drawer này
export function ProviderDrawer({ provider: p, canEdit, canDelete, onClose, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Drawer isOpen={!!p} onClose={close} label="Chi tiết nhà cung cấp">
      {p && (
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
                    <IconAction label="Xóa" danger onClick={() => onDelete(p)}>
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
                <ProviderForm key={p.id} initial={p} onDone={close} onPendingChange={setPending} />
              ) : (
                <>
                  <h3 className="mb-4 text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{p.name}</h3>
                  <DrawerSection title="Thông tin">
                    <InfoRow label="Mã">{p.code}</InfoRow>
                    <InfoRow label="Ngày tạo">{fmtDateTime(p.createdAt)}</InfoRow>
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
                <Button type="submit" form={PROVIDER_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
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
