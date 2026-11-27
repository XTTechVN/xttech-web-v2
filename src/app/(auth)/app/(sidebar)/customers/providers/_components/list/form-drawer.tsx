'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, SideDrawer } from '@/components-remake';
import type { CustomerProvider } from '@/types';
import { PROVIDER_FORM_ID, ProviderForm } from './provider-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Thêm nhanh từ form khác: mở thành drawer con thay vì drawer chính */
  side?: boolean;
  onCreated?: (provider: CustomerProvider) => void;
}

// Drawer thêm nhà cung cấp (sửa nằm ngay trong drawer chi tiết)
export default function ProviderFormDrawer({ isOpen, onClose, side, onCreated }: Props) {
  const [pending, setPending] = useState(false);

  const content = (
    <>
      <DrawerHeader compact title="Thêm nhà cung cấp" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">
          {isOpen && (
            <ProviderForm
              onPendingChange={setPending}
              onDone={(p) => {
                onCreated?.(p);
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
          <Button type="submit" form={PROVIDER_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
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
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm nhà cung cấp">
      {content}
    </Drawer>
  );
}
