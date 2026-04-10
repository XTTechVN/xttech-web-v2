'use client';

import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { PlusIcon, X } from 'lucide-react';

import { useForm } from 'react-hook-form';

export interface CameraFormModalData {
  name: string;
  rtspUrl: string;
  address: string;
  workerIp: string;
}

export default function CameraAddModal({
  isLoading,
  onClose,
  onAdd,
}: {
  isLoading: boolean;
  onClose: () => void;
  onAdd: (value: CameraFormModalData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CameraFormModalData>({
    defaultValues: {
      name: '',
      rtspUrl: '',
      address: '',
      workerIp: '',
    },
  });

  const onSubmit = (data: CameraFormModalData) => {
    onAdd(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Heading>Thêm camera</Heading>
          <SubHeading>Thêm camera vào hệ thống</SubHeading>
        </div>

        <Button type="button" variant="ghost" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      {/* Name and Worker IP */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Tên thiết bị</Label>
          <Input
            placeholder="VD: Camera 1"
            {...register('name', { required: 'Tên thiết bị là bắt buộc' })}
            error={errors.name?.message as string}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Worker IP</Label>
          <Input
            placeholder="192.168.1.x"
            {...register('workerIp', { required: 'Worker IP là bắt buộc' })}
            error={errors.workerIp?.message as string}
          />
        </div>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-2">
        <Label>Địa chỉ</Label>
        <Input
          placeholder="VD: Hà Nội"
          {...register('address', { required: 'Địa chỉ là bắt buộc' })}
          error={errors.address?.message as string}
        />
      </div>

      {/* URL RTSP */}
      <div className="flex flex-col gap-2">
        <Label>URL RTSP</Label>
        <Input
          placeholder="rtsp://[IP_ADDRESS]/live/0/0"
          {...register('rtspUrl', { required: 'URL RTSP là bắt buộc' })}
          error={errors.rtspUrl?.message as string}
        />
      </div>

      {/* Button */}
      <div className="flex flex-col items-center justify-end gap-2 mt-8">
        <Button
          type="submit"
          className="w-full"
          size="md"
          icon={isLoading ? <Loading size={16} /> : <PlusIcon size={16} />}
          disabled={isLoading}
        >
          {isLoading ? 'Đang thêm...' : 'Thêm'}
        </Button>
      </div>
    </form>
  );
}
