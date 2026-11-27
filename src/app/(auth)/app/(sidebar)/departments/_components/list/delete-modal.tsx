'use client';

import { Button, Modal } from '@/components';
import type { Department } from '@/types';

interface Props {
  department: Department | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export function DeleteDepartmentModal({ department, isPending, onClose, onConfirm }: Props) {
  return (
    <Modal isOpen={!!department} onClose={onClose} title="Xác nhận xóa phòng ban" className="m-2 w-full max-w-md">
      <p className="py-2 text-sm leading-relaxed text-slate-600">
        Bạn có chắc chắn muốn xóa phòng ban <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{department?.name}</strong>?
        Hành động này không thể hoàn tác.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" loading={isPending} onClick={() => department && onConfirm(department.id)}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
