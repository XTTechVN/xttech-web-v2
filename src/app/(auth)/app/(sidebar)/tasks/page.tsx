'use client';

import { AccessDenied } from '@/components/access-denied';
import { PageHeading } from '@/components-remake';
import { useCan } from '@/hooks';
import TaskTable from './_components/list/table';

export default function StaffTasksPage() {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('staff_task:read')) return <AccessDenied />;
  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Công việc" description="Giao việc và theo dõi tiến độ, hạn hoàn thành." />
      <TaskTable />
    </div>
  );
}
