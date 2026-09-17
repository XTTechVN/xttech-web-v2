import { PageLoader } from '@/components';

export default function Loading() {
  return (
    <PageLoader
      isVisible={true}
      title="Đang tải dữ liệu"
      subtitle="Vui lòng chờ trong giây lát..."
    />
  );
}
