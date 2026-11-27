'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import type { Customer } from '@/types';
import { CUSTOMER_FORM_ID, CustomerForm } from './customer-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (customer: Customer) => void;
}

// Drawer thêm khách hàng (sửa nằm ngay trong drawer chi tiết). Form dự án cũng dùng để thêm nhanh.
export default function CustomerFormDrawer({ isOpen, onClose, onCreated }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm khách hàng">
      <DrawerHeader compact title="Thêm khách hàng" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">
          {isOpen && (
            <CustomerForm
              onPendingChange={setPending}
              onDone={(c) => {
                onCreated?.(c);
                onClose();
              }}
            />
          )}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={CUSTOMER_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Thêm khách hàng
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
