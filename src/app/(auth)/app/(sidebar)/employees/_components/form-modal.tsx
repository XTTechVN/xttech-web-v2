'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';

import { Input, Button, Modal, Select } from '@/components';
import { createEmployee, updateEmployee } from '@/actions/employee';
import queryClient from '@/utils/query';
import { Employee } from '@/types';
import { cn } from '@/utils/cn';

import { AvatarUpload } from './avatar-upload';
import { DuplicateUserModal } from './duplicate-user-modal';
import { useEmployeeCheck } from './use-employee-check';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Employee | null;
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

export default function EmployeeFormModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận',
  initialData,
}: EmployeeFormModalProps) {
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
  } = useForm({
    resolver: zodResolver(isEditMode ? updateEmployeeSchema : createEmployeeSchema),
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
      onClose();
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
      onClose();
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
      onClose();
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
          }
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

  return (
    <>
      <Modal size="lg" isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full">
        <form onSubmit={handleSubmit(handleConfirm)} autoComplete="off" className="flex flex-col gap-4 py-2">
          {/* Avatar Preview */}
          <AvatarUpload previewUrl={previewUrl} fullName={fullNameValue} register={register} setValue={setValue} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Họ và tên *" placeholder="Nhập họ và tên" fullWidth {...register('fullName')} error={errors.fullName?.message} />
            <Input label="Tên đăng nhập *" placeholder="Nhập tên đăng nhập" fullWidth {...register('username')} error={errors.username?.message} />

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
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md animate-pulse">
                    <Loader2 size={12} className="animate-spin text-amber-600" />
                    Đang kiểm tra...
                  </span>
                )}
                {emailStatus === 'valid' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Email hợp lệ
                  </span>
                )}
                {emailStatus === 'duplicate' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
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
                  emailStatus === 'duplicate' && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10'
                )}
                error={errors.email?.message}
              />
            </div>

            <Input label="Số điện thoại *" placeholder="Nhập số điện thoại" fullWidth {...register('phoneNumber')} error={errors.phoneNumber?.message} />

            {/* CCCD Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 select-none">Căn cước công dân *</label>
                {cccdStatus === 'checking' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md animate-pulse">
                    <Loader2 size={12} className="animate-spin text-amber-600" />
                    Đang kiểm tra...
                  </span>
                )}
                {cccdStatus === 'valid' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    CCCD hợp lệ
                  </span>
                )}
                {cccdStatus === 'duplicate' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
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
                  cccdStatus === 'duplicate' && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10'
                )}
                error={errors.identifyCode?.message}
              />
            </div>

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
            <Input label="Ngày gia nhập" type="date" fullWidth {...register('joinedAt')} error={errors.joinedAt?.message} />
            <Select
              label="Chính sách chấm công"
              value={watch('attendancePolicy') || 'administrative'}
              {...register('attendancePolicy')}
              options={[
                { value: 'administrative', label: 'Hành chính' },
                { value: 'seasonal', label: 'Thời vụ' },
                { value: 'part_time', label: 'Part-time' },
              ]}
            />
          </div>

          <Input label="Địa chỉ *" placeholder="Nhập địa chỉ cư trú" fullWidth {...register('address')} error={errors.address?.message} />

          <div className="flex gap-2 justify-end w-full mt-4">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" size="sm" disabled={isPending} loading={isPending}>
              {submitText}
            </Button>
          </div>
        </form>
      </Modal>

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

export { EmployeeFormModal };
