"use client";

import { Modal, Button, Badge, Avatar } from "@/components";
import { Attendance, getAttendanceStatusInfo } from "@/types";
import { BASE_MINIO_URL } from "@/config";
import {
  Calendar,
  MapPin,
  FileText,
  LogIn,
  LogOut,
  Camera,
  Timer,
  ShieldCheck,
  Mail,
} from "lucide-react";

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

  const statusInfo = getAttendanceStatusInfo(data.status);

  const formatTime = (value?: string | null): string => {
    if (!value) return "--:--";
    if (value.includes("T")) return value.substring(11, 16);
    return value.substring(0, 5);
  };

  const avatarSrc = data.user?.avatar
    ? data.user.avatar.startsWith("http")
      ? data.user.avatar
      : `${BASE_MINIO_URL}${data.user.avatar}`
    : undefined;

  const checkInImgSrc = data.imgCheckinPath
    ? data.imgCheckinPath.startsWith("http")
      ? data.imgCheckinPath
      : `${BASE_MINIO_URL}${data.imgCheckinPath}`
    : null;

  const checkOutImgSrc = data.imgCheckoutPath
    ? data.imgCheckoutPath.startsWith("http")
      ? data.imgCheckoutPath
      : `${BASE_MINIO_URL}${data.imgCheckoutPath}`
    : null;

  const footer = (
    <div className="flex items-center justify-between w-full text-xs text-slate-400">
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Dữ liệu chấm công thời gian thực</span>
      </div>
      <Button variant="outline" onClick={onClose} className="px-5 hover:bg-[#ececf27d]">
        Đóng
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Chi tiết chấm công ngày làm việc"
      size="lg"
      footer={footer}
    >
      <div className="space-y-4 text-sm text-slate-700 py-1">

        {/* 1. Header Profile Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Left: Avatar & User Details */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                src={avatarSrc}
                name={data.user?.fullName || "NV"}
                size="lg"
                className="ring-2 ring-primary/20 border-2 border-white shadow-xs shrink-0"
              />
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {data.user?.fullName || "Nhân viên"}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{data.user?.email || "Chưa cập nhật email"}</span>
                </div>
              </div>
            </div>

            {/* Right: Date, Status, Total Hours */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-200/60 justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                <Calendar size={13} className="text-primary" />
                <span>{data.workDate || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                <Timer size={13} className="text-primary" />
                <span>{data.totalHours ?? 0} giờ</span>
              </div>
              <Badge variant={statusInfo.variant} pill className="px-3 py-1.5 text-xs font-bold shadow-2xs">
                {statusInfo.label}
              </Badge>
            </div>

          </div>
        </div>

        {/* 2. Check-In & Check-Out Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Check In Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <LogIn size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">CHECK IN</h4>
                  {data.isLate ? (
                    <span className="text-[11px] font-semibold text-rose-600">
                      Muộn {data.lateMinutes ?? 0} phút
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {data.checkIn ? "Đúng giờ" : "Chưa vào ca"}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20 shrink-0 font-mono">
                {formatTime(data.checkIn)}
              </span>
            </div>

            {/* Check In Photo */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Camera size={13} className="text-slate-400" /> Ảnh chụp Check In
              </p>
              {checkInImgSrc ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                  <img
                    src={checkInImgSrc}
                    alt="Check In Photo"
                    className="h-full w-full object-cover transition transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Camera size={22} className="mb-1 text-slate-300" />
                  <span className="text-xs">Chưa có ảnh</span>
                </div>
              )}
            </div>

            {/* Check In Location */}
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium text-slate-400">
                <MapPin size={13} className="text-slate-400" /> Vị trí GPS:
              </span>
              <span className="font-mono text-slate-700 font-medium">
                {data.checkInLatitude != null && data.checkInLongitude != null
                  ? `${data.checkInLatitude.toFixed(4)}, ${data.checkInLongitude.toFixed(4)}`
                  : "Chưa ghi nhận"}
              </span>
            </div>
          </div>

          {/* Check Out Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <LogOut size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">CHECK OUT</h4>
                  {data.isEarlyLeave ? (
                    <span className="text-[11px] font-semibold text-amber-600">
                      Về sớm {data.earlyLeaveMinutes ?? 0} phút
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {data.checkOut ? "Đúng giờ" : "Chưa ra ca"}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20 shrink-0 font-mono">
                {formatTime(data.checkOut)}
              </span>
            </div>

            {/* Check Out Photo */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Camera size={13} className="text-slate-400" /> Ảnh chụp Check Out
              </p>
              {checkOutImgSrc ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                  <img
                    src={checkOutImgSrc}
                    alt="Check Out Photo"
                    className="h-full w-full object-cover transition transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Camera size={22} className="mb-1 text-slate-300" />
                  <span className="text-xs">Chưa có ảnh</span>
                </div>
              )}
            </div>

            {/* Check Out Location */}
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium text-slate-400">
                <MapPin size={13} className="text-slate-400" /> Vị trí GPS:
              </span>
              <span className="font-mono text-slate-700 font-medium">
                {data.checkOutLatitude != null && data.checkOutLongitude != null
                  ? `${data.checkOutLatitude.toFixed(4)}, ${data.checkOutLongitude.toFixed(4)}`
                  : "Chưa ghi nhận"}
              </span>
            </div>
          </div>

        </div>

        {/* 3. Notes Section */}
        {data.note && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" /> Ghi chú
            </p>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80 italic">
              &quot;{data.note}&quot;
            </p>
          </div>
        )}

      </div>
    </Modal>
  );
}