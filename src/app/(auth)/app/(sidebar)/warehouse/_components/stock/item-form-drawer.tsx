'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { ITEM_FORM_ID, ItemForm } from './item-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer thêm mặt hàng mới (sửa nằm ngay trong drawer chi tiết)
export default function ItemFormDrawer({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm mặt hàng" width={520}>
      <DrawerHeader compact title="Thêm mặt hàng" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <ItemForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={ITEM_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Thêm mặt hàng
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
