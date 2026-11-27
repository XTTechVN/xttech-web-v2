'use client';

import { Button } from '@/components-remake';
import type { Attendance } from '@/types';
import { AttendanceList } from './list';

export interface DepartmentSection {
  id: number;
  name: string;
  items: Attendance[];
  total: number;
}

interface Props {
  sections: DepartmentSection[];
  onOpen: (a: Attendance) => void;
  onMore: (id: number) => void;
}

// Mỗi phòng ban một khối: tiêu đề + số bản ghi + bảng riêng; nhân sự thuộc phòng ban nào nằm ở khối đó
export function DepartmentSections({ sections, onOpen, onMore }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((s) => (
        <section key={s.id} aria-labelledby={`att-dept-${s.id}`} className="flex flex-col gap-2">
          <h2 id={`att-dept-${s.id}`} className="flex items-baseline gap-2 text-sm font-semibold text-slate-900">
            <span className="min-w-0 truncate">{s.name}</span>
            <span className="flex-none text-xs font-normal text-slate-500">{s.total} bản ghi</span>
          </h2>
          <AttendanceList rows={s.items} showUser onOpen={onOpen} />
          {s.items.length < s.total && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => onMore(s.id)}>
                {`Xem thêm (${s.total - s.items.length})`}
              </Button>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
