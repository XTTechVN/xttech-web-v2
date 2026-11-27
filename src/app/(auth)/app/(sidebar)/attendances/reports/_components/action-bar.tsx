'use client';

import React, { useState, useMemo } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components';
import { useCan, useQueryParam } from '@/hooks';
import { exportAttendanceReport } from '@/actions';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils';
import { getDefaultDateRange } from './table';
import { PeriodLock } from './period-lock';

export const ReportActionBar = () => {
  const { can } = useCan();
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [fromDate] = useQueryParam('fromDate', defaultRange.from);
  const [toDate] = useQueryParam('toDate', defaultRange.to);
  const [departmentId] = useQueryParam('departmentId', '');
  const [attendancePolicy] = useQueryParam('attendancePolicy', '');
  const [search] = useQueryParam('search', '');

  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    if (!fromDate || !toDate) {
      toast.error('Vui lòng chọn khoảng thời gian');
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading('Đang khởi tạo file Excel...');
    try {
      await exportAttendanceReport({
        fromDate,
        toDate,
        departmentId: departmentId ? Number(departmentId) : undefined,
        attendancePolicy: attendancePolicy || undefined,
        search: search || undefined,
      });
      toast.success('Xuất file Excel thành công', { id: toastId });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Có lỗi xảy ra khi xuất file Excel'), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <PeriodLock fromDate={fromDate || ''} />
      {can('attendance_report:export') && (
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          onClick={handleExportExcel}
          loading={isExporting}
          leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        >
          Xuất Excel
        </Button>
      )}
    </div>
  );
};

export default ReportActionBar;
