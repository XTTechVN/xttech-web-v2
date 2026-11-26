'use client';

import { AccessDenied } from '@/components/access-denied';
import { PageHeading } from '@/components-remake';
import { useCan } from '@/hooks';
import EmployeeTable from './_components/employee/table';

const Page = () => {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('user:read')) return <AccessDenied />;
  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Nhân sự" description="Hồ sơ, phòng ban và chức vụ của nhân sự." />
      <EmployeeTable />
    </div>
  );
};

export default Page;
