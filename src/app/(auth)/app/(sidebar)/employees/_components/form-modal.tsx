'use client';

import { useEffect, useState } from 'react';

// Components
import { Input, Button, Modal, Select, Avatar } from '@/components';

// Icon thư viện lucide-react
import { CheckCircle2, Camera, Eye, EyeOff, X } from 'lucide-react';

// Thư viện validate dữ liệu
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// React-hook-form
import { useForm } from 'react-hook-form';

// Lấy api từ actions
import { createEmployee, updateEmployee } from '@/actions/employee';

// Load ra thông báo
import toast from 'react-hot-toast';

// Thư viện react query
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';

// Lấy employee types
import { Employee } from '@/types';

// Định nghĩa Props cho Modal
interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Employee | null;
}

// Schema chung cho Form
const baseEmployeeSchema = z.object({
  fullName: z.string().min(1, { message: 'Họ và tên không được để trống' }),
  username: z.string().min(1, { message: 'Tên đăng nhập không được để trống' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  phoneNumber: z.string().min(1, { message: 'Số điện thoại không được để trống' }),
  identifyCode: z
    .string()
    .min(1, { message: 'Mã định danh/CCCD không được để trống' })
    .regex(/^\d{9,12}$/, { message: 'Mã định danh/CCCD không hợp lệ' }),
  gender: z.string(),
  birthday: z.string().optional(),
  address: z.string().min(1, { message: 'Địa chỉ không được để trống' }),
  joinedAt: z.string().optional(),
  attendancePolicy: z.string(),
  avatar: z.any().optional(),
});

// Schema dành riêng cho TẠO MỚI (Bắt buộc mật khẩu)
const createEmployeeSchema = baseEmployeeSchema.extend({
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

// Schema dành riêng cho CẬP NHẬT (Mật khẩu là tùy chọn, nếu điền mới validate)
const updateEmployeeSchema = baseEmployeeSchema.extend({
  password: z.string().optional(),
});

export default function EmployeeFormModal({ isOpen, onClose, title, submitText = 'Xác nhận', initialData }: EmployeeFormModalProps) {
  // Chọn schema linh hoạt theo việc có initialData hay không
  const isEditMode = Boolean(initialData);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditMode ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: {
      gender: 'male',
      attendancePolicy: 'administrative',
    },
  });

  const avatarValue = watch('avatar');
  const fullNameValue = watch('fullName');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Cập nhật Preview Ảnh
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
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
          setPreviewUrl(avatarPath);
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';
          const separator = baseUrl.endsWith('/') || avatarPath.startsWith('/') ? '' : '/';
          setPreviewUrl(`${baseUrl}${separator}${avatarPath}`);
        }
      } else {
        setPreviewUrl(null);
      }
    }
  }, [avatarValue, initialData]);

  // Mutation Tạo
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: ({ data, file }: { data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'roles' | 'positions'> & { password?: string }; file?: File }) => createEmployee(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Thêm nhân sự thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi khi thêm nhân sự');
    },
  });

  // Mutation Cập nhật
  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data, file }: { id: string; data: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>; file?: File }) => updateEmployee(id, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Cập nhật thông tin nhân sự thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi khi cập nhật nhân sự');
    },
  });

  // Reset form khi mở Modal hoặc đổi initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
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
        });
      } else {
        reset({
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
        });
      }
    }
  }, [isOpen, initialData, reset]);

  // Hàm xử lý gửi Form
  const handleConfirm = (data: any) => {
    const file = avatarValue?.[0];

    const body: any = {
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber,
      identifyCode: data.identifyCode,
      gender: data.gender,
      birthday: data.birthday, // Đã bổ sung ngày sinh
      joinedAt: data.joinedAt, // Đã bổ sung ngày gia nhập
      attendancePolicy: data.attendancePolicy,
      address: data.address,
    };

    if (data.avatar === null) {
      body.avatar = null;
    }

    if (isEditMode && initialData?.id) {
      updateMutate({ id: initialData.id, data: body, file });
    } else {
      body.password = data.password;
      createMutate({ data: body, file });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)} autoComplete="off" className="flex flex-col gap-4 py-2">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center gap-2 py-1">
          <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-50 flex items-center justify-center shadow-xs">
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Avatar name={fullNameValue || 'Nhân sự'} size="xl" />
            )}
            <label
              htmlFor="avatar-file-input"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white text-[11px]"
            >
              <Camera size={22} />
              <span>Chọn ảnh</span>
            </label>
            <input id="avatar-file-input" type="file" accept="image/*" className="hidden" {...register('avatar')} />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="avatar-file-input" className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
              <Camera size={14} />
              <span>Chọn ảnh đại diện</span>
            </label>
            {previewUrl && (
              <button
                type="button"
                className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                onClick={() => setValue('avatar', null)}
              >
                <span>Xóa ảnh</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Họ và tên */}
          <Input label="Họ và tên *" placeholder="Nhập họ và tên" fullWidth {...register('fullName')} error={errors.fullName?.message} />

          {/* Tên đăng nhập */}
          <Input
            label="Tên đăng nhập *"
            placeholder="Nhập tên đăng nhập"
            autoComplete="off"
            fullWidth
            {...register('username')}
            error={errors.username?.message}
          />

          {/* Mật khẩu */}
          {!isEditMode && (
            <div className="relative w-full">
              <Input
                label="Mật khẩu *"
                placeholder="Nhập mật khẩu"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                fullWidth
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10.5 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center bg-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {/* Email */}
          <Input label="Email *" placeholder="example@gmail.com" type="email" fullWidth {...register('email')} error={errors.email?.message} />

          {/* Số điện thoại */}
          <Input
            label="Số điện thoại *"
            placeholder="Nhập số điện thoại"
            fullWidth
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />

          {/* CCCD */}
          <Input
            label="Căn cước công dân *"
            placeholder="Nhập căn cước công dân"
            fullWidth
            {...register('identifyCode')}
            error={errors.identifyCode?.message}
          />

          {/* Giới tính */}
          <Select
            label="Giới tính"
            {...register('gender')}
            options={[
              { value: 'male', label: 'Nam' },
              { value: 'female', label: 'Nữ' },
              { value: 'other', label: 'Khác' },
            ]}
          />

          {/* Ngày sinh */}
          <Input label="Ngày sinh" type="date" fullWidth {...register('birthday')} error={errors.birthday?.message} />

          {/* Ngày gia nhập */}
          <Input label="Ngày gia nhập" type="date" fullWidth {...register('joinedAt')} error={errors.joinedAt?.message} />

          {/* Chính sách */}
          <Select
            label="Chính sách chấm công"
            {...register('attendancePolicy')}
            options={[
              { value: 'administrative', label: 'Hành chính' },
              { value: 'seasonal', label: 'Thời vụ' },
              { value: 'part_time', label: 'Part-time' },
            ]}
          />
        </div>

        {/* Địa chỉ */}
        <Input label="Địa chỉ *" placeholder="Nhập địa chỉ cư trú" fullWidth {...register('address')} error={errors.address?.message} />

        {/* Nut huỷ và Lưu */}
        <div className="flex gap-2 justify-end w-full mt-4">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" size="sm" leftIcon={<CheckCircle2 size={16} />} disabled={isPending} loading={isPending}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export { EmployeeFormModal };
