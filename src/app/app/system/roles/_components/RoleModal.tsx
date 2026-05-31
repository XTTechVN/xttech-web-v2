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
import { Role } from '@/types/shared/role';

export interface RoleFormData {
  name: string;
  code: string;
  description: string;
}

export default function RoleModal({
  isLoading,
  onClose,
  onSave,
  defaultValues,
}: {
  isLoading: boolean;
  onClose: () => void;
  onSave: (value: RoleFormData) => void;
  defaultValues?: Role;
}) {
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || '',
        code: defaultValues.code || '',
        description: defaultValues.description || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: RoleFormData) => {
    onSave(data);
  };

  const nameRegister = register('name', { required: 'Tên vai trò là bắt buộc' });
  const codeRegister = register('code', { required: 'Mã vai trò là bắt buộc' });
  const descriptionRegister = register('description');

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-lg h-fit max-h-[90vh] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>{isEdit ? 'Cập nhật vai trò' : 'Thêm vai trò mới'}</Heading>
          <SubHeading>
            {isEdit
              ? 'Vui lòng kiểm tra lại thông tin trước khi cập nhật'
              : 'Vui lòng kiểm tra lại thông tin trước khi thêm mới'}
          </SubHeading>
          <SubHeading>
            <span className="text-amber-600">
              Trường "Mã vai trò" không thể chỉnh sửa sau khi tạo
            </span>
          </SubHeading>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="rounded-full hover:bg-transparent"
        >
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Tên & Mã Vai Trò */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <Label>Tên vai trò</Label>
              <Input
                placeholder="Quản trị viên"
                name={nameRegister.name}
                onChange={nameRegister.onChange}
                onBlur={nameRegister.onBlur}
                ref={nameRegister.ref}
                error={errors.name?.message}
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <Label>Mã vai trò</Label>
              <Input
                placeholder="admin"
                disabled={isEdit}
                name={codeRegister.name}
                onChange={codeRegister.onChange}
                onBlur={codeRegister.onBlur}
                ref={codeRegister.ref}
                error={errors.code?.message}
              />
            </div>
          </div>

          {/* Mô tả */}
          <div className="flex flex-col gap-1">
            <Label>Mô tả</Label>
            <Input
              placeholder="Có toàn quyền quản trị toàn bộ hệ thống"
              name={descriptionRegister.name}
              onChange={descriptionRegister.onChange}
              onBlur={descriptionRegister.onBlur}
              ref={descriptionRegister.ref}
              error={errors.description?.message}
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
              {isLoading ? 'Đang xử lý...' : isEdit ? 'Cập nhật vai trò' : 'Thêm vai trò'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
