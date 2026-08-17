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
    <div className="mt-4 flex justify-end">
      <div className="w-64 border border-gray-400">
        <div className="grid grid-cols-2 border-b border-gray-400">
          <div className="p-1.5 text-gray-900 border-r border-gray-400 bg-gray-50">Tổng tiền</div>
          <div className="p-1.5 text-right text-gray-900">{formatCurrency(subtotal)}</div>
        </div>
        {discountPercentage > 0 && (
          <div className="grid grid-cols-2 border-b border-gray-400">
            <div className="p-1.5 text-gray-900 border-r border-gray-400 bg-gray-50">
              Chiết khấu ({discountPercentage}%)
            </div>
            <div className="p-1.5 text-right text-red-600">-{formatCurrency(discountAmount)}</div>
          </div>
        )}
        <div className="grid grid-cols-2">
          <div className="p-1.5 text-gray-900 border-r border-gray-400 bg-primary/10">Thành tiền</div>
          <div className="p-1.5 text-right text-gray-900 bg-primary/5">{formatCurrency(finalAmount)}</div>
        </div>
      </div>
    </div>
  );
};
