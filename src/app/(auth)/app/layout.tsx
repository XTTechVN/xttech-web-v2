'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { getUser } from '@/actions/user';
import queryClient from '@/utils/query';
import { SidebarProvider, PageTransitionProvider } from '@/contexts';
import { QueryClientProvider } from '@tanstack/react-query';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const state = useAuthStore.getState();
      const isAuthenticated = state.isAuthenticated;
      const accessToken = state.accessToken;

      if (!isAuthenticated || !accessToken) {
        document.cookie = 'xt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        router.replace('/signin');
      } else {
        setIsLoading(false);

        // Đồng bộ ngầm profile mới nhất từ backend (avatar, quyền, chức vụ, họ tên)
        const currentUserId = state.user?.id;
        if (currentUserId) {
          try {
            const latestUser = await getUser(currentUserId);
            if (latestUser) {
              useAuthStore.getState().updateUser(latestUser as any);
            }
          } catch {
            // Không chặn giao diện nếu mạng yếu
          }
        }
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-primary"></div>
          <p className="text-sm font-medium text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <PageTransitionProvider>
            <div>{children}</div>
          </PageTransitionProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </>
  );
}
