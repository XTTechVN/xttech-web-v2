import api from '@/utils/api';
import { downloadOrShareBlob, getFilenameFromContentDisposition } from '@/utils';
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

  const disposition = response.headers['content-disposition'];
  const from = params.fromDate || params.from_date || '';
  const to = params.toDate || params.to_date || '';
  const defaultFileName = `bao_cao_cham_cong_${from}_${to}.xlsx`;
  const fileName = getFilenameFromContentDisposition(disposition, defaultFileName);

  await downloadOrShareBlob(response.data, fileName);
};
