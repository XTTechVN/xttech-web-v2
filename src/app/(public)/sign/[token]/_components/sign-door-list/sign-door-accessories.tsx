import type { PublicAccessoryLine } from '@/types';
import { getSignCategoryLabel, getSignUnitLabel } from '@/utils/public-signing';

function groupByCategory(accessories: PublicAccessoryLine[]) {
  const groups = new Map<string, PublicAccessoryLine[]>();
  for (const acc of accessories) {
    const key = getSignCategoryLabel(acc.category);
    groups.set(key, [...(groups.get(key) ?? []), acc]);
  }
  return Array.from(groups.entries());
}

export function SignDoorAccessories({ accessories }: { accessories: PublicAccessoryLine[] }) {
  if (accessories.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-bold uppercase tracking-wide text-primary">Phụ kiện ({accessories.length})</h4>
      {groupByCategory(accessories).map(([category, lines]) => (
        <div key={category} className="overflow-hidden rounded-md border border-stone-200 text-xs">
          <div className="bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{category}</div>
          <ul>
            {lines.map((acc, index) => (
              <li
                key={`${acc.code ?? acc.name}-${index}`}
                className="flex items-start justify-between gap-3 px-2.5 py-2 odd:bg-white even:bg-stone-50"
              >
                <div className="min-w-0">
                  <div className="font-medium text-stone-900 [overflow-wrap:anywhere]">{acc.name}</div>
                  <div className="text-[11px] text-stone-600">
                    {[acc.code, acc.brandName, acc.comboName].filter(Boolean).join(' · ')}
                  </div>
                  {acc.note && <div className="text-[11px] text-stone-600">{acc.note}</div>}
                </div>
                <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-stone-900">
                  ×{acc.quantity} {getSignUnitLabel(acc.unit)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}