'use client';

import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from 'antd';
import { Worker, WorkerFormModalData } from '@/types/shared/worker';

export default function WorkerEditModal({
  isLoading,
  defaultValues,
  onClose,
  onEdit,
}: {
  isLoading: boolean;
  defaultValues?: Worker;
  onClose: () => void;
  onEdit: (value: WorkerFormModalData) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkerFormModalData>({
    defaultValues: {
      macId: defaultValues?.macId || '',
      name: defaultValues?.name || '',
      socket: defaultValues?.socket || '',
      port: defaultValues?.port || 8000,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const onSubmit = (data: WorkerFormModalData) => {
    onEdit(data);
  };

  // Re-sync values if defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      setValue('name', defaultValues.name);
      setValue('socket', defaultValues.socket);
      setValue('port', defaultValues.port);
      setValue('isActive', defaultValues.isActive);
    }
  }, [defaultValues, setValue]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-lg h-fit max-h-[90vh] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>Sửa Worker</Heading>
          <SubHeading>Cập nhật thông tin node worker</SubHeading>
        </div>

        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Mac ID */}
          <div className="flex flex-col gap-2">
            <Label>Mac ID</Label>
            <Input
              placeholder="VD: 12:34:56:78:90:AB"
              {...register('macId', { required: 'Mac ID là bắt buộc' })}
              error={errors.macId?.message as string}
              disabled
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label>Tên Worker</Label>
            <Input
              placeholder="VD: Worker-North-01"
              {...register('name', { required: 'Tên worker là bắt buộc' })}
              error={errors.name?.message as string}
            />
          </div>

          {/* Socket (IP removed) */}
          <div className="flex flex-col gap-2">
            <Label>Socket</Label>
            <Input
              placeholder="wss://ai-wk1.vifence.io"
              {...register('socket', { required: 'Socket là bắt buộc' })}
              error={errors.socket?.message as string}
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <Switch 
              checked={watch('isActive')} 
              onChange={(val) => setValue('isActive', val)} 
            />
            <div className="flex flex-col">
              <Label >Trạng thái hoạt động</Label>
              <span className="text-[11px] text-gray-500">Cho phép worker nhận tác vụ xử lý</span>
            </div>
          </div>

          {/* Button Submit */}
          <div className="flex flex-col items-center justify-end gap-2 mt-8">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              icon={isLoading ? <Loading size={16} /> : <Save size={16} />}
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
