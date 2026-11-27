'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import type { WarehouseItem } from '@/types';
import { OFFCUT_FORM_ID, OffcutForm } from './offcut-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profileItems: WarehouseItem[];
}

export default function OffcutFormDrawer({ isOpen, onClose, profileItems }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thu hồi nhôm thừa">
      <DrawerHeader compact title="Thu hồi nhôm thừa" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <OffcutForm profileItems={profileItems} onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={OFFCUT_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Thu hồi
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
