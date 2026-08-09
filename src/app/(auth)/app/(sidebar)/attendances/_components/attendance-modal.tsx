"use client";

import { Modal, Button, Badge, Avatar } from "@/components";
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
    if (!data) return null;

    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
        present: { label: "Có mặt", variant: "success" },
        late: { label: "Đi muộn", variant: "warning" },
        absent: { label: "Vắng mặt", variant: "danger" },
        early_leave: { label: "Về sớm", variant: "warning" },
        half_day: { label: "Nửa ngày", variant: "warning" },
    };

    const statusInfo = statusMap[data.status ?? ""] ?? { label: data.status || "-", variant: "info" };

    const footer = (
        <Button variant="primary" onClick={onClose}>
            Đóng
        </Button>
    );

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Chi tiết chấm công"
            size="md"
            footer={footer}
        >
            <div className="space-y-4 text-sm text-slate-700">
                {/* Employee Info Header */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
                    <Avatar
                        src={data.user?.avatar || undefined}
                        name={data.user?.fullName || "NV"}
                        size="md"
                    />
                    <div>
                        <p className="font-semibold text-slate-900">{data.user?.fullName || "-"}</p>
                        <p className="text-xs text-slate-500">{data.user?.email || "-"}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Ngày làm việc</span>
                    <span className="font-semibold text-slate-800">{data.workDate || "-"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Check In</span>
                    <span className="text-slate-800">{data.checkIn || "-"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Check Out</span>
                    <span className="text-slate-800">{data.checkOut || "-"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Tổng giờ</span>
                    <span className="font-semibold text-slate-800">{data.totalHours ?? 0} giờ</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Trạng thái</span>
                    <Badge variant={statusInfo.variant} pill>
                        {statusInfo.label}
                    </Badge>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Đi muộn</span>
                    <span className={data.isLate ? "text-red-500 font-medium" : "text-slate-600"}>
                        {data.isLate ? `${data.lateMinutes ?? 0} phút` : "Không"}
                    </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Về sớm</span>
                    <span className={data.isEarlyLeave ? "text-amber-600 font-medium" : "text-slate-600"}>
                        {data.isEarlyLeave ? `${data.earlyLeaveMinutes ?? 0} phút` : "Không"}
                    </span>
                </div>

                <div>
                    <p className="mb-1 font-medium text-slate-600">Ghi chú</p>
                    <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-700">
                        {data.note || "-"}
                    </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-3">
                        <p className="text-xs text-slate-400">Checkin Latitude</p>
                        <p className="font-mono text-xs text-slate-700">{data.checkInLatitude ?? "-"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-3">
                        <p className="text-xs text-slate-400">Checkin Longitude</p>
                        <p className="font-mono text-xs text-slate-700">{data.checkInLongitude ?? "-"}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}