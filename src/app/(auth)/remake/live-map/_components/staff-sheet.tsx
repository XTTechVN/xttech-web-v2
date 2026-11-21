'use client';

import { BatteryMedium, Gauge, MapPin, Route, Smartphone } from 'lucide-react';
import { DEVICE_PLATFORM_MAP, STAFF_LIVE_STATUS_MAP, type StaffLiveLocation } from '@/types';
import { buildDiagnosticSignals, formatDeviceSummary } from '../../../app/(sidebar)/live-map/_components/diagnostic-signals';
import { Badge, type Tone } from '../../_components/badge';
import { Sheet } from '../../_components/sheet';

const SIGNAL_TONE: Record<string, Tone> = { danger: 'danger', warning: 'warning', info: 'neutral' };
const SIGNAL_LABEL: Record<string, string> = { danger: 'Lỗi', warning: 'Cảnh báo', info: 'Ghi chú' };
const hhmm = (s: string) => new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const BTN = 'inline-flex h-rm-tap items-center justify-center gap-2 rounded-rm px-4 text-sm font-medium active:scale-95 md:h-rm-control';

interface Props {
  staff: StaffLiveLocation | null;
  open: boolean;
  onClose: () => void;
  onRoute: (p: StaffLiveLocation) => void;
}

// Chi tiết một người: trạng thái, tốc độ, pin, thiết bị, cảnh báo tín hiệu; mở lộ trình hoặc Google Maps.
export function StaffSheet({ staff: s, open, onClose, onRoute }: Props) {
  const signals = s ? buildDiagnosticSignals(s.diagnostics, { awaitingFirstPing: s.awaitingFirstPing }) : [];
  const device = s ? formatDeviceSummary(s.diagnostics) : '';
  const low = s?.batteryLevel != null && s.batteryLevel < 20;
  return (
    <Sheet open={open && !!s} onClose={onClose} title={s?.userName ?? 'Vị trí'}>
      {s && (
        <div className="flex flex-col gap-3 p-rm-gutter text-sm">
          <p className="text-rm-muted">
            {[
              s.positionName ?? s.departmentName,
              STAFF_LIVE_STATUS_MAP[s.status],
              `cập nhật ${hhmm(s.updatedAt)}`,
              s.checkInTime && `vào ca ${s.checkInTime.slice(0, 5)}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <ul className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 text-xs">
            <li className="flex min-w-0 flex-col items-center gap-1 rounded-rm bg-rm-bg px-1 py-2">
              <Gauge size={16} className="text-rm-muted" aria-hidden="true" />
              <span className="max-w-full truncate">{s.speed ? `${Math.round(s.speed * 3.6)} km/h` : 'Đứng yên'}</span>
            </li>
            <li className="flex min-w-0 flex-col items-center gap-1 rounded-rm bg-rm-bg px-1 py-2">
              <BatteryMedium size={16} className={low ? 'text-rm-danger' : 'text-rm-muted'} aria-hidden="true" />
              <span className={low ? 'font-medium text-rm-danger' : ''}>
                {s.batteryLevel != null ? `${Math.round(s.batteryLevel)}%${low ? ' · yếu' : ''}` : '–'}
              </span>
            </li>
            <li className="flex min-w-0 flex-col items-center gap-1 rounded-rm bg-rm-bg px-1 py-2">
              <Smartphone size={16} className="text-rm-muted" aria-hidden="true" />
              <span className="max-w-full truncate">{s.platform ? DEVICE_PLATFORM_MAP[s.platform] : '–'}</span>
            </li>
          </ul>
          <p className="font-mono text-xs">
            {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}
            {s.accuracy != null && <span className="text-rm-muted"> (±{Math.round(s.accuracy)} m)</span>}
          </p>
          {device && <p className="break-words text-xs text-rm-muted">{device}</p>}
          {signals.length > 0 && (
            <ul className="flex flex-col gap-2">
              {signals.map((g) => (
                <li key={g.id} className="flex items-start gap-2">
                  <Badge tone={SIGNAL_TONE[g.severity]}>{SIGNAL_LABEL[g.severity]}</Badge>
                  <span className="min-w-0 flex-1 text-xs">{g.label}</span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => onRoute(s)} className={`${BTN} border border-rm-line`}>
            <Route size={18} aria-hidden="true" />
            Xem lộ trình
          </button>
          <a
            href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
            target="_blank"
            rel="noreferrer"
            className={`${BTN} bg-rm-primary text-rm-on-primary`}
          >
            <MapPin size={18} aria-hidden="true" />
            Mở trên Google Maps
          </a>
        </div>
      )}
    </Sheet>
  );
}
