'use client';

// Các thuộc tính React
import { useState, useTransition } from 'react';

// Các thuộc tính dùng chung cho toàn bộ trang
import { Button, Checkbox, Input } from '@/components';

import { useAuthStore } from '@/stores';

// Các thông báo Toast
import { toast } from 'react-hot-toast';

// Nhập router điều hướng
import { useRouter } from 'next/navigation';

// Icons của lucide-react
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setPasswordError('');
    setError('');

    let hasError = false;
    if (!username) {
      setUsernameError('Vui lòng nhập vào tên đăng nhập');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Vui lòng nhập vào mật khẩu');
      hasError = true;
    }

    if (hasError) return;
    // Xử lý logic đăng nhập
    startTransition(async () => {
      const success = await useAuthStore.getState().signin(username, password);
      if (success) {
        toast.success('Đăng nhập thành công!');
        router.push('/app/dashboard');
      } else {
        const errorMsg = 'Tên đăng nhập hoặc mật khẩu không chính xác';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    });
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      {error && <div className="text-red-500 text-xs bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">{error}</div>}

      {/* Nhập tên đăng nhập */}
      <Input
        label="Tên đăng nhập"
        type="text"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (usernameError) setUsernameError('');
        }}
        placeholder="Nhập tên đăng nhập"
        error={usernameError}
      />

      {/* Nhập mật khẩu */}
      <div className="relative">
        <Input
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError('');
          }}
          placeholder="••••••••"
          error={passwordError}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8.5 text-gray-400 hover:text-gray-500 transition cursor-pointer"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Ghi nhớ đăng nhập và quên mật khẩu */}
      <div className="flex items-center justify-between mt-1">
        <Checkbox label="Ghi nhớ đăng nhập" className="text-xs" />
        <a href="#forgot" className="text-xs font-medium text-primary hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      {/* Nút đăng nhập */}
      <Button type="submit" size="lg" fullWidth className="mt-2 rounded-xl" disabled={isPending}>
        {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
};

export default LoginForm;
