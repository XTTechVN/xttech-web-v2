'use client';

import { Drawer, DrawerBody, DrawerHeader, SideDrawer } from '@/components-remake';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Drawer con nằm cạnh drawer đang mở */
  side?: boolean;
  children: React.ReactNode;
}

// Drawer có đầu gọn + thân cuộn; mọi hộp thoại của trình quản lý tài liệu dùng chung khung này
export function Sheet({ open, onClose, title, side, children }: Props) {
  const Panel = side ? SideDrawer : Drawer;
  return (
    <Panel isOpen={open} onClose={onClose} label={title}>
      <DrawerHeader compact title={title} onClose={onClose} />
      <DrawerBody>{children}</DrawerBody>
    </Panel>
  );
}
