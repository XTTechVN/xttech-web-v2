'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createDocumentCategory, updateDocumentCategory } from '@/actions';
import type { DocumentCategory } from '@/types';
import { invalidateDocumentQueries } from '@/utils';
import { BTN_PRIMARY, Field, INPUT, messageOf } from '../form';
import { Sheet } from '../sheet';

interface Props {
  open: boolean;
  onClose: () => void;
  /** có = sửa; không = tạo mới */
  folder: DocumentCategory | null;
  parentId: number | null;
  siblings: DocumentCategory[];
}

// Tạo / sửa thư mục: tên (cảnh báo trùng), mã (chỉ khi tạo), mô tả.
export function FolderSheet({ open, onClose, folder, parentId, siblings }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState(folder?.name ?? 'Thư mục mới');
  const [code, setCode] = useState(folder?.code ?? '');
  const [desc, setDesc] = useState(folder?.description ?? '');
  const dup = name.trim() !== '' && siblings.some((f) => f.id !== folder?.id && f.name.trim().toLowerCase() === name.trim().toLowerCase());
  const save = useMutation({
    mutationFn: () =>
      folder
        ? updateDocumentCategory(folder.id, { name: name.trim(), description: desc.trim() || undefined })
        : createDocumentCategory({
            name: name.trim(),
            code: code.trim() ? code.trim().toUpperCase() : undefined,
            description: desc.trim() || undefined,
            parentId,
          }),
    onSuccess: () => {
      invalidateDocumentQueries(qc);
      toast.success(folder ? 'Đã cập nhật thư mục' : 'Đã tạo thư mục');
      onClose();
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={open} onClose={onClose} title={folder ? 'Sửa thư mục' : 'Tạo thư mục'}>
      <form
        className="flex flex-col gap-4 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tên thư mục" id="fd-name">
          <input
            id="fd-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.select()}
            aria-describedby={dup ? 'fd-dup' : undefined}
            className={INPUT}
          />
          {dup && (
            <span id="fd-dup" role="status" className="text-sm text-amber-700">
              Tên này đã có trong thư mục hiện tại
            </span>
          )}
        </Field>
        {!folder && (
          <Field label="Mã thư mục (tuỳ chọn)" id="fd-code">
            <input id="fd-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={INPUT} />
            <span className="text-xs text-slate-500">Viết hoa, không dấu. Để trống để hệ thống tự sinh.</span>
          </Field>
        )}
        <Field label="Mô tả (tuỳ chọn)" id="fd-desc">
          <textarea
            id="fd-desc"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full rounded-control border border-slate-200 bg-white p-3 text-base outline-none focus-visible:border-primary md:text-sm"
          />
        </Field>
        <button type="submit" disabled={save.isPending || !name.trim()} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : folder ? 'Lưu thay đổi' : 'Tạo thư mục'}
        </button>
      </form>
    </Sheet>
  );
}
