'use client';

import { useState } from 'react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import type { Brand, ProfileBar } from '@/types';
import { PROFILE_BAR_FORM_ID, ProfileBarForm } from './profile-bar-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profileBar: ProfileBar | null;
  isCopy: boolean;
  brands: Brand[];
  defaultBrandId: number | null;
}

// Thêm / sửa / sao chép thanh profile trong một drawer rộng
export function ProfileBarFormDrawer({ isOpen, onClose, profileBar, isCopy, brands, defaultBrandId }: Props) {
  const [pending, setPending] = useState(false);
  const isEdit = !!profileBar && !isCopy;
  const title = isEdit ? 'Sửa thanh profile' : isCopy ? 'Sao chép thanh profile' : 'Thêm thanh profile';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label={title} width={720}>
      <DrawerHeader compact title={title} onClose={onClose} />
      <DrawerBody>
        <div className="py-4">
          <ProfileBarForm
            key={`${profileBar?.id ?? 'new'}-${isCopy}`}
            isOpen={isOpen}
            onPendingChange={setPending}
            onClose={onClose}
            profileBar={profileBar}
            isCopy={isCopy}
            brands={brands}
            defaultBrandId={defaultBrandId}
          />
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={PROFILE_BAR_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            {isEdit ? 'Lưu thay đổi' : isCopy ? 'Tạo bản sao' : 'Thêm thanh profile'}
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
