import React from 'react';

// Thành phần dùng riêng cho trang  - cột phải
import Hero from './_components/hero';
import PreviewSystem from './_components/preview-system';
import StatCard from './_components/stats-card';

// Thành phần dùng riêng cho trang  - cột trái
import Container from './_components/container';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white md:bg-gray-50/30 p-0 md:p-4 sm:p-6 lg:p-8">
      <div className="w-full min-h-screen md:min-h-fit md:w-[95%] md:max-w-300 bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-xl md:shadow-gray-200/50 p-5 sm:p-6 md:p-10 overflow-y-auto md:overflow-hidden flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cột trái: Quên mật khẩu */}
          <Container />

          {/* Cột phải: Minh họa hệ thống */}
          <div className="hidden md:flex col-span-12 lg:col-span-7 flex-col gap-8 lg:pl-2 justify-between">
            <Hero />
            <StatCard />
            <PreviewSystem />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
