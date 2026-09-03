'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import L from 'leaflet';
import { Modal, DatePicker } from 'antd';
import { Loader2, Navigation, MapPin, Gauge } from 'lucide-react';
import { getStaffRoute } from '@/actions';
import { StaffRouteResponse } from '@/types';
import 'leaflet/dist/leaflet.css';

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

// Tạo icon bắt đầu và kết thúc tùy chỉnh
const createRouteMarkerIcon = (type: 'start' | 'end') => {
  const isStart = type === 'start';
  const bgColor = isStart ? 'bg-emerald-600' : 'bg-rose-600';
  const badgeBg = isStart ? 'bg-emerald-700' : 'bg-rose-700';
  const iconEmoji = isStart ? '📍' : '🏁';
  const label = isStart ? 'Bắt đầu' : 'Gần nhất';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
      <div class="w-8 h-8 rounded-full ${bgColor} text-white shadow-lg border-2 border-white flex items-center justify-center text-xs font-bold">
        ${iconEmoji}
      </div>
      <div class="absolute -bottom-4 ${badgeBg} text-white text-[9px] px-1.5 py-0.2 rounded-md whitespace-nowrap font-medium shadow-xs">
        ${label}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: `custom-route-${type}-marker`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface RoutePlaybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function RoutePlaybackModal({
  isOpen,
  onClose,
  userId,
  userName,
}: RoutePlaybackModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [routeData, setRouteData] = useState<StaffRouteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchRoute = async () => {
      setIsLoading(true);
      try {
        const data = await getStaffRoute(userId, selectedDate);
        setRouteData(data);
      } catch (err) {
        console.error('Lỗi khi tải lộ trình:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [isOpen, userId, selectedDate]);

  const points = routeData?.points || [];
  const polylineCoords: [number, number][] = points.map((p) => [
    p.latitude,
    p.longitude,
  ]);

  const defaultCenter: [number, number] =
    points.length > 0
      ? [points[0].latitude, points[0].longitude]
      : [21.028511, 105.804817]; // Hà Nội default

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Navigation size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Lộ trình di chuyển: {userName}
              </h3>
              <p className="text-xs text-slate-500">
                Lịch sử các điểm GPS được ghi nhận trong ngày
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Chọn ngày:</span>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={(d) => {
                if (d) setSelectedDate(d.format('YYYY-MM-DD'));
              }}
              allowClear={false}
              format="DD/MM/YYYY"
              className="w-36 rounded-lg text-xs"
            />
          </div>
        </div>
      }
      className="p-0 overflow-hidden"
    >
      <div className="py-3 space-y-3">
        {/* Thống kê lộ trình */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Navigation size={12} className="text-primary" /> Tổng quãng đường
            </span>
            <p className="text-sm font-bold text-slate-800">
              {routeData?.totalDistanceKm ?? routeData?.total_distance_km ?? 0} km
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin size={12} className="text-emerald-500" /> Điểm ghi nhận
            </span>
            <p className="text-sm font-bold text-slate-800">
              {points.length} điểm
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Gauge size={12} className="text-amber-500" /> Bắt đầu lúc
            </span>
            <p className="text-sm font-bold text-slate-800">
              {points.length > 0
                ? dayjs(points[0].recordedAt || points[0].recorded_at).format('HH:mm:ss')
                : '--:--'}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin size={12} className="text-rose-500" /> Cập nhật cuối
            </span>
            <p className="text-sm font-bold text-slate-800">
              {points.length > 0
                ? dayjs(
                    points[points.length - 1].recordedAt ||
                    points[points.length - 1].recorded_at
                  ).format('HH:mm:ss')
                : '--:--'}
            </p>
          </div>
        </div>

        {/* Khung bản đồ */}
        <div className="relative h-[480px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          {isLoading ? (
            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-xs flex items-center justify-center gap-2 text-primary font-medium text-sm">
              <Loader2 className="animate-spin" size={20} />
              Đang tải lộ trình GPS...
            </div>
          ) : points.length === 0 ? (
            <div className="absolute inset-0 z-10 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400">
              <MapPin size={36} className="opacity-40" />
              <p className="text-sm">
                Không có dữ liệu lộ trình di chuyển trong ngày này.
              </p>
            </div>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_2twi_1_650da3cf662548463efcc8fb"
              />

              {/* Vẽ đường đi Polyline */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{ color: '#045863', weight: 4, opacity: 0.8 }}
              />

              {/* Điểm xuất phát (Điểm đầu) */}
              {points.length > 0 && (
                <Marker
                  position={[points[0].latitude, points[0].longitude]}
                  icon={createRouteMarkerIcon('start')}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-emerald-700">📍 Điểm bắt đầu</p>
                      <p>
                        Thời gian:{' '}
                        {dayjs(points[0].recorded_at).format('HH:mm:ss DD/MM')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Điểm kết thúc / Hiện tại (Điểm cuối) */}
              {points.length > 1 && (
                <Marker
                  position={[
                    points[points.length - 1].latitude,
                    points[points.length - 1].longitude,
                  ]}
                  icon={createRouteMarkerIcon('end')}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-rose-700">🏁 Điểm gần nhất</p>
                      <p>
                        Thời gian:{' '}
                        {dayjs(
                          points[points.length - 1].recorded_at
                        ).format('HH:mm:ss DD/MM')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          )}
        </div>
      </div>
    </Modal>
  );
}
