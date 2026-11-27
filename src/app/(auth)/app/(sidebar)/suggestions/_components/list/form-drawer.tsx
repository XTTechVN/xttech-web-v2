'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { SUGGESTION_FORM_ID, SuggestionForm } from './suggestion-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer gửi đề xuất mới (sửa nằm ngay trong drawer chi tiết)
export default function SuggestionFormDrawer({ isOpen, onClose }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Gửi đề xuất">
      <DrawerHeader compact title="Gửi đề xuất" onClose={onClose} />
      <DrawerBody>
        <div className="pt-4">{isOpen && <SuggestionForm onDone={onClose} onPendingChange={setPending} />}</div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={SUGGESTION_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            Gửi đề xuất
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
