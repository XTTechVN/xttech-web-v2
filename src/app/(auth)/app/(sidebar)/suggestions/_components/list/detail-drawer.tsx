'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Paperclip, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewSuggestion } from '@/actions';
import { Textarea } from '@/components';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { Suggestion } from '@/types';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { SUGGESTION_FORM_ID, SuggestionForm } from './suggestion-form';
import { fmtDate, isImage, senderName, statusOf, typeOf } from './format';

interface Props {
  suggestion: Suggestion | null;
  showUser: boolean;
  /** Được sửa đơn này (chủ đề xuất hoặc người quản lý) */
  canEdit: (s: Suggestion) => boolean;
  canDelete: (s: Suggestion) => boolean;
  canReview: (s: Suggestion) => boolean;
  onClose: () => void;
  onDelete: (s: Suggestion) => void;
}

type Review = 'approve' | 'reject';

// Xem nhanh một đề xuất; Sửa và Duyệt/Từ chối diễn ra ngay trong drawer này
export function SuggestionDrawer({ suggestion: s, showUser, canEdit, canDelete, canReview, onClose, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [note, setNote] = useState('');

  const close = () => {
    setEditing(false);
    setReview(null);
    setNote('');
    onClose();
  };

  const submit = useMutation({
    mutationFn: (status: Review) => reviewSuggestion(String(s?.id), { status, review: note.trim() }),
    onSuccess: (_, status) => {
      ['suggestions', 'suggestions-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(status === 'approve' ? 'Đã duyệt đề xuất' : 'Đã từ chối đề xuất');
      close();
    },
    onError: (e) => showErrorToast(e, 'Không thể xử lý đề xuất'),
  });

  const send = () => {
    if (!note.trim()) return void toast.error('Vui lòng nhập nội dung phản hồi');
    if (review) submit.mutate(review);
  };

  const isPending = s?.status === 'pending';
  const edit = !!s && isPending && canEdit(s);
  const del = !!s && isPending && canDelete(s);
  const status = s && statusOf(s.status);

  return (
    <Drawer isOpen={!!s} onClose={close} label="Chi tiết đề xuất" width={480}>
      {s && status && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa đề xuất' : review ? (review === 'approve' ? 'Duyệt đề xuất' : 'Từ chối đề xuất') : 'Đề xuất'}
            onClose={close}
            actions={
              !editing &&
              !review && (
                <>
                  {edit && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {del && (
                    <IconAction label="Xóa" danger onClick={() => onDelete(s)}>
                      <Trash2 size={16} />
                    </IconAction>
                  )}
                </>
              )
            }
          />
          <DrawerBody>
            <div className="pt-4">
              {editing ? (
                <SuggestionForm key={s.id} initial={s} onDone={close} onPendingChange={setPending} />
              ) : review ? (
                <Textarea
                  label="Nội dung phản hồi *"
                  placeholder={
                    review === 'approve' ? 'Ví dụ: Đề xuất hữu ích, triển khai từ tuần sau' : 'Ví dụ: Chưa phù hợp với định hướng hiện tại'
                  }
                  rows={4}
                  fullWidth
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              ) : (
                <>
                  <h3 className="mb-4 text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{s.title}</h3>
                  <DrawerSection title="Thông tin">
                    <InfoRow label="Trạng thái">
                      <Tag tone={status.tone}>{status.label}</Tag>
                    </InfoRow>
                    <InfoRow label="Loại">{typeOf(s.type).label}</InfoRow>
                    {showUser && <InfoRow label="Người gửi">{senderName(s)}</InfoRow>}
                    <InfoRow label="Ngày gửi">{fmtDate(s.createdAt)}</InfoRow>
                  </DrawerSection>
                  <DrawerSection title="Nội dung">
                    <p className="whitespace-pre-line text-sm text-slate-900 [overflow-wrap:anywhere]">{s.content}</p>
                  </DrawerSection>
                  {s.attachments?.length > 0 && (
                    <DrawerSection title="Đính kèm" hint={String(s.attachments.length)}>
                      <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                        {s.attachments.map((a) => {
                          const url = getFileUrl(a.path);
                          return (
                            <li key={a.id} className="min-w-0">
                              {isImage(a.path) ? (
                                <a href={url} target="_blank" rel="noreferrer">
                                  <img
                                    src={url}
                                    alt="Ảnh đính kèm"
                                    className="aspect-video w-full rounded-control border border-slate-200/80 object-cover"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex min-h-11 items-center gap-2 rounded-control bg-slate-100 px-3 text-sm text-primary"
                                >
                                  <Paperclip size={14} className="flex-none" />
                                  <span className="min-w-0 truncate">{a.path.split('/').pop()}</span>
                                </a>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </DrawerSection>
                  )}
                  {s.review && (
                    <DrawerSection title="Phản hồi">
                      {s.reviewBy && <InfoRow label="Người duyệt">{s.reviewBy.fullName || s.reviewBy.username}</InfoRow>}
                      <InfoRow label="Nội dung">{s.review}</InfoRow>
                    </DrawerSection>
                  )}
                </>
              )}
            </div>
          </DrawerBody>
          {(editing || review || (!!s && canReview(s) && isPending)) && (
            <DrawerFooter>
              <div className="flex justify-end gap-2">
                {editing || review ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 md:flex-none"
                      disabled={pending || submit.isPending}
                      onClick={() => (editing ? setEditing(false) : setReview(null))}
                    >
                      Hủy
                    </Button>
                    {editing ? (
                      <Button type="submit" form={SUGGESTION_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                        Lưu
                      </Button>
                    ) : (
                      <Button className="flex-1 md:flex-none" loading={submit.isPending} onClick={send}>
                        Gửi phản hồi
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setReview('reject')}>
                      Từ chối
                    </Button>
                    <Button className="flex-1 md:flex-none" onClick={() => setReview('approve')}>
                      Duyệt
                    </Button>
                  </>
                )}
              </div>
            </DrawerFooter>
          )}
        </>
      )}
    </Drawer>
  );
}
