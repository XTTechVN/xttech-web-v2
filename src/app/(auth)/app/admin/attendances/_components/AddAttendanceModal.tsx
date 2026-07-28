"use client";

import { useState } from "react";
import { Button } from "@/components";
import { X } from "lucide-react";

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

    const [form, setForm] = useState({
        employeeId: "",
        checkinTime: "",
        checkoutTime: "",
        workDate: "",
    });


    if (!open) return null;


    const handleSubmit = async () => {

        console.log("Create attendance", form);

        // await attendanceApi.create(form)

        onSuccess?.();
        onClose();
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                <div className="mb-5 flex justify-between">
                    <h2 className="text-lg font-semibold text-black">
                        Thêm chấm công
                    </h2>

                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>


                <div className="space-y-4">

                    <input
                        className="w-full rounded-lg border p-2 text-black"
                        placeholder="Nhân viên"
                        value={form.employeeId}
                        onChange={
                            e => setForm({
                                ...form,
                                employeeId: e.target.value
                            })
                        }
                    />


                    <input
                        type="date"
                        className="w-full rounded-lg border p-2 text-black"
                        value={form.workDate}
                        onChange={
                            e => setForm({
                                ...form,
                                workDate: e.target.value
                            })
                        }
                    />


                    <input
                        className="w-full rounded-lg border p-2 text-black"
                        placeholder="Giờ checkin"
                        value={form.checkinTime}
                        onChange={
                            e => setForm({
                                ...form,
                                checkinTime: e.target.value
                            })
                        }
                    />


                    <input
                        className="w-full rounded-lg border p-2 text-black"
                        placeholder="Giờ checkout"
                        value={form.checkoutTime}
                        onChange={
                            e => setForm({
                                ...form,
                                checkoutTime: e.target.value
                            })
                        }
                    />

                </div>


                <div className="mt-6 flex justify-end gap-2 text-black">

                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>


                    <Button
                        onClick={handleSubmit}
                    >
                        Lưu
                    </Button>

                </div>

            </div>

        </div>
    )
}