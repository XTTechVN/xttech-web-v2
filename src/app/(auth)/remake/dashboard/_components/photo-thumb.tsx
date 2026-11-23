'use client';

import { useRef } from 'react';
import { ImageOff, X } from 'lucide-react';
import { getFileUrl } from '@/utils';

// Ảnh nhỏ vuông (cắt giữa); bấm để xem lớn trong hộp thoại gốc (Esc / bấm nền để đóng).
export function PhotoThumb({ src, alt, empty }: { src?: string | null; alt: string; empty?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  if (!src) {
    return (
      <span
        role={empty ? undefined : 'status'}
        aria-label={empty ? undefined : 'Chưa có'}
        className="flex size-12 flex-none items-center justify-center overflow-hidden rounded-rm-sm bg-white/20 text-white/60"
      >
        {empty ? <ImageOff size={18} aria-hidden="true" /> : <span className="size-full animate-pulse bg-white/20" />}
        {empty && <span className="sr-only">Không có ảnh</span>}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={`Xem lớn: ${alt}`}
        className="size-12 flex-none overflow-hidden rounded-rm-sm bg-white/20 transition-transform active:scale-95"
      >
        <img src={getFileUrl(src)} alt="" className="size-full object-cover object-center" />
      </button>
      <dialog
        ref={ref}
        aria-label={alt}
        onClick={(e) => e.target === ref.current && ref.current.close()}
        className="m-auto max-h-[90dvh] w-[min(90vw,32rem)] overflow-hidden rounded-rm-xl bg-rm-surface p-0 backdrop:bg-black/60"
      >
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Đóng"
          className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full bg-black/50 text-white active:scale-95"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <img src={getFileUrl(src)} alt={alt} className="block max-h-[90dvh] w-full object-contain" />
      </dialog>
    </>
  );
}
