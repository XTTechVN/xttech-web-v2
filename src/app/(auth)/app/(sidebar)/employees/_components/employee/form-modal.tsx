'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { EMPLOYEE_FORM_ID, EmployeeForm } from './employee-form';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer thêm nhân sự mới (sửa nằm ngay trong drawer chi tiết)
export default function EmployeeFormModal({ isOpen, onClose }: EmployeeFormModalProps) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm nhân sự mới">
      <DrawerHeader compact title="Thêm nhân sự mới" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <EmployeeForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={onClose} disabled={pending}>
            Hủy
          </Button>
          <Button type="submit" form={EMPLOYEE_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Xác nhận tạo
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}

export { EmployeeFormModal };
