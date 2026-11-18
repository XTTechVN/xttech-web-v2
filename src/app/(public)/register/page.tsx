import AuthShell from '../_components/auth-shell';
import RegisterForm from './_components/register-form';

const Register = () => (
  <AuthShell title="Đăng ký doanh nghiệp" subtitle="Tạo không gian làm việc riêng cho doanh nghiệp của bạn">
    <RegisterForm />
  </AuthShell>
);

export default Register;
