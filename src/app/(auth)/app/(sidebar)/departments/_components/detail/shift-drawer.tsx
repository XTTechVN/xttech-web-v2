'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import type { WorkShift } from '@/types';
import { ShiftFormBody } from './shift-form/shift-form-modal';

const FORM_ID = 'shift-form';

interface Props {
  /** 'new' = thêm mới, ca = sửa, null = đóng */
  shift: WorkShift | 'new' | null;
  departmentId: number;
  departmentName: string;
  onClose: () => void;
}

// Form ca làm việc dài (ngày làm, GPS, ngoại lệ) nên mở drawer riêng đè lên drawer phòng ban
export function ShiftDrawer({ shift, departmentId, departmentName, onClose }: Props) {
  const [pending, setPending] = useState(false);
  const editing = shift && shift !== 'new' ? shift : null;

  return (
    <Drawer isOpen={!!shift} onClose={onClose} label={editing ? 'Sửa ca làm việc' : 'Thêm ca làm việc'} width={560}>
      {shift && (
        <>
          <DrawerHeader compact title={editing ? 'Sửa ca làm việc' : 'Thêm ca làm việc'} onClose={onClose} />
          <DrawerBody>
            <ShiftFormBody
              key={editing?.id ?? 'new'}
              formId={FORM_ID}
              submitText="Lưu"
              onClose={onClose}
              onPendingChange={setPending}
              initialData={editing}
              defaultDepartmentId={departmentId}
              defaultDepartmentName={departmentName}
            />
          </DrawerBody>
          <DrawerFooter>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" form={FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                Lưu
              </Button>
            </div>
          </DrawerFooter>
        </>
      )}
    </Drawer>
  );
}
