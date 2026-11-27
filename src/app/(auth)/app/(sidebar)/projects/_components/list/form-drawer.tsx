'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { PROJECT_FORM_ID, ProjectForm } from './project-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer thêm dự án (sửa nằm ngay trong drawer chi tiết)
export default function ProjectFormDrawer({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm dự án">
      <DrawerHeader compact title="Thêm dự án" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <ProjectForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={PROJECT_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Thêm dự án
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
