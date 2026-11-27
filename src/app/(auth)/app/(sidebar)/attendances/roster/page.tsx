'use client';

import { AccessDenied } from '@/components/access-denied';
import { PageHeading } from '@/components-remake';
import { useCan } from '@/hooks';
import { DepartmentCalendar } from './_components';

export default function DepartmentRosterPage() {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('attendance_report:read')) return <AccessDenied />;
  return (
    <div className="w-full p-4 font-body md:p-6 [&_h1]:font-heading">
      <PageHeading title="Lịch làm việc" description="Lịch ca của phòng ban theo tháng." />
      <DepartmentCalendar />
    </div>
  );
}
