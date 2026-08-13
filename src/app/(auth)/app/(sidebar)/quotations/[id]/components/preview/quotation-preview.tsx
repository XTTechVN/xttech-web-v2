'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '@/actions/material';
import { getDoors } from '@/actions/door';
import { QuotationHeader } from './quotation-header';
import { QuotationTitle } from './quotation-title';
import { CustomerInfo } from './customer-info';
import { QuotationTable } from './quotation-table';
import { QuotationSummary } from './quotation-summary';
import type { QuotationDetail, PreviewFloor } from '@/types';

interface QuotationPreviewProps {
  quotation: QuotationDetail;
  floors: PreviewFloor[];
}

export const QuotationPreview = ({ quotation, floors }: QuotationPreviewProps) => {
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: () => getMaterials({ limit: 100 }),
  });

  const { data: doorsData } = useQuery({
    queryKey: ['doors'],
    queryFn: () => getDoors({ limit: 100 }),
  });

  const materialsList = materialsData?.items || [];
  const doorsList = doorsData?.items || [];

  // Tính toán lại tổng tiền dựa trên local state floors
  const calculatedSubtotal = floors.reduce((acc, floor) => {
    return acc + (floor.totalAmount || 0);
  }, 0);
  
  const discountAmount = calculatedSubtotal * (quotation.discountPercentage / 100);
  const calculatedFinalAmount = calculatedSubtotal - discountAmount;

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0">
      {/* Document Area */}
      <div className="bg-gray-200 rounded-xl p-4 md:p-8 overflow-y-auto flex-1 border border-gray-300 shadow-inner min-h-[800px]">
        <div className="bg-white max-w-5xl mx-auto shadow-md rounded border border-gray-300 p-8 md:p-12 min-h-full">
          {/* Document Header */}
          <QuotationHeader createdAt={quotation.createdAt} />

          {/* Document Title */}
          <QuotationTitle title={quotation.title} code={quotation.code} id={quotation.id} />

          {/* Customer Info */}
          <CustomerInfo projectId={quotation.projectId} />

          {/* Main Table */}
          <QuotationTable floors={floors} materialsList={materialsList} doorsList={doorsList} />

          {/* Document Footer / Summary */}
          <QuotationSummary
            subtotal={calculatedSubtotal}
            discountPercentage={quotation.discountPercentage}
            discountAmount={discountAmount}
            finalAmount={calculatedFinalAmount}
          />
        </div>
      </div>
    </div>
  );
};
