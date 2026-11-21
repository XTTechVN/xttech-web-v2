'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { uploadProgressEvidence } from '@/actions';
import { BASE_MINIO_URL } from '@/config';
import type { EvidenceMediaItem } from '@/types';
import { BTN_LINE, messageOf } from '../../_components/form';

export const mediaUrl = (u: string) => (u.startsWith('http') ? u : `${BASE_MINIO_URL}/${u.replace(/^\//, '')}`);
export const isVideo = (m: { url: string; type?: string }) => m.type === 'video' || /\.(mp4|webm|mov|avi)$/i.test(m.url.split('?')[0]);

// Chụp hoặc chọn ảnh / video minh chứng, tải lên kho và trả danh sách đường dẫn.
export function EvidenceUploader({
  projectId,
  value,
  onChange,
  label = 'Ảnh / video thực tế',
  required,
}: {
  projectId: number;
  value: EvidenceMediaItem[];
  onChange: (v: EvidenceMediaItem[]) => void;
  label?: string;
  required?: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const r = await Promise.all(Array.from(files).map((f) => uploadProgressEvidence(projectId, f)));
      onChange([...value, ...r.map((x) => ({ url: x.url, name: x.name, type: x.type }))]);
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
      if (file.current) file.current.value = '';
    }
  };
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 text-sm font-medium">
          {label}
          {required && <span className="text-rm-danger"> *</span>}
        </span>
        <input
          ref={file}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          multiple
          className="sr-only"
          aria-label={label}
          onChange={(e) => pick(e.target.files)}
        />
        <button type="button" disabled={busy} onClick={() => file.current?.click()} className={`${BTN_LINE} flex-none px-4`}>
          {busy ? 'Đang tải…' : 'Chụp / chọn'}
        </button>
      </div>
      {value.length === 0 ? (
        <p className="mt-1 text-xs text-rm-muted">Chưa có tệp nào.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((m, i) => (
            <li key={`${m.url}-${i}`} className="relative size-16">
              {isVideo(m) ? (
                <span className="flex size-full items-center justify-center rounded-rm border border-rm-line bg-rm-bg text-xs text-rm-muted">
                  Video
                </span>
              ) : (
                <img src={mediaUrl(m.url)} alt={m.name ?? 'Minh chứng'} className="size-full rounded-rm border border-rm-line object-cover" />
              )}
              <button
                type="button"
                aria-label="Bỏ tệp"
                onClick={() => onChange(value.filter((_, k) => k !== i))}
                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-rm-danger text-xs text-white"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
