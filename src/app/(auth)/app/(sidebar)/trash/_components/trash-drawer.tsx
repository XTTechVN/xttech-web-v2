'use client';

import { RotateCcw, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { TrashItem } from '@/types';
import { LeftTag, deletedDay, kindLabel } from './trash-list';

interface Props {
  item: TrashItem | null;
  canRestore: boolean;
  canPurge: boolean;
  restoring: boolean;
  onClose: () => void;
  onRestore: (i: TrashItem) => void;
  onPurge: (i: TrashItem) => void;
}

// Xem nhanh một mục đã xóa; khôi phục hoặc xóa vĩnh viễn
export function TrashDrawer({ item: i, canRestore, canPurge, restoring, onClose, onRestore, onPurge }: Props) {
  return (
    <Drawer isOpen={!!i} onClose={onClose} label="Chi tiết mục đã xóa">
      {i && (
        <>
          <DrawerHeader
            compact
            title="Mục đã xóa"
            onClose={onClose}
            actions={
              <>
                {canRestore && (
                  <IconAction label="Khôi phục" disabled={restoring} onClick={() => onRestore(i)}>
                    <RotateCcw size={16} />
                  </IconAction>
                )}
                {canPurge && (
                  <IconAction label="Xóa vĩnh viễn" danger onClick={() => onPurge(i)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{i.title}</h3>
              <p className="mt-2 flex flex-wrap items-center gap-1.5">
                <Tag tone="blue">{i.code || '–'}</Tag>
                <Tag tone="violet">{kindLabel(i)}</Tag>
                <LeftTag i={i} />
              </p>
              <div className="mt-4">
                <DrawerSection title="Thông tin">
                  <InfoRow label="Thư mục">{i.categoryName || '–'}</InfoRow>
                  <InfoRow label="Người xóa">{i.deletedByName || '–'}</InfoRow>
                  <InfoRow label="Ngày xóa">{deletedDay(i)}</InfoRow>
                </DrawerSection>
              </div>
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
