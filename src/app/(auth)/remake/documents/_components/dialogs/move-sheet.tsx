'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getDocumentCategoryTree, saveDocumentToFolder, updateDocument, updateDocumentCategory } from '@/actions';
import type { BulkMoveTarget } from '@/hooks';
import type { DocumentCategory, DocumentItem } from '@/types';
import { DOC_QUERY_KEYS, invalidateDocumentQueries, isDescendant } from '@/utils';
import { BTN_PRIMARY, messageOf } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { FolderPicker } from './folder-picker';

interface MoveProps {
  open: boolean;
  onClose: () => void;
  targets: BulkMoveTarget[];
}

// Di chuyển thư mục / tài liệu (một hoặc nhiều mục) tới thư mục đích; chặn chuyển vào chính nó hoặc thư mục con.
export function MoveSheet({ open, onClose, targets }: MoveProps) {
  const qc = useQueryClient();
  const [dest, setDest] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: tree = [] } = useQuery({ queryKey: DOC_QUERY_KEYS.categories.tree, queryFn: getDocumentCategoryTree, enabled: open });

  const parentOf = (t: BulkMoveTarget) => ('categoryId' in t.item ? (t.item.categoryId ?? null) : ((t.item as DocumentCategory).parentId ?? null));
  const blocked = new Set<number>();
  for (const t of targets) {
    if (t.type !== 'folder') continue;
    blocked.add(t.item.id);
    const walk = (nodes: DocumentCategory[]) =>
      nodes.forEach((n) => {
        if (isDescendant(tree, t.item.id, n.id)) blocked.add(n.id);
        if (n.children) walk(n.children);
      });
    walk(tree);
  }
  const same = targets.length > 0 && targets.every((t) => parentOf(t) === dest);
  const invalid = same || (dest !== null && blocked.has(dest));
  const label =
    targets.length > 1
      ? `${targets.length} mục đã chọn`
      : targets[0]
        ? 'title' in targets[0].item
          ? targets[0].item.title
          : targets[0].item.name
        : '';

  const move = async () => {
    setBusy(true);
    try {
      await Promise.all(
        targets.map((t) => {
          if (t.type === 'folder') return updateDocumentCategory(t.item.id, { parentId: dest });
          const d = t.item as DocumentItem;
          return updateDocument(d.id, { title: d.title, documentType: d.documentType, status: d.status, shareScope: d.shareScope, categoryId: dest });
        }),
      );
      toast.success(`Đã di chuyển ${label}`);
      invalidateDocumentQueries(qc);
      onClose();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Di chuyển">
      <div className="flex flex-col gap-4 p-rm-gutter">
        <p className="text-sm [overflow-wrap:anywhere]">
          Đang di chuyển: <strong>{label}</strong>
        </p>
        <FolderPicker value={dest} onChange={setDest} disabledIds={blocked} />
        {invalid && (
          <p role="alert" className="text-sm text-rm-danger">
            Vị trí này không hợp lệ (đang ở đó rồi hoặc là thư mục con của chính nó).
          </p>
        )}
        <button type="button" disabled={busy || invalid} onClick={move} className={BTN_PRIMARY}>
          {busy ? 'Đang chuyển…' : 'Di chuyển tới đây'}
        </button>
      </div>
    </Sheet>
  );
}

interface SaveProps {
  doc: DocumentItem | null;
  onClose: () => void;
}

// Lưu lối tắt của tài liệu được chia sẻ vào thư mục cá nhân.
export function SaveToFolderSheet({ doc, onClose }: SaveProps) {
  const qc = useQueryClient();
  const [dest, setDest] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const exists = !!doc && dest !== null && (doc.categoryId === dest || (doc.savedFolders ?? []).includes(dest));

  const save = async () => {
    if (!doc || dest === null) return;
    setBusy(true);
    try {
      await saveDocumentToFolder(doc.id, dest);
      toast.success('Đã lưu lối tắt vào thư mục cá nhân');
      invalidateDocumentQueries(qc);
      onClose();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={!!doc} onClose={onClose} title="Lưu vào thư mục cá nhân">
      <div className="flex flex-col gap-4 p-rm-gutter">
        <p className="text-sm [overflow-wrap:anywhere]">
          Tài liệu: <strong>{doc?.title}</strong>
        </p>
        <FolderPicker value={dest} onChange={setDest} mineOnly />
        {dest === null && <p className="text-sm text-rm-muted">Chọn một thư mục cá nhân làm đích.</p>}
        {exists && (
          <p role="alert" className="text-sm text-rm-danger">
            Tài liệu đã có trong thư mục này.
          </p>
        )}
        <button type="button" disabled={busy || dest === null || exists} onClick={save} className={BTN_PRIMARY}>
          {busy ? 'Đang lưu…' : 'Lưu lối tắt'}
        </button>
      </div>
    </Sheet>
  );
}
