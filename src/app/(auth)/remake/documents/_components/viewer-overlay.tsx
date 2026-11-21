'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Download, ExternalLink, Printer } from 'lucide-react';
import { markDocumentAsRead } from '@/actions';
import type { DocumentItem } from '@/types';
import { getFileUrl } from '@/utils';
import { FileViewer } from './file-viewer';

const ICON_BTN = 'flex size-11 flex-none items-center justify-center rounded-full text-rm-muted active:bg-rm-line md:hover:bg-rm-line';
const size = (n?: number) => (n ? (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`) : '');

// Xem tài liệu toàn màn hình như Google Drive: thanh trên (quay lại, tên, in, tải, mở tab mới) + nội dung tệp.
export function ViewerOverlay({ doc, onClose, onDetail }: { doc: DocumentItem | null; onClose: () => void; onDetail: () => void }) {
  const id = doc?.id;
  const unread = doc?.isRead === false;
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [id, onClose]);
  useEffect(() => {
    if (id && unread) markDocumentAsRead(id).catch(() => {});
  }, [id, unread]);

  if (!doc) return null;
  const v = doc.currentVersion;
  const url = getFileUrl(v?.downloadUrl ?? v?.fileUrl ?? v?.filePath);

  const print = () => {
    const w = window.open(url, '_blank');
    w?.focus();
    w?.print();
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={doc.title} className="fixed inset-0 z-50 flex flex-col bg-rm-bg font-body text-rm-text">
      <header className="flex h-14 flex-none items-center gap-1 border-b border-rm-line bg-rm-surface pr-1 pl-1">
        <button type="button" onClick={onClose} aria-label="Đóng" className={ICON_BTN}>
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1 px-1">
          <h1 className="truncate text-sm font-medium">{doc.title}</h1>
          {v && (
            <p className="truncate text-xs text-rm-muted">
              {v.fileName}
              {size(v.fileSize) && ` · ${size(v.fileSize)}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDetail}
          className="h-9 flex-none rounded-rm px-3 text-sm text-rm-primary active:bg-rm-primary-soft md:hover:bg-rm-primary-soft"
        >
          Chi tiết
        </button>
        {url && (
          <>
            <span className="hidden md:contents">
              <button type="button" onClick={print} aria-label="In" className={ICON_BTN}>
                <Printer size={18} />
              </button>
              <a href={url} target="_blank" rel="noreferrer" aria-label="Mở trong tab mới" className={ICON_BTN}>
                <ExternalLink size={18} />
              </a>
            </span>
            <a href={url} download aria-label="Tải xuống" className={ICON_BTN}>
              <Download size={18} />
            </a>
          </>
        )}
      </header>
      <main className="min-h-0 flex-1 overflow-auto">
        {v && url ? (
          <div className="h-full bg-rm-surface">
            <FileViewer key={v.id} url={url} fileName={v.fileName} mimeType={v.mimeType} fill />
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-rm-muted">Tài liệu chưa có tệp đính kèm.</p>
        )}
      </main>
    </div>,
    document.body,
  );
}
