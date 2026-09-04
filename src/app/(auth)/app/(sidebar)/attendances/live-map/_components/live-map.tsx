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

    const statusBorderColor = isOffline
      ? 'border-slate-400 bg-slate-100'
      : isMoving
      ? 'border-emerald-500 bg-emerald-50'
      : 'border-primary bg-primary/10';

    const pulseEffect = isMoving
      ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>'
      : '';
    const safeName = staff.userName || 'Nhân viên';
    const shortName = safeName.split(' ').slice(-2).join(' ');

    const avatarHtml = staff.avatar
      ? `<img src="${BASE_MINIO_URL + staff.avatar}" alt="${safeName}" class="w-full h-full object-cover rounded-full" />`
      : `<span class="text-xs font-bold text-slate-700">${safeName.charAt(0).toUpperCase()}</span>`;

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
        <div class="w-10 h-10 rounded-full border-2 ${statusBorderColor} shadow-lg flex items-center justify-center bg-white overflow-hidden p-0.5">
          ${avatarHtml}
        </div>
        ${pulseEffect}
        <div class="absolute -bottom-5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.2 rounded-md whitespace-nowrap shadow-sm font-medium">
          ${shortName}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-staff-marker',
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
                        <img src={ BASE_MINIO_URL + staff.avatar} alt={staff.userName || 'Nhân viên'} className="w-full h-full object-cover" />
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
