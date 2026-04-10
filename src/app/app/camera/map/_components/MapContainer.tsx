'use client';

import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CameraMarkerProps {
  id: string;
  name: string;
  status: 'online' | 'offline';
  top: string;
  left: string;
}

const CameraMarker = ({ id, name, status, top, left }: CameraMarkerProps) => (
  <div className="absolute group cursor-pointer" style={{ top, left }}>
    <div
      className={cn(
        'p-1.5 rounded-full border-2 transition-all duration-300 group-hover:scale-125 shadow-lg',
        status === 'online'
          ? 'bg-white border-green-500 text-green-500'
          : 'bg-white border-red-500 text-red-500',
      )}
    >
      <Camera size={16} />
    </div>

    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block transition-all z-20">
      <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-xl border border-white/20">
        <p className="font-bold">{name}</p>
        <p className={cn(status === 'online' ? 'text-green-400' : 'text-red-400')}>
          {status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
        </p>
      </div>
      <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/20" />
    </div>
  </div>
);

export default function MapContainer() {
  const mockupCameras: CameraMarkerProps[] = [
    { id: '1', name: 'Camera Cổng Chính', status: 'online', top: '30%', left: '45%' },
    { id: '2', name: 'Camera Bãi Đỗ Xe', status: 'online', top: '55%', left: '30%' },
    { id: '3', name: 'Camera Sảnh Chờ', status: 'offline', top: '40%', left: '70%' },
    { id: '4', name: 'Camera Hàng Rào Bắc', status: 'online', top: '15%', left: '20%' },
    { id: '5', name: 'Camera Khu Vực Kho', status: 'online', top: '75%', left: '65%' },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-200px)] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
      {/* Map Iframe Overlay */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14902.5866164293!2d106.613901!3d20.8072865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a7735d162afdb%3A0x70df39254ee1c357!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBI4bqjaSBQaMOYbmc!5e0!3m2!1svi!2svn!4v1711900000000!5m2!1svi!2svn"
        className="w-full h-full border-none"
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Interactive Markers Layer */}
      <div className="absolute inset-0 z-10">
        {mockupCameras.map((cam) => (
          <CameraMarker key={cam.id} {...cam} />
        ))}
      </div>

      {/* Map Control Mockups */}
      <div className="absolute right-4 top-4 z-20 space-y-2">
        <button className="h-8 w-8 bg-white border border-gray-200 rounded shadow hover:bg-gray-50 flex items-center justify-center font-bold">
          +
        </button>
        <button className="h-8 w-8 bg-white border border-gray-200 rounded shadow hover:bg-gray-50 flex items-center justify-center font-bold">
          -
        </button>
      </div>

      <div className="absolute left-4 bottom-4 z-20 bg-white/90 backdrop-blur-sm border border-gray-200 p-2 rounded-lg shadow-sm flex items-center gap-3 text-[10px] font-medium text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm" />
          <span>Online (4)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm" />
          <span>Offline (1)</span>
        </div>
      </div>
    </div>
  );
}
