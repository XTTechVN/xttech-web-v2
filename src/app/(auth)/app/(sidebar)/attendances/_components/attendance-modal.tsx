"use client";

import { Modal, Button, Badge, Avatar } from "@/components";
import { Attendance } from "@/types";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  Camera,
  Timer,
  AlertCircle,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { BASE_MINIO_URL } from '@/config';

interface Props {
  open: boolean;
  data: Attendance | null;
  onClose: () => void;
}

export default function AttendanceDetailModal({
  open,
  data,
  onClose,
}: Props) {
  if (!data) return null;

  const statusMap: Record<
    string,
    { label: string; variant: "success" | "warning" | "danger" | "info"; bg: string; text: string }
  > = {
    normal: { label: "Đúng giờ", variant: "success", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
    late: { label: "Đi muộn", variant: "warning", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    absent: { label: "Vắng mặt", variant: "danger", bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
    early_leave: { label: "Về sớm", variant: "warning", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    half_day: { label: "Nửa ngày", variant: "warning", bg: "bg-sky-50 border-sky-200", text: "text-sky-700" },
  };

  const statusInfo = statusMap[data.status ?? ""] ?? {
    label: data.status || "Không xác định",
    variant: "info",
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-700",
  };

  const formatTime = (value?: string | null): string => {
    if (!value) return "--:--";
    if (value.includes("T")) return value.substring(11, 16);
    return value.substring(0, 5);
  };

  const footer = (
    <div className="flex items-center justify-between w-full text-xs text-slate-400">
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Dữ liệu chấm công thời gian thực</span>
      </div>
      <Button variant="primary" onClick={onClose} className="px-5">
        Đóng
      </Button>
    </div>
  );
  const PLACEHOLDER_IMAGE = 'https://picsum.photos/600/400';
  const getAttendanceImageUrl = (path?: string | null) => {
    // Không có ảnh hoặc API trả dữ liệu mẫu "string"
    if (!path || path === 'string') {
      return PLACEHOLDER_IMAGE;
    }

    return `${BASE_MINIO_URL}${path}`;
  };
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Chi tiết chấm công ngày làm việc"
      size="lg"
      footer={footer}
    >
      <div className="space-y-5 text-sm text-slate-700 py-1">

        {/* 1. Header Profile Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-slate-100/50 to-blue-50/30 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Left: Avatar & User Details */}
            <div className="flex items-center gap-4 min-w-0">
              <Avatar
                src={data.user?.avatar || undefined}
                name={data.user?.fullName || "NV"}
                size="lg"
                className="ring-2 ring-teal-500/20 border-2 border-white shadow-xs shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {data.user?.fullName || "Nhân viên"}
                  </h3>
                  {(data.userId || data.user?.id) && (
                    <span
                      className="font-mono text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs truncate max-w-[180px]"
                      title={String(data.userId || data.user?.id)}
                    >
                      {/* #{String(data.userId || data.user?.id)} */}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 truncate">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{data.user?.email || "Chưa cập nhật email"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Work Date & Status Badge */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                <Calendar size={14} className="text-teal-600" />
                <span>{formatDateVN(data.workDate)}</span>
              </div>
              <Badge variant={statusInfo.variant} pill className="px-3.5 py-1.5 text-xs font-bold shadow-2xs">
                {statusInfo.label}
              </Badge>
            </div>

          </div>
        </div>

        {/* 2. Key Metrics Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Hours */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Tổng giờ làm</span>
              <Timer size={15} className="text-blue-500" />
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900">
              {data.totalHours ?? 0} <span className="text-xs font-normal text-slate-500">giờ</span>
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-xl border p-3 flex flex-col justify-between ${statusInfo.bg}`}>
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Trạng thái</span>
              <CheckCircle2 size={15} className={statusInfo.text} />
            </div>
            <div className={`mt-2 text-base font-bold ${statusInfo.text}`}>
              {statusInfo.label}
            </div>
          </div>

          {/* Late Minutes */}
          <div className={`rounded-xl border p-3 flex flex-col justify-between ${data.isLate ? 'bg-rose-50 border-rose-200' : 'bg-slate-50/70 border-slate-200/80'}`}>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Vào muộn</span>
              <AlertCircle size={15} className={data.isLate ? "text-rose-500" : "text-slate-400"} />
            </div>
            <div className={`mt-2 text-base font-bold ${data.isLate ? 'text-rose-700' : 'text-slate-700'}`}>
              {data.isLate ? `${data.lateMinutes ?? 0} phút` : "Đúng giờ"}
            </div>
          </div>

          {/* Early Leave Minutes */}
          <div className={`rounded-xl border p-3 flex flex-col justify-between ${data.isEarlyLeave ? 'bg-amber-50 border-amber-200' : 'bg-slate-50/70 border-slate-200/80'}`}>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Về sớm</span>
              <AlertTriangle size={15} className={data.isEarlyLeave ? "text-amber-500" : "text-slate-400"} />
            </div>
            <div className={`mt-2 text-base font-bold ${data.isEarlyLeave ? 'text-amber-700' : 'text-slate-700'}`}>
              {data.isEarlyLeave ? `${data.earlyLeaveMinutes ?? 0} phút` : "Không"}
            </div>
          </div>
        </div>

        {/* 3. Check-In & Check-Out Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Check In Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <LogIn size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">CHECK IN</h4>
                  <p className="text-[11px] text-slate-400">Thời gian ghi nhận vào ca</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                {formatTime(data.checkIn)}
              </span>
            </div>

            {/* Check In Photo */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Camera size={13} className="text-slate-400" /> Ảnh quẹt thẻ Check In
              </p>
              {data.imgCheckinPath ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                  <img
                    src={getAttendanceImageUrl(data.imgCheckinPath)}
                    alt="Check In Photo"
                    className="h-full w-full object-cover transition transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2 text-xs text-white">
                    Ảnh sinh trắc học Check In
                  </div>
                </div>
              ) : (
                <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Camera size={24} className="mb-1 text-slate-300" />
                  <span className="text-xs">Chưa có ảnh quẹt thẻ</span>
                </div>
              )}
            </div>

            {/* Check In Location & Info */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1 font-medium text-slate-400">
                  <MapPin size={13} className="text-slate-400" /> Vị trí quẹt thẻ:
                </span>
                <span className="font-mono text-slate-700 font-medium">
                  {data.checkInLatitude != null && data.checkInLongitude != null
                    ? `${data.checkInLatitude.toFixed(4)}, ${data.checkInLongitude.toFixed(4)}`
                    : "Chưa ghi nhận GPS"}
                </span>
              </div>
              {data.isLate && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-rose-600 font-semibold">
                  <span>Trạng thái vào ca:</span>
                  <span>Đi muộn {data.lateMinutes ?? 0} phút</span>
                </div>
              )}
            </div>
          </div>

          {/* Check Out Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <LogOut size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">CHECK OUT</h4>
                  <p className="text-[11px] text-slate-400">Thời gian ghi nhận ra ca</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                {formatTime(data.checkOut)}
              </span>
            </div>

            {/* Check Out Photo */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Camera size={13} className="text-slate-400" /> Ảnh quẹt thẻ Check Out
              </p>
              {data.imgCheckoutPath ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                  <img
                    src={getAttendanceImageUrl(data.imgCheckoutPath)}
                    alt="Check Out Photo"
                    className="h-full w-full object-cover transition transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2 text-xs text-white">
                    Ảnh sinh trắc học Check Out
                  </div>
                </div>
              ) : (
                <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Camera size={24} className="mb-1 text-slate-300" />
                  <span className="text-xs">Chưa có ảnh quẹt thẻ</span>
                </div>
              )}
            </div>

            {/* Check Out Location & Info */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1 font-medium text-slate-400">
                  <MapPin size={13} className="text-slate-400" /> Vị trí quẹt thẻ:
                </span>
                <span className="font-mono text-slate-700 font-medium">
                  {data.checkOutLatitude != null && data.checkOutLongitude != null
                    ? `${data.checkOutLatitude.toFixed(4)}, ${data.checkOutLongitude.toFixed(4)}`
                    : "Chưa ghi nhận GPS"}
                </span>
              </div>
              {data.isEarlyLeave && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-amber-600 font-semibold">
                  <span>Trạng thái ra ca:</span>
                  <span>Về sớm {data.earlyLeaveMinutes ?? 0} phút</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 4. Notes Section */}
        {data.note && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" /> Ghi chú từ hệ thống / nhân viên
            </p>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80 italic">
              &quot;{data.note}&quot;
            </p>
          </div>
        )}

      </div>
    </Modal>
  );
}

export function formatDateVN(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const rawDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = rawDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}