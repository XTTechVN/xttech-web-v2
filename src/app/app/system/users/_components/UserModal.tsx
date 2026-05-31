'use client';

import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { PlusIcon, SaveIcon, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { User } from '@/types/shared/user';

export interface UserFormData {
  email: string;
  username: string;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
  password?: string;
}

export default function UserModal({
  isLoading,
  onClose,
  onSave,
  defaultValues,
}: {
  isLoading: boolean;
  onClose: () => void;
  onSave: (value: UserFormData) => void;
  defaultValues?: User;
}) {
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      email: '',
      username: '',
      fullName: '',
      phone: null,
      avatar: null,
      password: '',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        email: defaultValues.email || '',
        username: defaultValues.username || '',
        fullName: defaultValues.fullName || '',
        phone: defaultValues.phone || null,
        avatar: defaultValues.avatar || null,
        password: '',
      });
    } else {
      reset({
        email: '',
        username: '',
        fullName: '',
        phone: null,
        avatar: null,
        password: '',
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: UserFormData) => {
    // If updating, exclude empty password
    if (isEdit && !data.password) {
      delete data.password;
    }
    onSave(data);
  };

  const fullNameRegister = register('fullName', { required: 'Họ và tên là bắt buộc' });
  const usernameRegister = register('username', { required: 'Tên đăng nhập là bắt buộc' });
  const emailRegister = register('email', { required: 'Email là bắt buộc', minLength: 3 });
  const phoneRegister = register('phone');
  const passwordRegister = register('password', {
    required: isEdit ? false : 'Mật khẩu là bắt buộc',
    minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' },
  });

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-lg h-fit max-h-[90vh] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>{isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</Heading>
          <SubHeading>
            {isEdit
              ? 'Vui lòng kiểm tra lại thông tin trước khi cập nhật'
              : 'Vui lòng kiểm tra lại thông tin trước khi thêm mới'}
          </SubHeading>
        </div>

        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Họ và Tên */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1">
              <Label>Họ và tên</Label>
              <Input
                placeholder="Nguyễn Văn A"
                name={fullNameRegister.name}
                onChange={fullNameRegister.onChange}
                onBlur={fullNameRegister.onBlur}
                ref={fullNameRegister.ref}
                error={errors.fullName?.message}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="nguyenvan@gmail.com"
                name={emailRegister.name}
                onChange={emailRegister.onChange}
                onBlur={emailRegister.onBlur}
                ref={emailRegister.ref}
                error={errors.email?.message}
              />
            </div>
          </div>

          <div className="flex gap-4">
            {/* Tên Đăng Nhập */}
            <div className="flex flex-col gap-1">
              <Label>Tên đăng nhập</Label>
              <Input
                placeholder="nguyenvanad"
                name={usernameRegister.name}
                onChange={usernameRegister.onChange}
                onBlur={usernameRegister.onBlur}
                ref={usernameRegister.ref}
                error={errors.username?.message}
              />
            </div>

            {/* Số Điện Thoại */}
            <div className="flex flex-col gap-1">
              <Label>Số điện thoại</Label>
              <Input
                placeholder="0987654321"
                name={phoneRegister.name}
                onChange={phoneRegister.onChange}
                onBlur={phoneRegister.onBlur}
                ref={phoneRegister.ref}
                error={errors.phone?.message}
              />
            </div>
          </div>

          {/* Mật Khẩu */}
          <div className="flex flex-col gap-1">
            <Label>{isEdit ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}</Label>
            <Input
              type="password"
              placeholder={isEdit ? '••••••••' : 'Nhập mật khẩu'}
              name={passwordRegister.name}
              onChange={passwordRegister.onChange}
              onBlur={passwordRegister.onBlur}
              ref={passwordRegister.ref}
              error={errors.password?.message}
            />
          </div>

          {/* Button Submit */}
          <div className="flex flex-col items-center justify-end gap-2 mt-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              icon={
                isLoading ? (
                  <Loading size={16} />
                ) : isEdit ? (
                  <SaveIcon size={16} />
                ) : (
                  <PlusIcon size={16} />
                )
              }
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : isEdit ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
