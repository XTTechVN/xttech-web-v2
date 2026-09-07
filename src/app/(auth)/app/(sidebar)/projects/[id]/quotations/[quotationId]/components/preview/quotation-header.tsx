import React from 'react';

interface QuotationHeaderProps {
  createdAt: string;
}

export const QuotationHeader = ({ createdAt }: QuotationHeaderProps) => {
  return (
    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-2 mb-4">
      <div className="flex flex-col gap-0.5 text-gray-900 font-medium text-[11px] leading-relaxed flex-1 pr-4">
        <h1 className="uppercase font-bold text-xs text-gray-950">
          CÔNG TY TNHH THƯƠNG MẠI VÀ XÂY DỰNG CƠ SỞ HẠ TẦNG XUÂN TIỆP
        </h1>
        <p>Trụ sở: TDP Quý Kim 2, (tại nhà ông Bùi Đức Tiệp), phường Nam Đồ Sơn, Hải Phòng.</p>
        <p>Nhà máy sx: Số 507 TDP Nghĩa Sơn, phường Nam Đồ Sơn, Hải Phòng.</p>
        <p>Tài khoản NH số: 119000090101, tại Ngân hàng TMCP Công Thương Việt Nam - CN Đông Hải Phòng.</p>
        <div className="grid grid-cols-[60%_40%] w-full">
          <div>ĐT: 0569 669 669/ 0904 816 489/ 0934 389 468</div>
          <div>MST: 0201263785</div>
        </div>
        <div className="grid grid-cols-[60%_40%] w-full">
          <div>Email: Nhomkinhxuantiep@gmail.com</div>
          <div>Website: xuantiepwindow.com</div>
        </div>
      </div>
      <div className="text-right shrink-0 self-end">
        <p className="text-gray-950 font-semibold text-[11px] whitespace-nowrap">
          Hải Phòng, ngày {new Date(createdAt).toLocaleDateString('vi-VN')}
        </p>
      </div>
    </div>
  );
};
