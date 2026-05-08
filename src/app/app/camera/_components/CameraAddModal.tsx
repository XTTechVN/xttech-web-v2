'use client';

import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import MapSelect from '@/components/map/MapSelect';
import Select from '@/components/ui/Select';
import { InfoIcon, MapPin, PlusIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

import { CameraAddFormData } from '@/types/shared/camera';
import { Worker } from '@/types/shared/worker';

export default function CameraAddModal({
  isLoading,
  onClose,
  onAdd,
}: {
  isLoading: boolean;
  onClose: () => void;
  onAdd: (value: CameraAddFormData) => void;
}) {
  // State
  let workerOptions: { value: string; label: string }[] = [];
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Fetch worker data from API
  const {
    data: workers,
    isLoading: isLoadingWorkers,
    isError,
  } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: () => api.get('/api/v1/workers?limit=100&offset=0').then((res: any) => res.data.items),
  });

  if (workers) {
    workerOptions = workers.map((worker) => ({
      value: worker.id as string,
      label: worker.name as string,
    }));
  }

  // Set up form with react-hook-form and zod
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CameraAddFormData>({
    defaultValues: {
      name: '',
      rtspUrl: '',
      address: '',
      workerId: '',
      lat: 21.0285,
      lng: 105.8342,
      status: 'stopped',
    },
  });

  // Submit form
  const onSubmit = (data: CameraAddFormData) => {
    onAdd(data);
  };

  // Handle map select
  const handleMapSelect = (position: { lat: number; lng: number }) => {
    setValue('lat', position.lat);
    setValue('lng', position.lng);
  };

  useEffect(() => {
    if (isLoadingWorkers) return;
    if (isError) return;

    if (!workers || workers.length === 0) {
      toast.error('Không tìm thấy máy chủ AI', {
        icon: <InfoIcon size={16} />,
      });
      onClose();
      return;
    }

    setValue('workerId', workers[0].id as string);
  }, [workers, setValue, isLoadingWorkers, isError]);

  // handle error
  if (isError) {
    return (
      <div className="flex items-center justify-center">
        <Heading>Đã có lỗi xảy ra khi tải danh sách worker</Heading>
        <SubHeading>Vui lòng thử lại sau</SubHeading>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      {/* Main Modal */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-xl h-fit max-h-[90vh] transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-2">
          <div className="flex flex-col gap-1">
            <Heading>Thêm camera</Heading>
            <SubHeading>
              Sau khi thêm camera, vui lòng cấu hình các thông tin chi tiết khác tại nút "cấu hình"
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
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
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
                <Controller
                  name="workerId"
                  control={control}
                  rules={{ required: 'Worker IP là bắt buộc' }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      ref={field.ref}
                      options={
                        workers?.map((worker) => ({
                          value: worker.id as string,
                          label: worker.name as string,
                        })) || []
                      }
                      placeholder="Chọn worker"
                      error={errors.workerId?.message}
                      className="w-full h-full"
                    />
                  )}
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

            {/* Coordinates and Map Button */}
            <div className="flex items-end gap-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Vĩ độ (Lat)</Label>
                  <Input
                    type="number"
                    step="any"
                    {...register('lat', { valueAsNumber: true })}
                    error={errors.lat?.message as string}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Kinh độ (Lng)</Label>
                  <Input
                    type="number"
                    step="any"
                    {...register('lng', { valueAsNumber: true })}
                    error={errors.lng?.message as string}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant={isMapOpen ? 'primary' : 'outline'}
                className="mb-[2px] transition-all"
                onClick={() => setIsMapOpen(!isMapOpen)}
                title="Chọn trên bản đồ"
              >
                <MapPin size={18} />
              </Button>
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

            {/* Button Submit */}
            <div className="flex flex-col items-center justify-end gap-2 mt-8">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                icon={isLoading ? <Loading size={16} /> : <PlusIcon size={16} />}
                disabled={isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Submodal: Map Selection */}
      <AnimatePresence>
        {isMapOpen && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-2xl shadow-2xl w-[450px] h-[580px] border border-gray-100 flex flex-col overflow-hidden"
          >
            <div className="flex-1 relative h-full">
              <MapSelect
                onSelect={handleMapSelect}
                defaultPosition={{ lat: 21.0285, lng: 105.8342 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
