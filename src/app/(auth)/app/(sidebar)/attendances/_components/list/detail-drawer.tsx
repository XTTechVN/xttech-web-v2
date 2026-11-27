'use client';

import { useState } from 'react';
import { Camera, FileEdit, Pencil, Route, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { useCan } from '@/hooks';
import { getAttendanceStatusLabel, type Attendance } from '@/types';
import { getFileUrl } from '@/utils';
import { ATTENDANCE_FORM_ID, AttendanceForm } from './attendance-form';
import { fmtDate, hhmm, personName, statusTone } from './format';

interface Props {
  attendance: Attendance | null;
  showUser: boolean;
  onClose: () => void;
  onDelete: (a: Attendance) => void;
  onComplain: (a: Attendance) => void;
  onRoute: (a: Attendance) => void;
}

const gps = (lat?: number | null, lng?: number | null) => (lat != null && lng != null ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Chưa ghi nhận');

function Shot({ src, alt }: { src?: string; alt: string }) {
  return src ? (
    <img src={src} alt={alt} className="aspect-video w-full rounded-control border border-slate-200/80 bg-slate-100 object-cover" />
  ) : (
    <div className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-control border border-dashed border-slate-200 text-slate-400">
      <Camera size={18} />
      <span className="text-xs">Chưa có ảnh</span>
    </div>
  );
}

// Xem nhanh một bản ghi chấm công; bấm Sửa thì chính drawer này chuyển sang ô nhập
export function AttendanceDrawer({ attendance: a, showUser, onClose, onDelete, onComplain, onRoute }: Props) {
  const { can } = useCan();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };

  const routeAction = a && (
    <IconAction label="Xem lộ trình" onClick={() => onRoute(a)}>
      <Route size={16} />
    </IconAction>
  );

  return (
    <Drawer isOpen={!!a} onClose={close} label="Chi tiết chấm công" width={480}>
      {a && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa chấm công' : showUser ? personName(a) : fmtDate(a.workDate)}
            onClose={close}
            actions={
              !editing && (
                <>
                  {can('attendance:update') && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {can('attendance:delete') && (
                    <IconAction label="Xóa" danger onClick={() => onDelete(a)}>
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
                <AttendanceForm key={a.id} initial={a} onDone={() => setEditing(false)} onPendingChange={setPending} />
              ) : (
                <>
                  <DrawerSection
                    title="Thông tin"
                    action={
                      can('attendance_request:create') && (
                        <IconAction label="Khiếu nại chấm công" onClick={() => onComplain(a)}>
                          <FileEdit size={16} />
                        </IconAction>
                      )
                    }
                  >
                    {showUser && <InfoRow label="Nhân sự">{personName(a)}</InfoRow>}
                    {showUser && a.user?.email && <InfoRow label="Email">{a.user.email}</InfoRow>}
                    <InfoRow label="Ngày làm việc">{fmtDate(a.workDate)}</InfoRow>
                    <InfoRow label="Trạng thái">
                      <Tag tone={statusTone(a.status)}>{getAttendanceStatusLabel(a.status)}</Tag>
                    </InfoRow>
                    <InfoRow label="Tổng giờ">{a.totalHours ?? 0} giờ</InfoRow>
                    {a.note && <InfoRow label="Ghi chú">{a.note}</InfoRow>}
                  </DrawerSection>
                  <DrawerSection title="Vào ca" action={routeAction}>
                    <InfoRow label="Giờ vào">
                      <span className="tabular-nums">{hhmm(a.checkIn)}</span>
                      {a.isLate && <span className="ml-2 text-xs text-amber-700">Muộn {a.lateMinutes ?? 0} phút</span>}
                    </InfoRow>
                    <InfoRow label="Vị trí GPS">{gps(a.checkInLatitude, a.checkInLongitude)}</InfoRow>
                    <Shot src={getFileUrl(a.imgCheckinPath) || undefined} alt="Ảnh chấm công vào ca" />
                  </DrawerSection>
                  <DrawerSection title="Ra ca" action={routeAction}>
                    <InfoRow label="Giờ ra">
                      <span className="tabular-nums">{hhmm(a.checkOut)}</span>
                      {a.isEarlyLeave && <span className="ml-2 text-xs text-amber-700">Sớm {a.earlyLeaveMinutes ?? 0} phút</span>}
                    </InfoRow>
                    <InfoRow label="Vị trí GPS">{gps(a.checkOutLatitude, a.checkOutLongitude)}</InfoRow>
                    <Shot src={getFileUrl(a.imgCheckoutPath) || undefined} alt="Ảnh chấm công ra ca" />
                  </DrawerSection>
                </>
              )}
            </div>
          </DrawerBody>
          {editing && (
            <DrawerFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={() => setEditing(false)}>
                  Hủy
                </Button>
                <Button type="submit" form={ATTENDANCE_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                  Lưu
                </Button>
              </div>
            </DrawerFooter>
          )}
        </>
      )}
    </Drawer>
  );
}
