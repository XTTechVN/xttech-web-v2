'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import dayjs from 'dayjs';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import TimePicker from './TimePicker';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import MediaViewer from './MediaViewer';

const DefaultIcon = L.icon({
  iconUrl: (markerIcon as any).src || markerIcon,
  iconRetinaUrl: (markerIcon2x as any).src || markerIcon2x,
  shadowUrl: (markerShadow as any).src || markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component giúp set center map theo dữ liệu
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function Map({
  tracingLabel,
  tracingDetectionResult,
}: {
  tracingLabel: string;
  tracingDetectionResult: string;
}) {
  const [routeCoordinates, setRouteCoordinates] = useState<any>([]); // Toàn bộ tọa độ đi qua
  const [center, setCenter] = useState<[number, number] | undefined>(undefined); // Center map
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs()); // Ngày mặc định là ngày hôm nay
  const [time, setTime] = useState<number>(8 * 60 * 60); // Thời gian mặc định là 8h sáng theo giờ local
  const [selectedId, setSelectedId] = useState<any>(null);

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['detection-result', tracingLabel, tracingDetectionResult, date, time],
    queryFn: async () => {
      // 1. Chuyển ngày và giờ sang giờ UTC
      const startDate = dayjs(date).startOf('day').add(time, 'second').toISOString();

      // 1.1 Giờ lấy theo "time" + 1 giờ, vì chúng ta sẽ truy vết trong khoảng 1 giờ
      const endDate = dayjs(date)
        .startOf('day')
        .add(time + 60 * 60, 'second')
        .toISOString();

      console.log(startDate, endDate);
      // 2. call API tracing
      const res = await api.get(
        `/api/v1/detected-objects/tracing?label=${tracingLabel}&detectionResult=${tracingDetectionResult}&startDate=${startDate}&endDate=${endDate}`,
      );
      return res.data.items;
    },
    enabled: !!tracingLabel && !!tracingDetectionResult && !!date && !!time,
  });

  // Lọc dữ liệu set state
  useEffect(() => {
    if (data && data.length > 0) {
      const coords = data.map((item: any) => ({
        id: item.id || Math.random().toString(), // Use item.id if available
        lat: item.record?.camera?.lat ?? 21.0278,
        lng: item.record?.camera?.lng ?? 105.8526,
      }));
      const firstCenter: [number, number] = [coords[0].lat, coords[0].lng];
      setRouteCoordinates(coords);
      setCenter(firstCenter);
    } else {
      setRouteCoordinates([]);
      setCenter([21.0278, 105.8526]);
    }
  }, [data]);

  // hiển thị thông báo nếu đang loading hoặc chưa có dữ liệu
  if (isLoading || !center) {
    return (
      <div className="h-[70vh] w-[90vw] p-6 bg-white rounded-lg shadow-md space-y-4">
        {/* TimePicker */}
        <div>
          <TimePicker date={date} setDate={setDate} time={time} setTime={setTime} />
        </div>

        {/* Loading */}
        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="animate-pulse">Đang tải dữ liệu vị trí...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TimePicker */}
      <div className="flex items-center justify-between gap-4 ">
        <TimePicker date={date} setDate={setDate} time={time} setTime={setTime} />
      </div>

      {/* Map */}
      <MapContainer
        className="col-span-7"
        center={center}
        zoom={13}
        style={{ height: '600px', width: '100%', borderRadius: '8px' }}
      >
        <ChangeView center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render Marker */}
        {routeCoordinates &&
          routeCoordinates.map((pos: any) => (
            <Marker
              eventHandlers={{
                click: () => {
                  setSelectedId(pos.id);
                },
              }}
              key={`${pos.id}-${pos.lat}-${pos.lng}`}
              position={[pos.lat, pos.lng]}
              icon={DefaultIcon}
            />
          ))}
      </MapContainer>

      {/* MediaViewer */}
      <MediaViewer selectedId={selectedId} data={data} />
    </div>
  );
}
