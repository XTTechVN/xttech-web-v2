'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import { X, Save } from 'lucide-react';
import { usePtzStore } from '@/stores/usePtzStore';
import toast from 'react-hot-toast';

interface PtzModalProps {
  onClose: () => void;
}

export default function PtzModal({ onClose }: PtzModalProps) {
  const { speed, duration, setSpeed, setDuration } = usePtzStore();

  const [localSpeed, setLocalSpeed] = useState<number>(speed);
  const [localDuration, setLocalDuration] = useState<number>(duration);

  // Initialize/sync with store when opened
  useEffect(() => {
    setLocalSpeed(speed);
    setLocalDuration(duration);
  }, [speed, duration]);

  const handleSave = () => {
    if (isNaN(localSpeed) || localSpeed <= 0 || localSpeed > 1) {
      toast.error('Tốc độ phải là số lớn hơn 0 và nhỏ hơn hoặc bằng 1');
      return;
    }
    if (isNaN(localDuration) || localDuration <= 0 || localDuration > 10) {
      toast.error('Thời gian di chuyển phải từ 0.01s đến 10s');
      return;
    }

    setSpeed(localSpeed);
    setDuration(localDuration);
    toast.success('Đã lưu cấu hình PTZ');
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-md transition-all h-fit max-h-[90vh] min-w-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-100">
        <div className="flex flex-col gap-1">
          <Heading className="text-xl">Cấu hình PTZ Settings</Heading>
          <SubHeading>Cài đặt tốc độ và thời gian phản hồi PTZ</SubHeading>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100 min-w-0"
        >
          <X size={20} className="text-gray-500" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Speed setting */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label>Tốc độ (Speed)</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {localSpeed.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Tốc độ xoay/quét của camera. Giá trị lớn hơn sẽ quay nhanh hơn (0.01 đến 1.0).
          </p>
          <div className="flex items-center gap-4 mt-1">
            <input
              type="range"
              min="0.01"
              max="1.00"
              step="0.01"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <Input
              type="number"
              min="0.01"
              max="1.00"
              step="0.01"
              value={localSpeed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setLocalSpeed(val);
                }
              }}
              className="w-20 text-center text-sm font-medium py-1 px-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Duration setting */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label>Thời gian di chuyển (Duration)</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {localDuration.toFixed(2)}s
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Thời gian di chuyển mỗi khi nhấn phím điều hướng (giây).
          </p>
          <div className="flex items-center gap-4 mt-1">
            <input
              type="range"
              min="0.05"
              max="2.00"
              step="0.05"
              value={localDuration}
              onChange={(e) => setLocalDuration(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <Input
              type="number"
              min="0.05"
              max="10.00"
              step="0.05"
              value={localDuration}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setLocalDuration(val);
                }
              }}
              className="w-20 text-center text-sm font-medium py-1 px-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end items-center gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium"
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium"
          icon={<Save size={16} />}
        >
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
