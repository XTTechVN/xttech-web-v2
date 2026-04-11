'use client';

import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import MapSelect from '@/components/map/MapSelect';

export interface CameraFormModalData {
  name: string;
  rtspUrl: string;
  address: string;
  workerIp: string;
  lat: number;
  lng: number;
}

export default function CameraEditModal({
  isLoading,
  defaultValues,
  onClose,
  onEdit,
}: {
  isLoading: boolean;
  defaultValues?: CameraFormModalData;
  onClose: () => void;
  onEdit: (value: CameraFormModalData) => void;
}) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CameraFormModalData>({
    defaultValues: {
      name: defaultValues?.name || '',
      rtspUrl: defaultValues?.rtspUrl || '',
      address: defaultValues?.address || '',
      workerIp: defaultValues?.workerIp || '',
      lat: defaultValues?.lat || 21.0285,
      lng: defaultValues?.lng || 105.8342,
    },
  });

  const onSubmit = (data: CameraFormModalData) => {
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
      setValue('workerIp', defaultValues.workerIp);
      setValue('lat', defaultValues.lat);
      setValue('lng', defaultValues.lng);
    }
  }, [defaultValues, setValue]);

  return (
    <div className="flex items-start gap-4">
      {/* Main Modal */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-xl transition-all h-fit max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex flex-col gap-1">
            <Heading>Sửa camera</Heading>
            <SubHeading>Cập nhật thông tin camera</SubHeading>
          </div>

          <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
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
                  defaultValues ? { lat: defaultValues.lat, lng: defaultValues.lng } : undefined
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
