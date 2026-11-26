'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGlobalWarrantyQueue } from '@/actions';
import { AccessDenied } from '@/components/access-denied';
import { PageHeading, Tabs } from '@/components-remake';
import { useCan } from '@/hooks';
import ProjectTable from './_components/list/table';
import { WarrantyQueueSection } from './_components';

type View = 'projects' | 'warranty';

const Page = () => {
  const { can, isReady } = useCan();
  const canWarranty = can('warranty:read');
  const [view, setView] = useState<View>('projects');

  // Số yêu cầu bảo hành đang mở, hiện ngay trên tab
  const badge = useQuery({
    queryKey: ['global_warranty_badge'],
    queryFn: () => getGlobalWarrantyQueue({ openOnly: true, limit: 1 }),
    staleTime: 30_000,
    enabled: canWarranty,
  });

  if (!isReady) return null;
  if (!can('project:read')) return <AccessDenied />;

  const fresh = badge.data?.stats.newClaims ?? 0;
  const open = badge.data?.stats.totalOpen ?? 0;
  const warrantyLabel = fresh > 0 ? `Bảo hành & sửa chữa · ${fresh} mới` : open > 0 ? `Bảo hành & sửa chữa · ${open}` : 'Bảo hành & sửa chữa';
  const tabs: { value: View; label: string }[] = [{ value: 'projects', label: 'Danh sách dự án' }];
  if (canWarranty) tabs.push({ value: 'warranty', label: warrantyLabel });

  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Dự án" description="Theo dõi dự án và tiến độ." />
      <div className="flex flex-col gap-4">
        <Tabs tabs={tabs} value={view} onChange={setView} label="Nhóm dự án" className="px-0" />
        {view === 'warranty' && canWarranty ? <WarrantyQueueSection /> : <ProjectTable />}
      </div>
    </div>
  );
};

export default Page;
