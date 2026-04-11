import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

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

export type Position = {
  lat: number;
  lng: number;
};

function LocationMarker({
  setPosition,
  defaultPosition,
}: {
  setPosition: (position: Position) => void;
  defaultPosition?: Position;
}) {
  const [pos, setPos] = useState<any>(defaultPosition);

  // Lắng nghe sự kiện click trên bản đồ
  useMapEvents({
    click(e) {
      setPos(e.latlng);
      setPosition(e.latlng); // Gửi tọa độ ra component cha để lưu DB
    },
  });

  return pos === null ? null : <Marker icon={DefaultIcon} position={pos}></Marker>;
}

function SearchField({ onSelect }: { onSelect: (position: Position) => void }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        'accept-language': 'vi', // Ưu tiên kết quả tiếng Việt
        countrycodes: 'vn', // Giới hạn tìm kiếm trong Việt Nam
      },
    });

    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: 'bar', // Kiểu hiển thị thanh search
      showMarker: true, // Tự động cắm marker khi chọn kết quả
      showPopup: false,
      marker: { icon: DefaultIcon },
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Nhập địa chỉ (VD: Hoàng Mai, Hà Nội)',
      keepResult: true,
    });

    map.addControl(searchControl);

    // Lắng nghe sự kiện khi người dùng chọn một địa điểm từ kết quả tìm kiếm
    map.on('geosearch/showlocation', (result: any) => {
      const { x, y } = result.location; // x là lng, y là lat
      onSelect({ lat: y, lng: x });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onSelect]);

  return null;
}

// Component chính của bạn
export default function MapSelect({
  onSelect,
  defaultPosition,
}: {
  onSelect: (position: Position) => void;
  defaultPosition?: Position;
}) {
  const center: [number, number] =
    defaultPosition &&
    typeof defaultPosition.lat === 'number' &&
    typeof defaultPosition.lng === 'number'
      ? [defaultPosition.lat, defaultPosition.lng]
      : [21.0285, 105.8342];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Thêm chức năng Search */}
        <SearchField onSelect={onSelect} />

        {/* Giữ nguyên chức năng Click chọn tay */}
        <LocationMarker setPosition={onSelect} defaultPosition={defaultPosition} />
      </MapContainer>
    </div>
  );
}
