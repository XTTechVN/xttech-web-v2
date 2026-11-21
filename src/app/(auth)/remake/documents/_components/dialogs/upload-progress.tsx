'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Loader2, RotateCcw, X } from 'lucide-react';
import type { QueueUploadItem } from '@/components/documents/upload-progress-drawer';

interface Props {
  items: QueueUploadItem[];
  open: boolean;
  onClose: () => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}

const size = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const ACTIVE = ['pending', 'uploading', 'compressing'];

// Tiến trình tải lên / tải xuống: thanh nổi phía trên thanh tab dưới, thu gọn được; thử lại hoặc huỷ từng tệp.
export function UploadProgress({ items, open, onClose, onRetry, onCancel }: Props) {
  const [min, setMin] = useState(false);
  if (!open || items.length === 0) return null;
  const doneN = items.filter((i) => i.status === 'success').length;
  const running = items.some((i) => ACTIVE.includes(i.status));

  return (
    <section
      aria-label="Tiến trình tải tệp"
      className="fixed inset-x-rm-gutter bottom-[calc(var(--spacing-rm-nav)+env(safe-area-inset-bottom)+1.5rem)] z-30 overflow-hidden rounded-rm-xl border border-rm-line bg-rm-surface shadow-rm-pop md:inset-x-auto md:bottom-6 md:right-6 md:w-96"
    >
      <header className="flex items-center gap-1 pl-3">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {running ? 'Đang xử lý' : 'Hoàn tất'} {doneN}/{items.length} tệp
        </p>
        <button
          type="button"
          aria-label={min ? 'Mở rộng' : 'Thu gọn'}
          onClick={() => setMin(!min)}
          className="flex size-11 items-center justify-center text-rm-muted"
        >
          {min ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <button
          type="button"
          aria-label="Đóng"
          disabled={running}
          onClick={onClose}
          className="flex size-11 items-center justify-center text-rm-muted disabled:opacity-30"
        >
          <X size={18} />
        </button>
      </header>
      {!min && (
        <ul className="max-h-64 divide-y divide-rm-line overflow-y-auto border-t border-rm-line">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-3 py-2">
              <FileText size={18} className="flex-none text-rm-muted" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{i.title}</span>
                {ACTIVE.includes(i.status) ? (
                  <span
                    className="mt-1 block h-1 overflow-hidden rounded-full bg-rm-line"
                    role="progressbar"
                    aria-valuenow={Math.round(i.progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span className="block h-full bg-rm-primary" style={{ width: `${i.progress}%` }} />
                  </span>
                ) : (
                  <span className={`block truncate text-xs ${i.status === 'error' ? 'text-rm-danger' : 'text-rm-muted'}`}>
                    {i.status === 'success' ? size(i.size) : i.status === 'cancelled' ? 'Đã huỷ' : (i.errorMessage ?? 'Lỗi')}
                  </span>
                )}
              </span>
              {ACTIVE.includes(i.status) && <Loader2 size={16} className="flex-none animate-spin text-rm-primary" aria-hidden="true" />}
              {i.status === 'success' && <CheckCircle2 size={18} className="flex-none text-rm-success" aria-label="Xong" />}
              {i.status === 'error' && <AlertCircle size={18} className="flex-none text-rm-danger" aria-label="Lỗi" />}
              {i.status === 'error' && (
                <button
                  type="button"
                  aria-label={`Thử lại ${i.title}`}
                  onClick={() => onRetry(i.id)}
                  className="flex size-11 flex-none items-center justify-center text-rm-primary"
                >
                  <RotateCcw size={18} />
                </button>
              )}
              {ACTIVE.includes(i.status) && (
                <button
                  type="button"
                  aria-label={`Huỷ ${i.title}`}
                  onClick={() => onCancel(i.id)}
                  className="flex size-11 flex-none items-center justify-center text-rm-muted"
                >
                  <X size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
