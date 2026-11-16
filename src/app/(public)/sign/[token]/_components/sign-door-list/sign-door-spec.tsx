import type { PublicDoorSpec } from '@/types';
import { formatNumber, getSignDoorTypeLabel } from '@/utils/public-signing';

interface SpecRow {
  label: string;
  value: React.ReactNode;
}

export function SignDoorSpec({ spec }: { spec: PublicDoorSpec }) {
  const rows: SpecRow[] = [
    {
      label: 'Kích thước',
      value: (
        <span className="font-mono tabular-nums">
          {formatNumber(spec.width, 0)} × {formatNumber(spec.height, 0)} mm
        </span>
      ),
    },
    {
      label: 'Diện tích',
      value: <span className="font-mono tabular-nums">{formatNumber(spec.areaM2)} m²</span>,
    },
    { label: 'Loại cửa', value: getSignDoorTypeLabel(spec.doorType) },
    { label: 'Nhà cung cấp', value: spec.supplierName },
    { label: 'Hệ nhôm', value: spec.brandName },
    {
      label: 'Màu nhôm',
      value: spec.colorName ? (
        <span className="inline-flex items-center gap-1.5">
          {spec.colorHex && (
            <span
              className="inline-block size-3 rounded-full border border-stone-300"
              style={{ backgroundColor: spec.colorHex }}
              aria-hidden
            />
          )}
          {spec.colorName}
        </span>
      ) : null,
    },
    { label: 'Kính', value: spec.glassName },
    { label: 'Quy cách kỹ thuật', value: spec.specification },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
      {rows
        .filter((row) => row.value)
        .map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-[10px] uppercase tracking-wide text-stone-500">{row.label}</dt>
            <dd className="font-medium text-stone-900 [overflow-wrap:anywhere]">{row.value}</dd>
          </div>
        ))}
      {spec.note && (
        <div className="col-span-2">
          <dt className="text-[10px] uppercase tracking-wide text-stone-500">Ghi chú</dt>
          <dd className="text-stone-700">{spec.note}</dd>
        </div>
      )}
    </dl>
  );
}
