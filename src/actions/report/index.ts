import api from '@/utils/api';
import type {
  AttendanceReportQueryParams,
  AttendanceReportResponse,
} from '@/types';

const baseVersion1 = '/api/v1';

// Lấy báo cáo thống kê chấm công
export const getAttendanceReport = async (params: AttendanceReportQueryParams) => {
  const response = await api.get<AttendanceReportResponse>(
    `${baseVersion1}/reports/attendance`,
    { params }
  );

  return response.data;
};

// Xuất báo cáo thống kê chấm công ra file Excel (.xlsx)
export const exportAttendanceReport = async (params: AttendanceReportQueryParams) => {
  const response = await api.get(
    `${baseVersion1}/reports/attendance/export`,
    {
      params,
      responseType: 'blob',
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const from = params.fromDate || params.from_date || '';
  const to = params.toDate || params.to_date || '';
  const fileName = `bao_cao_cham_cong_${from}_${to}.xlsx`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
