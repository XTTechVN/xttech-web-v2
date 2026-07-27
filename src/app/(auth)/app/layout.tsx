'use client';

import queryClient from '@/utils/query';
import { SidebarProvider } from '@/contexts/SidebarProvider';
import { QueryClientProvider } from '@tanstack/react-query';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <div>{children}</div>
        </SidebarProvider>
      </QueryClientProvider>
    </>
  );
}
