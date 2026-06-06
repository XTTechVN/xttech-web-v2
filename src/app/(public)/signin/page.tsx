'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Lock, User as UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores';

type SignInInputs = {
  username: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const { signin } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInputs>({
    defaultValues: {
      username: 'admin',
      password: '123456',
    },
  });

  const onSubmit = async (data: SignInInputs) => {
    try {
      // 1. Call API đăng nhập
      // const response: AxiosResponse<User> = await api.post('/api/v1/auth/signin', data);

      const success = await signin(data.username, data.password);

      if (success) {
        router.push('/app');
      }

      setTimeout(() => {
        toast.success('Đăng nhập thành công');
      }, 500);
    } catch (error: any) {
      // 1. Lấy detail từ response (có fallback)
      const detail = error.response?.data?.detail;

      // 2. Hiển thị toast thông báo lỗi an toàn
      if (typeof detail === 'string') {
        toast.error(
          detail === 'Incorrect username or password' ? 'Sai tài khoản hoặc mật khẩu' : detail,
        );
      } else if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
        const message = detail.message;
        toast.error(
          message === 'Incorrect username or password'
            ? 'Sai tài khoản hoặc mật khẩu'
            : message || 'Có lỗi xảy ra, vui lòng thử lại',
        );
      } else if (Array.isArray(detail)) {
        // Trường hợp lỗi validation của FastAPI (Pydantic trả về mảng objects có key 'msg')
        const firstErrorMsg = detail[0]?.msg;
        toast.error(firstErrorMsg ? `Lỗi dữ liệu: ${firstErrorMsg}` : 'Dữ liệu không hợp lệ');
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    }
  };

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Dark blue top section */}
      <div className="bg-blue-dark text-white h-full flex items-center justify-center">
        {/* Main */}
        <div className="bg-white shadow-2xl px-10 py-20 max-w-md w-full border border-slate-100 rounded-lg">
          <div className="text-center mb-10">
            <h1 className="text-3xl text-slate-900 font-bold mb-3">Đăng Nhập</h1>
            <p className="text-slate-500 text-sm">
              Truy cập vào bảng điều khiển hệ thống quản lý AI
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2"
                htmlFor="username"
              >
                Tài Khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  {...register('username', { required: 'Vui lòng nhập tài khoản' })}
                  className={`block w-full pl-10 pr-4 py-3 border ${
                    errors.username ? 'border-red-500' : 'border-slate-200'
                  } text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-dark focus:border-transparent outline-none transition-all`}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                  className={`block w-full pl-10 pr-4 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-slate-200'
                  } text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-dark focus:border-transparent outline-none transition-all`}
                  placeholder="Nhập mật khẩu"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-dark hover:bg-[#1a4470] text-white py-3 transition-colors font-semibold shadow-md mt-6"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
