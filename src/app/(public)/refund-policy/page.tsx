import type { Metadata } from 'next';
import { LegalPageView } from '../_components';

export const metadata: Metadata = {
  title: 'Chính Sách Hoàn Tiền & Bảo Hành Dịch Vụ | XTTECH ERP',
  description:
    'Chính sách dùng thử miễn phí trọn đời, cam kết hoàn tiền 100% trong 7 ngày đầu, quy tắc hoàn phí theo tỷ lệ (Pro-rata) cho gói năm và bảo hành đào tạo tận xưởng của XTTECH.',
};

export default function RefundPolicyPage() {
  return <LegalPageView policyKey="refund" />;
}
