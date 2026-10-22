import type { CuttingBar } from '@/types';
import { cn } from '@/utils/cn';

const PIECE_COLORS = [
  'bg-sky-200 text-sky-900',
  'bg-emerald-200 text-emerald-900',
  'bg-amber-200 text-amber-900',
  'bg-violet-200 text-violet-900',
  'bg-rose-200 text-rose-900',
  'bg-teal-200 text-teal-900',
];

const pieceColor = (positionId?: number | null): string =>
  PIECE_COLORS[(positionId ?? 0) % PIECE_COLORS.length];

interface CuttingBarStripProps {
  bar: CuttingBar;
  index: number;
  isReturnSelectable?: boolean;
  isReturnSelected?: boolean;
  onToggleReturn?: (barId: number) => void;
}

// Một cây nhôm: các đoạn cắt tỉ lệ theo chiều dài, phần còn lại là đoạn dư
export function CuttingBarStrip({
  bar,
  index,
  isReturnSelectable = false,
  isReturnSelected = false,
  onToggleReturn,
}: CuttingBarStripProps) {
  const wastePercent = Math.max(bar.wasteMm / bar.stockLengthMm, 0) * 100;
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-14 shrink-0 font-mono font-semibold text-slate-500">
        {bar.sourceType === 'offcut' ? `Dư #${index}` : `Cây ${index}`}
      </span>
      <div className="flex h-7 flex-1 overflow-hidden rounded border border-slate-200 bg-slate-50">
        {bar.pieces.map((piece) => (
          <div
            key={piece.seq}
            style={{ width: `${(piece.lengthMm / bar.stockLengthMm) * 100}%` }}
            title={`${piece.positionCode ?? ''} · ${piece.lengthMm} mm${piece.angle ? ` · ${piece.angle}` : ''}`}
            className={cn(
              'flex items-center justify-center overflow-hidden border-r border-white px-0.5 font-mono',
              pieceColor(piece.positionId),
            )}
          >
            <span className="truncate">{Math.round(piece.lengthMm)}</span>
          </div>
        ))}
        <div
          style={{ width: `${wastePercent}%` }}
          className="flex items-center justify-center bg-[repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9_4px,#e2e8f0_4px,#e2e8f0_8px)] font-mono text-slate-500"
        >
          {bar.wasteMm >= 300 && <span className="truncate">{Math.round(bar.wasteMm)}</span>}
        </div>
      </div>
      <span className="w-24 shrink-0 text-right font-mono text-slate-500">
        {Math.round(bar.stockLengthMm)} mm
      </span>
      {isReturnSelectable && (
        <input
          type="checkbox"
          checked={isReturnSelected}
          onChange={() => onToggleReturn?.(bar.id)}
          aria-label={`Trả đoạn dư cây ${index} về kho`}
          className="rounded text-primary"
        />
      )}
    </div>
  );
}

