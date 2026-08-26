import api from '@/utils/api';
import type {
  AttendanceReportQueryParams,
  AttendanceReportResponse,
  UserAttendanceDetailReportQueryParams,
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

// Xuất báo cáo chi tiết chấm công & bảng lương theo từng nhân viên ra file Excel (.xlsx)
export const exportUserAttendanceDetailReport = async (
  params: UserAttendanceDetailReportQueryParams,
  employeeSlug?: string
) => {
  const response = await api.get(
    `${baseVersion1}/reports/attendance/detail/export`,
    {
      params: {
        userId: params.userId || params.user_id,
        fromDate: params.fromDate || params.from_date,
        toDate: params.toDate || params.to_date,
        hourlyRate: params.hourlyRate || params.hourly_rate,
        mealAllowanceRate: params.mealAllowanceRate || params.meal_allowance_rate,
        distance10kmRate: params.distance10kmRate || params.distance_10km_rate,
        distance33kmRate: params.distance33kmRate || params.distance_33km_rate,
      },
      responseType: 'blob',
    }
  );


  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const from = params.fromDate || params.from_date || '';
  const to = params.toDate || params.to_date || '';
  const slug = employeeSlug || params.userId || params.user_id || 'nhan_vien';
  const fileName = `bang_cham_cong_luong_${slug}_${from}_${to}.xlsx`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

