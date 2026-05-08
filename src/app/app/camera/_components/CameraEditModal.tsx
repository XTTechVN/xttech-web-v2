'use client';

// Components
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import Select from '@/components/ui/Select';
import MapSelect from '@/components/map/MapSelect';
import { MapPin, Save, X } from 'lucide-react';
import { Radio } from 'antd';

// Libraries
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

// Utils
import api from '@/utils/api';

// Types
import { CameraEditFormData } from '@/types/shared/camera';
import { Worker } from '@/types/shared/worker';

export default function CameraEditModal({
  isLoading,
  defaultValues,
  onClose,
  onEdit,
}: {
  isLoading: boolean;
  defaultValues?: any;
  onClose: () => void;
  onEdit: (value: CameraEditFormData) => void;
}) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [detailConfig, setDetailConfig] = useState(false);

  // Fetch worker data from API
  const {
    data: workers,
    isLoading: isLoadingWorkers,
    isError,
  } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: () => api.get('/api/v1/workers?limit=100&offset=0').then((res: any) => res.data.items),
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CameraEditFormData>({
    defaultValues: {
      name: defaultValues?.name || '',
      rtspUrl: defaultValues?.rtspUrl || '',
      address: defaultValues?.address || '',
      workerId: defaultValues?.workerId || '',
      lat: defaultValues?.lat || 21.0285,
      lng: defaultValues?.lng || 105.8342,
      status: defaultValues?.status || 'stopped',
      rtspType: defaultValues?.rtspType || 'rtsp',
      onvif: defaultValues?.onvif || false,
      port: defaultValues?.port || 9900,
    },
  });

  const onSubmit = (data: CameraEditFormData) => {
    onEdit(data);
  };

  const handleMapSelect = (position: { lat: number; lng: number }) => {
    setValue('lat', position.lat);
    setValue('lng', position.lng);
  };

  // Re-sync values if defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      setValue('name', defaultValues.name);
      setValue('rtspUrl', defaultValues.rtspUrl);
      setValue('address', defaultValues.address);
      setValue('workerId', defaultValues.workerId);
      setValue('lat', defaultValues.lat);
      setValue('lng', defaultValues.lng);
      setValue('status', defaultValues.status);
    }
  }, [defaultValues, setValue]);

  // handle error
  if (isError) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <Heading>Đã có lỗi xảy ra khi tải danh sách worker</Heading>
          <SubHeading>Vui lòng thử lại sau</SubHeading>
          <Button onClick={onClose} className="mt-4">
            Đóng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      {/* Main Modal */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-xl transition-all h-fit max-h-[90vh] min-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex flex-col gap-1">
            <Heading>Cấu hình chi tiết camera</Heading>
            <SubHeading>Cập nhật thông tin camera</SubHeading>
          </div>

          <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>

        <div className="px-6 mt-2 flex items-center justify-start gap-4">
          <div
            className={` ${!detailConfig ? 'border-b-2 border-primary' : ''} cursor-pointer text-sm`}
            onClick={() => setDetailConfig(false)}
          >
            Cấu hình cơ bản
          </div>
          <div
            className={` ${detailConfig ? 'border-b-2 border-primary' : ''} cursor-pointer text-sm`}
            onClick={() => setDetailConfig(true)}
          >
            Cấu hình chi tiết
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {!detailConfig && (
              <>
                {/* Name and Worker ID */}
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
                    <Label>Worker</Label>
                    {isLoadingWorkers ? (
                      <Loading />
                    ) : (
                      <Controller
                        name="workerId"
                        control={control}
                        rules={{ required: 'Worker là bắt buộc' }}
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
                    )}
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
              </>
            )}

            {detailConfig && (
              <>
                {/* RTSP Type */}
                <div className="flex flex-col items-start gap-2">
                  <Label>Loại RTSP</Label>
                  <Controller
                    name="rtspType"
                    control={control}
                    render={({ field }) => (
                      <Radio.Group onChange={field.onChange} value={field.value}>
                        <Radio value="pull">Pull</Radio>
                        <Radio value="push">Push</Radio>
                      </Radio.Group>
                    )}
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col items-start gap-2">
                  <Label>Trạng thái ghi hình</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Radio.Group onChange={field.onChange} value={field.value}>
                        <Radio value="stopped">Dừng ghi</Radio>
                        <Radio value="recording_continuous">Ghi hình liên tục</Radio>
                        <Radio value="recording_event">Ghi hình sự kiện</Radio>
                      </Radio.Group>
                    )}
                  />
                </div>

                {/* Onvif */}
                <div className="flex flex-col items-start gap-2">
                  <Label>Onvif (cho phép điều khiển từ xa)</Label>
                  <Controller
                    name="onvif"
                    control={control}
                    render={({ field }) => (
                      <Radio.Group onChange={field.onChange} value={field.value}>
                        <Radio value={true}>Cho phép</Radio>
                        <Radio value={false}>Không cho phép</Radio>
                      </Radio.Group>
                    )}
                  />
                </div>
              </>
            )}

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
                defaultPosition={
                  defaultValues
                    ? { lat: defaultValues.lat, lng: defaultValues.lng }
                    : { lat: 21.0285, lng: 105.8342 }
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
