'use client';

import { useState } from 'react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tabs, Tag } from '@/components-remake';
import type { Brand } from '@/types';
import { CopyToOrg, SystemTag } from '../../_components/shared-catalog';
import { BrandColors } from './brand-colors';
import { BrandFavorite } from './brand-favorite';
import { BRAND_FORM_ID, BrandForm } from './brand-form';
import { BrandLogo } from './brand-logo';
import { typeLabel } from './format';

interface Props {
  brand: Brand | null;
  brands: Brand[];
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (b: Brand) => void;
}

type Tab = 'info' | 'colors';

// Xem nhanh một thương hiệu; Sửa diễn ra ngay trong drawer này. Hãng nhôm có thêm tab Hệ màu.
export function BrandDrawer({ brand: b, brands, canEdit, canDelete, onClose, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>('info');
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    setTab('info');
    onClose();
  };

  const hasColors = !!b && b.brandType !== 'accessory';
  const current = hasColors ? tab : 'info';

  return (
    <Drawer isOpen={!!b} onClose={close} label="Chi tiết thương hiệu" width={560}>
      {b && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa thương hiệu' : 'Thương hiệu'}
            onClose={close}
            actions={
              !editing &&
              current === 'info' && (
                <>
                  {b.isSystem && <CopyToOrg variant="icon" kind="brand" id={b.id} name={b.name} onCopied={close} />}
                  {canEdit && !b.isSystem && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {canDelete && !b.isSystem && (
                    <IconAction label="Xóa" danger onClick={() => onDelete(b)}>
                      <Trash2 size={16} />
                    </IconAction>
                  )}
                </>
              )
            }
          />
          <DrawerBody>
            <div className="pt-2">
              {hasColors && !editing && (
                <Tabs
                  label="Nhóm thông tin"
                  value={current}
                  onChange={setTab}
                  tabs={[
                    { value: 'info', label: 'Thông tin' },
                    { value: 'colors', label: 'Hệ màu' },
                  ]}
                />
              )}
              <div className="pt-4">
                {editing ? (
                  <BrandForm key={b.id} initial={b} onDone={() => setEditing(false)} onPendingChange={setPending} />
                ) : current === 'colors' ? (
                  <BrandColors brand={b} />
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <BrandLogo brand={b} className="size-14" />
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{b.name}</h3>
                        <p className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Tag tone="blue">{b.code}</Tag>
                          {b.isSystem && <SystemTag />}
                          {b.isActive ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm ngưng</Tag>}
                        </p>
                      </div>
                    </div>
                    <DrawerSection title="Thông tin">
                      <InfoRow label="Phân loại">{typeLabel(b.brandType)}</InfoRow>
                      <InfoRow label="Xuất xứ">{b.originCountry || '–'}</InfoRow>
                      <InfoRow label="Cây nhôm">{b.barLengthMm ? `${b.barLengthMm.toLocaleString('vi-VN')} mm` : '–'}</InfoRow>
                      <InfoRow label="Website">
                        {b.website ? (
                          <a href={b.website} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 text-primary">
                            <span className="truncate">{b.website}</span>
                            <ExternalLink size={12} className="flex-none" />
                          </a>
                        ) : (
                          '–'
                        )}
                      </InfoRow>
                      <InfoRow label="Ghi chú">{b.description || '–'}</InfoRow>
                    </DrawerSection>
                    {canEdit && !b.isSystem && (
                      <div className="mt-4">
                        <BrandFavorite brand={b} brands={brands} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </DrawerBody>
          {editing && (
            <DrawerFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={() => setEditing(false)}>
                  Hủy
                </Button>
                <Button type="submit" form={BRAND_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
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
