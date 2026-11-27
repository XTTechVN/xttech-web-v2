'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import type { Attendance } from '@/types';
import { ADJUSTMENT_FORM_ID, AdjustmentForm } from './adjustment-form';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Có = khiếu nại cho bản ghi chấm công này; không có = tạo tự do (quên chấm công) */
  data?: Attendance | null;
}

// Drawer tạo khiếu nại; dùng ở trang Khiếu nại, bảng Chấm công và Lịch sử chấm công
export default function AddAdjustmentDrawer({ open, onClose, onSuccess, data }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={open} onClose={onClose} label="Tạo khiếu nại">
      <DrawerHeader compact title="Tạo khiếu nại chấm công" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">
          {open && (
            <AdjustmentForm
              attendance={data}
              onPendingChange={setPending}
              onDone={() => {
                onSuccess?.();
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
          <Button type="submit" form={ADJUSTMENT_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Gửi khiếu nại
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
