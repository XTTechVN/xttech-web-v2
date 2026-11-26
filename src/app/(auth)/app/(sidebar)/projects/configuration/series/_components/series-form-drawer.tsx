'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import type { Brand } from '@/types';
import { SERIES_FORM_ID, SeriesForm } from './series-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  defaultBrandId: number | null;
}

// Drawer thêm hệ nhôm (sửa nằm ngay trong drawer chi tiết)
export default function SeriesFormDrawer({ isOpen, onClose, brands, defaultBrandId }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Thêm hệ nhôm">
      <DrawerHeader compact title="Thêm hệ nhôm" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">
          {isOpen && <SeriesForm brands={brands} defaultBrandId={defaultBrandId} onPendingChange={setPending} onDone={onClose} />}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={SERIES_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Thêm hệ nhôm
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
