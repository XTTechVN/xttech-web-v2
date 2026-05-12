'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Back() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2 text-sm cursor-pointer"
    >
      <ArrowLeft size={16} />
      Quay lại trang trước
    </button>
  );
}
