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
import { Project } from '@/types/shared/project';

export interface ProjectFormData {
  name: string;
  code?: string;
  address?: string;
  description?: string;
  status: string;
}

export default function ProjectModal({
  isLoading,
  onClose,
  onSave,
  defaultValues,
}: {
  isLoading: boolean;
  onClose: () => void;
  onSave: (value: ProjectFormData) => void;
  defaultValues?: Project;
}) {
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      code: '',
      address: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || '',
        code: defaultValues.code || '',
        address: defaultValues.address || '',
        description: defaultValues.description || '',
        status: defaultValues.status || 'ACTIVE',
      });
    } else {
      reset({
        name: '',
        code: '',
        address: '',
        description: '',
        status: 'ACTIVE',
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: ProjectFormData) => {
    onSave(data);
  };

  const nameRegister = register('name', { required: 'Tên dự án là bắt buộc' });
  const codeRegister = register('code', { required: 'Mã dự án là bắt buộc' });
  const addressRegister = register('address');
  const descriptionRegister = register('description');
  const statusRegister = register('status', { required: 'Trạng thái là bắt buộc' });

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-lg h-fit max-h-[90vh] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>{isEdit ? 'Cập nhật dự án' : 'Thêm dự án mới'}</Heading>
          <SubHeading>
            {isEdit
              ? 'Vui lòng kiểm tra lại thông tin trước khi cập nhật'
              : 'Nhập thông tin chi tiết dự án công trường thi công'}
          </SubHeading>
        </div>

        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* Tên dự án & Mã dự án */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 w-full">
              <Label>Tên dự án <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Dự án Cầu Rồng"
                name={nameRegister.name}
                onChange={nameRegister.onChange}
                onBlur={nameRegister.onBlur}
                ref={nameRegister.ref}
                error={errors.name?.message}
              />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Label>Mã dự án <span className="text-red-500">*</span></Label>
              <Input
                placeholder="DA-CR01"
                name={codeRegister.name}
                onChange={codeRegister.onChange}
                onBlur={codeRegister.onBlur}
                ref={codeRegister.ref}
                error={errors.code?.message}
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex flex-col gap-1">
            <Label>Địa chỉ</Label>
            <Input
              placeholder="Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng"
              name={addressRegister.name}
              onChange={addressRegister.onChange}
              onBlur={addressRegister.onBlur}
              ref={addressRegister.ref}
              error={errors.address?.message}
            />
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col gap-1">
            <Label>Trạng thái</Label>
            <div className="relative">
              <select
                name={statusRegister.name}
                onChange={statusRegister.onChange}
                onBlur={statusRegister.onBlur}
                ref={statusRegister.ref}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngưng hoạt động</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          {/* Mô tả */}
          <div className="flex flex-col gap-1">
            <Label>Mô tả dự án</Label>
            <textarea
              placeholder="Nhập mô tả chi tiết về dự án..."
              name={descriptionRegister.name}
              onChange={descriptionRegister.onChange}
              onBlur={descriptionRegister.onBlur}
              ref={descriptionRegister.ref}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
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
              {isLoading ? 'Đang xử lý...' : isEdit ? 'Cập nhật dự án' : 'Tạo dự án'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
