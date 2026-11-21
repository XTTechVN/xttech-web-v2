'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { isStaffSignalLost, type StaffLiveLocation } from '@/types';
import { getFileUrl } from '@/utils';
import 'leaflet/dist/leaflet.css';

const HCM: [number, number] = [10.7769, 106.7009];
const GAP = 44; // hai người cách nhau dưới ngần này pixel thì gom thành cụm
const TILE = { map: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' };

const RING = { danger: 'border-rm-danger', success: 'border-rm-success', primary: 'border-rm-primary' };
const ring = (p: StaffLiveLocation) => (isStaffSignalLost(p.status) ? RING.danger : p.status === 'moving' ? RING.success : RING.primary);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Ảnh đại diện (hoặc chữ cái đầu) trong vòng viền màu theo trạng thái; người đang chọn to hơn.
function staffIcon(p: StaffLiveLocation, active: boolean) {
  const size = active ? 48 : 40;
  const face = p.avatar
    ? `<img src="${esc(getFileUrl(p.avatar))}" alt="" class="size-full object-cover"/>`
    : esc((p.userName || 'N').trim().charAt(0).toUpperCase());
  return L.divIcon({
    className: 'rounded-full border-0 bg-transparent',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="flex size-full items-center justify-center overflow-hidden rounded-full border-[3px] bg-rm-primary-soft text-sm font-semibold text-rm-primary ${ring(p)}">${face}</div>`,
  });
}

const clusterIcon = (n: number) =>
  L.divIcon({
    className: 'rounded-full border-0 bg-transparent',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<div class="flex size-full items-center justify-center rounded-full border-2 border-rm-surface bg-rm-primary text-sm font-semibold text-rm-on-primary">${n}</div>`,
  });

interface Group {
  key: string;
  center: [number, number];
  members: StaffLiveLocation[];
}

// Gom các điểm sát nhau theo khoảng cách pixel ở mức zoom hiện tại.
function group(map: L.Map, items: StaffLiveLocation[]): Group[] {
  const pts = items.map((p) => ({ p, xy: map.latLngToContainerPoint([p.latitude, p.longitude]) }));
  const used = new Set<string>();
  const out: Group[] = [];
  for (const a of pts) {
    if (used.has(a.p.userId)) continue;
    const near = pts.filter((b) => !used.has(b.p.userId) && a.xy.distanceTo(b.xy) < GAP);
    near.forEach((b) => used.add(b.p.userId));
    const members = near.map((b) => b.p);
    out.push({
      key: members.map((m) => m.userId).join('+'),
      center: [members.reduce((s, m) => s + m.latitude, 0) / members.length, members.reduce((s, m) => s + m.longitude, 0) / members.length],
      members,
    });
  }
  return out;
}

interface Props {
  items: StaffLiveLocation[];
  selected: StaffLiveLocation | null;
  route: [number, number][];
  follow: boolean;
  satellite: boolean;
  onSelect: (p: StaffLiveLocation) => void;
}

function Markers({ items, selected, onSelect }: Pick<Props, 'items' | 'selected' | 'onSelect'>) {
  const map = useMap();
  const [, setZoom] = useState(0);
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const groups = group(map, items);
  return groups.map((g) =>
    g.members.length > 1 ? (
      <Marker
        key={g.key}
        position={g.center}
        icon={clusterIcon(g.members.length)}
        eventHandlers={{
          click: () =>
            map.fitBounds(
              g.members.map((m) => [m.latitude, m.longitude] as [number, number]),
              { padding: [64, 64], maxZoom: 19 },
            ),
        }}
      >
        <Tooltip direction="top" offset={[0, -18]}>
          {g.members.map((m) => m.userName).join(', ')}
        </Tooltip>
      </Marker>
    ) : (
      <Marker
        key={g.key}
        position={g.center}
        icon={staffIcon(g.members[0], g.members[0].userId === selected?.userId)}
        eventHandlers={{ click: () => onSelect(g.members[0]) }}
      >
        <Tooltip direction="top" offset={[0, -20]}>
          {g.members[0].userName}
        </Tooltip>
      </Marker>
    ),
  );
}

// Có lộ trình: ôm cả lộ trình. Chọn người: bay tới (đang theo sát thì đi theo từng ping). Không chọn: ôm mọi điểm khi số người đổi.
function Fit({ items, selected, route, follow }: Omit<Props, 'onSelect' | 'satellite'>) {
  const map = useMap();
  const id = selected?.userId;
  const lat = follow ? selected?.latitude : undefined;
  const lng = follow ? selected?.longitude : undefined;
  const hasRoute = route.length > 1;

  // Khung bản đồ đổi cỡ (bố cục, toàn màn hình, xoay máy) thì Leaflet phải tính lại.
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map]);

  useEffect(() => {
    if (hasRoute) map.fitBounds(route, { padding: [32, 32], maxZoom: 17 });
  }, [map, route, hasRoute]);

  useEffect(() => {
    if (hasRoute) return;
    if (selected) map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 16));
    else if (items.length)
      map.fitBounds(
        items.map((p) => [p.latitude, p.longitude] as [number, number]),
        { padding: [48, 48], maxZoom: 16 },
      );
  }, [map, id, lat, lng, items.length, hasRoute]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function StaffMap({ items, selected, route, follow, satellite, onSelect }: Props) {
  const ends = useMemo(() => (route.length > 1 ? [route[0], route[route.length - 1]] : []), [route]);
  return (
    <MapContainer center={HCM} zoom={12} scrollWheelZoom className="size-full">
      <TileLayer key={satellite ? 'sat' : 'map'} attribution="&copy; Google Maps" url={satellite ? TILE.satellite : TILE.map} maxZoom={20} />
      <Fit items={items} selected={selected} route={route} follow={follow} />
      {route.length > 1 && <Polyline positions={route} pathOptions={{ className: 'stroke-rm-primary', weight: 4, opacity: 0.85 }} />}
      {ends.map((pt, i) => (
        <CircleMarker
          key={i}
          center={pt}
          radius={7}
          pathOptions={{ className: i === 0 ? 'fill-rm-success stroke-rm-surface' : 'fill-rm-danger stroke-rm-surface', weight: 2, fillOpacity: 1 }}
        >
          <Tooltip direction="top">{i === 0 ? 'Điểm đầu' : 'Điểm cuối'}</Tooltip>
        </CircleMarker>
      ))}
      <Markers items={items} selected={selected} onSelect={onSelect} />
    </MapContainer>
  );
}
