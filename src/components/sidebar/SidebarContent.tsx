// Use this component to wrap all of page content that used sidebar component

'use client';

import { useSidebar } from '@/contexts/SidebarProvider';
import { HEADER_HEIGHT, SIDEBAR_WIDTH, MAIN_BG_COLOR } from '@/config/ui';

export default function SidebarContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div
      style={{
        marginLeft: isMobile ? 0 : isOpen ? SIDEBAR_WIDTH : 0,
        transition: 'margin-left 0.3s',
        width: `calc(100% - ${isMobile ? 0 : isOpen ? SIDEBAR_WIDTH : 0}px)`,
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        backgroundColor: MAIN_BG_COLOR,
      }}
    >
      {children}
    </div>
  );
}
