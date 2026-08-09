'use client';

// Thành phần dùng chung cho toàn trang
import { Heading, Button } from '@/components';

// Components riêng cho trang profile
import ProfileCard from './_components/profile-card';

import { LogOut } from 'lucide-react';

const Page = () => {
  const handleLogout = () => {
    localStorage.clear();
    document.cookie = 'xt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    window.location.href = '/signin';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center p-3">
        <div className="flex flex-col gap-2">
          <Heading size="h2" className="text-primary text-xl md:text-3xl">
            Profile
          </Heading>
          <Heading size="h3" className="text-gray-500 text-sm md:text-base">
            Quản lý thông tin cá nhân
          </Heading>
        </div>
      </div>
      <ProfileCard />
      <div className='flex justify-end'>
        <Button
          variant="danger"
          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none flex items-center justify-center gap-2 px-3 sm:px-4"
          type="button"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 md:hidden" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </div>
  );
};

export default Page;
