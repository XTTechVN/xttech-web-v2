'use client';

// Các thuộc tính React
import { useEffect, useState, useTransition } from 'react';

// Các thuộc tính dùng chung cho toàn bộ trang
import { Button, Checkbox, Input } from '@/components';

import { useAuthStore } from '@/stores';

// Các thông báo Toast
import { toast } from 'react-hot-toast';

// Nhập router điều hướng
import { useRouter } from 'next/navigation';

// Icons của lucide-react
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

import { useForm } from 'react-hook-form';
import { readLastOrg, saveLastOrg } from '@/utils/last-org';

const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      orgCode: '',
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    const last = readLastOrg();
    if (last) setValue('orgCode', last);
  }, [setValue]);

  // Hàm xử lý khi người dùng submit form
  const onSubmit = (data: any) => {
    setError('');

    // Xử lý logic đăng nhập
    startTransition(async () => {
      const success = await useAuthStore.getState().signin(data.username, data.password, data.orgCode.trim());
      if (success) {
        saveLastOrg(data.orgCode.trim());
        toast.success('Đăng nhập thành công!');
        // Mã doanh nghiệp `system` = quản trị nền tảng: vào thẳng /platform
        const target = data.orgCode.trim().toLowerCase() === 'system' ? '/platform' : '/app/dashboard';
        window.location.replace(`${target}?_t=` + Date.now());
      } else {
        const errorMsg = 'Tên đăng nhập hoặc mật khẩu không chính xác';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    });
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      {error && <div className="text-red-500 text-xs bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">{error}</div>}

      {/* Mã doanh nghiệp: nhớ lần đăng nhập trước */}
      <Input
        label="Mã doanh nghiệp"
        type="text"
        placeholder="Ví dụ: xuan_tiep_window"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="organization"
        className="h-11 lg:h-10"
        {...register('orgCode')}
      />

      {/* Nhập tên đăng nhập */}
      <Input
        label="Tên đăng nhập"
        type="text"
        placeholder="Nhập tên đăng nhập"
        autoComplete="username"
        className="h-11 lg:h-10"
        error={errors.username?.message}
        {...register('username', { required: 'Vui lòng nhập vào tên đăng nhập' })}
      />

      {/* Nhập mật khẩu */}
      <div className="relative">
        <Input
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          className="h-11 pr-11 lg:h-10"
          autoComplete="current-password"
          {...register('password', { required: 'Vui lòng nhập vào mật khẩu' })}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="absolute right-0 top-6.5 flex h-11 w-11 items-center justify-center text-gray-400 hover:text-gray-500 transition cursor-pointer lg:h-10"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Ghi nhớ đăng nhập và quên mật khẩu */}
      <div className="flex items-center justify-between mt-1">
        <Checkbox label="Ghi nhớ đăng nhập" labelClassName="text-xs sm:text-sm" />
        <Link href="/forgot-password" className="text-xs sm:text-sm font-medium text-primary hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      {/* Nút đăng nhập */}
      <Button type="submit" size="lg" fullWidth className="mt-2" disabled={isPending}>
        {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
};

export default LoginForm;
