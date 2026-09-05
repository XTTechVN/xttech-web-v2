'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import dayjs from 'dayjs';
import { StaffLiveLocation } from '@/types';
import { Battery, Gauge, Clock, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { BASE_MINIO_URL } from '@/config';

// Dynamic import Leaflet components for SSR safety
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface LiveMapProps {
  staffLocations: StaffLiveLocation[];
  selectedStaff: StaffLiveLocation | null;
  onSelectStaff: (staff: StaffLiveLocation) => void;
  onViewRoute: (staff: StaffLiveLocation) => void;
}

export function LiveMap({ staffLocations, selectedStaff, onSelectStaff, onViewRoute, }: LiveMapProps) {
  // Tạo custom HTML Marker cho nhân viên
  const createCustomStaffIcon = (staff: StaffLiveLocation) => {
    const isSelected = selectedStaff?.userId === staff.userId;
    const isMoving = staff.status === 'moving';
    const isOffline = staff.status === 'offline';

    // 1. Phân loại màu sắc theo yêu cầu: Đứng yên = Xanh lá, Di chuyển = Vàng, Offline = Xám
    const ringColor = isOffline
      ? 'ring-2 ring-slate-400 bg-slate-200'
      : isMoving
      ? 'ring-3 ring-amber-500 shadow-amber-500/30'
      : 'ring-3 ring-emerald-500 shadow-emerald-500/30';

    // 2. Chấm huy hiệu trạng thái góc avatar
    const badgeDot = isOffline
      ? '<span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">✕</span>'
      : isMoving
      ? '<span class="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white"></span></span>'
      : '<span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>';

    const safeName = staff.userName || 'Nhân viên';
    const shortName = safeName.split(' ').slice(-2).join(' ');

    // 3. Avatar: Cắt tròn chuẩn, làm mờ đen trắng nếu Offline
    const avatarFilter = isOffline ? 'grayscale opacity-60' : '';
    const avatarHtml = staff.avatar
      ? `<img src="${BASE_MINIO_URL + staff.avatar}" alt="${safeName}" class="w-full h-full object-cover shrink-0 ${avatarFilter}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 9999px;" />`
      : `<span class="text-xs font-bold ${isOffline ? 'text-slate-400' : 'text-slate-700'}">${safeName.charAt(0).toUpperCase()}</span>`;

    // 4. Chấm màu đồng bộ trên nhãn tên
    const dotColor = isOffline ? 'bg-slate-400' : isMoving ? 'bg-amber-400' : 'bg-emerald-400';

    const html = `
      <div class="relative flex flex-col items-center cursor-pointer select-none transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
        <div class="relative w-10 h-10 rounded-full ${ringColor} shadow-md bg-white p-0.5 shrink-0 flex items-center justify-center">
          <div class="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-100">
            ${avatarHtml}
          </div>
          ${badgeDot}
        </div>
        <div class="mt-1 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm font-medium flex items-center gap-1 pointer-events-none">
          <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
          ${shortName}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-staff-marker !bg-transparent !border-0',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  const [map, setMap] = React.useState<L.Map | null>(null);

  // Tự động bay / phóng to tới vị trí nhân sự khi được chọn
  React.useEffect(() => {
    if (selectedStaff && map) {
      map.flyTo([selectedStaff.latitude, selectedStaff.longitude], 16, {
        duration: 1.2,
      });
    }
  }, [selectedStaff, map]);

  const defaultCenter: [number, number] =
    staffLocations.length > 0
      ? [staffLocations[0].latitude, staffLocations[0].longitude]
      : [21.028511, 105.804817]; // Hà Nội default

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      <MapContainer
        ref={setMap as unknown as React.Ref<L.Map>}
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {staffLocations.map((staff, index) => {
          const markerKey = staff.userId ? `${staff.userId}-${index}` : `marker-${index}`;
          return (
            <Marker
              key={markerKey}
              position={[staff.latitude, staff.longitude]}
              icon={createCustomStaffIcon(staff)}
              eventHandlers={{
                click: () => onSelectStaff(staff),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-2 min-w-[200px]">
                  {/* Header Popup */}
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                      {staff.avatar ? (
                        <img src={BASE_MINIO_URL + staff.avatar} alt={staff.userName || 'Nhân viên'} className="w-full h-full object-cover" />
                      ) : (
                        (staff.userName || 'N').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{staff.userName || 'Nhân viên'}</h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {staff.positionName || staff.departmentName || 'Nhân viên'}
                      </p>
                    </div>
                  </div>

                  {/* Thông số chi tiết */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Gauge size={12} className="text-emerald-500" />
                      <span>{staff.speed ? `${Math.round(staff.speed * 3.6)} km/h` : 'Đứng yên'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery size={12} className={typeof staff.batteryLevel === 'number' && staff.batteryLevel < 20 ? 'text-rose-500' : 'text-amber-500'} />
                      <span>{typeof staff.batteryLevel === 'number' ? `${staff.batteryLevel}%` : '--'}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <Clock size={12} className="text-slate-400" />
                      <span>Cập nhật: {dayjs(staff.updatedAt).format('HH:mm:ss')}</span>
                    </div>
                  </div>

                  {/* Nút Xem lộ trình */}
                  <button
                    type="button"
                    onClick={() => onViewRoute(staff)}
                    className="w-full h-7 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Navigation size={12} />
                    <span>Xem lộ trình trong ngày</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
