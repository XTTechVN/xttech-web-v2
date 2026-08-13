import React from 'react';

interface QuotationTitleProps {
  title: string;
  code?: string | null;
  id?: number;
}

export const QuotationTitle = ({ title, code, id }: QuotationTitleProps) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        BẢNG BÁO GIÁ HẠNG MỤC: {title.toUpperCase()}
      </h2>
      <p className="text-sm font-medium text-gray-600">
        Số: {code || `BG-${id}`}/XTTECH
      </p>
    </div>
  );
};
