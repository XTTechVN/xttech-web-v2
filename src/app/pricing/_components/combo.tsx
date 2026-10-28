import React from 'react';

/* ---------- Types ---------- */
export type ComboChip = {
  before: string;
  strong?: string; // phần in đậm
  after?: string;
};

export interface ComboStripProps {
  label?: string;
  chips?: ComboChip[];
  note?: string;
  className?: string;
}

/* ---------- Data mockup (có thể truyền props để ghi đè) ---------- */
const DEFAULT_COMBO = {
  label: 'Gộp combo:',
  chips: [
    {
      before: 'G4 Xưởng Nhôm 29.9tr + Tái cấu trúc 15tr = ',
      strong: '44.9tr năm đầu',
      after: ' (tiết kiệm 15tr)',
    },
    { before: 'Tặng 1 tháng G2 trị giá 1.29tr' },
  ] as ComboChip[],
  note: '* Áp dụng khi thanh toán theo năm',
};

/* ---------- Component ---------- */
const Combo = ({
  label = DEFAULT_COMBO.label,
  chips = DEFAULT_COMBO.chips,
  note = DEFAULT_COMBO.note,
  className = '',
}: ComboStripProps) => {
  return (
    <div className="w-full bg-white px- py-6 sm:px-8 lg:px-16 xl:px-24">
      <div className={`mx-auto w-full max-w-7xl flex flex-col gap-3 rounded-2xl border border-dashed border-primary/25 bg-primary/5 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-5 ${className}`}>
      <span className="text-xs font-bold text-primary">{label}</span>

      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <span
            key={chip.before}
            className="rounded-full border border-primary/10 bg-white px-3.5 py-1.5 text-xs text-gray-700"
          >
            {chip.before}
            {chip.strong && <strong className="font-bold text-gray-900">{chip.strong}</strong>}
            {chip.after}
          </span>
        ))}
      </div>

      {note && <span className="text-[11px] text-primary/70 sm:ml-auto">{note}</span>}
      </div>
    </div>
  );
};

export default Combo;