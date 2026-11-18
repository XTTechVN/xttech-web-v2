'use client';

import { useState } from 'react';
import api from '@/utils/api';
import { Button, Input } from '@/components';

// Trang bắt buộc đổi mật khẩu ở lần đăng nhập đầu (tài khoản do admin tạo hoặc vừa được reset)
export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('Mật khẩu nhập lại chưa khớp');
    setError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/change', { newPassword: password });
      // đổi mật khẩu thu hồi phiên: đăng nhập lại bằng mật khẩu mới
      window.location.replace('/signin');
    } catch (err) {
      setError((err as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Không đổi được mật khẩu');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
      <header>
        <h1 className="font-lexend text-xl font-semibold tracking-tight text-gray-900">Đổi mật khẩu</h1>
        <p className="text-sm text-gray-500">Bạn cần đặt mật khẩu mới trước khi tiếp tục sử dụng.</p>
      </header>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="Mật khẩu mới (tối thiểu 8 ký tự)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="h-11" />
        <Input label="Nhập lại mật khẩu" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" className="h-11" />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="h-11">Đổi mật khẩu</Button>
      </form>
    </div>
  );
}
