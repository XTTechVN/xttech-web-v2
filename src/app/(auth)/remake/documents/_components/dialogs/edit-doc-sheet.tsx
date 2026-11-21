'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateDocument } from '@/actions';
import { DOCUMENT_TYPE_MAP, PERSONAL_DOC_TYPES, type DocumentItem } from '@/types';
import { invalidateDocumentQueries } from '@/utils';
import { BTN_PRIMARY, Field, INPUT, messageOf } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { Sheet } from '../../../_components/sheet';

// Sửa thông tin tài liệu cá nhân: tiêu đề, phân loại, mã, trích yếu.
export function EditDocSheet({ doc, onClose }: { doc: DocumentItem | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(doc?.title ?? '');
  const [type, setType] = useState(doc?.documentType ?? 'work_report');
  const [code, setCode] = useState(doc?.code ?? '');
  const [summary, setSummary] = useState(doc?.summary ?? '');
  const types = [...(doc && !PERSONAL_DOC_TYPES.includes(doc.documentType) ? [doc.documentType] : []), ...PERSONAL_DOC_TYPES].map((k) => ({
    value: k,
    label: DOCUMENT_TYPE_MAP[k]?.label ?? k,
  }));
  const save = useMutation({
    mutationFn: () =>
      updateDocument(doc!.id, {
        title: title.trim(),
        documentType: type,
        ...(code.trim() ? { code: code.trim().toUpperCase() } : {}),
        summary: summary.trim() || null,
      } as Partial<DocumentItem>),
    onSuccess: () => {
      invalidateDocumentQueries(qc);
      toast.success('Đã cập nhật tài liệu');
      onClose();
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={!!doc} onClose={onClose} title="Sửa tài liệu">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tiêu đề" id="ed-title">
          <input id="ed-title" value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Phân loại" id="ed-type">
          <Select id="ed-type" label="Phân loại" value={type} onChange={setType} options={types} />
        </Field>
        <Field label="Mã tài liệu (tuỳ chọn)" id="ed-code">
          <input id="ed-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={INPUT} />
        </Field>
        <Field label="Trích yếu" id="ed-sum">
          <textarea
            id="ed-sum"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-rm border border-rm-line bg-rm-surface p-3 text-base outline-none focus-visible:border-rm-primary md:text-sm"
          />
        </Field>
        <button type="submit" disabled={save.isPending || !title.trim()} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
      </form>
    </Sheet>
  );
}
