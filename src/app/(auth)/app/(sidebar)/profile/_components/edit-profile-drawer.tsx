'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { updateMyProfile } from '@/actions';
import { Avatar, Input } from '@/components';
import { Button, Chip, DateTimeField, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { useAuthStore } from '@/stores';
import { getFileUrl, showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import type { AuthUser } from '@/types';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
const AVATAR_MAX = 5 * 1024 * 1024;
const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  birthday: string;
  address: string;
}

const toForm = (u: AuthUser): FormState => ({
  fullName: u.fullName ?? '',
  email: u.email ?? '',
  phoneNumber: u.phoneNumber ?? '',
  gender: u.gender ?? '',
  birthday: u.birthday ?? '',
  address: u.address ?? '',
});

// Sửa thông tin của chính mình, kèm đổi ảnh đại diện. Chỉ gửi những trường đã đổi.
export function EditProfileDrawer({ user, isOpen, onClose }: { user: AuthUser; isOpen: boolean; onClose: () => void }) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Chỉnh sửa thông tin">
      <EditProfileForm user={user} onClose={onClose} />
    </Drawer>
  );
}

function EditProfileForm({ user, onClose }: { user: AuthUser; onClose: () => void }) {
  const initial = toForm(user);
  const [form, setForm] = useState<FormState>(initial);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) return setAvatarError('Chỉ nhận ảnh JPG, PNG, WEBP, GIF hoặc HEIC');
    if (file.size > AVATAR_MAX) return setAvatarError('Ảnh tối đa 5MB');
    setAvatarError('');
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const errors = {
    fullName: form.fullName.trim().length < 3 ? 'Họ và tên tối thiểu 3 ký tự' : undefined,
    email: !EMAIL.test(form.email.trim()) ? 'Email không hợp lệ' : undefined,
    phoneNumber: form.phoneNumber && !/^[0-9+\s]{10,15}$/.test(form.phoneNumber.trim()) ? 'Số điện thoại 10 đến 15 chữ số' : undefined,
    address: form.address && form.address.trim().length < 3 ? 'Địa chỉ tối thiểu 3 ký tự' : undefined,
  };
  const hasError = Object.values(errors).some(Boolean);

  const changes: Record<string, string> = {};
  (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
    const value = form[k].trim();
    if (value && value !== initial[k]) changes[k] = value;
  });
  const dirty = Object.keys(changes).length > 0 || !!avatarFile;

  const save = useMutation({
    mutationFn: () => updateMyProfile(changes, avatarFile),
    onSuccess: (updated) => {
      useAuthStore.getState().updateUser({ ...updated });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      showSuccessToast('Đã cập nhật thông tin');
      onClose();
    },
    onError: (e: Error) => showErrorToast(e, 'Không cập nhật được thông tin'),
  });

  const avatarSrc = preview ?? (user.avatar ? getFileUrl(user.avatar) : undefined);

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty && !hasError) save.mutate();
      }}
    >
      <DrawerHeader compact title="Chỉnh sửa thông tin" onClose={onClose} />
      <DrawerBody>
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Đổi ảnh đại diện"
              className="relative flex-none cursor-pointer rounded-full active:scale-95"
            >
              <Avatar src={avatarSrc} name={form.fullName || user.username} className="h-20 w-20 text-2xl" />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white">
                <Camera size={14} />
              </span>
            </button>
            <input ref={fileRef} type="file" accept={AVATAR_TYPES.join(',')} className="hidden" onChange={pickAvatar} />
            <div className="min-w-0 text-sm">
              <p className="font-medium text-slate-900">Ảnh đại diện</p>
              <p className="text-xs text-slate-500">JPG, PNG, WEBP, tối đa 5MB</p>
              {avatarError && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {avatarError}
                </p>
              )}
            </div>
          </div>

          <Input fullWidth label="Họ và tên" value={form.fullName} maxLength={50} autoComplete="name" onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} />
          <Input fullWidth label="Tên đăng nhập" value={user.username} readOnly disabled />
          <Input fullWidth label="Email" type="email" inputMode="email" autoComplete="email" maxLength={50} value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <Input fullWidth label="Số điện thoại" type="tel" inputMode="tel" autoComplete="tel" maxLength={15} value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} error={errors.phoneNumber} />

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Giới tính</span>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip key={g.value} selected={form.gender === g.value} onClick={() => set('gender', g.value)}>
                  {g.label}
                </Chip>
              ))}
            </div>
          </div>

          <DateTimeField label="Ngày sinh" mode="date" value={form.birthday} max={new Date().toISOString().slice(0, 10)} onChange={(v) => set('birthday', v)} />
          <Input fullWidth label="Địa chỉ" value={form.address} maxLength={100} autoComplete="street-address" onChange={(e) => set('address', e.target.value)} error={errors.address} />
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" loading={save.isPending} disabled={!dirty || hasError}>
            Lưu thay đổi
          </Button>
        </div>
      </DrawerFooter>
    </form>
  );
}
