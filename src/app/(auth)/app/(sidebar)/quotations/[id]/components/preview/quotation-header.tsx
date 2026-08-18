import React from 'react';

interface QuotationHeaderProps {
  createdAt: string;
}

export const QuotationHeader = ({ createdAt }: QuotationHeaderProps) => {
  return (
    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-2 mb-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="uppercase font-normal">CÔNG TY CỔ PHẦN CÔNG NGHỆ XTTECH</h1>
        <p className="text-gray-600">Trụ sở: Kiến An, Hải Phòng, Việt Nam</p>
        <p className="text-gray-600">Điện thoại: 0862613122 / MST: 031205001877</p>
        <p className="text-gray-600">Email: contact@xttech.vn | Website: xttech.vn</p>
      </div>
      <div className="text-right">
        <p className="text-gray-600 mt-[44px]">
          Hải Phòng, ngày {new Date(createdAt).toLocaleDateString('vi-VN')}
        </p>
      </div>
    </div>
  );
};
