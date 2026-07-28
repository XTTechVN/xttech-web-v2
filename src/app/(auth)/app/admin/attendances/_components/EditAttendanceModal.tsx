"use client";

import { Button } from "@/components";
import { X } from "lucide-react";
import { useEffect, useState } from "react";


interface Props {

    open: boolean;

    data: any;

    onClose: () => void;

    onSuccess?: () => void;

}



export default function EditAttendanceModal({
    open,
    data,
    onClose,
    onSuccess
}: Props) {


    const [form, setForm] = useState(data);


    useEffect(() => {
        setForm(data);
    }, [data]);



    if (!open) return null;



    const handleUpdate = () => {

        console.log(
            "Update attendance",
            form
        );

        // attendanceApi.update(id,form)

        onSuccess?.();

        onClose();

    }



    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">


            <div className="w-full max-w-lg rounded-xl bg-white p-6">


                <div className="mb-5 flex justify-between">

                    <h2 className="font-semibold text-lg text-black">
                        Chỉnh sửa chấm công
                    </h2>


                    <button onClick={onClose}>
                        <X size={20} />
                    </button>


                </div>



                <input
                    className="mb-3 w-full rounded-lg border p-2 text-black"
                    value={form?.user || ""}
                    onChange={
                        e => setForm({
                            ...form,
                            user: e.target.value
                        })
                    }
                />



                <input
                    className="mb-3 w-full rounded-lg border p-2 text-black"
                    value={form?.checkinTime || ""}
                    onChange={
                        e => setForm({
                            ...form,
                            checkinTime: e.target.value
                        })
                    }
                />



                <input
                    className="mb-3 w-full rounded-lg border p-2 text-black"
                    value={form?.checkoutTime || ""}
                    onChange={
                        e => setForm({
                            ...form,
                            checkoutTime: e.target.value
                        })
                    }
                />



                <div className="mt-5 flex justify-end gap-2 text-black">

                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>

                    <Button
                        onClick={handleUpdate}
                    >
                        Cập nhật
                    </Button>


                </div>


            </div>

        </div>

    )

}