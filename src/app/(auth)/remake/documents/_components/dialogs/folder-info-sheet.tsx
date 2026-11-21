'use client';

import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { DocumentCategory } from '@/types';
import { Sheet } from '../../../_components/sheet';

const day = (s?: string) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');

// Thông tin thư mục (chỉ đọc): mã có nút sao chép, tên, mô tả, người tạo.
export function FolderInfoSheet({ folder, onClose }: { folder: DocumentCategory | null; onClose: () => void }) {
  const rows: [string, string][] = folder
    ? [
        ['Tên', folder.name],
        ['Mô tả', folder.description || 'Chưa có mô tả'],
        ['Người tạo', folder.createdByName ?? '–'],
        ['Ngày tạo', day(folder.createdAt)],
        ['Đã chia sẻ', String(folder.shareCount ?? folder.sharedWithCount ?? 0)],
      ]
    : [];
  return (
    <Sheet open={!!folder} onClose={onClose} title="Thông tin thư mục">
      {folder && (
        <div className="flex flex-col gap-4 p-rm-gutter">
          <div className="flex items-center gap-2 rounded-rm bg-rm-bg px-3">
            <span className="min-w-0 flex-1 truncate py-3 font-mono text-sm">{folder.code || '---'}</span>
            {folder.code && (
              <button
                type="button"
                aria-label="Sao chép mã thư mục"
                onClick={() => navigator.clipboard.writeText(folder.code).then(() => toast.success(`Đã sao chép mã ${folder.code}`))}
                className="flex size-11 flex-none items-center justify-center text-rm-muted active:bg-rm-line"
              >
                <Copy size={18} />
              </button>
            )}
          </div>
          <dl className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 px-3 py-2">
                <dt className="flex-none text-rm-muted">{k}</dt>
                <dd className="min-w-0 text-right [overflow-wrap:anywhere]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Sheet>
  );
}
