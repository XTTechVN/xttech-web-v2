"use client";

import { useState } from "react";
import { Modal, Button, Select, Input, Textarea, DateInput } from "@/components";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AttendanceCreate, AttendanceStatus } from "@/types";
import { createAttendance, getUsers } from "@/actions";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
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
        status: "normal",
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

            // Reset form
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
                status: "normal",
                note: "",
            });
        },
        onError: (error: any) => {
            console.error(error);
            toast.error(
                error?.response?.data?.message || "Không thể tạo chấm công"
            );
        },
    });

    const userOptions =
        usersData?.items?.map((user) => ({
            value: user.id,
            label: user.fullName,
        })) ?? [];

    const statusOptions = [
        { value: "normal", label: "Đúng giờ" },
        { value: "late", label: "Đi muộn" },
        { value: "early_leave", label: "Về sớm" },
        { value: "half_day", label: "Nửa ngày" },
        { value: "absent", label: "Vắng mặt" },
    ];

    const todayStr = new Date().toISOString().split("T")[0];

    const handleSubmit = () => {
        if (!form.userId) {
            toast.error("Vui lòng chọn nhân viên");
            return;
        }

        if (!form.workDate) {
            toast.error("Vui lòng chọn ngày làm việc");
            return;
        }

        if (form.workDate > todayStr) {
            toast.error("Ngày làm việc phải nhỏ hơn hoặc bằng ngày hôm nay");
            return;
        }

        if (form.checkIn && form.checkOut && form.checkOut < form.checkIn) {
            toast.error("Thời gian check-out phải lớn hơn hoặc bằng thời gian check-in");
            return;
        }

        const payload: AttendanceCreate = {
            ...form,
            workDate: form.workDate,
        };

        createMutation.mutate(payload);
    };

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose}>
                Hủy
            </Button>
            <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
            >
                {createMutation.isPending ? "Đang lưu..." : "Lưu chấm công"}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Thêm chấm công"
            size="lg"
            footer={footer}
        >
            <div className="space-y-4 py-2">
                <p className="text-xs text-slate-500 mb-2">Tạo bản ghi chấm công cho nhân viên</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Select */}
                    <Select
                        label="Nhân viên *"
                        placeholder={isLoadingUsers ? "Đang tải nhân viên..." : "Chọn nhân viên"}
                        options={userOptions}
                        value={form.userId}
                        disabled={isLoadingUsers}
                        onChange={(e) => updateField("userId", e.target.value)}
                        fullWidth
                    />

                    {/* Work Date */}
                    <DateInput
                        label="Ngày làm việc *"
                        max={todayStr}
                        value={form.workDate}
                        onChange={(e) => updateField("workDate", e.target.value)}
                        fullWidth
                    />

                    {/* Checkin */}
                    <Input
                        label="Check in"
                        type="time"
                        value={form.checkIn}
                        onChange={(e) => updateField("checkIn", e.target.value)}
                        fullWidth
                    />

                    {/* Checkout */}
                    <Input
                        label="Check out"
                        type="time"
                        value={form.checkOut}
                        onChange={(e) => updateField("checkOut", e.target.value)}
                        fullWidth
                    />

                    {/* Status */}
                    <Select
                        label="Trạng thái"
                        options={statusOptions}
                        value={form.status}
                        onChange={(e) => updateField("status", e.target.value as AttendanceStatus)}
                        fullWidth
                    />
                </div>

                {/* Note */}
                <Textarea
                    label="Ghi chú"
                    placeholder="Nhập ghi chú chấm công"
                    value={form.note}
                    onChange={(e) => updateField("note", e.target.value)}
                    rows={3}
                    fullWidth
                />
            </div>
        </Modal>
    );
}
