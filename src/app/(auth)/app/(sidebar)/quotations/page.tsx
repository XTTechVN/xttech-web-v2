'use client';

import { AccessDenied } from '@/components/access-denied';
import { PageHeading } from '@/components-remake';
import { useCan } from '@/hooks';
import QuotationTable from './_components/table';

// Admin nắm toàn bộ báo giá của hệ thống, duyệt nhanh báo giá đang chờ
const Page = () => {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('quotation:approve')) return <AccessDenied />;
  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Duyệt báo giá" description="Xem xét và duyệt báo giá của dự án." />
      <QuotationTable />
    </div>
  );
};

export default Page;
