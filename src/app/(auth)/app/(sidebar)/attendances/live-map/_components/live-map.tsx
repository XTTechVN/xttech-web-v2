/* eslint-disable react-hooks/set-state-in-effect */
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
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface LiveMapProps {
  staffLocations: StaffLiveLocation[];
  selectedStaff: (StaffLiveLocation & { _selectedAt?: number }) | null;
  onSelectStaff: (staff: StaffLiveLocation) => void;
  onViewRoute: (staff: StaffLiveLocation) => void;
}

interface StaffCluster {
  id: string;
  center: [number, number];
  staffList: StaffLiveLocation[];
}

export function LiveMap({
  staffLocations,
  selectedStaff,
  onSelectStaff,
  onViewRoute,
}: LiveMapProps) {
  const [map, setMap] = React.useState<L.Map | null>(null);
  const [currentZoom, setCurrentZoom] = React.useState<number>(13);
  const [activeSpiderfyClusterId, setActiveSpiderfyClusterId] = React.useState<string | null>(null);

  // Ref lưu mốc thời gian click gần nhất để chỉ bay tới khi người dùng click từ sidebar
  const lastSelectedAtRef = React.useRef<number>(0);

  // Callback ref ổn định cho MapContainer, chống việc kích hoạt re-render lặp
  const handleMapRef = React.useCallback((mapInstance: L.Map | null) => {
    if (mapInstance) {
      setMap((prev) => (prev !== mapInstance ? mapInstance : prev));
    }
  }, []);

  // Rút gọn tên nhân viên thông minh, cắt bỏ text quá dài
  const formatShortStaffName = (name?: string) => {
    if (!name) return 'Nhân viên';
    const trimmed = name.trim();
    if (trimmed.toLowerCase() === 'system administrator') return 'Admin';
    const parts = trimmed.split(' ').filter(Boolean);
    if (parts.length <= 2) return trimmed.slice(0, 14);
    return parts.slice(-2).join(' ').slice(0, 14);
  };

  // Tạo custom HTML Marker cho 1 nhân viên
  const createCustomStaffIcon = (staff: StaffLiveLocation) => {
    const isSelected = selectedStaff?.userId === staff.userId;
    const isMoving = staff.status === 'moving';
    const isOffline = staff.status === 'offline';
    const isCloseZoom = currentZoom >= 13;

    const ringColor = isOffline
      ? 'ring-2 ring-slate-400 bg-slate-200'
      : isMoving
      ? 'ring-3 ring-amber-500 shadow-amber-500/30'
      : 'ring-3 ring-emerald-500 shadow-emerald-500/30';

    const badgeDot = isOffline
      ? '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-slate-500 border-2 border-white rounded-full flex items-center justify-center text-[7px] text-white font-bold">✕</span>'
      : isMoving
      ? '<span class="absolute -top-0.5 -right-0.5 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span></span>'
      : '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>';

    const safeName = staff.userName || 'Nhân viên';
    const shortName = formatShortStaffName(safeName);

    const avatarFilter = isOffline ? 'grayscale opacity-60' : '';
    const avatarHtml = staff.avatar
      ? `<img src="${BASE_MINIO_URL + staff.avatar}" alt="${safeName}" class="w-full h-full object-cover shrink-0 ${avatarFilter}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 9999px;" />`
      : `<span class="text-[11px] font-bold ${isOffline ? 'text-slate-400' : 'text-slate-700'}">${safeName.charAt(0).toUpperCase()}</span>`;

    const dotColor = isOffline ? 'bg-slate-400' : isMoving ? 'bg-amber-400' : 'bg-emerald-400';

    // Khi zoom xa (< 13): ẩn nhãn tên, chỉ hiện khi rê chuột hover hoặc khi đang chọn nhân sự đó
    const nameVisibilityClass = isCloseZoom || isSelected
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 transition-opacity duration-200';

    const html = `
      <div class="group relative flex flex-col items-center cursor-pointer select-none transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-120 z-50' : ''}">
        <div class="relative w-8 h-8 rounded-full ${ringColor} shadow-md bg-white p-0.5 shrink-0 flex items-center justify-center">
          <div class="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-100">
            ${avatarHtml}
          </div>
          ${badgeDot}
        </div>
        <div class="mt-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-sm font-medium flex items-center gap-1 pointer-events-none ${nameVisibilityClass}">
          <span class="w-1 h-1 rounded-full ${dotColor}"></span>
          ${shortName}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-staff-marker !bg-transparent !border-0',
      iconSize: [60, 50],
      iconAnchor: [30, 16],
      popupAnchor: [0, -18],
    });
  };

  // Tạo Icon Cụm Gom nhóm khi nhiều nhân viên ở cùng vị trí
  const createClusterIcon = (cluster: StaffCluster) => {
    const count = cluster.staffList.length;
    const hasMoving = cluster.staffList.some((s) => s.status === 'moving');
    const allOffline = cluster.staffList.every((s) => s.status === 'offline');

    const badgeColor = allOffline
      ? 'bg-slate-500 ring-slate-300'
      : hasMoving
      ? 'bg-amber-500 ring-amber-300'
      : 'bg-emerald-600 ring-emerald-300';

    const pulse = hasMoving
      ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>'
      : '';

    // Lấy tối đa 2 avatar xếp đè làm biểu tượng cụm
    const avatarsHtml = cluster.staffList
      .slice(0, 2)
      .map((s, idx) => {
        const offsetClass = idx === 0 ? 'z-10' : 'z-0 -ml-2.5';
        if (s.avatar) {
          return `<img src="${BASE_MINIO_URL + s.avatar}" class="w-5 h-5 rounded-full border border-white object-cover ${offsetClass}" />`;
        }
        return `<div class="w-5 h-5 rounded-full border border-white bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center ${offsetClass}">${(s.userName || 'N').charAt(0)}</div>`;
      })
      .join('');

    const html = `
      <div class="relative flex flex-col items-center cursor-pointer select-none transition-transform duration-200 hover:scale-110 active:scale-95">
        <div class="relative flex items-center justify-center bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg border border-slate-200 ring-2 ${badgeColor}/50">
          <div class="flex items-center">
            ${avatarsHtml}
          </div>
          <div class="ml-1.5 flex items-center gap-1">
            <span class="relative flex h-2 w-2">
              ${pulse}
              <span class="relative inline-flex rounded-full h-2 w-2 ${badgeColor}"></span>
            </span>
            <span class="text-xs font-bold text-slate-800">${count}</span>
          </div>
        </div>
        <div class="mt-0.5 bg-slate-900/90 text-white text-[8px] font-semibold px-2 py-0.2 rounded-full shadow-sm whitespace-nowrap flex items-center gap-1">
          <span>${count} nhân sự</span>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-cluster-marker !bg-transparent !border-0',
      iconSize: [80, 48],
      iconAnchor: [40, 16],
    });
  };

  // Icon tâm mỏ neo khi đang xòe Spiderfy
  const createCenterAnchorIcon = () => {
    return L.divIcon({
      html: `<div class="w-2.5 h-2.5 bg-slate-400/80 rounded-full border-2 border-white shadow-xs"></div>`,
      className: '!bg-transparent !border-0',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });
  };

  // Lắng nghe sự kiện click ngoài và zoom bản đồ (chỉ cập nhật khi zoom thực sự thay đổi)
  React.useEffect(() => {
    if (!map) return;

    const initialZoom = map.getZoom();
    setCurrentZoom((prev) => (prev !== initialZoom ? initialZoom : prev));

    const handleMapClick = () => {
      setActiveSpiderfyClusterId(null);
    };

    const handleZoomEnd = () => {
      const newZoom = map.getZoom();
      setCurrentZoom((prev) => (prev !== newZoom ? newZoom : prev));
      // Khi zoom xa (< 14), tự động thu nan hoa lại để tránh rối mắt
      if (newZoom < 14) {
        setActiveSpiderfyClusterId(null);
      }
    };

    map.on('click', handleMapClick);
    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('click', handleMapClick);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map]);

  // Khoảng cách địa lý tối đa (mét) để coi là cùng một địa điểm / văn phòng
  const MAX_CLUSTER_GEO_DISTANCE_METERS = 150; // 150 mét

  // Thuật toán Gom cụm nhân sự: Chỉ gộp khi CÙNG địa điểm thực tế (<= 150m) VÀ bị đè pixel lên nhau
  const clusters = React.useMemo(() => {
    if (!map || staffLocations.length === 0) {
      return staffLocations.map((staff, idx) => ({
        id: `single-${staff.userId || idx}`,
        center: [staff.latitude, staff.longitude] as [number, number],
        staffList: [staff],
      }));
    }

    const groups: StaffCluster[] = [];
    const CLUSTER_PIXEL_THRESHOLD = currentZoom < 14 ? 42 : 36;

    staffLocations.forEach((staff, index) => {
      const staffLatLng = L.latLng(staff.latitude, staff.longitude);
      const staffPoint = map.latLngToLayerPoint(staffLatLng);

      let matchedGroup: StaffCluster | null = null;
      for (const group of groups) {
        // 1. Kiểm tra khoảng cách địa lý thực tế (không được gom người ở xa / khác tỉnh)
        const groupLatLng = L.latLng(group.center[0], group.center[1]);
        const geoDistance = map.distance(staffLatLng, groupLatLng);
        if (geoDistance > MAX_CLUSTER_GEO_DISTANCE_METERS) {
          continue;
        }

        // 2. Kiểm tra khoảng cách pixel trên màn hình
        const groupPoint = map.latLngToLayerPoint(group.center);
        const pixelDistance = staffPoint.distanceTo(groupPoint);
        if (pixelDistance <= CLUSTER_PIXEL_THRESHOLD) {
          matchedGroup = group;
          break;
        }
      }

      if (matchedGroup) {
        matchedGroup.staffList.push(staff);
      } else {
        groups.push({
          id: `cluster-${staff.userId || index}`,
          center: [staff.latitude, staff.longitude],
          staffList: [staff],
        });
      }
    });

    return groups;
  }, [staffLocations, map, currentZoom]);

  // Tự động bay tới nhân sự được chọn khi người dùng click từ danh sách bên ngoài
  React.useEffect(() => {
    if (!map || !selectedStaff) return;

    const currentClickTime = selectedStaff._selectedAt;
    // Chỉ kích hoạt bay tới khi có cú click mới từ Sidebar
    if (currentClickTime && currentClickTime !== lastSelectedAtRef.current) {
      lastSelectedAtRef.current = currentClickTime;

      map.flyTo([selectedStaff.latitude, selectedStaff.longitude], 16, {
        duration: 1.2,
      });

      const targetCluster = clusters.find(
        (c) =>
          c.staffList.length > 1 &&
          c.staffList.some((s) => s.userId === selectedStaff.userId)
      );
      if (targetCluster) {
        setActiveSpiderfyClusterId(targetCluster.id);
      }
    }
  }, [selectedStaff, map, clusters]);

  const defaultCenter: [number, number] =
    staffLocations.length > 0
      ? [staffLocations[0].latitude, staffLocations[0].longitude]
      : [20.770184, 106.734790]; // 941 Phạm văn đồng

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      <MapContainer
        ref={handleMapRef as unknown as React.Ref<L.Map>}
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster) => {
          const isCluster = cluster.staffList.length > 1;
          const isSpiderfied = activeSpiderfyClusterId === cluster.id;

          // 1. Trường hợp là cụm > 1 người nhưng chưa bấm xòe -> Hiển thị Marker Cụm
          if (isCluster && !isSpiderfied) {
            return (
              <Marker
                key={cluster.id}
                position={cluster.center}
                icon={createClusterIcon(cluster)}
                eventHandlers={{
                  click: () => {
                    setActiveSpiderfyClusterId(cluster.id);
                    if (map && map.getZoom() < 16) {
                      map.flyTo(cluster.center, 16, { duration: 0.6 });
                    }
                  },
                }}
              />
            );
          }

          // 2. Trường hợp là cụm đang xòe nan hoa (Spiderfy) -> Vẽ các đường chỉ & Marker bung tròn
          if (isCluster && isSpiderfied) {
            const count = cluster.staffList.length;
            const radius = Math.min(65, Math.max(46, 32 + count * 6)); // Bán kính nan hoa (pixel)
            const centerPoint = map ? map.latLngToLayerPoint(cluster.center) : L.point(0, 0);

            return (
              <React.Fragment key={`spider-group-${cluster.id}`}>
                {/* Điểm neo tâm */}
                <Marker
                  position={cluster.center}
                  icon={createCenterAnchorIcon()}
                  eventHandlers={{
                    click: () => setActiveSpiderfyClusterId(null),
                  }}
                />

                {cluster.staffList.map((staff, idx) => {
                  // Tính góc và tọa độ bung nan hoa
                  const angle = (2 * Math.PI * idx) / count - Math.PI / 2; // Bắt đầu từ 12h
                  const spiderPoint = L.point(
                    centerPoint.x + radius * Math.cos(angle),
                    centerPoint.y + radius * Math.sin(angle)
                  );
                  const spiderLatLng = map ? map.layerPointToLatLng(spiderPoint) : L.latLng(staff.latitude, staff.longitude);
                  const spiderPos: [number, number] = [spiderLatLng.lat, spiderLatLng.lng];

                  return (
                    <React.Fragment key={`spider-item-${staff.userId || idx}`}>
                      {/* Đường chỉ nan hoa nối về tâm */}
                      <Polyline
                        positions={[cluster.center, spiderPos]}
                        pathOptions={{
                          color: '#64748b',
                          weight: 1.5,
                          dashArray: '3, 4',
                          opacity: 0.7,
                        }}
                      />

                      {/* Marker nhân sự trong nan hoa */}
                      <Marker
                        position={spiderPos}
                        icon={createCustomStaffIcon(staff)}
                        eventHandlers={{
                          click: () => onSelectStaff(staff),
                        }}
                      >
                        <Popup className="custom-leaflet-popup">
                          <StaffPopupContent
                            staff={staff}
                            onViewRoute={onViewRoute}
                          />
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          }

          // 3. Trường hợp chỉ có 1 nhân sự đơn lẻ -> Hiển thị Marker bình thường
          const singleStaff = cluster.staffList[0];
          return (
            <Marker
              key={cluster.id}
              position={[singleStaff.latitude, singleStaff.longitude]}
              icon={createCustomStaffIcon(singleStaff)}
              eventHandlers={{
                click: () => onSelectStaff(singleStaff),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <StaffPopupContent
                  staff={singleStaff}
                  onViewRoute={onViewRoute}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Component nội dung Popup hiển thị thông số nhân viên
function StaffPopupContent({
  staff,
  onViewRoute,
}: {
  staff: StaffLiveLocation;
  onViewRoute: (staff: StaffLiveLocation) => void;
}) {
  return (
    <div className="p-1 space-y-2 min-w-[200px]">
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
          {staff.avatar ? (
            <img
              src={BASE_MINIO_URL + staff.avatar}
              alt={staff.userName || 'Nhân viên'}
              className="w-full h-full object-cover"
            />
          ) : (
            (staff.userName || 'N').charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-800 truncate">
            {staff.userName || 'Nhân viên'}
          </h4>
          <p className="text-[10px] text-slate-500 truncate">
            {staff.positionName || staff.departmentName || 'Nhân viên'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
        <div className="flex items-center gap-1">
          <Gauge size={12} className="text-emerald-500" />
          <span>{staff.speed ? `${Math.round(staff.speed * 3.6)} km/h` : 'Đứng yên'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Battery
            size={12}
            className={
              typeof staff.batteryLevel === 'number' && staff.batteryLevel < 20
                ? 'text-rose-500'
                : 'text-amber-500'
            }
          />
          <span>{typeof staff.batteryLevel === 'number' ? `${staff.batteryLevel}%` : '--'}</span>
        </div>
        <div className="flex items-center gap-1 col-span-2">
          <Clock size={12} className="text-slate-400" />
          <span>Cập nhật: {dayjs(staff.updatedAt).format('HH:mm:ss')}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewRoute(staff)}
        className="w-full h-7 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
      >
        <Navigation size={12} />
        <span>Xem lộ trình trong ngày</span>
      </button>
    </div>
  );
}
