'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks';

type SidebarContextType = {
  isOpen: boolean;
  isMobile: boolean | undefined;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery({ breakpoint: '768px' });
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggle = () => setIsOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    if (isMobile) {
      close();
    }
  }, [isMobile]);

  if (isMobile === undefined) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
