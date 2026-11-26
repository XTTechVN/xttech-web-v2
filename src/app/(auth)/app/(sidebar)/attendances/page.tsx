'use client';

import { PageHeading } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import AttendanceTable from './_components/list/table';

const Page = () => {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('attendance:read')) return <AccessDenied />;
  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Chấm công" description="Theo dõi giờ vào ra và xử lý chấm công." />
      <AttendanceTable />
    </div>
  );
};

export default Page;
