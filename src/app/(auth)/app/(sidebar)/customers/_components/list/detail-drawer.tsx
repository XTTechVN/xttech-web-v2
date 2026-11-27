'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, MessageSquareText, Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { Customer } from '@/types';
import { getFileUrl } from '@/utils';
import { CUSTOMER_FORM_ID, CustomerForm } from './customer-form';
import { fmtDate, mapUrl, staffName, typeOf } from './format';

interface Props {
  customer: Customer | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (c: Customer) => void;
}

const LINK = 'text-primary underline-offset-2 md:hover:underline';

// Xem nhanh một khách hàng; Sửa diễn ra ngay trong drawer này. Nhật ký tương tác nằm ở trang riêng.
export function CustomerDrawer({ customer: c, canEdit, canDelete, onClose, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };

  const type = c && typeOf(c.type);
  const map = c && mapUrl(c);

  return (
    <Drawer isOpen={!!c} onClose={close} label="Chi tiết khách hàng" width={480}>
      {c && type && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa khách hàng' : 'Khách hàng'}
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
                    <IconAction label="Xóa" danger onClick={() => onDelete(c)}>
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
                <CustomerForm key={c.id} initial={c} onDone={close} onPendingChange={setPending} />
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <h3 className="min-w-0 text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{c.name}</h3>
                    <Tag tone={type.tone}>{type.label}</Tag>
                  </div>
                  <DrawerSection title="Liên hệ">
                    <InfoRow label="Điện thoại">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className={LINK}>
                          {c.phone}
                        </a>
                      ) : (
                        '–'
                      )}
                    </InfoRow>
                    <InfoRow label="Email">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className={LINK}>
                          {c.email}
                        </a>
                      ) : (
                        '–'
                      )}
                    </InfoRow>
                    <InfoRow label="Địa chỉ">
                      {c.address || '–'}
                      {map && (
                        <a href={map} target="_blank" rel="noreferrer" className={`${LINK} mt-1 flex items-center gap-1 text-xs`}>
                          <MapPin size={12} className="flex-none" />
                          Xem trên Google Maps
                        </a>
                      )}
                    </InfoRow>
                  </DrawerSection>
                  <DrawerSection title="Quản lý">
                    <InfoRow label="Mã định danh">{c.identifyCode || '–'}</InfoRow>
                    <InfoRow label="Phụ trách">{staffName(c)}</InfoRow>
                    <InfoRow label="Nhà cung cấp">{c.provider ? `${c.provider.name} (${c.provider.code})` : '–'}</InfoRow>
                    <InfoRow label="Ngày tạo">{fmtDate(c.createdAt)}</InfoRow>
                  </DrawerSection>
                  {c.images?.length > 0 && (
                    <DrawerSection title="Hình ảnh" hint={String(c.images.length)}>
                      <ul className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
                        {c.images.map((img: { id: number; imagePath: string }) => (
                          <li key={img.id}>
                            <a href={getFileUrl(img.imagePath)} target="_blank" rel="noreferrer">
                              <img
                                src={getFileUrl(img.imagePath)}
                                alt="Ảnh khách hàng"
                                className="aspect-square w-full rounded-control border border-slate-200/80 object-cover"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </DrawerSection>
                  )}
                </>
              )}
            </div>
          </DrawerBody>
          <DrawerFooter>
            <div className="flex justify-end gap-2">
              {editing ? (
                <>
                  <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={() => setEditing(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" form={CUSTOMER_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                    Lưu
                  </Button>
                </>
              ) : (
                <Link
                  href={`/app/customers/${c.id}`}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-control border border-slate-200 text-sm font-medium text-slate-700 transition active:scale-95 active:bg-slate-100 md:h-10 md:flex-none md:px-4 md:hover:bg-slate-50"
                >
                  <MessageSquareText size={16} />
                  Nhật ký tương tác
                </Link>
              )}
            </div>
          </DrawerFooter>
        </>
      )}
    </Drawer>
  );
}
