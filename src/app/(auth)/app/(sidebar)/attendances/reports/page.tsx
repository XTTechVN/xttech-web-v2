'use client';

import { PageHeading } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import { ReportStatsCards, ReportActionBar, ReportTable } from './_components';

export default function AttendanceReportPage() {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('attendance_report:read')) return <AccessDenied />;
  return (
    <div className="w-full flex flex-col gap-4 p-4">
      <PageHeading title="Báo cáo chấm công" description="Thống kê công theo kỳ và xuất Excel." className="mb-0" />
      {/* Thẻ thống kê tổng quan */}
      <ReportStatsCards />

      {/* Action Bar (Nút Xuất Excel) */}
      <ReportActionBar />

      {/* Bảng dữ liệu báo cáo chấm công & Filter Table chung */}
      <ReportTable />
    </div>
  );
}
