import { EllipsisVertical, ImageOff } from 'lucide-react';
import { DoorThumbnail } from '@/components';
import { DOOR_STATUS_MAP } from '@/config';
import type { ProjectDoorPosition } from '@/types';
import { Badge, toneOf } from '../../../_components/badge';

// Thẻ vị trí cửa: bản vẽ, mã + trạng thái, kích thước; ⋮ mở danh sách thao tác (nếu có).
export function PositionCard({ p, onMenu }: { p: ProjectDoorPosition; onMenu?: () => void }) {
  const s = DOOR_STATUS_MAP[p.status];
  const hasDrawing = Boolean(p.systemConfig?.rootCell);
  return (
    <li className="flex flex-col overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">
      <div className="flex items-center gap-2 border-b border-rm-line pl-3">
        <span className="min-w-0 flex-1 truncate py-2 text-sm font-medium">{p.code}</span>
        {p.designOptionId ? <Badge tone="primary">Phương án</Badge> : <Badge tone={toneOf(s?.variant)}>{s?.label ?? p.status}</Badge>}
        {onMenu ? (
          <button
            type="button"
            aria-label={`Thao tác cửa ${p.code}`}
            onClick={onMenu}
            className="flex size-11 flex-none items-center justify-center text-rm-muted active:bg-rm-bg"
          >
            <EllipsisVertical size={18} aria-hidden="true" />
          </button>
        ) : (
          <span className="w-2" />
        )}
      </div>
      <div className="flex aspect-[4/3] items-center justify-center bg-rm-bg p-2">
        {hasDrawing ? (
          <DoorThumbnail systemConfig={p.systemConfig ?? undefined} hideDimensions={false} className="size-full" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs text-rm-muted">
            <ImageOff size={22} aria-hidden="true" />
            Chưa có bản vẽ
          </span>
        )}
      </div>
      <div className="space-y-0.5 px-3 py-2 text-xs">
        <p className="truncate text-sm font-medium">{p.description || (p.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi')}</p>
        <p className="text-rm-muted">
          {p.width} × {p.height} mm · {(p.areaM2 ?? 0).toFixed(2)} m²
        </p>
        <p className="truncate text-rm-muted">
          {p.floor?.name ?? '–'}
          {!p.isMeasured && !p.designOptionId ? ' · chưa đo' : ''}
        </p>
        {p.measureNote && <p className="line-clamp-2 text-rm-muted [overflow-wrap:anywhere]">Ghi chú: {p.measureNote}</p>}
      </div>
    </li>
  );
}
