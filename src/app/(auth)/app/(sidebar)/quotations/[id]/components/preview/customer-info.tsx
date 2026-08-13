import React from 'react';

interface CustomerInfoProps {
  projectId: number;
}

export const CustomerInfo = ({ projectId }: CustomerInfoProps) => {
  return (
    <div className="flex flex-col gap-2 text-sm text-gray-900 mb-6 font-medium">
      <div className="grid grid-cols-[100px_1fr_100px_1fr]">
        <span>KHÁCH HÀNG:</span>
        <span>Khách hàng dự án #{projectId}</span>
        <span>ĐIỆN THOẠI:</span>
        <span>---</span>
      </div>
      <div className="grid grid-cols-[100px_1fr]">
        <span>HIỆU LỰC:</span>
        <span className="italic font-normal">Báo giá có hiệu lực đến 30 ngày kể từ ngày tạo</span>
      </div>
    </div>
  );
};
