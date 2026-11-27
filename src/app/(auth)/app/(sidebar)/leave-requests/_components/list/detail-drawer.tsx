'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Paperclip, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewLeaveRequest } from '@/actions';
import { Textarea } from '@/components';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { useCan } from '@/hooks';
import type { LeaveRequest } from '@/types';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { LEAVE_FORM_ID, LeaveForm } from './leave-form';
import { DURATIONS, LEAVE_TYPES, daysText, fmtDate, fmtRange, isPending, labelOf, personName, statusOf } from './format';

interface Props {
  request: LeaveRequest | null;
  showUser: boolean;
  shiftName: (id: string | null) => string;
  onClose: () => void;
  onDelete: (r: LeaveRequest) => void;
}

type Review = 'approved' | 'rejected';

// Xem nhanh một đơn nghỉ phép; Sửa và Duyệt/Từ chối diễn ra ngay trong drawer này
export function LeaveDrawer({ request: r, showUser, shiftName, onClose, onDelete }: Props) {
  const { can } = useCan();
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
    mutationFn: (status: Review) => reviewLeaveRequest(String(r?.id), { status, reviewNote: note.trim() }),
    onSuccess: (_, status) => {
      ['leave-requests', 'leave-requests-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(status === 'approved' ? 'Đã duyệt đơn nghỉ phép' : 'Đã từ chối đơn nghỉ phép');
      close();
    },
    onError: (e) => showErrorToast(e, 'Không thể xử lý đơn nghỉ phép'),
  });

  const send = () => {
    if (review === 'rejected' && !note.trim()) return void toast.error('Vui lòng nhập lý do từ chối');
    if (review) submit.mutate(review);
  };

  const canEdit = !!r && isPending(r) && !!r._can?.update;
  const canDelete = !!r && !!r._can?.delete && (isPending(r) || r.status === 'cancelled');
  const canReview = !!r && isPending(r) && !!r._can?.review && can('leave_request:review');
  const status = r && statusOf(r.status);

  return (
    <Drawer isOpen={!!r} onClose={close} label="Chi tiết đơn nghỉ phép" width={480}>
      {r && status && (
        <>
          <DrawerHeader
            compact
            title={
              editing
                ? 'Chỉnh sửa đơn nghỉ phép'
                : review
                  ? review === 'approved'
                    ? 'Duyệt đơn'
                    : 'Từ chối đơn'
                  : showUser
                    ? personName(r.user)
                    : 'Đơn nghỉ phép'
            }
            onClose={close}
            actions={
              !editing &&
              !review && (
                <>
                  {canEdit && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {canDelete && (
                    <IconAction label="Xóa" danger onClick={() => onDelete(r)}>
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
                <LeaveForm key={r.id} initial={r} onDone={close} onPendingChange={setPending} />
              ) : review ? (
                <Textarea
                  label={review === 'approved' ? 'Lý do duyệt (không bắt buộc)' : 'Lý do từ chối *'}
                  placeholder={review === 'approved' ? 'Ví dụ: Đã kiểm tra lịch, đồng ý' : 'Ví dụ: Trùng lịch dự án, đề nghị đổi ngày'}
                  rows={4}
                  fullWidth
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              ) : (
                <>
                  <DrawerSection title="Thông tin">
                    {showUser && <InfoRow label="Nhân sự">{personName(r.user)}</InfoRow>}
                    {showUser && r.user?.email && <InfoRow label="Email">{r.user.email}</InfoRow>}
                    <InfoRow label="Trạng thái">
                      <Tag tone={status.tone}>{status.label}</Tag>
                    </InfoRow>
                    <InfoRow label="Loại nghỉ">{labelOf(LEAVE_TYPES, r.leaveType)}</InfoRow>
                    <InfoRow label="Thời lượng">{labelOf(DURATIONS, r.durationType)}</InfoRow>
                    <InfoRow label="Thời gian">
                      <span className="tabular-nums">{fmtRange(r)}</span>
                    </InfoRow>
                    <InfoRow label="Số ngày">{daysText(r, shiftName)}</InfoRow>
                    <InfoRow label="Lý do">{r.reason}</InfoRow>
                    {r.attachmentPath && (
                      <InfoRow label="Đính kèm">
                        <a
                          href={getFileUrl(r.attachmentPath)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary"
                        >
                          <Paperclip size={14} />
                          Xem tệp
                        </a>
                      </InfoRow>
                    )}
                  </DrawerSection>
                  {r.reviewedAt && (
                    <DrawerSection title="Phản hồi">
                      <InfoRow label="Người duyệt">{personName(r.reviewer)}</InfoRow>
                      <InfoRow label="Ngày duyệt">{fmtDate(r.reviewedAt)}</InfoRow>
                      {r.reviewNote && <InfoRow label="Ghi chú">{r.reviewNote}</InfoRow>}
                    </DrawerSection>
                  )}
                </>
              )}
            </div>
          </DrawerBody>
          {(editing || review || canReview) && (
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
                      <Button type="submit" form={LEAVE_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
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
                    <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setReview('rejected')}>
                      Từ chối
                    </Button>
                    <Button className="flex-1 md:flex-none" onClick={() => setReview('approved')}>
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
