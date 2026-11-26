'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components';
import { Button } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import { getEmployees } from '@/actions/employee';
import { EmployeeDetailPage } from '../_components/employee/detail-page';

const Shell = ({ children }: { children: React.ReactNode }) => <div className="mx-auto max-w-3xl p-4 font-body md:p-6">{children}</div>;

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { can, isReady } = useCan();
  const allowed = isReady && can('user:read');
  // Dùng chung bộ nhớ đệm với danh sách nhân sự nên mở từ danh sách là có ngay
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => getEmployees({ limit: 1000 }),
    enabled: allowed,
  });

  if (!isReady) return null;
  if (!allowed) return <AccessDenied />;
  if (isLoading)
    return (
      <Shell>
        <Skeleton className="mb-4 h-11 w-32" />
        <Skeleton className="mb-4 h-16 w-full rounded-block" />
        <Skeleton className="h-64 w-full rounded-block" />
      </Shell>
    );
  if (isError)
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
          <p className="text-sm text-slate-600">Không tải được thông tin nhân sự.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </Shell>
    );

  const employee = data?.items.find((e) => String(e.id) === id);
  if (!employee)
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
          <p className="text-sm text-slate-600">Không tìm thấy nhân sự này.</p>
          <Link href="/app/employees" className="inline-flex min-h-11 items-center text-sm font-medium text-primary">
            Về danh sách nhân sự
          </Link>
        </div>
      </Shell>
    );

  return <EmployeeDetailPage employee={employee} />;
};

export default Page;
