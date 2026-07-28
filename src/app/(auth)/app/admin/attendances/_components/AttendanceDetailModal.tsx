"use client";


import { X } from "lucide-react";


interface Props {

    open: boolean;

    data: any;

    onClose: () => void;

}



export default function AttendanceDetailModal({
    open,
    data,
    onClose
}: Props) {


    if (!open) return null;


    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">


            <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 text-white shadow-xl">


                <div className="mb-5 flex items-center justify-between">


                    <h2 className="text-lg font-semibold text-white">
                        Chi tiết chấm công
                    </h2>


                    <button
                        onClick={onClose}
                        className="text-white hover:text-slate-300"
                    >
                        <X size={20} />
                    </button>


                </div>



                <div className="space-y-3 text-sm text-white">


                    <p>
                        <strong className="text-slate-300">
                            Nhân viên:
                        </strong>
                        {" "}
                        {data?.user || "-"}
                    </p>


                    <p>
                        <strong className="text-slate-300">
                            Checkin:
                        </strong>
                        {" "}
                        {data?.checkinTime || "-"}
                    </p>


                    <p>
                        <strong className="text-slate-300">
                            Checkout:
                        </strong>
                        {" "}
                        {data?.checkoutTime || "-"}
                    </p>


                    <p>
                        <strong className="text-slate-300">
                            Trạng thái:
                        </strong>
                        {" "}
                        {data?.status || "-"}
                    </p>


                </div>



            </div>


        </div>

    )

}