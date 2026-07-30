"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components";
import { X } from "lucide-react";
import { Attendance } from "../page";

interface Props {
    open: boolean;
    data: Attendance | null;
    onClose: () => void;
    onSuccess?: () => void;
}

function FormItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">
                {label}
            </label>
            {children}
        </div>
    );
}

export default function EditAttendanceModal({
    open,
    data,
    onClose,
    onSuccess,
}: Props) {
    const [form, setForm] = useState<Attendance | null>(data);

    useEffect(() => {
        setForm(data);
    }, [data]);

    if (!open || !form) return null;

    const handleChange = (key: keyof Attendance, value: any) => {
        setForm({ ...form, [key]: value });
    };

    const handleUpdate = () => {
        console.log("Update attendance:", form);
        // await attendanceApi.update(form.id, form)
        onSuccess?.();
        onClose();
    };

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50
                backdrop-blur-sm
                px-4
            "
        >
            <div
                className="
                    w-full
                    max-w-2xl
                    rounded-2xl
                    bg-white
                    shadow-2xl
                    overflow-hidden
                "
            >
                {/* Header */}
                <div
                    className="
                        flex items-center justify-between
                        border-b
                        px-6 py-4
                    "
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Chỉnh sửa chấm công
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Cập nhật thông tin bản ghi chấm công
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="
                            rounded-lg p-2
                            text-gray-400
                            hover:bg-gray-100
                            hover:text-gray-700
                        "
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="
                        max-h-[70vh]
                        overflow-y-auto
                        px-6 py-5
                    "
                >
                    <div className="grid grid-cols-2 gap-4">
                        {/* Nhân viên - disabled */}
                        <FormItem label="Nhân viên">
                            <input
                                disabled
                                className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={form.user?.fullName || ""}
                            />
                        </FormItem>

                        {/* Ngày làm việc */}
                        <FormItem label="Ngày làm việc">
                            <input
                                type="date"
                                className="form-input"
                                value={form.workDate || ""}
                                onChange={(e) => handleChange("workDate", e.target.value)}
                            />
                        </FormItem>

                        {/* Check In */}
                        <FormItem label="Check in">
                            <input
                                type="time"
                                className="form-input"
                                value={form.checkIn ? form.checkIn.slice(0, 5) : ""}
                                onChange={(e) => handleChange("checkIn", e.target.value)}
                            />
                        </FormItem>

                        {/* Check Out */}
                        <FormItem label="Check out">
                            <input
                                type="time"
                                className="form-input"
                                value={form.checkOut ? form.checkOut.slice(0, 5) : ""}
                                onChange={(e) => handleChange("checkOut", e.target.value)}
                            />
                        </FormItem>

                        {/* Tổng giờ */}
                        <FormItem label="Tổng giờ">
                            <input
                                type="number"
                                className="form-input"
                                value={form.totalHours ?? 0}
                                onChange={(e) => handleChange("totalHours", Number(e.target.value))}
                            />
                        </FormItem>

                        {/* Trạng thái */}
                        <FormItem label="Trạng thái">
                            <select
                                className="form-input"
                                value={form.status ?? ""}
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                <option value="absent">Vắng mặt</option>
                                <option value="present">Có mặt</option>
                                <option value="late">Đi muộn</option>
                                <option value="leave">Nghỉ phép</option>
                            </select>
                        </FormItem>
                    </div>

                    {/* Ghi chú - full width */}
                    <div className="mt-4">
                        <FormItem label="Ghi chú">
                            <textarea
                                className="
                                    form-input
                                    w-full
                                    min-h-[120px]
                                    resize-y
                                    rounded-lg
                                    border
                                    px-3 py-2
                                    text-sm
                                "
                                placeholder="Nhập ghi chú"
                                value={form.note ?? ""}
                                onChange={(e) => handleChange("note", e.target.value)}
                            />
                        </FormItem>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="
                        flex justify-end gap-3
                        border-t
                        px-6 py-4
                    "
                >
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={handleUpdate}>
                        Cập nhật
                    </Button>
                </div>
            </div>
        </div>
    );
}