'use client';

import { useMemo, useState } from 'react';
import { Check, Eye, FileCode2, LayoutTemplate } from 'lucide-react';
import { ADMINISTRATIVE_TEMPLATES, DOC_TYPE_HEADING_MAP, buildAdministrativeA4Html, getTemplateByDocType } from '@/config/document-templates';
import { cn } from '@/utils/cn';
import { RichEditor } from '../../_components/rich-editor';
import { Sheet } from '../../_components/sheet';

interface Props {
  title: string;
  code?: string | null;
  documentType: string;
  summary: string;
  bodyHtml: string;
  creatorName?: string | null;
  approverName?: string | null;
  error?: string | null;
  onChangeBody: (html: string) => void;
}

// Soạn văn bản hành chính trên khổ A4: nạp mẫu chuẩn, soạn nội dung, xem bản in.
export function A4Composer({ title, code, documentType, summary, bodyHtml, creatorName, approverName, error, onChangeBody }: Props) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [picking, setPicking] = useState(false);
  const [tpl, setTpl] = useState(() => getTemplateByDocType(documentType).id);
  const [seenType, setSeenType] = useState(documentType);
  if (seenType !== documentType) {
    setSeenType(documentType);
    setTpl(getTemplateByDocType(documentType).id);
  }
  const [year] = useState(() => new Date().getFullYear());
  const [today] = useState(() => new Date());
  const heading = DOC_TYPE_HEADING_MAP[documentType] || 'VĂN BẢN ĐỊNH CHẾ';
  const no = code || `......./${year}/VB-XTTECH`;
  const preview = useMemo(
    () =>
      buildAdministrativeA4Html({
        title: title.trim() || '(Chưa nhập tiêu đề)',
        code,
        documentType,
        summary,
        bodyHtml: bodyHtml || '<p><em>(Chưa có nội dung)</em></p>',
        creatorName,
        approverName,
      }),
    [title, code, documentType, summary, bodyHtml, creatorName, approverName],
  );

  const header = (
    <div className="mb-3 select-none border-b border-dashed border-rm-line pb-3 text-center text-[#111]">
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 text-xs">
        <div>
          <p className="font-bold uppercase">Công ty cổ phần XTTECH</p>
          <p className="mt-1">Số: {no}</p>
        </div>
        <div>
          <p className="font-bold uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
          <p className="font-bold">Độc lập - Tự do - Hạnh phúc</p>
          <p className="mt-1 italic">
            Ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
          </p>
        </div>
      </div>
      <h3 className="mt-4 text-base font-bold uppercase">{heading}</h3>
      <p className="font-bold [overflow-wrap:anywhere]">{title.trim() || '(Nhập tiêu đề ở ô phía trên)'}</p>
      {summary.trim() && <p className="text-xs italic [overflow-wrap:anywhere]">({summary.trim()})</p>}
    </div>
  );
  const footer = (
    <div className="mt-4 grid select-none grid-cols-[repeat(2,minmax(0,1fr))] gap-3 border-t border-dashed border-rm-line pt-3 text-xs text-[#111]">
      <div>
        <p className="font-bold italic underline">Nơi nhận:</p>
        <p>- Ban Giám đốc (để báo cáo);</p>
        <p>- Các phòng ban liên quan;</p>
        <p>- Lưu: VT{creatorName ? ` (${creatorName})` : ''}.</p>
      </div>
      <div className="text-center">
        <p className="font-bold uppercase">Phê duyệt</p>
        <p className="italic">(Ký, ghi rõ họ tên)</p>
        <p className="mt-8 font-bold">{approverName ?? ''}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 border-b border-rm-line">
        <div role="tablist" aria-label="Chế độ xem" className="flex min-w-0 flex-1 gap-5">
          {(
            [
              ['edit', FileCode2, 'Soạn trên trang A4'],
              ['preview', Eye, 'Xem bản in'],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={tab === v}
              onClick={() => setTab(v)}
              className={cn(
                'flex h-rm-tap items-center gap-2 border-b-2 text-sm font-medium',
                tab === v ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
              )}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="min-w-0 truncate">{label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex h-9 flex-none items-center gap-2 rounded-rm px-2 text-sm font-medium text-rm-primary active:bg-rm-primary-soft md:hover:bg-rm-primary-soft"
        >
          <LayoutTemplate size={16} aria-hidden="true" />
          Mẫu
        </button>
      </div>
      {tab === 'edit' ? (
        <RichEditor
          label="Nội dung văn bản"
          value={bodyHtml}
          onChange={onChangeBody}
          placeholder="Nhập các chương, điều, khoản tại đây"
          header={header}
          footer={footer}
        />
      ) : (
        <div className="overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-bg p-2 md:p-4">
          <iframe
            title="Bản in văn bản A4"
            srcDoc={preview}
            sandbox="allow-same-origin"
            className="mx-auto h-[60dvh] w-full max-w-[44rem] border-0 bg-white"
          />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-rm-danger">
          {error}
        </p>
      )}
      <Sheet open={picking} onClose={() => setPicking(false)} title="Chọn mẫu văn bản">
        <ul className="divide-y divide-rm-line px-rm-gutter pb-2">
          {ADMINISTRATIVE_TEMPLATES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={tpl === t.id}
                onClick={() => {
                  setTpl(t.id);
                  onChangeBody(t.defaultBodyHtml);
                  setTab('edit');
                  setPicking(false);
                }}
                className="flex min-h-rm-row w-full items-center gap-3 py-3 text-left active:bg-rm-bg"
              >
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-sm', tpl === t.id ? 'font-semibold text-rm-primary' : 'font-medium')}>{t.label}</span>
                  <span className="mt-0.5 block text-xs text-rm-muted">{t.description}</span>
                </span>
                {tpl === t.id && <Check size={18} className="flex-none text-rm-primary" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
        <p className="px-rm-gutter pb-rm-gutter text-xs text-rm-muted">Chọn mẫu sẽ thay nội dung đang soạn bằng mẫu đó.</p>
      </Sheet>
    </div>
  );
}
