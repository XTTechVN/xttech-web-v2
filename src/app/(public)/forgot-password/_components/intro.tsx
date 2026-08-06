import React from 'react';
import { Heading } from '@/components';
import { KeyRound } from 'lucide-react';

interface IntroProps {
  step: 1 | 2;
}

const Intro = ({ step }: IntroProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Heading size="h1" className="text-primary">
        Quên mật khẩu?
      </Heading>
      <p className="text-gray-500 text-sm">
        {step === 1
          ? 'Đừng lo lắng, chúng tôi sẽ gửi mã xác nhận đến email của bạn để lấy lại mật khẩu.'
          : 'Vui lòng nhập mã OTP được gửi đến email và mật khẩu mới của bạn.'}
      </p>
    </div>
  );
};

export default Intro;
