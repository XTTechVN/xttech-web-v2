'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { Project } from '@/types';
import { codeOf, fmtDate, statusOf } from './format';
import { PROJECT_FORM_ID, ProjectForm } from './project-form';

interface Props {
  project: Project | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (p: Project) => void;
}

// Xem nhanh một dự án; Sửa diễn ra ngay trong drawer này. Chi tiết đầy đủ (báo giá, sản xuất...) ở trang dự án.
export function ProjectDrawer({ project: p, canEdit, canDelete, onClose, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };
  const status = p && statusOf(p.status);

  return (
    <Drawer isOpen={!!p} onClose={close} label="Chi tiết dự án" width={480}>
      {p && status && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa dự án' : 'Dự án'}
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
                <ProjectForm key={p.id} initial={p} onDone={close} onPendingChange={setPending} />
              ) : (
                <>
                  <h3 className="mb-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{p.name}</h3>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Tag tone="blue">{codeOf(p)}</Tag>
                    <Tag tone={status.tone}>{status.label}</Tag>
                  </div>
                  <DrawerSection title="Thông tin">
                    <InfoRow label="Khách hàng">{p.customer?.name || '–'}</InfoRow>
                    <InfoRow label="Điện thoại">{p.customer?.phone || '–'}</InfoRow>
                    <InfoRow label="Địa chỉ">{p.address || '–'}</InfoRow>
                    <InfoRow label="Ngày bắt đầu">{fmtDate(p.startDate)}</InfoRow>
                    <InfoRow label="Dự kiến xong">{fmtDate(p.targetDate)}</InfoRow>
                    {p.note && <InfoRow label="Ghi chú">{p.note}</InfoRow>}
                  </DrawerSection>
                  <DrawerSection title="Quy mô">
                    <InfoRow label="Số bộ cửa">{p.totalPositions ?? 0}</InfoRow>
                    <InfoRow label="Diện tích">{(p.totalAreaM2 ?? 0).toFixed(2)} m²</InfoRow>
                    <InfoRow label="Khối lượng nhôm">{(p.totalAluminumKg ?? 0).toFixed(1)} kg</InfoRow>
                  </DrawerSection>
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
                  <Button type="submit" form={PROJECT_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                    Lưu
                  </Button>
                </>
              ) : (
                <Link
                  href={`/app/projects/${p.id}`}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-control bg-primary text-sm font-medium text-white transition active:scale-95 active:bg-primary/90 md:h-10 md:flex-none md:px-4 md:hover:bg-primary/90"
                >
                  <ExternalLink size={16} />
                  Mở dự án
                </Link>
              )}
            </div>
          </DrawerFooter>
        </>
      )}
    </Drawer>
  );
}
