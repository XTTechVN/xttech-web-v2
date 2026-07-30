'use client';

// Các thuộc tính React
import { useState } from 'react';

// Các thuộc tính dùng chung cho toàn bộ trang
import { Button, Checkbox } from '@/components';

// Các icons trong thư viện lucide - react
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
      {/* Nhập email */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-gray-700 select-none">
          Email Address
        </label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={16} className="text-gray-400" />
          </div>
          <input
            type="email"
            placeholder="youremail@example.com"
            className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-gray-200 rounded-xl outline-none transition-all duration-200 text-gray-900 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Nhập mật khẩu */}
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-gray-700 select-none">
            Password
          </label>
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full h-11 pl-10 pr-10 text-sm bg-white border border-gray-200 rounded-xl outline-none transition-all duration-200 text-gray-900 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Ghi nhớ đăng nhập và quên mật khẩu */}
      <div className="flex items-center justify-between mt-1">
        <Checkbox label="Ghi nhớ đăng nhập" className="text-xs" />
        <a href="#forgot" className="text-xs font-medium text-primary hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      {/* Nút đăng nhập */}
      <Button type="submit" size="lg" fullWidth className="mt-2 rounded-xl">
        Đăng nhập
      </Button>
    </form>
  );
};

export default LoginForm;