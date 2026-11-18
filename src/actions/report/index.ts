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
  const from = params.fromDate || '';
  const to = params.toDate || '';
  const defaultFileName = `bao_cao_cham_cong_${from}_${to}.xlsx`;
  const fileName = getFilenameFromContentDisposition(disposition, defaultFileName);

  await downloadOrShareBlob(response.data, fileName);
};

// Chốt công theo tháng (YYYY-MM): tháng đã chốt thì không sửa/xoá/thêm công, không duyệt khiếu nại công
export interface AttendancePeriodLock {
  id: number;
  month: string;
  lockedById: string | null;
  lockedAt: string;
}

export const getAttendancePeriodLocks = async (year: number) =>
  (await api.get<AttendancePeriodLock[]>(`${baseVersion1}/attendance-periods`, { params: { year } })).data;

export const closeAttendancePeriod = async (month: string) =>
  (await api.post<AttendancePeriodLock>(`${baseVersion1}/attendance-periods/${month}/close`)).data;

export const reopenAttendancePeriod = async (month: string) => {
  await api.delete(`${baseVersion1}/attendance-periods/${month}/close`);
};
