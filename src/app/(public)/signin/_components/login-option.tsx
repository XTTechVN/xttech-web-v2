import Link from 'next/link';

// Thành phần dùng chung cho toàn trang
import { Button } from '@/components';

// Icon Google
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

// Icon Microsoft
const MicrosoftIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1h10v10H1z" fill="#F25022" />
    <path d="M12 1h10v10H12z" fill="#7FBA00" />
    <path d="M1 12h10v10H1z" fill="#00A4EF" />
    <path d="M12 12h10v10H12z" fill="#FFB900" />
  </svg>
);

const LoginOption = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <span className="relative px-3 text-xs font-semibold text-gray-400 bg-white uppercase">OR</span>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          fullWidth
          size="lg"
          className="rounded-xl border-gray-200 hover:border-gray-300 active:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-700 text-sm h-12"
          leftIcon={<GoogleIcon />}
        >
          Đăng nhập với Google
        </Button>
        <Button
          variant="outline"
          fullWidth
          size="lg"
          className="rounded-xl border-gray-200 hover:border-gray-300 active:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-700 text-sm h-12"
          leftIcon={<MicrosoftIcon />}
        >
          Đăng nhập với Microsoft
        </Button>
      </div>
      <div className="text-center text-xs text-gray-500 mt-4">
        Chưa có tài khoản?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Yêu cầu tạo tài khoản
        </Link>
      </div>
    </div>
  );
};

export default LoginOption;
