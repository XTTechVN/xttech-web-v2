import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { motion } from 'framer-motion';

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

export default function Map({ routeCoordinates, center }: { routeCoordinates: [number, number][], center: [number, number] }) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {routeCoordinates && routeCoordinates.map((position, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Marker position={position} icon={DefaultIcon} />
        </motion.div>
      ))}
    </MapContainer>
  );
}
