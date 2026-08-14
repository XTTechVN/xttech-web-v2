"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Button, Input, Select, Textarea } from "@/components";
import { createUser } from "@/actions";
import { UserCreate } from "@/types";
import { Upload, X, User } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateUserModal({ open, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const [form, setForm] = useState<UserCreate>(initialForm);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const updateField = <K extends keyof UserCreate>(field: K, value: UserCreate[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const mutation = useMutation({
        mutationFn: () => createUser(form, avatarFile ?? undefined),
        onSuccess: () => {
            toast.success("Tạo người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setForm(initialForm);
            handleRemoveAvatar();
            onSuccess?.();
            onClose();
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { details?: Array<{ field: string; message: string }>; message?: string } } };
            const details = err.response?.data?.details;
            if (Array.isArray(details) && details.length > 0) {
                toast.error(details[0].message);
            } else {
                toast.error(err.response?.data?.message || "Tạo người dùng thất bại");
            }
        },
    });

    const handleSubmit = () => {
        if (!form.email || !form.username || !form.fullName || !form.identifyCode || !form.password) {
            toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }
        mutation.mutate();
    };

    const genderOptions = [
        { value: "male", label: "Nam" },
        { value: "female", label: "Nữ" },
        { value: "other", label: "Khác" },
    ];

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
                {mutation.isPending ? "Đang tạo..." : "Tạo người dùng"}
            </Button>
        </div>
    );

    return (
        <Modal isOpen={open} onClose={onClose} title="Thêm người dùng mới" size="xl" footer={footer}>
            <div className="space-y-5 py-2">
                <p className="text-xs text-slate-500">Tạo tài khoản nhân viên mới trong hệ thống</p>

                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <User size={32} className="text-slate-300" />
                            )}
                        </div>
                        {avatarPreview && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Ảnh đại diện</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                            <Upload size={13} /> Chọn ảnh
                        </button>
                        <p className="mt-1 text-[11px] text-slate-400">JPG, PNG, WEBP. Tối đa 5MB</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Email *"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        fullWidth
                    />
                    <Input
                        label="Username *"
                        value={form.username}
                        onChange={(e) => updateField("username", e.target.value)}
                        fullWidth
                    />
                    <Input
                        label="Họ tên *"
                        value={form.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        fullWidth
                    />
                    <Input
                        label="Mã nhân viên * (9-12 ký tự)"
                        value={form.identifyCode}
                        onChange={(e) => updateField("identifyCode", e.target.value)}
                        fullWidth
                    />
                    <Input
                        label="Số điện thoại"
                        value={form.phoneNumber ?? ""}
                        onChange={(e) => updateField("phoneNumber", e.target.value || null)}
                        fullWidth
                    />
                    <Select
                        label="Giới tính"
                        options={genderOptions}
                        value={form.gender ?? "male"}
                        onChange={(e) => updateField("gender", e.target.value)}
                        fullWidth
                    />
                    <Input
                        label="Ngày sinh"
                        type="date"
                        value={form.birthday ?? ""}
                        onChange={(e) => updateField("birthday", e.target.value || null)}
                        fullWidth
                    />
                    <Input
                        label="Ngày vào làm"
                        type="date"
                        value={form.joinedAt ?? ""}
                        onChange={(e) => updateField("joinedAt", e.target.value || null)}
                        fullWidth
                    />
                    <Input
                        label="Chính sách chấm công"
                        value={form.attendancePolicy ?? ""}
                        placeholder="VD: standard, flexible..."
                        onChange={(e) => updateField("attendancePolicy", e.target.value || null)}
                        fullWidth
                    />
                    <Input
                        label="Mật khẩu * (6-50 ký tự)"
                        type="password"
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        fullWidth
                    />
                </div>

                <Textarea
                    label="Địa chỉ"
                    placeholder="Nhập địa chỉ nhân viên"
                    value={form.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={2}
                    fullWidth
                />
            </div>
        </Modal>
    );
}
