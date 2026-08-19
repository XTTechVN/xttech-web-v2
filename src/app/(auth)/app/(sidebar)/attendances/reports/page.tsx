'use client';

import React from 'react';
import { ReportStatsCards, ReportActionBar, ReportTable } from './_components';

export default function AttendanceReportPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Thẻ thống kê tổng quan */}
      <ReportStatsCards />

      {/* Action Bar (Nút Xuất Excel) */}
      <ReportActionBar />

      {/* Bảng dữ liệu báo cáo chấm công & Filter Table chung */}
      <ReportTable />
    </div>
  );
}
