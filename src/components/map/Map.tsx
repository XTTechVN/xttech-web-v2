import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';

// Sửa lỗi icon marker bị lỗi khi dùng với Webpack/Next.js
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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

function LocationMarker({ setPosition }: { setPosition: (position: any) => void }) {
  const [pos, setPos] = useState<any>(null);

  // Lắng nghe sự kiện click trên bản đồ
  useMapEvents({
    click(e) {
      setPos(e.latlng);
      setPosition(e.latlng); // Gửi tọa độ ra component cha để lưu DB
    },
  });

  return pos === null ? null : <Marker icon={DefaultIcon} position={pos}></Marker>;
}

export default function Map({ routeCoordinates }: { routeCoordinates: [number, number][] }) {
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  return (
    <MapContainer center={[21.0285, 105.8342]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* 1. Nghiệp vụ lấy tọa độ khi click */}
      <LocationMarker setPosition={setSelectedCoords} />

      {/* 2. Nghiệp vụ vẽ đường truy vết (nếu có dữ liệu truyền vào) */}
      {routeCoordinates && <Polyline positions={routeCoordinates} color="red" />}
    </MapContainer>
  );
}
