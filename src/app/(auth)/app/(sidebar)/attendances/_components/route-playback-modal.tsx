/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import L from 'leaflet';
import { Modal, DatePicker, Switch } from 'antd';
import { Loader2, Navigation, MapPin, Gauge, Route, Maximize2, Minimize2 } from 'lucide-react';
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
 * Tính khoảng cách xấp xỉ giữa 2 điểm tọa độ (mét)
 */
function getPointDistance(p1: StaffRoutePoint, p2: StaffRoutePoint): number {
  const dLat = (p2.latitude - p1.latitude) * 111320;
  const avgLat = (((p1.latitude + p2.latitude) / 2) * Math.PI) / 180;
  const dLon = (p2.longitude - p1.longitude) * 111320 * Math.cos(avgLat);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * Lọc bớt các điểm nhiễu, điểm văng trạm sóng BTS và điểm quá gần (< 6m)
 */
function filterPointsForMatching(points: StaffRoutePoint[]): StaffRoutePoint[] {
  if (points.length <= 2) return points;

  // 1. Lọc bỏ các điểm có sai số lớn (> 50m) nếu có accuracy
  const accuratePoints = points.filter(
    (p) => p.accuracy === undefined || p.accuracy === null || p.accuracy <= 50
  );
  const basePoints = accuratePoints.length >= 2 ? accuratePoints : points;

  // 2. Lọc điểm văng nảy con thoi (Ping-Pong Spike / BTS bounce):
  // Nếu điểm B văng xa khỏi A (>= 50m) nhưng điểm C ngay sau đó lại quay về gần A (<= 35m)
  // -> B là điểm văng ảo do trạm sóng BTS -> loại bỏ B
  const nonSpikePoints: StaffRoutePoint[] = [];
  const n = basePoints.length;
  let i = 0;

  while (i < n) {
    const curr = basePoints[i];
    if (nonSpikePoints.length > 0 && i + 1 < n) {
      const prev = nonSpikePoints[nonSpikePoints.length - 1];
      const next = basePoints[i + 1];

      const dPrevCurr = getPointDistance(prev, curr);
      const dCurrNext = getPointDistance(curr, next);
      const dPrevNext = getPointDistance(prev, next);

      const isBounceSpike =
        dPrevCurr >= 50 &&
        dCurrNext >= 50 &&
        (dPrevNext <= 35 || dPrevNext < dPrevCurr * 0.35);

      if (isBounceSpike) {
        i++;
        continue;
      }
    }

    nonSpikePoints.push(curr);
    i++;
  }

  // 3. Lọc bỏ các điểm quá sát nhau khi dừng xe / đứng yên (< 6m)
  const filtered: StaffRoutePoint[] = [nonSpikePoints[0]];
  for (let j = 1; j < nonSpikePoints.length; j++) {
    const prev = filtered[filtered.length - 1];
    const curr = nonSpikePoints[j];
    const dist = getPointDistance(prev, curr);

    if (dist >= 6 || j === nonSpikePoints.length - 1) {
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
  initialDate?: string;
}

export function RoutePlaybackModal({
  isOpen,
  onClose,
  userId,
  userName,
  attendanceId,
  initialDate,
}: RoutePlaybackModalProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || dayjs().format('YYYY-MM-DD')
  );
  const [filterMode, setFilterMode] = useState<'attendance' | 'day'>(
    attendanceId ? 'attendance' : 'day'
  );
  const [routeData, setRouteData] = useState<StaffRouteResponse | null>(null);
  const [matchedCoords, setMatchedCoords] = useState<[number, number][]>([]);
  const [isSnapToRoad, setIsSnapToRoad] = useState<boolean>(false);
  const [isMatchingRoad, setIsMatchingRoad] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Tự động invalidateSize khi thay đổi chế độ toàn màn hình để map không bị xám góc
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isFullscreen, map, isOpen]);

  // Hỗ trợ phím ESC để thoát toàn màn hình
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate, isOpen]);

  const rawPoints = routeData?.points || [];
  const points = filterPointsForMatching(rawPoints);
  const polylineCoords: [number, number][] = points.map((p) => [
    p.latitude,
    p.longitude,
  ]);

  // Chọn tọa độ hiển thị: ưu tiên đường đã nắn bám tim đường nếu người dùng bật
  const displayedCoords =
    isSnapToRoad && matchedCoords.length > 0 ? matchedCoords : polylineCoords;

  // Tự động căn vừa toàn bộ lộ trình khi có dữ liệu điểm GPS
  useEffect(() => {
    if (!map || displayedCoords.length === 0) return;
    try {
      const bounds = L.latLngBounds(displayedCoords.map((c) => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } catch {
      // Bỏ qua nếu bounds không hợp lệ
    }
  }, [map, displayedCoords]);

  const defaultCenter: [number, number] =
    points.length > 0
      ? [points[0].latitude, points[0].longitude]
      : [20.770184, 106.73479]; // 941 Phạm Văn Đồng

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        setIsFullscreen(false);
        onClose();
      }}
      footer={null}
      width={isFullscreen ? '100vw' : 1120}
      rootClassName={isFullscreen ? 'route-playback-fullscreen-root' : ''}
      wrapClassName={isFullscreen ? '!p-0 !m-0 !overflow-hidden' : ''}
      style={
        isFullscreen
          ? { top: 0, left: 0, padding: 0, margin: 0, maxWidth: '100vw', width: '100vw', height: '100vh' }
          : { top: 20 }
      }
      className={
        isFullscreen
          ? 'fullscreen-route-modal [&_.ant-modal-content]:!h-screen [&_.ant-modal-content]:!w-screen [&_.ant-modal-content]:!rounded-none [&_.ant-modal-content]:!flex [&_.ant-modal-content]:!flex-col [&_.ant-modal-content]:!p-4 [&_.ant-modal-content]:!shadow-none'
          : '[&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!p-4'
      }
      styles={{
        body: isFullscreen
          ? {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 85px)',
              maxHeight: 'calc(100vh - 85px)',
              minHeight: 0,
              padding: 0,
              overflow: 'hidden',
            }
          : {
              padding: 0,
            },
      }}
      title={
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pr-8 pb-3 border-b border-slate-100">
          {/* Thông tin nhân viên & ca */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-800">
                  Lộ trình di chuyển: {userName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {attendanceId && filterMode === 'attendance'
                  ? 'Lịch sử GPS của ca làm việc'
                  : 'Lịch sử di chuyển GPS trong toàn bộ ngày'}
              </p>
            </div>
          </div>

          {/* Cụm công cụ lọc & Chức năng */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Bộ chuyển đổi Lọc theo ca hoặc Cả ngày */}
            {attendanceId && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setFilterMode('attendance')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    filterMode === 'attendance'
                      ? 'bg-white text-primary shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Theo ca 
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('day')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    filterMode === 'day'
                      ? 'bg-white text-primary shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cả ngày
                </button>
              </div>
            )}

            {/* Nút bật/tắt bám tim đường
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors">
              <Route
                size={14}
                className={
                  isSnapToRoad && matchedCoords.length > 0
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }
              />
              <span className="text-xs text-slate-600 font-medium select-none">
                Bám đường:
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
            </div> */}

            {/* Chọn ngày */}
              <DatePicker
                value={dayjs(selectedDate)}
                onChange={(d) => {
                  if (d) setSelectedDate(d.format('YYYY-MM-DD'));
                }}
                allowClear={false}
                format="DD/MM/YYYY"
                className="border-none shadow-none text-xs w-28 px-1"
              />

            {/* Nút Phóng to / Thu nhỏ toàn màn hình */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ lại (Esc)' : 'Phóng to toàn màn hình'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center gap-1 text-xs"
            >
              {isFullscreen ? (
                <Minimize2 size={15} className="text-primary" />
              ) : (
                <Maximize2 size={15} />
              )}
            </button>
          </div>
        </div>
      }
    >
      {/* CSS ghi đè triệt để toàn màn hình 100vw x 100vh cho Antd Modal */}
      {isFullscreen && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .route-playback-fullscreen-root .ant-modal-wrap {
                padding: 0 !important;
                margin: 0 !important;
                overflow: hidden !important;
              }
              .route-playback-fullscreen-root .ant-modal {
                top: 0 !important;
                left: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100vw !important;
                width: 100vw !important;
                height: 100vh !important;
              }
              .route-playback-fullscreen-root .ant-modal-content {
                height: 100vh !important;
                width: 100vw !important;
                max-width: 100vw !important;
                border-radius: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                padding: 16px !important;
                margin: 0 !important;
              }
              .route-playback-fullscreen-root .ant-modal-body {
                flex: 1 1 0% !important;
                height: calc(100vh - 85px) !important;
                max-height: calc(100vh - 85px) !important;
                min-height: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                padding: 0 !important;
                overflow: hidden !important;
              }
            `,
          }}
        />
      )}

      <div className={`pt-3 flex flex-col ${isFullscreen ? 'flex-1 min-h-0' : 'space-y-3'}`}>
        {/* Thống kê lộ trình cân đối */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 shrink-0 mb-3">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Navigation size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Tổng quãng đường
              </span>
              <p className="text-sm font-bold text-slate-800">
                {routeData?.totalDistanceKm ?? routeData?.total_distance_km ?? 0} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Điểm ghi nhận
              </span>
              <p className="text-sm font-bold text-slate-800">
                {points.length} điểm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Gauge size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Bắt đầu lúc
              </span>
              <p className="text-sm font-bold text-slate-800">
                {points.length > 0
                  ? dayjs(points[0].recordedAt).format('HH:mm:ss')
                  : '--:--'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Cập nhật cuối
              </span>
              <p className="text-sm font-bold text-slate-800">
                {points.length > 0
                  ? dayjs(points[points.length - 1].recordedAt).format('HH:mm:ss')
                  : '--:--'}
              </p>
            </div>
          </div>
        </div>

        {/* Khung bản đồ */}
        <div
          style={{
            height: isFullscreen ? 'calc(100vh - 185px)' : '540px',
          }}
          className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 min-h-[360px]"
        >
          {/* Nút chuyển đổi Vệ tinh / Bản đồ chuẩn Google Maps (Góc dưới bên trái) */}
          <div className="absolute bottom-5 left-5 z-[1000]">
            <button
              type="button"
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              title={mapType === 'roadmap' ? 'Chuyển sang ảnh Vệ tinh' : 'Chuyển sang Bản đồ giao thông'}
              className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-slate-200 block text-left select-none"
            >
              {/* Ảnh nền thumbnail */}
              <img
                src={
                  mapType === 'roadmap'
                    ? 'https://mt1.google.com/vt/lyrs=y&x=3311&y=1874&z=12'
                    : 'https://mt1.google.com/vt/lyrs=m&x=3311&y=1874&z=12'
                }
                alt={mapType === 'roadmap' ? 'Vệ tinh' : 'Bản đồ'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
              />
              {/* Nhãn chữ dưới đáy thumbnail */}
              <span className="absolute bottom-0 inset-x-0 bg-slate-900/75 backdrop-blur-2xs text-white text-[10px] font-bold py-0.5 text-center transition-colors group-hover:bg-primary">
                {mapType === 'roadmap' ? 'Vệ tinh' : 'Bản đồ'}
              </span>
            </button>
          </div>

          {/* Nút Phóng to / Thu nhỏ toàn màn hình chuẩn Google Maps (Góc dưới bên phải) */}
          <div className="absolute bottom-5 right-5 z-[1000]">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Phóng to toàn màn hình'}
              className="w-11 h-11 rounded-full bg-white shadow-xl border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-primary hover:bg-slate-50 transition-all duration-200 cursor-pointer active:scale-95 group select-none"
            >
              {isFullscreen ? (
                <Minimize2 size={20} className="transition-transform group-hover:scale-110 text-primary" />
              ) : (
                <Maximize2 size={20} className="transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-[1100] bg-white/70 backdrop-blur-xs flex items-center justify-center gap-2 text-primary font-medium text-sm">
              <Loader2 className="animate-spin" size={20} />
              Đang tải lộ trình GPS...
            </div>
          )}

          {/* Thông báo nhẹ khi chưa có điểm GPS */}
          {!isLoading && points.length === 0 && (
            <div className="absolute top-4 inset-x-0 mx-auto w-fit z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 text-slate-600 text-xs font-medium">
              <MapPin size={16} className="text-amber-500" />
              <span>Chưa có dữ liệu lộ trình di chuyển trong ngày này.</span>
            </div>
          )}

          {/* Bản đồ MapContainer luôn luôn được mount */}
          <MapContainer
            ref={setMap as unknown as React.Ref<L.Map>}
            center={defaultCenter}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              key={mapType}
              attribution="&copy; Google Maps"
              url={
                mapType === 'roadmap'
                  ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                  : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
              }
              maxZoom={20}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />

            {/* Vẽ đường đi Polyline nếu có tọa độ */}
            {displayedCoords.length > 0 && (
              <Polyline
                positions={displayedCoords}
                pathOptions={{
                  color:
                    isSnapToRoad && matchedCoords.length > 0
                      ? '#059669'
                      : mapType === 'satellite'
                      ? '#38bdf8'
                      : '#2563eb',
                  weight: isSnapToRoad && matchedCoords.length > 0 ? 5 : 4,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

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
                      {dayjs(points[0].recordedAt).format('HH:mm:ss DD/MM')}
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
                        points[points.length - 1].recordedAt
                      ).format('HH:mm:ss DD/MM')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </Modal>
  );
}

