import { Suspense } from 'react';
import AuthShell from '../_components/auth-shell';
import AcceptInviteForm from './_components/accept-invite-form';

const AcceptInvite = () => (
  <AuthShell title="Tham gia doanh nghiệp" subtitle="Đặt tên đăng nhập và mật khẩu để bắt đầu">
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  </AuthShell>
);

export default AcceptInvite;
