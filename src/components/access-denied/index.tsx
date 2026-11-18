import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

// Trang không đủ quyền: hiện thông báo rõ ràng thay vì trang trống hoặc chuyển hướng im lặng
export const AccessDenied = () => (
  <div className="flex min-h-[60dvh] items-center justify-center px-4">
    <div className="flex max-w-sm flex-col items-center gap-3 text-center">
      <ShieldAlert size={40} className="text-gray-400" aria-hidden="true" />
      <h1 className="font-lexend text-xl font-semibold text-gray-900">Bạn chưa có quyền xem trang này</h1>
      <p className="text-sm text-gray-500">Liên hệ quản trị viên của doanh nghiệp nếu bạn cần được cấp quyền.</p>
      <Link
        href="/app/dashboard"
        className="mt-2 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-white"
      >
        Về trang tổng quan
      </Link>
    </div>
  </div>
);
