'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { DEPARTMENT_FORM_ID, DepartmentForm } from './department-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer thêm phòng ban mới (sửa nằm ngay trong drawer chi tiết)
export default function DepartmentFormModal({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm phòng ban mới">
      <DrawerHeader compact title="Thêm phòng ban mới" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <DepartmentForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={onClose} disabled={pending}>
            Hủy
          </Button>
          <Button type="submit" form={DEPARTMENT_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Xác nhận tạo
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
