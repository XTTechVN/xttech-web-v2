'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { TASK_FORM_ID, TaskForm } from './task-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer giao việc mới (sửa nằm ngay trong drawer chi tiết)
export default function TaskFormDrawer({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Giao việc" width={520}>
      <DrawerHeader compact title="Giao việc" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <TaskForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={TASK_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Giao việc
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
