import { User } from './user';

// Phân loại loại nghỉ (leave_type)
export enum LeaveType {
  ANNUAL = 'annual',
  UNPAID = 'unpaid',
  SICK = 'sick',
  MATERNITY = 'maternity',
  WEDDING = 'wedding',
  BEREAVEMENT = 'bereavement',
  OTHER = 'other',
}

// Phạm vi thời gian nghỉ (duration_type)
export enum DurationType {
  FULL_DAY = 'full_day',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  CUSTOM_SHIFT = 'custom_shift',
}

// Trạng thái đơn (status)
export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

// Kiểu dữ liệu đơn xin nghỉ phép
export interface LeaveRequest {
  id: string | number;
  userId: string;
  leaveType: LeaveType | string;
  durationType: DurationType | string;
  workShiftId: string | null;
  startDate: string;
  endDate: string;
  totalDays: number | null;
  reason: string;
  attachmentPath: string | null;
  status: LeaveRequestStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  user: User | null;
  reviewer: User | null;
}

// Alias số nhiều
export type LeaveRequests = LeaveRequest;

// Tham số truy vấn danh sách đơn xin nghỉ phép
export interface LeaveRequestsQueryParams {
  offset?: number;
  limit?: number;
  status?: LeaveRequestStatus | string;
  leaveType?: LeaveType | string;
  leave_type?: LeaveType | string;
  fromDate?: string;
  from_date?: string;
  toDate?: string;
  to_date?: string;
  search?: string;
}

// Dữ liệu tạo mới đơn xin nghỉ phép
export interface LeaveRequestCreate {
  userId?: string;
  user_id?: string;
  leaveType: LeaveType | string;
  durationType: DurationType | string;
  workShiftId?: string | null;
  startDate: string;
  endDate: string;
  totalDays?: number | null;
  reason: string;
}

// Dữ liệu cập nhật đơn xin nghỉ phép
export interface LeaveRequestUpdate {
  userId?: string;
  user_id?: string;
  leaveType?: LeaveType | string;
  durationType?: DurationType | string;
  workShiftId?: string | null;
  startDate?: string;
  endDate?: string;
  totalDays?: number | null;
  reason?: string;
}

// Dữ liệu duyệt hoặc từ chối đơn
export interface LeaveRequestReview {
  status: 'approved' | 'rejected';
  reviewNote?: string;
  review_note?: string;
}
