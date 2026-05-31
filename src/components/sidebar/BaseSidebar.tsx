// This is base sidebar component, use this component to wrap all of sidebar component

'use client';

import { useSidebar } from '@/contexts/SidebarProvider';
import { cn } from '@/utils/cn';
import { motion } from 'motion/react';

import { HEADER_HEIGHT, SIDEBAR_WIDTH } from '@/config/ui';

export default function BaseSidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();

  return (
    <aside>
      <motion.div
        initial={{ width: isMobile ? 0 : SIDEBAR_WIDTH }}
        animate={{
          width: isOpen ? SIDEBAR_WIDTH : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          'overflow-auto text-nowrap scrollbar-hide',
          isMobile === undefined && 'max-md:hidden',
        )}
        style={{
          position: 'fixed',
          top: HEADER_HEIGHT,
          left: 0,
          bottom: 0,
        }}
      >
        {children}
      </motion.div>
    </aside>
  );
}
