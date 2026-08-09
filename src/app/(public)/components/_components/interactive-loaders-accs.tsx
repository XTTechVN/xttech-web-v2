'use client';

import React from 'react';
import { Skeleton, Accordion } from '@/components';

export function InteractiveLoadersAccs() {
  const faqItems = [
    {
      id: 'faq-1',
      title: 'Làm thế nào để kết nối API hệ thống?',
      content: 'Bạn chỉ cần khởi tạo khóa API Key trong cấu hình tài khoản cá nhân, sau đó truyền vào header Authorization: Bearer <API_KEY> khi thực hiện cuộc gọi API.',
    },
    {
      id: 'faq-2',
      title: 'XTTech có hỗ trợ xuất báo cáo định dạng nào?',
      content: 'Hệ thống hiện tại hỗ trợ xuất toàn bộ dữ liệu ra định dạng Excel (.xlsx), PDF báo cáo đẹp mắt, hoặc JSON thô cho nhà phát triển.',
    },
    {
      id: 'faq-3',
      title: 'Quy trình phê duyệt tài khoản diễn ra trong bao lâu?',
      content: 'Thông thường, đội ngũ quản trị viên sẽ phê duyệt tài khoản mới đăng ký trong vòng 10 đến 15 phút giờ làm việc hành chính.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Skeleton section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">1. Skeleton (Khung tải giả lập)</h3>
        <div className="space-y-4 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
          {/* Card Mock Loading */}
          <div className="flex items-center gap-3 p-4 border border-gray-150 rounded-lg bg-white shadow-xs max-w-sm">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>

          {/* Lines Loading */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>

      {/* Accordion section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">2. Accordion (Nội dung xếp gọn)</h3>
        <Accordion items={faqItems} />
      </div>
    </div>
  );
}
