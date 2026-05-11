'use client';

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Camera } from '@/types/shared/camera';
import { controlPtz } from '@/app/actions/ptz';

interface Props {
  camera: Camera;
}

export default function Ptz({ camera }: Props) {
  const [isMoving, setIsMoving] = useState(false);

  const handlePTZ = async (action: string) => {
    if (!camera.onvif) {
      toast.error('Camera này không hỗ trợ PTZ');
      return;
    }

    if (!camera.rtspUrl) {
      toast.error('Camera chưa được cấu hình RTSP URL');
      return;
    }

    try {
      setIsMoving(true);
      const loadingToast = toast.loading(`Đang xoay camera (${action})...`);

      const res = await controlPtz(camera.rtspUrl, action);

      if (res.success) {
        toast.success(`Đã xoay camera thành công`, { id: loadingToast });
      } else {
        toast.error(`Lỗi: ${res.error}`, { id: loadingToast });
        console.log('Error:', res);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gọi lệnh PTZ');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="px-4 pb-4 text-black space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Điều khiển PTZ (Onvif)</p>
        {!camera.onvif && <span className="text-xs text-red-600 rounded">Không hỗ trợ</span>}
      </div>

      {/* Vùng chứa các nút điều khiển */}
      <div
        className={`flex flex-col items-center justify-center py-6 bg-white rounded-lg border border-gray-200 gap-6 ${!camera.onvif ? 'opacity-50 grayscale pointer-events-none' : ''}`}
      >
        {/* D-Pad 4 hướng */}
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button
            className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center active:bg-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePTZ('up')}
            disabled={!camera.onvif || isMoving}
          >
            <ChevronUp size={28} className="text-primary" />
          </button>
          <div />

          <button
            className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center active:bg-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePTZ('left')}
            disabled={!camera.onvif || isMoving}
          >
            <ChevronLeft size={28} className="text-primary" />
          </button>
          <div className="p-3 bg-primary/5 rounded-xl flex items-center justify-center shadow-inner border border-primary/10">
            <div className="w-3 h-3 bg-primary/40 rounded-full" />
          </div>
          <button
            className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center active:bg-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePTZ('right')}
            disabled={!camera.onvif || isMoving}
          >
            <ChevronRight size={28} className="text-primary" />
          </button>

          <div />
          <button
            className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center active:bg-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePTZ('down')}
            disabled={!camera.onvif || isMoving}
          >
            <ChevronDown size={28} className="text-primary" />
          </button>
          <div />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-4 w-full px-6">
          <button
            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 active:bg-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePTZ('zoom_out')}
            disabled={!camera.onvif || isMoving}
          >
            <ZoomOut size={18} className="text-primary" />
            <span className="text-sm font-medium text-primary">Thu nhỏ</span>
          </button>
          <button
            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 active:bg-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePTZ('zoom_in')}
            disabled={!camera.onvif || isMoving}
          >
            <ZoomIn size={18} className="text-primary" />
            <span className="text-sm font-medium text-primary">Phóng to</span>
          </button>
        </div>
      </div>
    </div>
  );
}
