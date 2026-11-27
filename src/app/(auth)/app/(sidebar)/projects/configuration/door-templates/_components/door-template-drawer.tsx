'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { getDoorTypeConfig, type Door } from '@/types';
import { DoorPreview } from './door-card';
import { CopyToOrg, SystemTag } from '../../_components/shared-catalog';

interface Props {
  door: Door | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (d: Door) => void;
  onCopy: (d: Door) => void;
  onDelete: (d: Door) => void;
}

// Xem nhanh một mẫu cửa; Sửa và Sao chép mở trình thiết kế cửa
export function DoorTemplateDrawer({ door: d, canCreate, canEdit, canDelete, onClose, onEdit, onCopy, onDelete }: Props) {
  return (
    <Drawer isOpen={!!d} onClose={onClose} label="Chi tiết mẫu cửa">
      {d && (
        <>
          <DrawerHeader
            compact
            title="Mẫu cửa"
            onClose={onClose}
            actions={
              <>
                {d.isSystem && <CopyToOrg variant="icon" kind="door" id={d.id} name={d.name} onCopied={onClose} />}
                {canCreate && !d.isSystem && (
                  <IconAction label="Sao chép" onClick={() => onCopy(d)}>
                    <Copy size={16} />
                  </IconAction>
                )}
                {canEdit && !d.isSystem && (
                  <IconAction label="Sửa" onClick={() => onEdit(d)}>
                    <Pencil size={16} />
                  </IconAction>
                )}
                {canDelete && !d.isSystem && (
                  <IconAction label="Xóa" danger onClick={() => onDelete(d)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <div className="mb-4 flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-control border border-slate-200 bg-slate-50">
                <DoorPreview door={d} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{d.name}</h3>
              <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                {d.code && <Tag tone="blue">{d.code}</Tag>}
                {d.isSystem && <SystemTag />}
                {d.type && <Tag tone="violet">{getDoorTypeConfig(d.type).label}</Tag>}
              </p>
              <DrawerSection title="Thông tin">
                <InfoRow label="Hệ nhôm">{d.doorSeries?.name || '–'}</InfoRow>
                <InfoRow label="Quy cách">{d.specification || '–'}</InfoRow>
              </DrawerSection>
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
