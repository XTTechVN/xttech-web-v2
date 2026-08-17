import React from 'react';
import { QuotationHeader } from './quotation-header';
import { QuotationTitle } from './quotation-title';
import { CustomerInfo } from './customer-info';
import { QuotationTable } from './quotation-table';
import { QuotationSummary } from './quotation-summary';
import { adaptQuotationPreview } from './adapter';
import { PREVIEW_FONT_SIZE } from './config';
import type { QuotationDetail, PreviewFloor, Material, Door, ExtraOption } from '@/types';

interface QuotationPreviewProps {
  quotation: QuotationDetail;
  materialsList: Material[];
  doorsList: Door[];
  extraOptionsList: ExtraOption[];
}

export const QuotationPreview = ({ quotation, materialsList, doorsList, extraOptionsList }: QuotationPreviewProps) => {
  const adaptedFloors = adaptQuotationPreview(quotation);
  console.log('--- ADAPTED PREVIEW DATA ---', adaptedFloors);

  const subtotal = quotation.subtotalPrice ?? 0;
  const finalAmount = quotation.totalPrice ?? 0;
  const discountAmount = subtotal - finalAmount;

  return (
    <div className={`bg-white p-4 ${PREVIEW_FONT_SIZE} font-normal not-italic text-gray-900`}>
      {/* Document Header */}
      <QuotationHeader createdAt={quotation.createdAt} />

      {/* Document Title */}
      <QuotationTitle title={quotation.title} code={quotation.code} id={quotation.id} />

      {/* Customer Info */}
      <CustomerInfo customer={quotation.customer} />

      {/* Main Table */}
      <QuotationTable floors={adaptedFloors} materialsList={materialsList} doorsList={doorsList} />

      {/* Document Footer / Summary */}
      <QuotationSummary
        subtotal={subtotal}
        discountPercentage={quotation.discountPercentage}
        discountAmount={discountAmount}
        finalAmount={finalAmount}
      />
    </div>
  );
};
