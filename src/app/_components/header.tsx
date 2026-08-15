import Link from 'next/link';
import { Settings } from 'lucide-react';

// Thành phần dùng chung cho components
import { Button,Heading } from '@/components';

export const Header = () => {
  return (
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <Heading size='h1' className='text-primary'>XTTECH</Heading>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Tính năng</Link>
          <Link href="#" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Về chúng tôi</Link>
          <Link href="#contact" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Liên hệ</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 shadow-sm text-white">Đăng Nhập</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
