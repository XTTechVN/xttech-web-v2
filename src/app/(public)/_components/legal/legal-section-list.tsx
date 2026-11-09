import React from 'react';
import {
  LEGAL_SUPPORT_INFO,
  type LegalPolicyDocument,
} from '../../_constants/legal-policies.constants';

interface LegalSectionListProps {
  policy: LegalPolicyDocument;
  onPrintDocument: () => void;
}

export const LegalSectionList = ({
  policy,
  onPrintDocument,
}: LegalSectionListProps) => {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Thân văn bản theo lưới Swiss Editorial 12 Cột (4 cột tiêu đề trái : 8 cột nội dung phải) */}
      <div className="divide-y divide-slate-200">
        {policy.sections.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="grid scroll-mt-20 grid-cols-1 items-start gap-6 py-9 lg:grid-cols-12 lg:gap-10"
          >
            {/* Cột trái (4 cột): Mã điều khoản, Tiêu đề điều & Tóm tắt nguyên tắc */}
            <div className="space-y-2 lg:sticky lg:top-24 lg:col-span-4">
              <div className="font-mono text-xs font-bold tracking-widest text-[#045863] uppercase">
                {section.articleCode}
              </div>
              <h2 className="text-lg leading-snug font-bold tracking-tight text-slate-950 sm:text-xl">
                {section.title}
              </h2>
              <p className="pt-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                {section.principleSummary}
              </p>
            </div>

            {/* Cột phải (8 cột): Nội dung các Khoản, Bảng thông số đơn sắc & Cam kết */}
            <div className="space-y-6 text-sm leading-relaxed text-slate-700 lg:col-span-8">
              {section.clauses.map((clause, cIdx) => (
                <div key={cIdx} className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 sm:text-[15px]">
                    {clause.heading}
                  </h3>

                  {clause.paragraphs.map((paragraph, pIdx) => (
                    <p key={pIdx} className="leading-relaxed text-slate-700">
                      {paragraph}
                    </p>
                  ))}

                  {clause.bullets && clause.bullets.length > 0 && (
                    <ul className="list-disc space-y-1.5 pl-5 text-slate-700">
                      {clause.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>
                          {bullet.lead && (
                            <strong className="font-semibold text-slate-900">
                              {bullet.lead}{' '}
                            </strong>
                          )}
                          <span>{bullet.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Bảng Tiêu chuẩn / Ma trận Đối soát Đơn sắc (Clean Monochrome Table) */}
              {section.table && (
                <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-100/80 px-4 py-2.5 text-[11px]">
                    <span className="font-mono font-bold tracking-wider text-slate-800 uppercase">
                      {section.table.title}
                    </span>
                    <span className="font-mono text-slate-500">
                      {section.table.standardRef}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-white font-semibold text-slate-900">
                          <th className="w-1/4 px-4 py-2.5">
                            {section.table.headers[0]}
                          </th>
                          <th className="w-1/2 px-4 py-2.5">
                            {section.table.headers[1]}
                          </th>
                          <th className="w-1/4 px-4 py-2.5 text-right font-mono">
                            {section.table.headers[2]}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white text-slate-600">
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/70">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {row[0]}
                            </td>
                            <td className="px-4 py-3 leading-relaxed">
                              {row[1]}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                              {row[2]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hộp Ghi chú Cam kết thực thi (Subtle Left-border Callout) */}
              {section.commitmentNote && (
                <div className="border-l-2 border-[#045863] bg-white p-4 text-xs leading-relaxed text-slate-700 shadow-2xs sm:text-sm">
                  <span className="mb-0.5 block font-bold text-slate-900">
                    {section.commitmentNote.label}
                  </span>
                  <span>{section.commitmentNote.content}</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Khối Xác thực Văn bản Điện tử & Thông tin Liên hệ Pháp chế cuối trang */}
      <section className="mt-8 border-t-2 border-slate-900 pt-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#045863]" />
              <span className="font-mono text-xs font-bold tracking-widest text-slate-950 uppercase">
                Xác thực hiệu lực văn bản điện tử &amp; Liên hệ Pháp chế
              </span>
            </div>

            <p className="max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Văn bản này được ban hành chính thức dưới định dạng thông điệp dữ
              liệu điện tử theo quy định của Luật Giao dịch điện tử số
              20/2023/QH15, Nghị định số 23/2025/NĐ-CP và có giá trị thực thi
              thống nhất trên toàn hệ thống phần mềm XTTECH ERP.
            </p>

            <div className="grid grid-cols-1 gap-3 rounded-sm border border-slate-200 bg-white p-4 font-mono text-xs text-slate-700 sm:grid-cols-2">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">
                  Đơn vị chủ quản &amp; vận hành:
                </span>
                <span className="font-bold text-slate-900">
                  {LEGAL_SUPPORT_INFO.companyName}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">
                  Cơ quan tiếp nhận đối soát:
                </span>
                <span className="font-bold text-slate-900">
                  {LEGAL_SUPPORT_INFO.legalDepartment}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">
                  Hòm thư Pháp chế &amp; Hỗ trợ:
                </span>
                <a
                  href={LEGAL_SUPPORT_INFO.emailHref}
                  className="font-semibold text-[#045863] hover:underline"
                >
                  {LEGAL_SUPPORT_INFO.emailDisplay}
                </a>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">
                  Hotline trực tuyến ({LEGAL_SUPPORT_INFO.workingHours}):
                </span>
                <a
                  href={LEGAL_SUPPORT_INFO.hotlineHref}
                  className="font-semibold text-[#045863] hover:underline"
                >
                  {LEGAL_SUPPORT_INFO.hotlineDisplay}
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end space-y-2.5 lg:col-span-4 lg:pt-6">
            <a
              href={LEGAL_SUPPORT_INFO.zaloHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded bg-[#045863] px-4 py-2.5 text-center text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#03454E]"
            >
              Liên hệ Ban Pháp chế &amp; Đối soát
            </a>
            <button
              type="button"
              onClick={onPrintDocument}
              className="flex w-full cursor-pointer items-center justify-center rounded border border-slate-300 bg-white px-4 py-2.5 text-center text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
            >
              In văn bản / Lưu bản PDF (.PDF)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
