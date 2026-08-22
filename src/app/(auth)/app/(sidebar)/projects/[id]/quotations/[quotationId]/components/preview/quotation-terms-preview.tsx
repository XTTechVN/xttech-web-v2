'use client';

import React from 'react';
import { useQuotationStore } from '@/stores';
import { DEFAULT_TERMS_AND_CONDITIONS } from '../editor/config';

interface QuotationTermsPreviewProps {
  content?: string | null;
}

export const QuotationTermsPreview: React.FC<QuotationTermsPreviewProps> = ({ content }) => {
  const storeTerms = useQuotationStore((state) => state.termsAndConditions);
  
  // Ưu tiên nội dung realtime từ store hoặc từ props quotation, fallback về DEFAULT_TERMS
  const displayHtml = storeTerms || content || DEFAULT_TERMS_AND_CONDITIONS;

  if (!displayHtml) return null;

  return (
    <div className="w-full text-left text-[11px] leading-[1.65] text-slate-800 border-t-2 border-slate-200 pt-3 mt-4">
      {/* Tiêu đề mục điều khoản */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1 h-3.5 bg-[#045863] rounded-xs" />
        <h4 className="text-[11px] font-bold text-[#045863] uppercase tracking-wider">
          Chú ý
        </h4>
      </div>

      {/* Vùng nội dung HTML được format trang trọng */}
      <div
        className="prose prose-xs max-w-none text-slate-800 
          [&_p]:my-1 [&_p]:text-slate-800
          [&_ul]:my-1 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-0.5
          [&_ol]:my-1 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-0.5
          [&_li]:my-0.5 [&_li]:text-slate-700
          [&_strong]:font-bold [&_strong]:text-slate-900
          [&_u]:underline [&_em]:italic [&_em]:text-slate-600"
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
    </div>
  );
};
