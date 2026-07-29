"use client";

import { useState } from "react";
import { Button, Select } from "@/components";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface AttendanceForm {
    userId: string;
    workShiftId: number | null;
    workDate: string;
    checkIn: string;
    checkOut: string;
    checkInLatitude: number | null;
    checkInLongitude: number | null;
    checkOutLatitude: number | null;
    checkOutLongitude: number | null;
    isLate: boolean;
    lateMinutes: number;
    isEarlyLeave: boolean;
    earlyLeaveMinutes: number;
    status: string;
    note: string;
}

function FormItem({ label, children }: { label: string; children: React.ReactNode; }) {

    return (
        <div className="space-y-1.5">
            <label
                className="
                    text-sm 
                    font-medium
                    text-gray-900
                "
            >
                {label}
            </label>
            {children}
        </div>
    );
}

export default function AddAttendanceModal({
    open,
    onClose,
    onSuccess,
}: Props) {


    const [form, setForm] = useState<AttendanceForm>({
        userId: "",
        workShiftId: null,
        workDate: "",
        checkIn: "",
        checkOut: "",
        checkInLatitude: null,
        checkInLongitude: null,
        checkOutLatitude: null,
        checkOutLongitude: null,
        isLate: false,
        lateMinutes: 0,
        isEarlyLeave: false,
        earlyLeaveMinutes: 0,
        status: "absent",
        note: "",
    });

    const updateField = (
        field: keyof AttendanceForm,
        value: any
    ) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    if (!open) return null;
    const handleChange = (name: string, value: string) => {
        toast.success(`[${name}] Đã chọn: ${value}`);
    };
    const options = [
        { value: 'A', label: 'Nguyễn Văn A' },
        { value: 'B', label: 'Nguyễn Văn B' },
        { value: 'C', label: 'Nguyễn Văn C' },
    ];
    const handleSubmit = async () => {
        const payload = {
            workShiftId:
                form.workShiftId
                    ? Number(form.workShiftId)
                    : null,
            lateMinutes:
                Number(form.lateMinutes),
            earlyLeaveMinutes:
                Number(form.earlyLeaveMinutes),
        };
        console.log(
            "Create attendance payload:",
            payload
        );
        // await attendanceApi.create(payload)
        onSuccess?.();
        onClose();
    };
    const formatDate = (date?: string) => {
        if (!date) return "";
        const [year, month, day] = date.split("-");
        if (!year || !month || !day) return "";
        return `${day}/${month}/${year}`;
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
                        flex
                        items-center
                        justify-between
                        border-b
                        px-6
                        py-4
                    "
                >
                    <div>
                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Thêm chấm công
                        </h2>
                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            Tạo bản ghi chấm công cho nhân viên
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="
                            rounded-lg
                            p-2
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
                        px-6
                        py-5
                    "
                >
                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-4
                        "
                    >
                        {/* User */}
                        <FormItem label="Nhân viên">
                            <Select
                                placeholder="Chọn quốc gia"
                                options={options}
                                onChange={(e) => handleChange('Basic Select', e.target.value)}
                            />
                        </FormItem>

                        {/* Date */}
                        <FormItem label="Ngày làm việc">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="dd/mm/yyyy"
                                value={
                                    form.workDate
                                        ? formatDate(form.workDate)
                                        : ""
                                }
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // dd/mm/yyyy -> yyyy-mm-dd
                                    const parts = value.split("/");

                                    if (parts.length === 3) {
                                        const [day, month, year] = parts;

                                        updateField(
                                            "workDate",
                                            `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
                                        );
                                    } else {
                                        updateField(
                                            "workDate",
                                            value
                                        );
                                    }
                                }}
                            />
                        </FormItem>

                        {/* Checkin */}
                        <FormItem label="Check in">
                            <input
                                type="time"
                                className="form-input"
                                value={form.checkIn}
                                onChange={
                                    e =>
                                        updateField(
                                            "checkIn",
                                            e.target.value
                                        )
                                }
                            />
                        </FormItem>
                        {/* Checkout */}
                        <FormItem label="Check out">
                            <input
                                type="time"
                                className="form-input"
                                value={form.checkOut}
                                onChange={
                                    e =>
                                        updateField(
                                            "checkOut",
                                            e.target.value
                                        )
                                }
                            />
                        </FormItem>
                        <FormItem label="Trạng thái">
                            <select
                                className="form-input"
                                value={form.status}
                                onChange={
                                    e =>
                                        updateField(
                                            "status",
                                            e.target.value
                                        )
                                }
                            >
                                <option value="absent">
                                    Vắng mặt
                                </option>

                                <option value="present">
                                    Có mặt
                                </option>

                                <option value="late">
                                    Đi muộn
                                </option>

                                <option value="leave">
                                    Nghỉ phép
                                </option>

                            </select>
                        </FormItem>
                    </div>
                    {/* Status */}
                    <div
                        className="
                            mt-5
                            grid
                            grid-cols-2
                            gap-4
                        "
                    >
                        <div className="col-span-2">
                            <FormItem label="Ghi chú">
                                <textarea
                                    className="
                                        form-input
                                        w-full
                                        min-h-[120px]
                                        resize-y
                                        rounded-lg
                                        border
                                        px-3
                                        py-2
                                        text-sm
                                    "
                                    placeholder="Nhập ghi chú"
                                    value={form.note}
                                    onChange={(e) =>
                                        updateField(
                                            "note",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                </div>
                {/* Footer */}
                <div
                    className="
                        flex
                        justify-end
                        gap-3
                        border-t
                        px-6
                        py-4
                    "
                >
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                    >
                        Lưu chấm công
                    </Button>
                </div>
            </div>
        </div>
    );
}