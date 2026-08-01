"use client";

import { useState } from "react";
import { Button, Select } from "@/components";
import { X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AttendanceCreate, AttendanceStatus } from "@/types";
import { createAttendance, getUsers } from "@/actions";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
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

    const [form, setForm] = useState<AttendanceCreate>({
        userId: "",
        workShiftId: undefined,
        workDate: "",
        checkIn: "",
        checkOut: "",
        checkInLatitude: undefined,
        checkInLongitude: undefined,
        checkOutLatitude: undefined,
        checkOutLongitude: undefined,
        isLate: false,
        lateMinutes: 0,
        isEarlyLeave: false,
        earlyLeaveMinutes: 0,
        imgCheckinPath: "",
        imgCheckoutPath: "",
        status: "present",
        note: "",
    });
    const {
        data: usersData,
        isLoading: isLoadingUsers,
    } = useQuery({
        queryKey: ["users"],
        queryFn: () =>
            getUsers({
                limit: 100,
            }),
    });

    const updateField = <K extends keyof AttendanceCreate>(
        field: K,
        value: AttendanceCreate[K]
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const createMutation = useMutation({
        mutationFn: createAttendance,

        onSuccess: () => {
            toast.success("Thêm chấm công thành công");

            onSuccess?.();
            onClose();

            // reset form nếu cần
            setForm({
                userId: "",
                workShiftId: undefined,
                workDate: "",
                checkIn: "",
                checkOut: "",
                checkInLatitude: undefined,
                checkInLongitude: undefined,
                checkOutLatitude: undefined,
                checkOutLongitude: undefined,
                isLate: false,
                lateMinutes: 0,
                isEarlyLeave: false,
                earlyLeaveMinutes: 0,
                imgCheckinPath: "",
                imgCheckoutPath: "",
                status: "present",
                note: "",
            });
        },

        onError: (error: any) => {
            console.error(error);
            toast.error(
                error?.response?.data?.message ||
                "Không thể tạo chấm công"
            );
        },
    });

    if (!open) return null;
    const handleChange = (name: string, value: string) => {
        toast.success(`[${name}] Đã chọn: ${value}`);
    };

    const options =
        usersData?.items?.map((user) => ({
            value: user.id,
            label: user.fullName,
        })) ?? [];

    const handleSubmit = () => {

        if (!form.userId) {
            toast.error("Vui lòng chọn nhân viên");
            return;
        }

        if (!form.workDate) {
            toast.error("Vui lòng chọn ngày làm việc");
            return;
        }


        const payload: AttendanceCreate = {
            ...form,
            workDate: form.workDate,
        };


        createMutation.mutate(payload);
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
                                placeholder={isLoadingUsers ? "Đang tải nhân viên..." : "Chọn nhân viên"}
                                options={options}
                                value={form.userId}
                                disabled={isLoadingUsers}
                                onChange={(e) => {
                                    updateField(
                                        "userId",
                                        e.target.value
                                    )
                                }
                                }
                            />
                        </FormItem>

                        <FormItem label="Ngày làm việc">
                            <input
                                type="date"
                                className="form-input"
                                value={form.workDate}
                                onChange={(e) =>
                                    updateField(
                                        "workDate",
                                        e.target.value
                                    )
                                }
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
                                onChange={(e) =>
                                    updateField(
                                        "status",
                                        e.target.value as AttendanceStatus
                                    )
                                }
                            >
                                <option value="present">Có mặt</option>
                                <option value="late">Đi muộn</option>
                                <option value="early_leave">Về sớm</option>
                                <option value="half_day">Nửa ngày</option>
                                <option value="absent">Vắng mặt</option>
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
                        disabled={createMutation.isPending}
                    >
                        {
                            createMutation.isPending
                                ? "Đang lưu" : "Lưu chấm công"
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
}
