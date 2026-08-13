import React from 'react';
import { formatCurrency } from '@/utils';

interface QuotationSummaryProps {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number;
}

export const QuotationSummary = ({
  subtotal,
  discountPercentage,
  discountAmount,
  finalAmount,
}: QuotationSummaryProps) => {
  return (
    <div className="mt-8 flex justify-end">
      <div className="w-80 border border-gray-400 text-sm">
        <div className="grid grid-cols-2 border-b border-gray-400">
          <div className="p-2 font-bold text-gray-900 border-r border-gray-400 bg-gray-50">Tổng tiền</div>
          <div className="p-2 text-right font-bold text-gray-900">{formatCurrency(subtotal)}</div>
        </div>
        {discountPercentage > 0 && (
          <div className="grid grid-cols-2 border-b border-gray-400">
            <div className="p-2 font-bold text-gray-900 border-r border-gray-400 bg-gray-50">
              Chiết khấu ({discountPercentage}%)
            </div>
            <div className="p-2 text-right font-bold text-red-600">-{formatCurrency(discountAmount)}</div>
          </div>
        )}
        <div className="grid grid-cols-2">
          <div className="p-2 font-bold text-gray-900 border-r border-gray-400 bg-amber-100 uppercase">Thành tiền</div>
          <div className="p-2 text-right font-bold text-primary bg-amber-50">{formatCurrency(finalAmount)}</div>
        </div>
      </div>
    </div>
  );
};
