'use client';

import { Layers, LocateFixed, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  full: boolean;
  satellite: boolean;
  follow: boolean;
  canFollow: boolean;
  fetching: boolean;
  onFull: () => void;
  onSatellite: () => void;
  onFollow: () => void;
  onRefresh: () => void;
}

const BTN = 'flex size-11 items-center justify-center active:bg-rm-bg';
const ON = 'bg-rm-primary-soft text-rm-primary';

// Một cụm nút liền khối ở góc phải bản đồ.
export function MapControls({ full, satellite, follow, canFollow, fetching, onFull, onSatellite, onFollow, onRefresh }: Props) {
  return (
    <div className="absolute right-2 top-2 z-1000 flex flex-col divide-y divide-rm-line overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface shadow-sm">
      <button type="button" onClick={onFull} aria-label={full ? 'Thu nhỏ bản đồ' : 'Toàn màn hình'} className={BTN}>
        {full ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
      </button>
      <button type="button" onClick={onSatellite} aria-pressed={satellite} aria-label="Ảnh vệ tinh" className={cn(BTN, satellite && ON)}>
        <Layers size={18} aria-hidden="true" />
      </button>
      {canFollow && (
        <button type="button" onClick={onFollow} aria-pressed={follow} aria-label="Theo sát người đang chọn" className={cn(BTN, follow && ON)}>
          <LocateFixed size={18} aria-hidden="true" />
        </button>
      )}
      <button type="button" onClick={onRefresh} aria-label="Làm mới" className={BTN}>
        <RefreshCw size={18} className={cn(fetching && 'animate-spin')} aria-hidden="true" />
      </button>
    </div>
  );
}
