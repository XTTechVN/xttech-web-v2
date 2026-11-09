import type { Metadata } from 'next';
import { LegalPageView } from '../_components';

export const metadata: Metadata = {
  title: 'Điều Khoản Dịch Vụ | XTTECH ERP',
  description:
    'Quy định sử dụng nền tảng quản trị XMS Fab, XMS Build, XMS Biz, cơ chế hạn mức gói cước, quyền sở hữu dữ liệu và cam kết chất lượng dịch vụ SLA 99.9% của XTTECH.',
};

export default function TermsOfServicePage() {
  return <LegalPageView policyKey="terms" />;
}
