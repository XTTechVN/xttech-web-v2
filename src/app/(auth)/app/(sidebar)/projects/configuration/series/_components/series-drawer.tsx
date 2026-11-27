'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { Brand, DoorSeries } from '@/types';
import { CopyToOrg, SystemTag } from '../../_components/shared-catalog';
import { jointLabel } from './format';
import { SERIES_FORM_ID, SeriesForm } from './series-form';

interface Props {
  series: DoorSeries | null;
  brands: Brand[];
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (s: DoorSeries) => void;
}

// Xem nhanh một hệ nhôm; Sửa diễn ra ngay trong drawer này
export function SeriesDrawer({ series: s, brands, canEdit, canDelete, onClose, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Drawer isOpen={!!s} onClose={close} label="Chi tiết hệ nhôm">
      {s && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa hệ nhôm' : 'Hệ nhôm'}
            onClose={close}
            actions={
              !editing && (
                <>
                  {s.isSystem && <CopyToOrg variant="icon" kind="series" id={s.id} name={s.name} onCopied={close} />}
                  {canEdit && !s.isSystem && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {canDelete && !s.isSystem && (
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
                <SeriesForm key={s.id} brands={brands} initial={s} onDone={() => setEditing(false)} onPendingChange={setPending} />
              ) : (
                <>
                  <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{s.name}</h3>
                  <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                    <Tag tone="blue">{s.code}</Tag>
                    {s.isSystem && <SystemTag />}
                    {s.isActive !== false ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm ngưng</Tag>}
                  </p>
                  <DrawerSection title="Thông tin">
                    <InfoRow label="Hãng nhôm">{s.brand?.name || brands.find((b) => b.id === s.brandId)?.name || '–'}</InfoRow>
                    <InfoRow label="Độ dày">{s.aluminumThickness ? `${s.aluminumThickness} mm` : '–'}</InfoRow>
                    <InfoRow label="Liên kết góc">{jointLabel(s.cornerJointType)}</InfoRow>
                    <InfoRow label="Mô tả">{s.description || '–'}</InfoRow>
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
                <Button type="submit" form={SERIES_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
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
