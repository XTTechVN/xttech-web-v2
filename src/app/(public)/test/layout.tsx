'use client';

import queryClient from '@/utils/query';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <Suspense fallback={<div className="p-6 text-center text-sm text-gray-500">Đang tải trang test...</div>}>
        {children}
      </Suspense>
    </QueryClientProvider>
  );
}
