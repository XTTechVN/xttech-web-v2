'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateAdjustmentRequest } from '@/actions';
import { Textarea } from '@/components';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { getRequestTypeLabel, type AttendanceAdjustmentRequest } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { ADJUSTMENT_FORM_ID, AdjustmentForm } from './adjustment-form';
import { fmtDate, hhmm, personName, statusOf, touchesIn, touchesOut } from './format';

interface Props {
  request: AttendanceAdjustmentRequest | null;
  showUser: boolean;
  /** Được sửa/xóa đơn này (chủ đơn hoặc phạm vi quản lý) */
  canManage: (r: AttendanceAdjustmentRequest) => boolean;
  /** Có quyền duyệt (phạm vi quản lý) */
  canReview: (r: AttendanceAdjustmentRequest) => boolean;
  onClose: () => void;
  onDelete: (r: AttendanceAdjustmentRequest) => void;
}

type Review = 'approved' | 'rejected';

const time = (v?: string | null) => hhmm(v) || '–';

// Xem nhanh một khiếu nại; Sửa và Duyệt/Từ chối diễn ra ngay trong drawer này
export function AdjustmentDrawer({ request: r, showUser, canManage, canReview, onClose, onDelete }: Props) {
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
    mutationFn: (status: Review) => updateAdjustmentRequest(Number(r?.id), { status, reviewNote: note.trim() }),
    onSuccess: (_, status) => {
      ['adjustments', 'adjustment-requests'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(status === 'approved' ? 'Đã duyệt khiếu nại' : 'Đã từ chối khiếu nại');
      close();
    },
    onError: (e) => showErrorToast(e, 'Không thể xử lý khiếu nại'),
  });

  const send = () => {
    if (review === 'rejected' && !note.trim()) return void toast.error('Vui lòng nhập lý do từ chối');
    if (review) submit.mutate(review);
  };

  const isPending = r?.status === 'pending';
  const manage = !!r && isPending && canManage(r);
  const status = r && statusOf(r.status);

  return (
    <Drawer isOpen={!!r} onClose={close} label="Chi tiết khiếu nại" width={480}>
      {r && status && (
        <>
          <DrawerHeader
            compact
            title={
              editing
                ? 'Chỉnh sửa khiếu nại'
                : review
                  ? review === 'approved'
                    ? 'Duyệt khiếu nại'
                    : 'Từ chối khiếu nại'
                  : showUser
                    ? personName(r.user)
                    : 'Khiếu nại chấm công'
            }
            onClose={close}
            actions={
              !editing &&
              !review &&
              manage && (
                <>
                  <IconAction label="Sửa" onClick={() => setEditing(true)}>
                    <Pencil size={16} />
                  </IconAction>
                  {r._can?.delete && <IconAction label="Xóa" danger onClick={() => onDelete(r)}>
                    <Trash2 size={16} />
                  </IconAction>}
                </>
              )
            }
          />
          <DrawerBody>
            <div className="pt-4">
              {editing ? (
                <AdjustmentForm key={r.id} initial={r} onDone={close} onPendingChange={setPending} />
              ) : review ? (
                <Textarea
                  label={review === 'approved' ? 'Ghi chú duyệt (không bắt buộc)' : 'Lý do từ chối *'}
                  placeholder={review === 'approved' ? 'Ví dụ: Đã đối chiếu, đồng ý' : 'Ví dụ: Không có căn cứ chấm công'}
                  rows={4}
                  fullWidth
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              ) : (
                <>
                  <DrawerSection title="Thông tin">
                    {showUser && <InfoRow label="Nhân sự">{personName(r.user)}</InfoRow>}
                    <InfoRow label="Trạng thái">
                      <Tag tone={status.tone}>{status.label}</Tag>
                    </InfoRow>
                    <InfoRow label="Loại">{getRequestTypeLabel(r.requestType)}</InfoRow>
                    <InfoRow label="Ngày làm việc">{fmtDate(r.workDate)}</InfoRow>
                    <InfoRow label="Lý do">{r.reason}</InfoRow>
                  </DrawerSection>
                  <DrawerSection title="Đề nghị sửa giờ">
                    {touchesIn(r.requestType) && (
                      <InfoRow label="Giờ vào">
                        <span className="tabular-nums">
                          {time(r.oldCheckIn)} → <strong className="font-semibold">{time(r.requestedCheckIn)}</strong>
                        </span>
                      </InfoRow>
                    )}
                    {touchesOut(r.requestType) && (
                      <InfoRow label="Giờ ra">
                        <span className="tabular-nums">
                          {time(r.oldCheckOut)} → <strong className="font-semibold">{time(r.requestedCheckOut)}</strong>
                        </span>
                      </InfoRow>
                    )}
                  </DrawerSection>
                  {(r.reviewedAt || r.reviewNote) && (
                    <DrawerSection title="Phản hồi">
                      {r.reviewedAt && <InfoRow label="Ngày duyệt">{fmtDate(r.reviewedAt)}</InfoRow>}
                      {r.reviewNote && <InfoRow label="Ghi chú">{r.reviewNote}</InfoRow>}
                    </DrawerSection>
                  )}
                </>
              )}
            </div>
          </DrawerBody>
          {(editing || review || (!!r && canReview(r) && isPending)) && (
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
                      <Button type="submit" form={ADJUSTMENT_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
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
