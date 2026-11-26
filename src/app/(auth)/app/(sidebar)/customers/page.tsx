'use client';

import { AccessDenied } from '@/components/access-denied';
import { PageHeading } from '@/components-remake';
import { useCan } from '@/hooks';
import CustomerTable from './_components/list/table';

const Page = () => {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('customer:read')) return <AccessDenied />;
  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Khách hàng" description="Danh sách và thông tin khách hàng." />
      <CustomerTable />
    </div>
  );
};

export default Page;
