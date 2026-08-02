"use client";

import { X } from "lucide-react";
import { Attendance } from "@/types";

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


    if (!open || !data) return null;

    const statusMap: Record<string, string> = {
        present: "Có mặt",
        late: "Đi muộn",
        absent: "Vắng mặt",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Chi tiết chấm công
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Content */}
                <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Nhân viên
                        </span>
                        <span>
                            {data.user?.fullName || "-"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Email
                        </span>
                        <span>
                            {data.user?.email || "-"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Ngày làm việc
                        </span>
                        <span>
                            {data.workDate || "-"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Check In
                        </span>
                        <span>
                            {data.checkIn || "-"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Check Out
                        </span>
                        <span>
                            {data.checkOut || "-"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Tổng giờ
                        </span>
                        <span>
                            {data.totalHours ?? 0} giờ
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Trạng thái
                        </span>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${data.status === "present"
                                ? "bg-green-100 text-green-700"
                                : data.status === "late"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {
                                statusMap[data.status ?? ""]
                                || "-"
                            }
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-medium">
                            Đi muộn
                        </span>
                        <span>
                            {
                                data.isLate
                                    ? `${data.lateMinutes ?? 0} phút`
                                    : "Không"
                            }
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">
                            Về sớm
                        </span>
                        <span>
                            {
                                data.isEarlyLeave
                                    ? `${data.earlyLeaveMinutes ?? 0} phút`
                                    : "Không"
                            }
                        </span>
                    </div>
                    <div>
                        <p className="mb-1 font-medium">
                            Ghi chú
                        </p>
                        <div className="rounded-lg bg-slate-100 p-3">
                            {data.note || "-"}
                        </div>
                    </div>
                    {/* Location */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-100 p-3">
                            <p className="text-xs text-slate-500">
                                Checkin Latitude
                            </p>
                            <p>
                                {data.checkInLatitude ?? "-"}
                            </p>
                        </div>
                        <div className="rounded-lg bg-slate-100 p-3">
                            <p className="text-xs text-slate-500">
                                Checkin Longitude
                            </p>
                            <p>
                                {data.checkInLongitude ?? "-"}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}