'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, DrawerBody, DrawerFooter, DrawerHeader, IconAction, SideDrawer } from '@/components-remake';
import type { BrandColor } from '@/types';
import { COLOR_FORM_ID, ColorForm } from './color-form';

interface Props {
  brandId: number;
  isOpen: boolean;
  /** Có = sửa; không có = thêm màu mới */
  color?: BrandColor | null;
  onClose: () => void;
  /** Có = hiện nút xóa trên đầu drawer */
  onDelete?: (c: BrandColor) => void;
}

// Drawer con của drawer thương hiệu: thêm hoặc sửa một màu
export default function ColorFormDrawer({ brandId, isOpen, color, onClose, onDelete }: Props) {
  const [pending, setPending] = useState(false);
  const title = color ? 'Sửa màu' : 'Thêm màu';

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose} label={title}>
      <DrawerHeader
        compact
        title={title}
        onClose={onClose}
        actions={
          color &&
          onDelete && (
            <IconAction label="Xóa màu" danger onClick={() => onDelete(color)}>
              <Trash2 size={16} />
            </IconAction>
          )
        }
      />
      <DrawerBody>
        <div className="pt-4">
          {isOpen && (
            <ColorForm key={color?.id ?? 'new'} brandId={brandId} initial={color ?? undefined} onDone={onClose} onPendingChange={setPending} />
          )}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={COLOR_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
            {color ? 'Lưu' : 'Thêm màu'}
          </Button>
        </div>
      </DrawerFooter>
    </SideDrawer>
  );
}
