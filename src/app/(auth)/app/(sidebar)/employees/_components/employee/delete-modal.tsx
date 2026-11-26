'use client';

import { Button, Modal } from '@/components';
import type { Employee } from '@/types';

interface Props {
  employee: Employee | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteEmployeeModal({ employee, isPending, onClose, onConfirm }: Props) {
  return (
    <Modal isOpen={!!employee} onClose={onClose} title="Xác nhận xóa nhân sự" className="m-2 w-full max-w-md">
      <p className="py-2 text-sm leading-relaxed text-slate-600">
        Bạn có chắc chắn muốn xóa nhân sự <strong className="font-semibold text-slate-900">{employee?.fullName || employee?.username}</strong>? Hành
        động này không thể hoàn tác.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" loading={isPending} onClick={() => employee && onConfirm(employee.id)}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
