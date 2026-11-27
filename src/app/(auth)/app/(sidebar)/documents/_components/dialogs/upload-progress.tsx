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
      className="fixed inset-x-4 bottom-6 z-30 overflow-hidden rounded-block border border-slate-200 bg-white shadow-lg md:inset-x-auto md:bottom-6 md:right-6 md:w-96"
    >
      <header className="flex items-center gap-1 pl-3">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {running ? 'Đang xử lý' : 'Hoàn tất'} {doneN}/{items.length} tệp
        </p>
        <button
          type="button"
          aria-label={min ? 'Mở rộng' : 'Thu gọn'}
          onClick={() => setMin(!min)}
          className="flex size-11 items-center justify-center text-slate-500"
        >
          {min ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <button
          type="button"
          aria-label="Đóng"
          disabled={running}
          onClick={onClose}
          className="flex size-11 items-center justify-center text-slate-500 disabled:opacity-30"
        >
          <X size={18} />
        </button>
      </header>
      {!min && (
        <ul className="max-h-64 divide-y divide-slate-200 overflow-y-auto border-t border-slate-200">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-3 py-2">
              <FileText size={18} className="flex-none text-slate-500" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{i.title}</span>
                {ACTIVE.includes(i.status) ? (
                  <span
                    className="mt-1 block h-1 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                    aria-valuenow={Math.round(i.progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span className="block h-full bg-primary" style={{ width: `${i.progress}%` }} />
                  </span>
                ) : (
                  <span className={`block truncate text-xs ${i.status === 'error' ? 'text-red-600' : 'text-slate-500'}`}>
                    {i.status === 'success' ? size(i.size) : i.status === 'cancelled' ? 'Đã huỷ' : (i.errorMessage ?? 'Lỗi')}
                  </span>
                )}
              </span>
              {ACTIVE.includes(i.status) && <Loader2 size={16} className="flex-none animate-spin text-primary" aria-hidden="true" />}
              {i.status === 'success' && <CheckCircle2 size={18} className="flex-none text-green-600" aria-label="Xong" />}
              {i.status === 'error' && <AlertCircle size={18} className="flex-none text-red-600" aria-label="Lỗi" />}
              {i.status === 'error' && (
                <button
                  type="button"
                  aria-label={`Thử lại ${i.title}`}
                  onClick={() => onRetry(i.id)}
                  className="flex size-11 flex-none items-center justify-center text-primary"
                >
                  <RotateCcw size={18} />
                </button>
              )}
              {ACTIVE.includes(i.status) && (
                <button
                  type="button"
                  aria-label={`Huỷ ${i.title}`}
                  onClick={() => onCancel(i.id)}
                  className="flex size-11 flex-none items-center justify-center text-slate-500"
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
