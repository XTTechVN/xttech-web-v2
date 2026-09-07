// Thành phần dùng chung cho toàn bộ trang
import { Heading, XTLogo } from '@/components';

const LoginIntro = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <XTLogo className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(4,88,99,0.35)]" />
        <span className="font-bold text-primary text-2xl tracking-tight">XTTECH</span>
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-semibold">Chào mừng trở lại</span>
        </div>
        <Heading size="h1" className="text-xl md:text-2xl font-bold text-primary tracking-tight mt-1 leading-tight">
          Đăng nhập vào hệ thống XTTECH
        </Heading>
        <p className="text-[11px] text-gray-500 leading-relaxed">Đăng nhập để sử dụng các tính năng của hệ thống</p>
      </div>
    </div>
  );
};

export default LoginIntro;
