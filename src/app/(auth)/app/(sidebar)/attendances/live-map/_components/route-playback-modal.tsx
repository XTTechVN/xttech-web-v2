'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import L from 'leaflet';
import { Modal, DatePicker, Switch } from 'antd';
import { Loader2, Navigation, MapPin, Gauge, Route } from 'lucide-react';
import { getStaffRoute } from '@/actions';
import { StaffRoutePoint, StaffRouteResponse } from '@/types';
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

/**
 * Lọc bớt các điểm quá gần nhau (< 10m) để chống rung giật khi dừng xe
 */
function filterPointsForMatching(points: StaffRoutePoint[]): StaffRoutePoint[] {
  if (points.length <= 2) return points;
  const filtered: StaffRoutePoint[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = points[i];

    const dLat = (curr.latitude - prev.latitude) * 111320;
    const dLon =
      (curr.longitude - prev.longitude) *
      111320 *
      Math.cos((curr.latitude * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);

    // Bỏ qua các điểm quá sát nhau (< 12m) trừ điểm cuối cùng
    if (dist >= 12 || i === points.length - 1) {
      filtered.push(curr);
    }
  }
  return filtered;
}

/**
 * Thuật toán Map Matching: Sử dụng OSRM để nắn các điểm GPS bám khít 100% vào tim đường nhựa
 */
async function matchRouteWithOSRM(
  points: StaffRoutePoint[]
): Promise<[number, number][]> {
  const cleanPoints = filterPointsForMatching(points);
  if (cleanPoints.length < 2) return [];

  // OSRM Public API tối ưu cho chuỗi dưới 80 điểm; nếu nhiều hơn thì lấy mẫu đều
  let samplePoints = cleanPoints;
  if (cleanPoints.length > 80) {
    const step = Math.ceil(cleanPoints.length / 80);
    samplePoints = cleanPoints.filter(
      (_, idx) => idx % step === 0 || idx === cleanPoints.length - 1
    );
  }

  const coordsStr = samplePoints
    .map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`)
    .join(';');

  const url = `https://router.project-osrm.org/match/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    if (data.code === 'Ok' && data.matchings && data.matchings.length > 0) {
      const snappedCoords: [number, number][] = [];
      for (const match of data.matchings) {
        if (match.geometry && match.geometry.coordinates) {
          for (const coord of match.geometry.coordinates) {
            snappedCoords.push([coord[1], coord[0]]);
          }
        }
      }
      return snappedCoords;
    }
  } catch (err) {
    console.warn('[OSRM Map Matching] Error or timeout, fallback to raw GPS:', err);
  } finally {
    clearTimeout(timeoutId);
  }
  return [];
}

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
  attendanceId?: number;
}

export function RoutePlaybackModal({
  isOpen,
  onClose,
  userId,
  userName,
  attendanceId,
}: RoutePlaybackModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [filterMode, setFilterMode] = useState<'attendance' | 'day'>(
    attendanceId ? 'attendance' : 'day'
  );
  const [routeData, setRouteData] = useState<StaffRouteResponse | null>(null);
  const [matchedCoords, setMatchedCoords] = useState<[number, number][]>([]);
  const [isSnapToRoad, setIsSnapToRoad] = useState<boolean>(true);
  const [isMatchingRoad, setIsMatchingRoad] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchRoute = async () => {
      setIsLoading(true);
      setMatchedCoords([]);
      try {
        const activeAttendanceId = filterMode === 'attendance' ? attendanceId : undefined;
        const data = await getStaffRoute(userId, selectedDate, activeAttendanceId);
        setRouteData(data);

        const pts = data?.points || [];
        if (pts.length >= 2) {
          setIsMatchingRoad(true);
          const snapped = await matchRouteWithOSRM(pts);
          setMatchedCoords(snapped);
        }
      } catch (err) {
        console.error('Lỗi khi tải lộ trình:', err);
      } finally {
        setIsLoading(false);
        setIsMatchingRoad(false);
      }
    };

    fetchRoute();
  }, [isOpen, userId, selectedDate, attendanceId, filterMode]);

  const points = routeData?.points || [];
  const polylineCoords: [number, number][] = points.map((p) => [
    p.latitude,
    p.longitude,
  ]);

  // Chọn tọa độ hiển thị: ưu tiên đường đã nắn bám tim đường nếu người dùng bật
  const displayedCoords =
    isSnapToRoad && matchedCoords.length > 0 ? matchedCoords : polylineCoords;

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
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">
                  Lộ trình di chuyển: {userName}
                </h3>
                {attendanceId && filterMode === 'attendance' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ca chấm công #{attendanceId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {attendanceId && filterMode === 'attendance'
                  ? 'Lịch sử các điểm GPS của ca chấm công này'
                  : 'Lịch sử tất cả các điểm GPS được ghi nhận trong ngày'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bộ chuyển đổi Lọc theo ca hoặc Cả ngày */}
            {attendanceId && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFilterMode('attendance')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    filterMode === 'attendance'
                      ? 'bg-white text-primary shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Theo ca #{attendanceId}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('day')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    filterMode === 'day'
                      ? 'bg-white text-primary shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cả ngày
                </button>
              </div>
            )}

            {/* Nút bật/tắt bám tim đường */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Route
                size={14}
                className={
                  isSnapToRoad && matchedCoords.length > 0
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }
              />
              <span className="text-xs text-slate-600 font-medium">
                Bám tim đường:
              </span>
              <Switch
                size="small"
                checked={isSnapToRoad}
                onChange={setIsSnapToRoad}
                disabled={matchedCoords.length === 0 && !isMatchingRoad}
              />
              {isMatchingRoad && (
                <Loader2 size={12} className="animate-spin text-primary" />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-medium">Chọn ngày:</span>
              <DatePicker
                value={dayjs(selectedDate)}
                onChange={(d) => {
                  if (d) setSelectedDate(d.format('YYYY-MM-DD'));
                }}
                allowClear={false}
                format="DD/MM/YYYY"
                className="w-32 rounded-lg text-xs"
              />
            </div>
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

              {/* Vẽ đường đi Polyline (bám tim đường xanh ngọc lục bảo đẹp mắt, hoặc lam cho GPS gốc) */}
              <Polyline
                positions={displayedCoords}
                pathOptions={{
                  color:
                    isSnapToRoad && matchedCoords.length > 0
                      ? '#059669'
                      : '#2563eb',
                  weight: isSnapToRoad && matchedCoords.length > 0 ? 5 : 4,
                  opacity: 0.85,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
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
