'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { completeStaffTask, reopenStaffTask } from '@/actions';
import { Textarea } from '@/components';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { StaffTask } from '@/types';
import { showErrorToast } from '@/utils';
import { TASK_FORM_ID, TaskForm } from './task-form';
import { categoryLabel, deadlineOf, fmtDateTime, isOpenTask, lateText, priorityOf, refreshTasks, sourceLabel, statusLabel } from './format';

interface Props {
  task: StaffTask | null;
  canEdit: boolean;
  canDelete: boolean;
  /** Được hoàn thành / mở lại việc này (quản lý hoặc người được giao) */
  canAct: (t: StaffTask) => boolean;
  onClose: () => void;
  onDelete: (t: StaffTask) => void;
  onWarranty: (t: StaffTask) => void;
}

// Xem nhanh một công việc; Sửa và Hoàn thành diễn ra ngay trong drawer này
export function TaskDrawer({ task: t, canEdit, canDelete, canAct, onClose, onDelete, onWarranty }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [note, setNote] = useState('');
  // Mốc thời gian chốt lúc mở màn hoàn thành để cảnh báo "muộn" không đổi khi vẽ lại
  const [openedAt, setOpenedAt] = useState(0);

  const close = () => {
    setEditing(false);
    setCompleting(false);
    setNote('');
    onClose();
  };

  const complete = useMutation({
    mutationFn: () => completeStaffTask(t!.id, { completionNote: note.trim() || null }),
    onSuccess: () => {
      refreshTasks();
      toast.success('Đã xác nhận hoàn thành công việc');
      close();
    },
    onError: (e) => showErrorToast(e, 'Không thể xác nhận hoàn thành'),
  });

  const reopen = useMutation({
    mutationFn: () => reopenStaffTask(t!.id, { reason: 'Mở lại để kiểm tra bổ sung' }),
    onSuccess: () => {
      refreshTasks();
      toast.success('Đã mở lại công việc');
      close();
    },
    onError: (e) => showErrorToast(e, 'Không mở lại được công việc'),
  });

  const open = !!t && isOpenTask(t);
  const act = !!t && canAct(t);
  const warranty = !!t && open && act && !!t.warrantyVisitId && !!t.projectId;
  const late = !!t && completing && new Date(t.dueAt).getTime() < openedAt;
  const d = t && deadlineOf(t);
  const p = t && priorityOf(t);

  return (
    <Drawer isOpen={!!t} onClose={close} label="Chi tiết công việc" width={520}>
      {t && d && p && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa công việc' : completing ? 'Hoàn thành công việc' : 'Công việc'}
            onClose={close}
            actions={
              !editing &&
              !completing && (
                <>
                  {canEdit && open && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {canDelete && (
                    <IconAction label="Xóa" danger onClick={() => onDelete(t)}>
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
                <TaskForm key={t.id} initial={t} onDone={close} onPendingChange={setPending} />
              ) : completing ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-slate-900 [overflow-wrap:anywhere]">
                    <span className="font-semibold">{t.code}</span> · {t.title}
                  </p>
                  {late && (
                    <p className="rounded-control bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      Việc đã quá hạn ({fmtDateTime(t.dueAt)}). Vẫn xác nhận được, hệ thống sẽ ghi nhận là hoàn thành muộn.
                    </p>
                  )}
                  <Textarea
                    label="Kết quả thực hiện"
                    placeholder="Tóm tắt kết quả đã xử lý"
                    rows={4}
                    fullWidth
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <h3
                    className={`mb-4 text-base font-semibold [overflow-wrap:anywhere] ${t.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}
                  >
                    {t.title}
                  </h3>
                  <DrawerSection title="Thông tin">
                    <InfoRow label="Mã công việc">{t.code}</InfoRow>
                    <InfoRow label="Trạng thái">{statusLabel(t)}</InfoRow>
                    <InfoRow label="Tiến độ hạn">
                      <span className="flex flex-wrap items-center gap-1">
                        <Tag tone={d.tone}>{d.label}</Tag>
                        {t.isCompletedLate && t.lateMinutes > 0 && <span className="text-xs text-amber-700">{lateText(t.lateMinutes)}</span>}
                      </span>
                    </InfoRow>
                    <InfoRow label="Ưu tiên">
                      <Tag tone={p.tone}>{p.label}</Tag>
                    </InfoRow>
                    <InfoRow label="Phân loại">{categoryLabel(t)}</InfoRow>
                    <InfoRow label="Nguồn việc">{sourceLabel(t)}</InfoRow>
                  </DrawerSection>
                  <DrawerSection title="Phân công">
                    <InfoRow label="Thực hiện">{t.assigneeName || '–'}</InfoRow>
                    {t.departmentName && <InfoRow label="Phòng ban">{t.departmentName}</InfoRow>}
                    <InfoRow label="Người giao">{t.assignedByName || 'Hệ thống tự động'}</InfoRow>
                  </DrawerSection>
                  {(t.projectId || t.warrantyVisitCode) && (
                    <DrawerSection title="Liên quan">
                      {t.projectId && (
                        <InfoRow label="Dự án">
                          <Link href={`/app/projects/${t.projectId}`} className="text-primary [overflow-wrap:anywhere]">
                            {t.projectCode} · {t.projectName}
                          </Link>
                        </InfoRow>
                      )}
                      {t.warrantyVisitCode && <InfoRow label="Phiếu bảo hành">{t.warrantyVisitCode}</InfoRow>}
                      {t.requesterPhone && (
                        <InfoRow label="Khách">
                          {t.requesterName || '–'} · {t.requesterPhone}
                        </InfoRow>
                      )}
                    </DrawerSection>
                  )}
                  <DrawerSection title="Thời gian">
                    <InfoRow label="Ngày giao">{fmtDateTime(t.createdAt)}</InfoRow>
                    <InfoRow label="Hạn">{fmtDateTime(t.dueAt)}</InfoRow>
                    <InfoRow label="Hoàn thành">{fmtDateTime(t.completedAt)}</InfoRow>
                  </DrawerSection>
                  {t.description && (
                    <DrawerSection title="Mô tả">
                      <p className="whitespace-pre-line text-sm text-slate-900 [overflow-wrap:anywhere]">{t.description}</p>
                    </DrawerSection>
                  )}
                  {t.managerNote && (
                    <DrawerSection title="Ghi chú chỉ đạo">
                      <p className="whitespace-pre-line text-sm text-slate-900 [overflow-wrap:anywhere]">{t.managerNote}</p>
                    </DrawerSection>
                  )}
                  {t.completionNote && (
                    <DrawerSection title="Kết quả thực hiện">
                      <p className="whitespace-pre-line text-sm text-slate-900 [overflow-wrap:anywhere]">{t.completionNote}</p>
                    </DrawerSection>
                  )}
                </>
              )}
            </div>
          </DrawerBody>
          {(editing || completing || act) && (
            <DrawerFooter>
              <div className="flex justify-end gap-2">
                {editing || completing ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 md:flex-none"
                      disabled={pending || complete.isPending}
                      onClick={() => (editing ? setEditing(false) : setCompleting(false))}
                    >
                      Hủy
                    </Button>
                    {editing ? (
                      <Button type="submit" form={TASK_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                        Lưu
                      </Button>
                    ) : (
                      <Button className="flex-1 md:flex-none" loading={complete.isPending} onClick={() => complete.mutate()}>
                        Xác nhận hoàn thành
                      </Button>
                    )}
                  </>
                ) : open ? (
                  <>
                    {warranty && (
                      <Button variant="outline" className="flex-1 md:flex-none" onClick={() => onWarranty(t)}>
                        Biên bản bảo hành
                      </Button>
                    )}
                    <Button
                      className="flex-1 md:flex-none"
                      onClick={() => {
                        setOpenedAt(Date.now());
                        setCompleting(true);
                      }}
                    >
                      Hoàn thành
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="flex-1 md:flex-none" loading={reopen.isPending} onClick={() => reopen.mutate()}>
                    Mở lại
                  </Button>
                )}
              </div>
            </DrawerFooter>
          )}
        </>
      )}
    </Drawer>
  );
}
