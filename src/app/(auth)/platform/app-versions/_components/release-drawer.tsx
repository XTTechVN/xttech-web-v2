'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FileCheck, UploadCloud, X } from 'lucide-react';
import { Textarea } from '@/components';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { createAppVersion } from '@/actions';

const MAX_MB = 100;
const messageOf = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Không phát hành được, thử lại sau.');

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Phát hành bản mới: chọn file APK (số phiên bản đọc tự động từ file), ghi chú cập nhật, bắt buộc cập nhật hay không
export function ReleaseDrawer({ isOpen, onClose }: Props) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [force, setForce] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setFile(null);
    setNote('');
    setForce(false);
    setError('');
  };
  const close = () => {
    reset();
    onClose();
  };

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
      close();
    },
    onError: (e) => setError(messageOf(e)),
  });

  return (
    <Drawer isOpen={isOpen} onClose={close} label="Phát hành phiên bản mới">
      <DrawerHeader compact title="Phát hành phiên bản mới" onClose={close} />
      <DrawerBody>
        <form
          id="release-form"
          className="flex flex-col gap-4 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (file) release.mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">File cài đặt Android (.apk)</span>
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
              <div className="flex min-h-14 items-center gap-3 rounded-control border border-slate-200 px-3">
                <FileCheck size={20} className="flex-none text-green-700" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">{file.name}</span>
                  <span className="block text-xs text-slate-500">{(file.size / 1048576).toFixed(1)} MB · số phiên bản đọc tự động từ file</span>
                </span>
                <button
                  type="button"
                  aria-label="Bỏ file đã chọn"
                  onClick={() => {
                    setFile(null);
                    if (input.current) input.current.value = '';
                  }}
                  className="inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-500 active:bg-slate-100"
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
                className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-control border border-dashed border-slate-300 px-3 text-sm text-slate-600 active:bg-slate-50"
              >
                <UploadCloud size={24} aria-hidden="true" />
                <span>Bấm để chọn file hoặc kéo thả vào đây</span>
                <span className="text-xs text-slate-500">Chỉ .apk, tối đa {MAX_MB}MB</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rel-note" className="text-sm font-medium text-slate-700">
              Nội dung cập nhật (mỗi dòng một ý)
            </label>
            <Textarea
              id="rel-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder={'Nâng cấp định vị GPS\nSửa lỗi kết nối camera'}
            />
          </div>

          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-control border border-slate-200 px-3">
            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="size-5 flex-none accent-primary" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-900">Bắt buộc cập nhật</span>
              <span className="block text-xs text-slate-500">Nhân viên phải cập nhật bản này mới dùng tiếp được app.</span>
            </span>
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={release.isPending} onClick={close}>
            Hủy
          </Button>
          <Button type="submit" form="release-form" className="flex-1 md:flex-none" disabled={!file} loading={release.isPending}>
            Phát hành
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
