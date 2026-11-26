'use client';

import { PageHeading } from '@/components-remake';
import { DepartmentCalendar } from './_components';

export default function DepartmentRosterPage() {
  return (
    <div className="w-full p-4 font-body md:p-6 [&_h1]:font-heading">
      <PageHeading title="Lịch làm việc" description="Lịch ca của phòng ban theo tháng." />
      <DepartmentCalendar />
    </div>
  );
}
