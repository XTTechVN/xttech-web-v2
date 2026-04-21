'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Camera, ChevronLeft, ChevronRight, MapPin, Radio } from 'lucide-react';
import { cn } from '@/utils/cn';
import api from '@/utils/api';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { motion, AnimatePresence } from 'framer-motion';

// Sửa lỗi icon marker bị lỗi khi dùng với Webpack/Next.js
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface CameraData {
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

// Component helper to handle map centering
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapContainerComponent() {
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0285, 105.8342]);
  const [zoom, setZoom] = useState(13);

  // Fix icon issue on client mount
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: (markerIcon as any).src || markerIcon,
      iconRetinaUrl: (markerIcon2x as any).src || markerIcon2x,
      shadowUrl: (markerShadow as any).src || markerShadow,
    });
  }, []);

  // Create custom DIV icons for the active marker for a truly "premium" feel
  const createActiveIcon = useCallback(() => {
    return L.divIcon({
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
    });
  }, []);

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

  // Sync map center and zoom whenever selectedId changes
  useEffect(() => {
    if (!selectedId || cameras.length === 0) return;
    const camera = cameras.find((c) => c.id === selectedId);
    if (camera) {
      setMapCenter([camera.lat, camera.lng]);
    }
  }, [selectedId, cameras]);

  // Fetch data from API
  const fetchCameras = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/cameras', {
        params: { offset: 0, limit: 10 },
      });
      const items: CameraData[] = response.data.items || [];

      // SORT BY NAME to ensure Cam 1, Cam 2 order
      const sortedItems = [...items].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
      );

      setCameras(sortedItems);

      if (sortedItems.length > 0 && !selectedId) {
        setSelectedId(sortedItems[0].id);
        setZoom(15);
      }
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

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

  const currentCamera = useMemo(
    () => cameras.find((cam) => cam.id === selectedId) || null,
    [cameras, selectedId],
  );
  const selectedIndex = useMemo(
    () => cameras.findIndex((cam) => cam.id === selectedId),
    [cameras, selectedId],
  );

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Map Section */}
      <div className="relative w-full h-[calc(100vh-320px)] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-2xl group">
        {loading && (
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
            <Marker
              key={`${cam.id}-${cam.id === selectedId ? 'active' : 'default'}`}
              position={[cam.lat, cam.lng]}
              icon={cam.id === selectedId ? createActiveIcon() : defaultIcon}
              eventHandlers={{
                click: () => {
                  setSelectedId(cam.id);
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[150px]">
                  <h3 className="font-bold text-gray-900 text-sm">{cam.name}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{cam.address}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        cam.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500',
                      )}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {cam.isActive ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Info Overlay */}
        <AnimatePresence>
          {currentCamera && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl max-w-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Camera size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">{currentCamera.name}</h4>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {currentCamera.address}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute left-4 bottom-4 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 px-3 py-2 rounded-lg shadow-sm flex items-center gap-4 text-[10px] font-bold text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm shadow-green-200" />
            <span>Hoạt động ({cameras.filter((c) => c.isActive).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm shadow-red-200" />
            <span>Ngoại tuyến ({cameras.filter((c) => !c.isActive).length})</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 w-full md:w-72">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Chọn Camera
            </label>
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

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={cameras.length <= 1}
                className="rounded-lg h-10 w-10 p-0 hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronLeft size={20} />
              </Button>

              <div className="px-6 text-center min-w-[120px]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter text-gray-500">
                  Camera
                </p>
                <p className="text-sm font-black text-gray-900">
                  {selectedIndex + 1} <span className="text-gray-300 mx-1">/</span> {cameras.length}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={cameras.length <= 1}
                className="rounded-lg h-10 w-10 p-0 hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronRight size={20} />
              </Button>
            </div>

            <Button
              variant="outline"
              className="rounded-xl h-12 px-6 gap-2 border-gray-200 hover:border-primary hover:text-primary transition-all group"
              onClick={() => {
                if (currentCamera) {
                  setZoom(18);
                  // useEffect will handle centering
                }
              }}
            >
              <Radio size={18} className="group-hover:animate-pulse text-primary" />
              <span className="font-bold">Focus</span>
            </Button>
          </div>
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
