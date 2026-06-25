'use client';

import AppHeader from '@/components/header/AppHeader';
import BaseHeader from '@/components/header/BaseHeader';
import AppSidebar from '@/components/sidebar/AppSidebar';
import BaseSidebar from '@/components/sidebar/BaseSidebar';
import { SidebarProvider } from '@/contexts/SidebarProvider';
import LoadingScreen from '@/components/loading/LoadingScreen';
import SidebarContent from '@/components/sidebar/SidebarContent';

import queryClient from '@/utils/query';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import useUserStore from '@/stores/useUserStore';
import { useEffect, Suspense } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, hasHydrated } = useUserStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      window.location.href = '/signin';
    }
  }, [user, hasHydrated]);

  if (!user) return <LoadingScreen animate={false} />;

  return (
    <>
      <Toaster position="top-center" />
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <BaseHeader>
            <AppHeader />
          </BaseHeader>
          <div className="flex">
            <BaseSidebar>
              <AppSidebar />
            </BaseSidebar>
            <SidebarContent>
              <Suspense fallback={<LoadingScreen animate={true} />}>
                {children}
              </Suspense>
            </SidebarContent>
          </div>
        </SidebarProvider>
      </QueryClientProvider>
    </>
  );
}
