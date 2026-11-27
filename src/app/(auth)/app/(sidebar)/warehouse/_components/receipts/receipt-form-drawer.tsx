'use client';

import { useRef, useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import type { WarehouseItem, WarehouseReceiptItemCreatePayload, WarehouseSupplier } from '@/types';
import { RECEIPT_FORM_ID, ReceiptForm } from './receipt-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: WarehouseItem[];
  suppliers: WarehouseSupplier[];
  initialItems?: WarehouseReceiptItemCreatePayload[];
  onSuccess?: () => void;
}

// Drawer lập phiếu kho: lưu chờ duyệt, hoặc tạo và duyệt ngay
export default function ReceiptFormDrawer({ isOpen, onClose, items, suppliers, initialItems, onSuccess }: Props) {
  const [pending, setPending] = useState(false);
  const approveRef = useRef(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Lập phiếu kho" width={640}>
      <DrawerHeader compact title="Lập phiếu kho" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">
          {isOpen && (
            <ReceiptForm
              items={items}
              suppliers={suppliers}
              initialItems={initialItems}
              approveRef={approveRef}
              onSaved={onSuccess}
              onDone={onClose}
              onPendingChange={setPending}
            />
          )}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button variant="outline" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="outline"
            type="submit"
            form={RECEIPT_FORM_ID}
            disabled={pending}
            onClick={() => {
              approveRef.current = true;
            }}
          >
            Tạo và duyệt ngay
          </Button>
          <Button
            type="submit"
            form={RECEIPT_FORM_ID}
            loading={pending}
            onClick={() => {
              approveRef.current = false;
            }}
          >
            Lưu chờ duyệt
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
