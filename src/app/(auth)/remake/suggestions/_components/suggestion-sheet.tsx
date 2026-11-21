'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createSuggestion, deleteSuggestion, reviewSuggestion, updateSuggestion } from '@/actions';
import { useCan } from '@/hooks';
import { SuggestionType, type Suggestion } from '@/types';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { getFileUrl } from '@/utils';
import { Paperclip } from 'lucide-react';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

export const TYPES = [
  { value: 'process', label: 'Quy trình' },
  { value: 'product', label: 'Sản phẩm' },
  { value: 'technology', label: 'Công nghệ' },
  { value: 'cost', label: 'Chi phí' },
  { value: 'quality', label: 'Chất lượng' },
  { value: 'safety', label: 'An toàn' },
  { value: 'workplace', label: 'Môi trường làm việc' },
  { value: 'welfare', label: 'Phúc lợi' },
  { value: 'training', label: 'Đào tạo' },
  { value: 'customer', label: 'Khách hàng' },
  { value: 'complaint', label: 'Phản ánh' },
  { value: 'other', label: 'Khác' },
];
const AREA =
  'w-full rounded-rm border border-rm-line bg-rm-surface p-3 text-base text-rm-text outline-none focus-visible:border-rm-primary md:text-sm';

// Gửi / sửa / xoá sáng kiến của mình (khi còn chờ duyệt); người có quyền duyệt thì Duyệt hoặc Từ chối.
export function SuggestionSheet({ target, onClose }: { target: Suggestion | 'new' | null; onClose: () => void }) {
  const { can, me } = useCan();
  const qc = useQueryClient();
  const s = target && target !== 'new' ? target : null;
  const [type, setType] = useState(s?.type ?? 'process');
  const [title, setTitle] = useState(s?.title ?? '');
  const [content, setContent] = useState(s?.content ?? '');
  const [anonymous, setAnonymous] = useState(s?.anonymous ?? false);
  const [note, setNote] = useState(s?.review ?? '');
  const [files, setFiles] = useState<File[]>([]);
  const mine = !s || s.userId === me?.user.id;
  const editable = mine && (!s || (s.status === 'pending' && can('suggestion:update'))) && (!!s || can('suggestion:create'));

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['suggestions'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = { title: title.trim(), content: content.trim(), anonymous, type: type as SuggestionType };
      return s ? updateSuggestion(s.id, body, files) : createSuggestion(body, files);
    },
    onSuccess: () => done(s ? 'Đã lưu sáng kiến' : 'Đã gửi sáng kiến'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteSuggestion(s!.id), onSuccess: () => done('Đã xoá sáng kiến'), onError: fail });
  const review = useMutation({
    mutationFn: (status: 'approve' | 'reject') => reviewSuggestion(s!.id, { status, review: note.trim() }),
    onSuccess: () => done('Đã phản hồi sáng kiến'),
    onError: fail,
  });
  const canReview = !!s && s.status === 'pending' && can('suggestion:review');
  // Vì sao không sửa được: nói rõ thay vì để các ô bị khoá không lời giải thích
  const lockReason =
    !s || editable
      ? ''
      : s.status !== 'pending'
        ? `Sáng kiến đã ${s.status === 'approve' ? 'được duyệt' : 'bị từ chối'}, không thể sửa.`
        : !mine
          ? 'Bạn chỉ xem được sáng kiến này.'
          : 'Bạn không có quyền sửa sáng kiến.';

  return (
    <Sheet open={!!target} onClose={onClose} title={s ? 'Sáng kiến' : 'Gửi sáng kiến'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {lockReason && <p className="rounded-rm bg-rm-bg px-3 py-2 text-xs text-rm-muted">{lockReason}</p>}
        <Field label="Nhóm" id="sg-type">
          <Select id="sg-type" label="Nhóm" value={type} onChange={setType} options={TYPES} disabled={!editable} />
        </Field>
        <Field label="Tiêu đề" id="sg-title">
          <input id="sg-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!editable} maxLength={255} className={INPUT} />
        </Field>
        <Field label="Nội dung" id="sg-content">
          <textarea id="sg-content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} disabled={!editable} className={AREA} />
        </Field>
        {(s?.attachments?.length ?? 0) > 0 && (
          <ul className="flex flex-col gap-1 text-sm">
            {s!.attachments.map((a) => (
              <li key={a.id}>
                <a href={getFileUrl(a.path)} target="_blank" rel="noreferrer" className="flex min-h-rm-tap items-center gap-2 text-rm-primary">
                  <Paperclip size={16} className="flex-none" aria-hidden="true" />
                  <span className="min-w-0 truncate">{a.path.split('/').pop()}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {editable && (
          <div>
            <label htmlFor="sg-files" className="flex min-h-rm-tap cursor-pointer items-center gap-2 text-sm text-rm-primary">
              <Paperclip size={16} className="flex-none" aria-hidden="true" />
              {files.length ? `${files.length} tệp mới: ${files.map((f) => f.name).join(', ')}` : 'Đính kèm ảnh hoặc tệp'}
            </label>
            <input id="sg-files" type="file" multiple className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          </div>
        )}
        {mine && (
          <label className="flex min-h-rm-tap items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              disabled={!editable}
              className="size-5 accent-[var(--rm-primary)]"
            />
            Gửi ẩn danh
          </label>
        )}
        {editable && (
          <button type="submit" disabled={save.isPending || !title.trim() || !content.trim()} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : s ? 'Lưu' : 'Gửi sáng kiến'}
          </button>
        )}
      </form>

      {s && !canReview && s.review && (
        <p className="mx-rm-gutter mb-4 rounded-rm bg-rm-bg p-3 text-sm [overflow-wrap:anywhere]">
          <span className="block text-xs text-rm-muted">Phản hồi</span>
          {s.review}
        </p>
      )}

      {canReview && (
        <div className="flex flex-col gap-3 border-t border-rm-line p-rm-gutter">
          <Field label="Phản hồi" id="sg-note">
            <textarea id="sg-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={AREA} />
          </Field>
          {!note.trim() && <p className="-mt-1 text-xs text-rm-muted">Nhập phản hồi để Duyệt hoặc Từ chối.</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={review.isPending || !note.trim()}
              onClick={() => review.mutate('reject')}
              className={`${BTN_LINE} flex-1`}
            >
              Từ chối
            </button>
            <button
              type="button"
              disabled={review.isPending || !note.trim()}
              onClick={() => review.mutate('approve')}
              className={`${BTN_PRIMARY} flex-1`}
            >
              Duyệt
            </button>
          </div>
        </div>
      )}

      {s && mine && s.status === 'pending' && can('suggestion:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm('Xoá sáng kiến này? Không thể hoàn tác.') && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá sáng kiến
          </button>
        </div>
      )}
    </Sheet>
  );
}
