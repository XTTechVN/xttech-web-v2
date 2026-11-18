'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components';
import { acceptInvitation } from '@/actions';

const messageOf = (e: unknown) => (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';

const AcceptInviteForm = () => {
  const token = useSearchParams().get('token') ?? '';
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) return <p className="text-center text-sm text-red-600">Liên kết mời không hợp lệ.</p>;
  if (done)
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm text-gray-700">Tài khoản đã được tạo. Bạn có thể đăng nhập ngay.</p>
        <Link href="/signin" className="inline-flex h-11 items-center justify-center rounded-md bg-primary text-sm font-medium text-white">Đăng nhập</Link>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await acceptInvitation({ token, username, fullName, password });
      setDone(true);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" className="h-11 lg:h-10" />
      <Input label="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} autoCapitalize="none" autoComplete="username" className="h-11 lg:h-10" />
      <Input label="Mật khẩu (tối thiểu 8 ký tự)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="h-11 lg:h-10" />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={loading} className="h-11 lg:h-10">Tạo tài khoản</Button>
    </form>
  );
};

export default AcceptInviteForm;
