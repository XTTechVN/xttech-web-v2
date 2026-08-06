'use client';
import React, { useState } from 'react';
import { Input, Button } from '@/components';
import { Eye, EyeOff } from 'lucide-react';

interface FormProps {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
}

const Form = ({ step, setStep }: FormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (step === 1) {
      setStep(2);
    } else {
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp!');
        return;
      }
      alert('Đổi mật khẩu thành công! Chức năng API sẽ được tích hợp sau.');
    }
  };

  return (
    <form 
      className="flex flex-col gap-4 mt-2" 
      onSubmit={handleSubmit}
    >
      {step === 1 ? (
        <Input
          label="Địa chỉ Email"
          type="email"
          placeholder="name@example.com"
          required
        />
      ) : (
        <>
          <Input
            label="Mã xác nhận (OTP)"
            type="text"
            placeholder="Nhập mã 6 số"
            required
          />
          
          <div className="relative">
            <Input
              label="Mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8.5 text-gray-400 hover:text-gray-500 transition cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              error={error}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8.5 text-gray-400 hover:text-gray-500 transition cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </>
      )}

      <Button type="submit" size="lg" fullWidth className="mt-2 rounded-xl">
        {step === 1 ? 'Gửi mã xác nhận' : 'Đặt lại mật khẩu'}
      </Button>
    </form>
  );
};

export default Form;
