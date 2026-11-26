'use client';

import { ConfirmDelete } from '@/components-remake';
import type { DocumentItem } from '@/types';

interface Props {
  doc: DocumentItem | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: (d: DocumentItem) => void;
}

export function RuleDeleteConfirm({ doc, pending, onClose, onConfirm }: Props) {
  return (
    <ConfirmDelete isOpen={!!doc} title="Xác nhận xóa văn bản" pending={pending} onClose={onClose} onConfirm={() => doc && onConfirm(doc)}>
      Xóa văn bản <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{doc?.title}</strong> cùng dữ liệu liên quan?
    </ConfirmDelete>
  );
}
