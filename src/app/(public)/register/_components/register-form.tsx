'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components';
import { checkOrganizationCode, registerOrganization } from '@/actions';
import { saveLastOrg } from '@/utils/last-org';

const messageOf = (e: unknown) =>
  (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';

// "Công ty Xuân Tiệp" -> "cong_ty_xuan_tiep": bỏ dấu, chữ thường, nối bằng _
const toOrgCode = (name: string) =>
  name
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeEdited, setCodeEdited] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneCode, setDoneCode] = useState('');

  const verifyCode = async (value: string) => {
    if (!value) return setCodeError('');
    try {
      const r = await checkOrganizationCode(value);
      setCodeError(r.available ? '' : (r.reason ?? 'Mã không dùng được'));
    } catch {
      setCodeError('');
    }
  };

  if (doneCode)
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm text-gray-700">
          Đã tạo doanh nghiệp. Mã đăng nhập của bạn là <b className="font-mono">{doneCode}</b>.
        </p>
        <Link
          href="/signin"
          onClick={() => saveLastOrg(doneCode)}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary text-sm font-medium text-white"
        >
          Đăng nhập
        </Link>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const org = await registerOrganization({ name, code, adminFullName, adminEmail, adminUsername, adminPassword });
      setDoneCode(org.code);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Tên doanh nghiệp"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!codeEdited) setCode(toOrgCode(e.target.value));
        }}
        onBlur={() => verifyCode(code)}
        required
        autoComplete="organization"
        className="h-11 lg:h-10"
      />
      <Input
        label="Mã doanh nghiệp (dùng để đăng nhập)"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toLowerCase());
          setCodeEdited(true);
        }}
        onBlur={() => verifyCode(code)}
        error={codeError}
        required
        minLength={3}
        autoCapitalize="none"
        autoCorrect="off"
        className="h-11 font-mono lg:h-10"
      />
      <Input
        label="Họ và tên quản trị viên"
        value={adminFullName}
        onChange={(e) => setAdminFullName(e.target.value)}
        required
        autoComplete="name"
        className="h-11 lg:h-10"
      />
      <Input
        label="Email"
        type="email"
        inputMode="email"
        value={adminEmail}
        onChange={(e) => setAdminEmail(e.target.value)}
        required
        autoComplete="email"
        className="h-11 lg:h-10"
      />
      <Input
        label="Tên đăng nhập"
        value={adminUsername}
        onChange={(e) => setAdminUsername(e.target.value)}
        required
        minLength={3}
        autoCapitalize="none"
        autoComplete="username"
        className="h-11 lg:h-10"
      />
      <Input
        label="Mật khẩu (tối thiểu 8 ký tự)"
        type="password"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        className="h-11 lg:h-10"
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} disabled={!!codeError} className="h-11 lg:h-10">
        Tạo doanh nghiệp
      </Button>
      <p className="text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link href="/signin" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
