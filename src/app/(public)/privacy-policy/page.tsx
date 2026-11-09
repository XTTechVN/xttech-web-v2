import type { Metadata } from 'next';
import { LegalPageView } from '../_components';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật Dữ Liệu | XTTECH ERP',
  description:
    'Cam kết bảo mật tuyệt đối bản vẽ kỹ thuật CAD 2D/3D, định mức bóc tách vật tư (BOM), bảng báo giá, dữ liệu GPS chấm công công trình và hồ sơ khách hàng trên hệ sinh thái XTTECH.',
};

export default function PrivacyPolicyPage() {
  return <LegalPageView policyKey="privacy" />;
}
