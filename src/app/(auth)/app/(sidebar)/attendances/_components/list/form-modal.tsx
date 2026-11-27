'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { ATTENDANCE_FORM_ID, AttendanceForm } from './attendance-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer thêm chấm công (sửa nằm ngay trong drawer chi tiết)
export default function AttendanceFormDrawer({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm chấm công">
      <DrawerHeader compact title="Thêm chấm công" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <AttendanceForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={ATTENDANCE_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Lưu
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
