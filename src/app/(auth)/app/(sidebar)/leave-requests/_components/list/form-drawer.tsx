'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { LEAVE_FORM_ID, LeaveForm } from './leave-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer tạo đơn nghỉ phép (sửa nằm ngay trong drawer chi tiết)
export default function LeaveFormDrawer({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Tạo đơn nghỉ phép">
      <DrawerHeader compact title="Tạo đơn nghỉ phép" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <LeaveForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={LEAVE_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Gửi đơn
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
