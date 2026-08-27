'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Icon của thư viện lucide - react
import { Settings } from 'lucide-react';

// Thành phần dùng chung cho components
import { Button, Heading, Avatar, XTLogo } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import useAuthStore from '@/stores/useAuthStore';

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <XTLogo className="w-8 h-8 drop-shadow-[0_2px_5px_rgba(4,88,99,0.35)]" />
          <Heading size="h1" className="text-primary tracking-tight">
            XTTECH
          </Heading>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
            Tính năng
          </Link>
          <Link href="#" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
            Về chúng tôi
          </Link>
          <Link href="#contact" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
            Liên hệ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {mounted ? (
            isAuthenticated && user ? (
              <Link href="/app/dashboard" className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-full pr-4 transition-colors">
                <Avatar
                  src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_MINIO_URL}${user.avatar}`) : undefined}
                  name={user.fullName || user.username}
                  size="sm"
                />
                <span className="text-sm font-semibold text-gray-700">{user.fullName || user.username}</span>
              </Link>
            ) : (
              <Link href="/signin">
                <Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 shadow-sm text-white">
                  Đăng Nhập
                </Button>
              </Link>
            )
          ) : (
            <div className="w-[105px] h-8 bg-gray-200 animate-pulse rounded-full"></div>
          )}
        </div>
      </div>
    </header>
  );
};
