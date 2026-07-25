'use client';

import queryClient from '@/utils/query';
import { Toaster } from 'react-hot-toast';
import { SidebarProvider } from '@/contexts/SidebarProvider';
import { QueryClientProvider } from '@tanstack/react-query';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" />
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <div>{children}</div>
        </SidebarProvider>
      </QueryClientProvider>
    </>
  );
}
