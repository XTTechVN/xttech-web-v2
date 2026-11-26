import React from 'react';
import type { LegalPolicyDocument } from '../../_constants/legal-policies.constants';

interface LegalHeroBannerProps {
  policy: LegalPolicyDocument;
}

export const LegalHeroBanner = ({ policy }: LegalHeroBannerProps) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:px-8">
        {/* Dải định danh văn bản tối giản (Minimalist Corporate Overline) */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-[#045863] uppercase">
              {policy.overline}
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-[11px] tracking-wider text-slate-500">
              {policy.standardTag}
            </span>
          </div>

          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              {policy.statusTag}
            </span>
          </div>
        </div>

        {/* Tiêu đề Văn bản Pháp lý */}
        <h1 className="mb-3 max-w-5xl text-2xl leading-[1.18] font-extrabold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          {policy.title}
        </h1>

        {/* Căn cứ Pháp lý (Statutory Preamble) */}
        <p className="mb-6 max-w-5xl text-sm leading-relaxed text-slate-600">
          {policy.preamble}
        </p>

        {/* Dải Siêu dữ liệu Pháp lý 4 Cột (4-Column Horizontal Metadata Strip) */}
        <div className="grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 bg-slate-50/50 py-3 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <div className="px-4 py-1.5 sm:first:pl-2">
            <span className="mb-0.5 block font-mono text-[10px] tracking-widest text-slate-400 uppercase">
              Số hiệu văn bản
            </span>
            <span className="font-mono text-xs font-bold tracking-tight text-slate-900">
              {policy.documentCode}
            </span>
          </div>

          <div className="px-4 py-1.5">
            <span className="mb-0.5 block font-mono text-[10px] tracking-widest text-slate-400 uppercase">
              Ngày ban hành &amp; hiệu lực
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {policy.effectiveDate}{' '}
              <span className="font-normal text-slate-500">
                · {policy.versionLabel}
              </span>
            </span>
          </div>

          <div className="px-4 py-1.5">
            <span className="mb-0.5 block font-mono text-[10px] tracking-widest text-slate-400 uppercase">
              Căn cứ pháp lý áp dụng
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {policy.legalBasisShort}
            </span>
          </div>

          <div className="px-4 py-1.5 sm:last:pr-2">
            <span className="mb-0.5 block font-mono text-[10px] tracking-widest text-slate-400 uppercase">
              Cơ quan thẩm định
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {policy.issuingAuthority}
            </span>
          </div>
        </div>

        {/* Khối Lời mở đầu & Cam kết nguyên tắc */}
        <div className="mt-6 rounded-sm border border-slate-200 bg-[#FAFAFB] p-4 sm:p-5">
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider text-[#045863] uppercase">
            <span className="inline-block h-3 w-1 bg-[#045863]" />
            <span>Lời mở đầu &amp; Cam kết nguyên tắc thực thi</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
            {policy.principleBox}
          </p>
        </div>
      </div>
    </header>
  );
};
