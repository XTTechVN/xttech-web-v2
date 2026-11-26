'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { BRAND_FORM_ID, BrandForm } from './brand-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer thêm thương hiệu (sửa nằm ngay trong drawer chi tiết)
export default function BrandFormDrawer({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm thương hiệu">
      <DrawerHeader compact title="Thêm thương hiệu" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <BrandForm onPendingChange={setPending} onDone={onClose} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={BRAND_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Thêm thương hiệu
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
