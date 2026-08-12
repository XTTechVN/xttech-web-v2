'use client';

import { useState } from 'react';

// Thành phần dùng riêng cho trang quên mật khẩu
import Intro from './intro';
import Form from './form';
import Link from 'next/link';

// Icons từ thư viện lucide - react
import { ArrowLeft } from 'lucide-react';

import { QueryClientProvider } from '@tanstack/react-query';

// Hàm tiện ích
import queryClient from '@/utils/query';

const Container = () => {
  // State chuyển bước nhập mail - nhập Otp + mật khẩu mới
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 lg:border-r lg:border-gray-200 lg:pr-10 justify-center">
        <Intro step={step} />
        <Form step={step} setStep={setStep} />
        <div className="mt-4 flex justify-center text-sm">
          <Link href="/signin" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
            <ArrowLeft size={16} />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default Container;
