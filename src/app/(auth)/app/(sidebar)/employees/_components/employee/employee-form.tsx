'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';

import { Input, Select } from '@/components';
import { createEmployee, updateEmployee } from '@/actions/employee';
import queryClient from '@/utils/query';
import { Employee } from '@/types';
import { cn } from '@/utils/cn';

import { AvatarUpload } from './avatar-upload';
import { DuplicateUserModal } from './duplicate-user-modal';
import { useEmployeeCheck } from './use-employee-check';

interface EmployeeFormProps {
  initialData?: Employee | null;
  /** Gọi sau khi lưu thành công */
  onDone: () => void;
  onPendingChange?: (pending: boolean) => void;
  /** Phạm vi own/dept: chỉ sửa thông tin cá nhân cơ bản (ẩn tên đăng nhập, CCCD, ngày vào làm, chính sách chấm công) */
  limited?: boolean;
}

const baseEmployeeSchema = z.object({
  fullName: z.string().min(1, { message: 'Họ và tên không được để trống' }),
  username: z.string().min(1, { message: 'Tên đăng nhập không được để trống' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  phoneNumber: z.string().min(1, { message: 'Số điện thoại không được để trống' }),
  identifyCode: z
    .string()
    .min(1, { message: 'Mã định danh/CCCD không được để trống' })
    .regex(/^\d{9,12}$/, { message: 'Mã định danh/CCCD không hợp lệ (9-12 chữ số)' }),
  gender: z.string(),
  birthday: z.string().optional(),
  address: z.string().min(1, { message: 'Địa chỉ không được để trống' }),
  joinedAt: z.string().optional(),
  attendancePolicy: z.string(),
  avatar: z.any().optional(),
});

const createEmployeeSchema = baseEmployeeSchema.extend({
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

const updateEmployeeSchema = baseEmployeeSchema.extend({
  password: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof createEmployeeSchema>;

const limitedEmployeeSchema = updateEmployeeSchema.omit({ username: true, identifyCode: true, joinedAt: true, attendancePolicy: true });

export const EMPLOYEE_FORM_ID = 'employee-form';

// Form thêm/sửa nhân sự: chỉ có phần thân, drawer cha lo khung và nút Lưu (submit bằng form={EMPLOYEE_FORM_ID})
export function EmployeeForm({ initialData, onDone, onPendingChange, limited = false }: EmployeeFormProps) {
  const isOpen = true;
  const isEditMode = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(isEditMode ? (limited ? limitedEmployeeSchema : updateEmployeeSchema) : createEmployeeSchema) as unknown as Resolver<EmployeeFormValues>,
    defaultValues: { gender: 'male', attendancePolicy: 'administrative' },
  });

  const avatarValue = watch('avatar');
  const fullNameValue = watch('fullName');
  const emailValue = watch('email');
  const identifyCodeValue = watch('identifyCode');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Hook xử lý kiểm tra trùng lặp email và CCCD
  const {
    emailStatus,
    cccdStatus,
    existingUser,
    duplicateField,
    isDuplicateModalOpen,
    checkEmailExistence,
    checkCccdExistence,
    handleCancelDuplicate,
  } = useEmployeeCheck({
    emailValue,
    identifyCodeValue,
    isEditMode,
    isOpen,
    setError,
    clearErrors,
  });

  // Quản lý xem trước ảnh đại diện
  useEffect(() => {
    if (avatarValue && avatarValue.length > 0) {
      const file = avatarValue[0];
      if (file instanceof File || file instanceof Blob) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    } else if (avatarValue === null) {
      setPreviewUrl(null);
    } else {
      const avatarPath = initialData?.avatar;
      if (avatarPath) {
        const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';
        const separator = baseUrl.endsWith('/') || avatarPath.startsWith('/') ? '' : '/';
        setPreviewUrl(avatarPath.startsWith('http') ? avatarPath : `${baseUrl}${separator}${avatarPath}`);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [avatarValue, initialData]);

  // Mutation Thêm mới
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: ({ data, file }: { data: any; file?: File }) => createEmployee(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Thêm nhân sự thành công');
      onDone();
      reset();
    },
    onError: (err: any) => toast.error(err?.message || 'Lỗi khi thêm nhân sự'),
  });

  // Mutation Cập nhật
  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data, file }: { id: string; data: any; file?: File }) => updateEmployee(id, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Cập nhật thông tin nhân sự thành công');
      onDone();
      reset();
    },
    onError: (err: any) => toast.error(err?.message || 'Lỗi khi cập nhật nhân sự'),
  });

  // Mutation Khôi phục tài khoản đã xóa
  const { mutate: restoreMutate, isPending: isRestoring } = useMutation({
    mutationFn: (userId: string) => updateEmployee(userId, { deletedAt: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Khôi phục tài khoản nhân sự thành công!');
      onDone();
      reset();
    },
    onError: (err: any) => toast.error(err?.message || 'Lỗi khi khôi phục tài khoản'),
  });

  // Reset form khi đóng/mở modal
  useEffect(() => {
    if (!isOpen) return;
    reset(
      initialData
        ? {
            fullName: initialData.fullName || '',
            username: initialData.username || '',
            password: '',
            email: initialData.email || '',
            phoneNumber: initialData.phoneNumber || '',
            identifyCode: initialData.identifyCode || '',
            gender: initialData.gender || 'male',
            birthday: initialData.birthday ? initialData.birthday.split('T')[0] : '',
            address: initialData.address || '',
            joinedAt: initialData.joinedAt ? initialData.joinedAt.split('T')[0] : '',
            attendancePolicy: initialData.attendancePolicy || 'administrative',
          }
        : {
            fullName: '',
            username: '',
            password: '',
            email: '',
            phoneNumber: '',
            identifyCode: '',
            gender: 'male',
            birthday: '',
            address: '',
            joinedAt: '',
            attendancePolicy: 'administrative',
          },
    );
  }, [isOpen, initialData, reset]);

  const handleConfirm = (data: any) => {
    if (emailStatus === 'duplicate' || cccdStatus === 'duplicate') return;
    const file = avatarValue?.[0];
    const body = { ...data, avatar: data.avatar === null ? null : undefined };

    if (isEditMode && initialData?.id) {
      updateMutate({ id: initialData.id, data: body, file });
    } else {
      createMutate({ data: body, file });
    }
  };

  const isPending = isCreating || isUpdating || isRestoring;

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  return (
    <>
      <form id={EMPLOYEE_FORM_ID} onSubmit={handleSubmit(handleConfirm)} autoComplete="off" className="flex flex-col gap-4">
        {/* Avatar Preview */}
        <AvatarUpload previewUrl={previewUrl} fullName={fullNameValue} register={register} setValue={setValue} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <Input label="Họ và tên *" placeholder="Nhập họ và tên" fullWidth {...register('fullName')} error={errors.fullName?.message} />
          {!limited && (
            <Input label="Tên đăng nhập *" placeholder="Nhập tên đăng nhập" fullWidth {...register('username')} error={errors.username?.message} />
          )}

          {!isEditMode && (
            <div className="relative w-full">
              <Input
                label="Mật khẩu *"
                placeholder="Nhập mật khẩu"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10.5 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 select-none">Email *</label>
              {emailStatus === 'checking' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-control animate-pulse">
                  <Loader2 size={12} className="animate-spin text-amber-600" />
                  Đang kiểm tra...
                </span>
              )}
              {emailStatus === 'valid' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-control">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  Email hợp lệ
                </span>
              )}
              {emailStatus === 'duplicate' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-control">
                  <XCircle size={12} className="text-rose-600" />
                  Đã tồn tại
                </span>
              )}
            </div>
            <Input
              placeholder="example@gmail.com"
              type="email"
              fullWidth
              {...register('email')}
              onBlur={() => checkEmailExistence()}
              className={cn(
                emailStatus === 'checking' && 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20',
                emailStatus === 'valid' && 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/10',
                emailStatus === 'duplicate' && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10',
              )}
              error={errors.email?.message}
            />
          </div>

          <Input
            label="Số điện thoại *"
            placeholder="Nhập số điện thoại"
            fullWidth
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />

          {/* CCCD Field */}
          {!limited && (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 select-none">Căn cước công dân *</label>
              {cccdStatus === 'checking' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-control animate-pulse">
                  <Loader2 size={12} className="animate-spin text-amber-600" />
                  Đang kiểm tra...
                </span>
              )}
              {cccdStatus === 'valid' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-control">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  CCCD hợp lệ
                </span>
              )}
              {cccdStatus === 'duplicate' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-control">
                  <XCircle size={12} className="text-rose-600" />
                  Đã tồn tại
                </span>
              )}
            </div>
            <Input
              placeholder="Nhập CCCD (9-12 số)"
              fullWidth
              {...register('identifyCode')}
              onBlur={() => checkCccdExistence()}
              className={cn(
                cccdStatus === 'checking' && 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20',
                cccdStatus === 'valid' && 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/10',
                cccdStatus === 'duplicate' && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10',
              )}
              error={errors.identifyCode?.message}
            />
          </div>
          )}

          <Select
            label="Giới tính"
            value={watch('gender') || 'male'}
            {...register('gender')}
            options={[
              { value: 'male', label: 'Nam' },
              { value: 'female', label: 'Nữ' },
              { value: 'other', label: 'Khác' },
            ]}
          />
          <Input label="Ngày sinh" type="date" fullWidth {...register('birthday')} error={errors.birthday?.message} />
          {!limited && (
            <Input label="Ngày gia nhập" type="date" fullWidth {...register('joinedAt')} error={errors.joinedAt?.message} />
          )}
          {!limited && <Select
            label="Chính sách chấm công"
            value={watch('attendancePolicy') || 'administrative'}
            {...register('attendancePolicy')}
            options={[
              { value: 'administrative', label: 'Hành chính' },
              { value: 'seasonal', label: 'Thời vụ' },
              { value: 'part_time', label: 'Part-time' },
            ]}
          />}
        </div>

        <Input label="Địa chỉ *" placeholder="Nhập địa chỉ cư trú" fullWidth {...register('address')} error={errors.address?.message} />
      </form>

      {/* Modal Cảnh báo Trùng lặp & Khôi phục */}
      <DuplicateUserModal
        isOpen={isDuplicateModalOpen}
        user={existingUser}
        duplicateField={duplicateField}
        isRestoring={isRestoring}
        onRestore={() => existingUser?.id && restoreMutate(existingUser.id)}
        onCancel={handleCancelDuplicate}
      />
    </>
  );
}
