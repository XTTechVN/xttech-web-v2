"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components";
import { createUser } from "@/actions";
import { UserCreate } from "@/types";
interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}
function FormItem({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">
                {label}
            </label>

            {children}
        </div>
    );
}


export default function CreateUserModal({
    open,
    onClose,
    onSuccess,
}: Props) {


    const queryClient = useQueryClient();
    const initialForm: UserCreate = {
        email: "",
        username: "",
        fullName: "",
        phoneNumber: null,
        avatar: null,
        gender: "male",
        birthday: null,
        address: null,
        joinedAt: null,
        identifyCode: "",
        attendancePolicy: null,
        password: "",
    };


    const [form, setForm] = useState<UserCreate>(
        initialForm
    );



    const updateField = <K extends keyof UserCreate>(
        field: K,
        value: UserCreate[K]
    ) => {

        setForm(prev => ({
            ...prev,
            [field]: value,
        }));

    };


    const mutation = useMutation({

        mutationFn: createUser,


        onSuccess: () => {

            toast.success(
                "Tạo người dùng thành công"
            );


            queryClient.invalidateQueries({
                queryKey: ["users"]
            });


            setForm(initialForm);


            onSuccess?.();

            onClose();

        },


        onError: (error: any) => {

            console.error(
                error.response?.data
            );


            toast.error(
                error.response?.data?.message ||
                "Tạo người dùng thất bại"
            );

        }

    });


    const handleSubmit = () => {
        if (
            !form.email ||
            !form.username ||
            !form.fullName ||
            !form.identifyCode ||
            !form.password
        ) {
            toast.error(
                "Vui lòng nhập đầy đủ thông tin bắt buộc"
            );
            return;
        }
        mutation.mutate(form);
    };

    if (!open) return null;
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
                    max-w-3xl
                    rounded-2xl
                    bg-white
                    shadow-xl
                    overflow-hidden
                "
            >

                {/* Header */}

                <div
                    className="
                        flex
                        justify-between
                        items-center
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
                            "
                        >
                            Thêm người dùng
                        </h2>


                        <p
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            Tạo tài khoản nhân viên mới
                        </p>

                    </div>


                    <button
                        onClick={onClose}
                        className="
                            p-2
                            rounded-lg
                            hover:bg-gray-100
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


                        <FormItem label="Email">

                            <input
                                className="form-input"
                                type="email"
                                value={form.email}
                                onChange={e =>
                                    updateField(
                                        "email",
                                        e.target.value
                                    )
                                }
                            />

                        </FormItem>



                        <FormItem label="Username">

                            <input
                                className="form-input"
                                value={form.username}
                                onChange={e =>
                                    updateField(
                                        "username",
                                        e.target.value
                                    )
                                }
                            />

                        </FormItem>



                        <FormItem label="Họ tên">

                            <input
                                className="form-input"
                                value={form.fullName}
                                onChange={e =>
                                    updateField(
                                        "fullName",
                                        e.target.value
                                    )
                                }
                            />

                        </FormItem>



                        <FormItem label="Mã nhân viên">

                            <input
                                className="form-input"
                                value={form.identifyCode}
                                onChange={e =>
                                    updateField(
                                        "identifyCode",
                                        e.target.value
                                    )
                                }
                            />

                        </FormItem>



                        <FormItem label="Số điện thoại">
                            <input
                                className="form-input"
                                value={form.phoneNumber ?? ""}
                                onChange={(e) =>
                                    updateField(
                                        "phoneNumber",
                                        e.target.value || null
                                    )
                                }
                            />

                        </FormItem>



                        <FormItem label="Giới tính">

                            <select
                                className="form-input"
                                value={form.gender}
                                onChange={e =>
                                    updateField(
                                        "gender",
                                        e.target.value
                                    )
                                }
                            >

                                <option value="male">
                                    Nam
                                </option>


                                <option value="female">
                                    Nữ
                                </option>


                            </select>

                        </FormItem>



                        <FormItem label="Ngày sinh">

                            <input
                                type="date"
                                className="form-input"
                                value={form.birthday ?? ""}
                                onChange={(e) =>
                                    updateField(
                                        "birthday",
                                        e.target.value || null
                                    )
                                }
                            />

                        </FormItem>



                        <FormItem label="Ngày vào làm">

                            <input
                                type="date"
                                className="form-input"
                                value={form.joinedAt ?? ""}
                                onChange={(e) =>
                                    updateField(
                                        "joinedAt",
                                        e.target.value || null
                                    )
                                }
                            />
                        </FormItem>



                        <FormItem label="Mật khẩu">

                            <input
                                type="password"
                                className="form-input"
                                value={form.password}
                                onChange={e =>
                                    updateField(
                                        "password",
                                        e.target.value
                                    )
                                }
                            />

                        </FormItem>


                        <div className="col-span-2">

                            <FormItem label="Địa chỉ">

                                <textarea
                                    className="
                                        form-input
                                        min-h-[100px]
                                    "
                                    value={form.address || ""}
                                    onChange={e =>
                                        updateField(
                                            "address",
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
                        disabled={mutation.isPending}
                    >

                        {
                            mutation.isPending
                                ? "Đang tạo..."
                                : "Tạo người dùng"
                        }

                    </Button>
                </div>
            </div>
        </div>
    );
}
