'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, SideDrawer } from '@/components-remake';
import type { WarehouseSupplier } from '@/types';
import { SUPPLIER_FORM_ID, SupplierForm } from './supplier-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Thêm nhanh từ form phiếu kho: mở thành drawer con */
  side?: boolean;
  onCreated?: (supplier: WarehouseSupplier) => void;
}

// Drawer thêm nhà cung cấp (sửa nằm ngay trong drawer chi tiết)
export default function SupplierFormDrawer({ isOpen, onClose, side, onCreated }: Props) {
  const [pending, setPending] = useState(false);

  const content = (
    <>
      <DrawerHeader compact title="Thêm nhà cung cấp" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">
          {isOpen && (
            <SupplierForm
              onPendingChange={setPending}
              onDone={(s) => {
                onCreated?.(s);
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
          <Button type="submit" form={SUPPLIER_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Thêm nhà cung cấp
          </Button>
        </div>
      </DrawerFooter>
    </>
  );

  return side ? (
    <SideDrawer isOpen={isOpen} onClose={onClose} label="Thêm nhà cung cấp">
      {content}
    </SideDrawer>
  ) : (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm nhà cung cấp" width={520}>
      {content}
    </Drawer>
  );
}
