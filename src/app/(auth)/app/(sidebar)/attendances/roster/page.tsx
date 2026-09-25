'use client';

import { DepartmentCalendar } from './_components';

export default function DepartmentRosterPage() {
  return (
    <div className="flex flex-col gap-4 w-full">


      {/* 2. Khung Quyển lịch tháng (Full-width Month Calendar) */}
      <div className="w-full">
        <DepartmentCalendar />
      </div>
    </div>
  );
}
