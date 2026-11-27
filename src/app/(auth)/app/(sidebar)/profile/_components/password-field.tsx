'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  error?: string;
}

// Ô mật khẩu có nút hiện/ẩn (vùng chạm 44px)
export function PasswordField({ label, value, onChange, autoComplete, error }: PasswordFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input
        fullWidth
        label={label}
        type={shown ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-0 top-[1.375rem] flex size-10 cursor-pointer items-center justify-center text-slate-500 md:hover:text-slate-700"
      >
        {shown ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
