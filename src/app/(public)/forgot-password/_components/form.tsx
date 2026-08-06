'use client';

import { useState, useEffect } from 'react';

// Thành phần dùng chung cho toàn trang
import { Input, Button } from '@/components';

// Icons từ thư viện lucide - react
import { Eye, EyeOff } from 'lucide-react';

// Hook query từ thư viện react-query
import { useMutation } from '@tanstack/react-query';

// Hàm quên mật khẩu, đặt lại mật khẩu lấy từ actions
import { forgetPassword, resetPasswordWithOtp } from '@/actions/auth';

import { toast } from 'react-hot-toast';

// Hook Router
import { useRouter } from 'next/navigation';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';

// Kiểu dữ liệu cho props
interface FormProps {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
}

// Schema dùng để validate form
const forgotPasswordSchema = z
  .object({
    step: z.union([z.literal(1), z.literal(2)]),
    email: z.string().email('Email không đúng định dạng').min(1, 'Vui lòng nhập email'),
    otp: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.step === 2) {
      if (!data.otp) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vui lòng nhập mã OTP', path: ['otp'] });
      }
      if (!data.password || data.password.length < 6 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu phải có ít nhất 6 ký tự, gồm 1 chữ hoa, 1 thường, 1 số, 1 ký tự đặc biệt',
          path: ['password'],
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mật khẩu xác nhận không khớp!', path: ['confirmPassword'] });
      }
    }
  });

type FormValues = z.infer<typeof forgotPasswordSchema>;

// Component Form
const Form = ({ step, setStep }: FormProps) => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      step: 1,
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Effect dùng để cập nhật step
  useEffect(() => {
    setValue('step', step);
    setGlobalError('');
  }, [step, setValue]);

  // Mutation dùng để gửi email
  const forgetMutation = useMutation({
    mutationFn: (emailData: string) => forgetPassword(emailData),
    onSuccess: () => {
      toast.success('Mã xác nhận đã được gửi đến email của bạn');
      setStep(2);
    },
    onError: (err: any) => {
      setGlobalError(err.message || 'Lỗi khi gửi email');
      toast.error(err.message || 'Lỗi khi gửi email');
    },
  });

  // Mutation dùng để đặt lại mật khẩu
  const resetMutation = useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) => resetPasswordWithOtp(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      router.push('/signin');
    },
    onError: (err: any) => {
      const errMsg = err.message.toLowerCase().includes('lỗi khi') ? 'Nhập sai mã' : err.message || 'Nhập sai mã';
      setError('otp', { type: 'manual', message: errMsg });
      toast.error(errMsg);
    },
  });

  // Xử lý submit form
  const onSubmit = (data: FormValues) => {
    setGlobalError('');
    if (data.step === 1) {
      forgetMutation.mutate(data.email);
    } else {
      resetMutation.mutate({
        email: data.email,
        otp: data.otp as string,
        newPassword: data.password as string,
      });
    }
  };

  // Check trạng thái đang xử lý
  const isPending = forgetMutation.isPending || resetMutation.isPending;

  return (
    <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit(onSubmit)}>
      {globalError && <div className="text-red-500 text-xs bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">{globalError}</div>}

      {step === 1 ? (
        <Input label="Địa chỉ Email" type="email" placeholder="name@example.com" {...register('email')} error={errors.email?.message} />
      ) : (
        <>
          <Input label="Mã xác nhận (OTP)" type="text" placeholder="Nhập mã 6 số" {...register('otp')} error={errors.otp?.message} />

          <div className="relative">
            <Input
              label="Mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 ${errors.password ? 'top-8.5' : 'top-8.5'} text-gray-400 hover:text-gray-500 transition cursor-pointer`}
              style={errors.password ? { top: '34px' } : undefined}
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
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 ${errors.confirmPassword ? 'top-8.5' : 'top-8.5'} text-gray-400 hover:text-gray-500 transition cursor-pointer`}
              style={errors.confirmPassword ? { top: '34px' } : undefined}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </>
      )}

      <Button type="submit" size="lg" fullWidth className="mt-2 rounded-xl" disabled={isPending}>
        {isPending ? (step === 1 ? 'Đang gửi...' : 'Đang xử lý...') : step === 1 ? 'Gửi mã xác nhận' : 'Đặt lại mật khẩu'}
      </Button>
    </form>
  );
};

export default Form;
