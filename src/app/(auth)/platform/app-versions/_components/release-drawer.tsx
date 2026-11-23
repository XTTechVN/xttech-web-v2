'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FileCheck, UploadCloud, X } from 'lucide-react';
import { createAppVersion } from '@/actions';
import { Drawer } from '../../_components/drawer';

const MAX_MB = 100;
const messageOf = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Không phát hành được, thử lại sau.');

// Phát hành bản mới: chọn file APK (số phiên bản đọc tự động từ file), ghi chú cập nhật, bắt buộc cập nhật hay không.
export function ReleaseDrawer({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [force, setForce] = useState(false);
  const [error, setError] = useState('');

  const pick = (f?: File) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.apk')) return setError('Chỉ nhận file cài đặt Android (.apk).');
    if (f.size > MAX_MB * 1024 * 1024) return setError(`File lớn hơn ${MAX_MB}MB.`);
    setError('');
    setFile(f);
  };

  const release = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append('file', file!);
      form.append('platform', 'android');
      form.append('force_update', String(force));
      const lines = note
        .split('\n')
        .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
      form.append('changelog', JSON.stringify(lines));
      return createAppVersion(form);
    },
    onSuccess: () => {
      toast.success('Đã phát hành phiên bản mới');
      qc.invalidateQueries({ queryKey: ['app-versions'] });
      onClose();
    },
    onError: (e) => setError(messageOf(e)),
  });

  return (
    <Drawer title="Phát hành phiên bản mới" subtitle="Ứng dụng di động Android" onClose={onClose}>
      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (file) release.mutate();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-900">File cài đặt (.apk)</span>
          <input
            ref={input}
            type="file"
            accept=".apk"
            className="sr-only"
            tabIndex={-1}
            aria-label="Chọn file APK"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {file ? (
            <div className="flex min-h-14 items-center gap-3 rounded-md border border-gray-200 px-3">
              <FileCheck size={20} className="flex-none text-emerald-600" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">{file.name}</span>
                <span className="block text-xs text-gray-500">{(file.size / 1048576).toFixed(1)} MB · số phiên bản đọc tự động từ file</span>
              </span>
              <button
                type="button"
                aria-label="Bỏ file đã chọn"
                onClick={() => {
                  setFile(null);
                  if (input.current) input.current.value = '';
                }}
                className="inline-flex size-11 flex-none items-center justify-center rounded-md text-gray-500 active:bg-gray-100"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(e.dataTransfer.files?.[0]);
              }}
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-3 text-sm text-gray-600 active:bg-gray-50"
            >
              <UploadCloud size={24} aria-hidden="true" />
              <span>Bấm để chọn file hoặc kéo thả vào đây</span>
              <span className="text-xs text-gray-500">Chỉ .apk, tối đa {MAX_MB}MB</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rel-note" className="text-sm font-medium text-gray-900">
            Nội dung cập nhật (mỗi dòng một ý)
          </label>
          <textarea
            id="rel-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder={'Nâng cấp định vị GPS\nSửa lỗi kết nối camera'}
            className="min-h-24 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
          />
        </div>

        <label className="flex min-h-14 items-center gap-3 rounded-md border border-gray-200 px-3">
          <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="size-5 flex-none accent-primary" />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-gray-900">Bắt buộc cập nhật</span>
            <span className="block text-xs text-gray-500">Nhân viên phải cập nhật bản này mới dùng tiếp được app.</span>
          </span>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!file || release.isPending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white active:scale-95 disabled:opacity-50"
        >
          {release.isPending ? 'Đang tải lên…' : 'Phát hành'}
        </button>
      </form>
    </Drawer>
  );
}
