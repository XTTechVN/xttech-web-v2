import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Label Dữ liệu AI | Vifence',
  description: 'Quản lý và đánh nhãn ảnh phục vụ huấn luyện mô hình AI',
};

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
