'use client';

import { Chip, DrawerSection } from '@/components-remake';
import { DAYS_OF_WEEK_OPTIONS } from '@/config';
import { cn } from '@/utils/cn';

export interface ShiftDaysSelectorProps {
  selectedDays: string[];
  selectedOptionalDays: string[];
  onToggleMandatoryDay: (day: string) => void;
  onToggleOptionalDay: (day: string) => void;
}

function DayRow({
  title,
  hint,
  selected,
  onToggle,
  optional,
}: {
  title: string;
  hint: string;
  selected: string[];
  onToggle: (day: string) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="mb-2 text-xs text-slate-500">{hint}</p>
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_OF_WEEK_OPTIONS.map((d) => {
          const on = selected.includes(d.value);
          return (
            <Chip key={d.value} selected={on} onClick={() => onToggle(d.value)} className={cn('px-0 text-center', on && optional && 'border-amber-500 bg-amber-50 text-amber-700')}>
              {d.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

export function ShiftDaysSelector({ selectedDays, selectedOptionalDays, onToggleMandatoryDay, onToggleOptionalDay }: ShiftDaysSelectorProps) {
  const none = selectedDays.length === 0 && selectedOptionalDays.length === 0;
  return (
    <DrawerSection title="Ngày làm việc">
      <DayRow title="Bắt buộc *" hint="Không đi làm thì tính vắng không phép" selected={selectedDays} onToggle={onToggleMandatoryDay} />
      <DayRow title="Tùy chọn" hint="Đi làm vẫn tính công, nghỉ không bị phạt" selected={selectedOptionalDays} onToggle={onToggleOptionalDay} optional />
      {none && <span className="text-xs text-red-500">Vui lòng chọn ít nhất 1 ngày làm việc</span>}
    </DrawerSection>
  );
}
