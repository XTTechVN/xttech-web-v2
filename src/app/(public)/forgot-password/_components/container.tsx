'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/utils/query';

import AuthShell from '../../_components/auth-shell';
import Form from './form';

const Container = () => {
  // Bước 1: nhập email · Bước 2: nhập OTP + mật khẩu mới
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthShell
        title="Quên mật khẩu?"
        subtitle={
          step === 1
            ? 'Nhập email, chúng tôi sẽ gửi mã xác nhận để lấy lại mật khẩu.'
            : 'Nhập mã OTP đã gửi đến email (có hiệu lực 5 phút, dùng một lần) và mật khẩu mới.'
        }
        footer={
          <Link href="/signin" className="inline-flex min-h-11 items-center gap-2 font-medium hover:text-primary">
            <ArrowLeft size={16} />
            Quay lại đăng nhập
          </Link>
        }
      >
        <Form step={step} setStep={setStep} />
      </AuthShell>
    </QueryClientProvider>
  );
};

export default Container;
