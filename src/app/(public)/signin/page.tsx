/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

import AuthShell from '../_components/auth-shell';
import LoginForm from './_components/login-form';

const Signin = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    return () => unsubFinish();
  }, []);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      window.location.replace('/app/dashboard');
    }
  }, [hasHydrated, isAuthenticated]);

  if (hasHydrated && isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50/60">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthShell
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục"
      footer={
        <>
          Doanh nghiệp chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
};

export default Signin;
