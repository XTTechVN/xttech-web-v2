'use client';

import { PageHeading } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import DepartmentTable from './_components/list/table';

const Page = () => {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('department:read')) return <AccessDenied />;
  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Phòng ban" description="Cơ cấu phòng ban, thành viên và chức vụ." />
      <DepartmentTable />
    </div>
  );
};

export default Page;
