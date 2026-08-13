"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Select, Input, Textarea } from "@/components";
import { Attendance } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateAttendance } from "@/actions";

interface Props {
    open: boolean;
    data: Attendance | null;
    onClose: () => void;
    onSuccess?: () => void;
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

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Attendance;
        }) => updateAttendance(id, data),

        onSuccess: () => {
            toast.success("Cập nhật chấm công thành công");
            queryClient.invalidateQueries({
                queryKey: ["attendances"]
            });
            onSuccess?.();
            onClose();
        },

        onError: (error: any) => {
            console.error(error.response?.data);
            toast.error(
                error.response?.data?.message || "Cập nhật chấm công thất bại"
            );
        }
    });

    if (!form) return null;

    const handleChange = (key: keyof Attendance, value: any) => {
        setForm({ ...form, [key]: value });
    };

    const handleUpdate = () => {
        if (!form.id) {
            toast.error("Không tìm thấy bản ghi chấm công");
            return;
        }

        updateMutation.mutate({
            id: form.id,
            data: form,
        });
    };

    const statusOptions = [
        { value: "absent", label: "Vắng mặt" },
        { value: "present", label: "Có mặt" },
        { value: "normal", label: "Bình thường" },
        { value: "late", label: "Đi muộn" },
        { value: "leave", label: "Nghỉ phép" },
        { value: "early_leave", label: "Về sớm" },
        { value: "half_day", label: "Nửa ngày" },
    ];

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose}>
                Hủy
            </Button>
            <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
            >
                {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Chỉnh sửa chấm công"
            size="lg"
            footer={footer}
        >
            <div className="space-y-4 py-2">
                <p className="text-xs text-slate-500 mb-2">Cập nhật thông tin bản ghi chấm công</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Employee (Disabled) */}
                    <Input
                        label="Nhân viên"
                        disabled
                        value={form.user?.fullName || ""}
                        fullWidth
                    />

                    {/* Work Date */}
                    <Input
                        label="Ngày làm việc"
                        type="date"
                        value={form.workDate || ""}
                        onChange={(e) => handleChange("workDate", e.target.value)}
                        fullWidth
                    />

                    {/* Check In */}
                    <Input
                        label="Check in"
                        type="time"
                        value={form.checkIn ? form.checkIn.slice(0, 5) : ""}
                        onChange={(e) => handleChange("checkIn", e.target.value)}
                        fullWidth
                    />

                    {/* Check Out */}
                    <Input
                        label="Check out"
                        type="time"
                        value={form.checkOut ? form.checkOut.slice(0, 5) : ""}
                        onChange={(e) => handleChange("checkOut", e.target.value)}
                        fullWidth
                    />

                    {/* Total Hours */}
                    <Input
                        label="Tổng giờ"
                        type="number"
                        value={form.totalHours ?? 0}
                        onChange={(e) => handleChange("totalHours", Number(e.target.value))}
                        fullWidth
                    />

                    {/* Status */}
                    <Select
                        label="Trạng thái"
                        options={statusOptions}
                        value={form.status ?? ""}
                        onChange={(e) => handleChange("status", e.target.value)}
                        fullWidth
                    />
                </div>

                {/* Note */}
                <Textarea
                    label="Ghi chú"
                    placeholder="Nhập ghi chú"
                    value={form.note ?? ""}
                    onChange={(e) => handleChange("note", e.target.value)}
                    rows={3}
                    fullWidth
                />
            </div>
        </Modal>
    );
}
