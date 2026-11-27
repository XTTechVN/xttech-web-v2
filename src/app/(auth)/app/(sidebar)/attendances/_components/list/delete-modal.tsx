'use client';

import { Button, Modal } from '@/components';
import type { Attendance } from '@/types';
import { fmtDate, personName } from './format';

interface Props {
  attendance: Attendance | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export function DeleteAttendanceModal({ attendance, isPending, onClose, onConfirm }: Props) {
  return (
    <Modal isOpen={!!attendance} onClose={onClose} title="Xác nhận xóa chấm công" className="m-2 w-full max-w-md">
      <p className="py-2 text-sm leading-relaxed text-slate-600">
        Xóa bản ghi chấm công của{' '}
        <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{attendance && personName(attendance)}</strong> ngày{' '}
        {attendance && fmtDate(attendance.workDate)}? Hành động này không thể hoàn tác.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" loading={isPending} onClick={() => attendance && onConfirm(attendance.id)}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
