'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Paperclip, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createSuggestion, updateSuggestion } from '@/actions';
import { Checkbox, Input, Textarea } from '@/components';
import { Select } from '@/components-remake';
import type { Suggestion, SuggestionType } from '@/types';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { TYPES } from './format';

export const SUGGESTION_FORM_ID = 'suggestion-form';

const MAX_FILE = 20 * 1024 * 1024;
const FILE_RE = /\.(jpe?g|png|webp|pdf|docx?|xlsx?)$/i;

interface Props {
  /** Có = sửa; không có = gửi đề xuất mới */
  initial?: Suggestion;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

const nameOf = (path: string) => path.split('/').pop() || 'Tệp đính kèm';

// Gửi hoặc sửa đề xuất. API thay toàn bộ tệp khi sửa, nên tệp cũ còn giữ được tải lại thành File trước khi gửi.
export function SuggestionForm({ initial, onDone, onPendingChange }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState(initial?.type ?? 'other');
  const [content, setContent] = useState(initial?.content ?? '');
  const [anonymous, setAnonymous] = useState(false);
  const [kept, setKept] = useState(initial?.attachments ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const save = useMutation({
    mutationFn: async () => {
      const data = { title: title.trim(), content: content.trim(), type: type as SuggestionType };
      if (!initial) {
        await createSuggestion({ ...data, anonymous }, files);
        return;
      }
      const old = await Promise.all(
        kept.map(async (a) => {
          const blob = await (await fetch(getFileUrl(a.path))).blob();
          return new File([blob], nameOf(a.path), { type: blob.type });
        }),
      );
      await updateSuggestion(initial.id, data, [...old, ...files]);
    },
    onSuccess: () => {
      ['suggestions', 'suggestions-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(initial ? 'Cập nhật đề xuất thành công' : 'Gửi đề xuất thành công');
      onDone();
    },
    onError: (e) => showErrorToast(e, initial ? 'Không thể cập nhật đề xuất' : 'Không thể gửi đề xuất'),
  });

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const ok = picked.filter((f) => {
      if (!FILE_RE.test(f.name)) toast.error(`"${f.name}" không hợp lệ: chỉ nhận ảnh, PDF, Word, Excel`);
      else if (f.size > MAX_FILE) toast.error(`"${f.name}" vượt quá 20MB`);
      else return true;
      return false;
    });
    setFiles((cur) => [...cur, ...ok]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Vui lòng nhập chủ đề đề xuất';
    if (!content.trim()) next.content = 'Vui lòng nhập nội dung đề xuất';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  const chips = [
    ...kept.map((a) => ({ key: `old-${a.id}`, name: nameOf(a.path), remove: () => setKept((k) => k.filter((x) => x.id !== a.id)) })),
    ...files.map((f, i) => ({ key: `new-${i}`, name: f.name, remove: () => setFiles((cur) => cur.filter((_, j) => j !== i)) })),
  ];

  return (
    <form id={SUGGESTION_FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Chủ đề *"
        placeholder="Ví dụ: Cải tạo khu pantry"
        fullWidth
        value={title}
        error={errors.title}
        onChange={(e) => {
          setTitle(e.target.value);
          touch('title');
        }}
      />
      <Select label="Loại đề xuất" value={type} options={TYPES} onChange={setType} />
      <Textarea
        label="Nội dung *"
        placeholder="Mô tả vấn đề và đề xuất của bạn"
        rows={5}
        fullWidth
        value={content}
        error={errors.content}
        onChange={(e) => {
          setContent(e.target.value);
          touch('content');
        }}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-500">Tệp đính kèm</span>
        {chips.map((c) => (
          <div key={c.key} className="flex min-h-11 items-center gap-2 rounded-control bg-slate-100 px-3 text-sm">
            <Paperclip size={16} className="flex-none text-slate-500" />
            <span className="min-w-0 flex-1 truncate">{c.name}</span>
            <button
              type="button"
              aria-label={`Bỏ ${c.name}`}
              onClick={c.remove}
              className="flex size-11 flex-none cursor-pointer items-center justify-center text-slate-500 md:size-9"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-dashed border-slate-300 px-3 text-sm text-slate-500 active:bg-slate-50 md:hover:bg-slate-50">
          <Paperclip size={16} />
          Chọn ảnh hoặc tài liệu (tối đa 20MB mỗi tệp)
          <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="sr-only" onChange={pickFiles} />
        </label>
      </div>
      {!initial && <Checkbox label="Gửi ẩn danh" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />}
    </form>
  );
}
