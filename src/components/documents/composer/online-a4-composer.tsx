'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Chip, Select } from '@/components-remake';
import { RichTextEditor } from '@/components/rich-text-editor/rich-text-editor';
import {
  ADMINISTRATIVE_TEMPLATES,
  DOC_TYPE_HEADING_MAP,
  buildAdministrativeA4Html,
  getTemplateByDocType,
  type AdministrativeDocumentTemplate,
} from '@/config/document-templates';

interface OnlineA4ComposerProps {
  title: string;
  code?: string | null;
  documentType: string;
  summary?: string;
  bodyHtml: string;
  creatorName?: string | null;
  approverName?: string | null;
  error?: string | null;
  onChangeBody: (html: string) => void;
}

export const OnlineA4Composer: React.FC<OnlineA4ComposerProps> = ({
  title,
  code,
  documentType,
  summary,
  bodyHtml,
  creatorName,
  approverName,
  error,
  onChangeBody,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'edit' | 'preview'>('edit');
  const [selectedTplId, setSelectedTplId] = useState<string>(
    () => getTemplateByDocType(documentType).id,
  );
  const [prevDocType, setPrevDocType] = useState<string>(documentType);

  if (prevDocType !== documentType) {
    setPrevDocType(documentType);
    setSelectedTplId(getTemplateByDocType(documentType).id);
  }

  const now = dayjs();
  const typeHeading = DOC_TYPE_HEADING_MAP[documentType] || 'VĂN BẢN ĐỊNH CHẾ';
  const docCode = code?.trim() || '....../2026/VB-XTTECH';

  const previewHtml = useMemo(
    () =>
      buildAdministrativeA4Html({
        title: title || 'TIÊU ĐỀ VĂN BẢN DỰ THẢO',
        code,
        documentType,
        summary,
        bodyHtml: bodyHtml || '<p><em>(Chưa có nội dung chi tiết)</em></p>',
        creatorName,
        approverName,
      }),
    [title, code, documentType, summary, bodyHtml, creatorName, approverName],
  );

  const handleApplyTemplate = (tpl: AdministrativeDocumentTemplate) => {
    setSelectedTplId(tpl.id);
    onChangeBody(tpl.defaultBodyHtml);
    setActiveSubTab('edit');
  };

  const paperHeaderSlot = (
    <div className="font-sans text-slate-900 select-none pb-4 mb-4 border-b border-dashed border-slate-200">
      <div className="grid grid-cols-12 gap-2 text-center items-start">
        <div className="col-span-5">
          <p className="font-bold text-sm uppercase tracking-tight">CÔNG TY CỔ PHẦN XTTECH</p>
          <div className="w-20 border-b border-slate-800 mx-auto my-1" />
          <p className="text-sm text-slate-700">Số: {docCode}</p>
        </div>
        <div className="col-span-7">
          <p className="font-bold text-sm uppercase tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="font-bold text-sm">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-28 border-b border-slate-800 mx-auto my-1" />
          <p className="italic text-sm text-slate-700">
            Hà Nội, ngày {now.format('DD')} tháng {now.format('MM')} năm {now.format('YYYY')}
          </p>
        </div>
      </div>

      <div className="text-center mt-5">
        <h3 className="font-bold text-lg uppercase tracking-wide text-slate-900">{typeHeading}</h3>
        <p className="font-bold text-base text-slate-900 mt-0.5">
          {title?.trim() || '(Nhập tiêu đề văn bản ở ô phía trên)'}
        </p>
        {summary?.trim() && <p className="italic text-sm text-slate-600 mt-0.5">({summary.trim()})</p>}
      </div>
    </div>
  );

  const paperFooterSlot = (
    <div className="font-sans text-slate-900 select-none pt-5 mt-6 border-t border-dashed border-slate-200 grid grid-cols-12 gap-3 text-sm">
      <div className="col-span-6 space-y-0.5 text-slate-700">
        <p className="font-bold italic underline text-slate-900">Nơi nhận:</p>
        <p>- Ban Giám đốc (để báo cáo);</p>
        <p>- Các Phòng ban / Bộ phận liên quan;</p>
        <p>- Lưu: VT, HCNS{creatorName ? ` (${creatorName})` : ''}.</p>
      </div>
      <div className="col-span-6 text-center">
        <p className="font-bold uppercase text-sm text-slate-900">ĐẠI DIỆN BAN GIÁM ĐỐC / PHÊ DUYỆT</p>
        <p className="italic text-xs text-slate-600">(Ký, ghi rõ họ tên và đóng dấu)</p>
        <p className="font-bold text-sm text-slate-900 mt-10">{approverName || ''}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-end">
        <div className="min-w-0 xl:flex-1">
          <Select
            label="Nạp mẫu chuẩn"
            value={selectedTplId}
            options={ADMINISTRATIVE_TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
            onChange={(id) => {
              const tpl = ADMINISTRATIVE_TEMPLATES.find((t) => t.id === id);
              if (tpl) handleApplyTemplate(tpl);
            }}
          />
        </div>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 xl:w-72 xl:flex-none">
          <Chip selected={activeSubTab === 'edit'} onClick={() => setActiveSubTab('edit')}>
            Soạn
          </Chip>
          <Chip selected={activeSubTab === 'preview'} onClick={() => setActiveSubTab('preview')}>
            Xem bản in
          </Chip>
        </div>
      </div>

      {activeSubTab === 'edit' ? (
        <RichTextEditor
          value={bodyHtml}
          onChange={onChangeBody}
          placeholder="Nhập nội dung các Chương, Điều, Khoản tại đây..."
          paperMode
          showStatusBar={false}
          headerSlot={paperHeaderSlot}
          footerSlot={paperFooterSlot}
        />
      ) : (
        <div className="bg-slate-200/80 p-3 sm:p-5 rounded-xl border border-slate-300/80 max-h-[70dvh] overflow-y-auto">
          <div className="w-full max-w-[720px] h-fit mx-auto bg-white shadow-md rounded-sm overflow-hidden">
            <iframe
              title="Xem trước văn bản hành chính A4"
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
              className="w-full h-[540px] border-0 bg-white"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
};
