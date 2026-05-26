'use client';

import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Camera, ChevronLeft, ChevronRight, MapPin, Radio } from 'lucide-react';

import api from '@/utils/api';
import { cn } from '@/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useCallback } from 'react';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface CameraData {
  id: string;
  name: string;
  rtspUrl: string;
  address: string;
  lat: number;
  lng: number;
  isActive: boolean;
  worker?: {
    name: string;
    ip: string;
  };
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

interface MapMarkerProps {
  camera: CameraData;
  isSelected: boolean;
  onClick: (id: string) => void;
  defaultIcon: L.Icon;
  createActiveIcon: () => L.DivIcon;
}

function MapMarker({ camera, isSelected, onClick, defaultIcon, createActiveIcon }: MapMarkerProps) {
  return (
    <Marker
      key={`${camera.id}-${isSelected ? 'active' : 'default'}`}
      position={[camera.lat, camera.lng]}
      icon={isSelected ? createActiveIcon() : defaultIcon}
      eventHandlers={{
        click: () => onClick(camera.id),
      }}
    >
      <Popup className="custom-popup">
        <div className="p-1 min-w-[150px]">
          <h3 className="font-bold text-gray-900 text-sm">{camera.name}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{camera.address}</p>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                camera.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500',
              )}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {camera.isActive ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

interface FloatingInfoProps {
  camera: CameraData;
}

function FloatingInfo({ camera }: FloatingInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-8 left-4 z-999 bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl max-w-xs"
    >
      <div className="flex items-center gap-3">
        <div>
          <h4 className="font-semibold text-sm text-primary">{camera.name}</h4>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin size={10} /> {camera.address}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function MapContainerComponent() {
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([21.0285, 105.8342]);
  const [zoom, setZoom] = React.useState(13);

  // ── Fix Leaflet icon on client mount ──
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: (markerIcon as any).src || markerIcon,
      iconRetinaUrl: (markerIcon2x as any).src || markerIcon2x,
      shadowUrl: (markerShadow as any).src || markerShadow,
    });
  }, []);

  // ── Icons ──
  const createActiveIcon = useCallback(
    () =>
      L.divIcon({
        className: 'custom-active-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-red-500 rounded-full animate-ping opacity-20"></div>
            <div class="absolute w-6 h-6 bg-red-500 rounded-full animate-pulse opacity-40"></div>
            <div class="relative w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [],
  );

  const defaultIcon = useMemo(
    () =>
      L.icon({
        iconUrl: (markerIcon as any).src || markerIcon,
        iconRetinaUrl: (markerIcon2x as any).src || markerIcon2x,
        shadowUrl: (markerShadow as any).src || markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    [],
  );

  // ── Fetch cameras with useQuery ──
  const { data: response, isLoading } = useQuery({
    queryKey: ['map-cameras'],
    queryFn: () =>
      api.get<{ items: CameraData[] }>('/api/v1/cameras', {
        params: { offset: 0, limit: 100 },
      }),
  });

  const cameras = useMemo(() => {
    const items: CameraData[] = response?.data?.items ?? [];
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
    );
  }, [response]);

  // Auto-select first camera on load
  useEffect(() => {
    if (cameras.length > 0 && !selectedId) {
      setSelectedId(cameras[0].id);
      setMapCenter([cameras[0].lat, cameras[0].lng]);
      setZoom(15);
    }
  }, [cameras, selectedId]);

  // Sync map center when selected camera changes
  useEffect(() => {
    if (!selectedId || cameras.length === 0) return;
    const camera = cameras.find((c) => c.id === selectedId);
    if (camera) {
      setMapCenter([camera.lat, camera.lng]);
    }
  }, [selectedId, cameras]);

  // ── Handlers ──
  const handleSelectCamera = (value: string | number | boolean) => {
    const id = String(value);
    setSelectedId(id);
    setZoom(16);
  };

  const handleNext = () => {
    if (cameras.length === 0) return;
    const currentIndex = cameras.findIndex((cam) => cam.id === selectedId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedId(cameras[nextIndex].id);
  };

  const handlePrev = () => {
    if (cameras.length === 0) return;
    const currentIndex = cameras.findIndex((cam) => cam.id === selectedId);
    const prevIndex = (currentIndex - 1 + cameras.length) % cameras.length;
    setSelectedId(cameras[prevIndex].id);
  };

  const handleFocus = () => {
    setZoom(18);
  };

  // ── Derived state ──
  const currentCamera = useMemo(
    () => cameras.find((cam) => cam.id === selectedId) || null,
    [cameras, selectedId],
  );

  const selectedIndex = useMemo(
    () => cameras.findIndex((cam) => cam.id === selectedId),
    [cameras, selectedId],
  );

  // ── Render ──
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Map Section */}
      <div className="flex items-center justify-between">
        <div className="">
          <Select
            placeholder="Tìm kiếm camera..."
            value={currentCamera?.id}
            onChange={handleSelectCamera}
            options={cameras.map((cam) => ({
              label: cam.name,
              value: cam.id,
            }))}
            className="w-full"
          />
        </div>
        <div className="flex items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={cameras.length <= 1}
            className="transition-all"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={cameras.length <= 1}
            className="transition-all"
          >
            <ChevronRight size={20} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleFocus} className="transition-all">
            <Radio size={20} />
            Phóng to
          </Button>
        </div>
      </div>
      <div className="relative w-full h-[calc(100vh-320px)] bg-gray-100 overflow-hidden group">
        {isLoading && (
          <div className="absolute inset-0 z-[1000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-600">Đang tải bản đồ...</p>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <ChangeView center={mapCenter} zoom={zoom} />

          {cameras.map((cam) => (
            <MapMarker
              key={cam.id}
              camera={cam}
              isSelected={cam.id === selectedId}
              onClick={setSelectedId}
              defaultIcon={defaultIcon}
              createActiveIcon={createActiveIcon}
            />
          ))}
        </MapContainer>

        <AnimatePresence>
          {currentCamera && <FloatingInfo camera={currentCamera} />}
        </AnimatePresence>

        <div className="absolute bottom-0 right-0 h-4 w-full z-[1000] bg-white flex items-center justify-center">
          <div className="text-white text-sm font-bold"></div>
        </div>
      </div>

      <style jsx global>{`
        .custom-active-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
