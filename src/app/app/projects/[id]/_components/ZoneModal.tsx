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
import { Zone } from '@/types/shared/zone';

export interface ZoneFormData {
  project_id: string;
  name: string;
  description?: string;
}

export default function ZoneModal({
  isLoading,
  onClose,
  onSave,
  projectId,
  defaultValues,
}: {
  isLoading: boolean;
  onClose: () => void;
  onSave: (value: ZoneFormData) => void;
  projectId: string;
  defaultValues?: Zone;
}) {
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ZoneFormData>({
    defaultValues: {
      project_id: projectId,
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        project_id: defaultValues.project_id || projectId,
        name: defaultValues.name || '',
        description: defaultValues.description || '',
      });
    } else {
      reset({
        project_id: projectId,
        name: '',
        description: '',
      });
    }
  }, [defaultValues, projectId, reset]);

  const onSubmit = (data: ZoneFormData) => {
    onSave(data);
  };

  const nameRegister = register('name', { required: 'Tên phân khu là bắt buộc' });
  const descriptionRegister = register('description');

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-lg h-fit max-h-[90vh] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>{isEdit ? 'Cập nhật phân khu' : 'Thêm phân khu mới'}</Heading>
          <SubHeading>
            {isEdit
              ? 'Kiểm tra lại thông tin trước khi cập nhật phân khu'
              : 'Thêm phân khu/khu vực thi công cho dự án này'}
          </SubHeading>
        </div>

        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Tên phân khu */}
          <div className="flex flex-col gap-1">
            <Label>
              Tên phân khu <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Khu vực A - Sảnh chính"
              name={nameRegister.name}
              onChange={nameRegister.onChange}
              onBlur={nameRegister.onBlur}
              ref={nameRegister.ref}
              error={errors.name?.message}
            />
          </div>

          {/* Mô tả */}
          <div className="flex flex-col gap-1">
            <Label>Mô tả phân khu</Label>
            <textarea
              placeholder="Mô tả cụ thể về phân khu này..."
              name={descriptionRegister.name}
              onChange={descriptionRegister.onChange}
              onBlur={descriptionRegister.onBlur}
              ref={descriptionRegister.ref}
              rows={3}
              className="w-full border border-gray-200 text-gray-900 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
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
              {isLoading ? 'Đang xử lý...' : isEdit ? 'Cập nhật phân khu' : 'Tạo phân khu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
