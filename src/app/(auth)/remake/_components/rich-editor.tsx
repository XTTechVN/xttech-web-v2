'use client';

import { useEffect, useRef } from 'react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  value: string;
  onChange: (html: string) => void;
  label: string;
  placeholder?: string;
  /** phần cố định phía trên / dưới nội dung (quốc hiệu, nơi nhận…), không sửa được */
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const TOOLS: [string, string, React.ComponentType<{ size?: number }>, string?][] = [
  ['bold', 'In đậm', Bold],
  ['italic', 'In nghiêng', Italic],
  ['underline', 'Gạch chân', Underline],
  ['justifyLeft', 'Căn trái', AlignLeft],
  ['justifyCenter', 'Căn giữa', AlignCenter],
  ['justifyRight', 'Căn phải', AlignRight],
  ['justifyFull', 'Căn đều', AlignJustify],
  ['insertUnorderedList', 'Danh sách gạch đầu dòng', List],
  ['insertOrderedList', 'Danh sách số', ListOrdered],
];
const BLOCKS: [string, string][] = [
  ['p', 'Văn bản thường'],
  ['h3', 'Tiêu đề'],
  ['h4', 'Tiêu đề nhỏ'],
];

// Trình soạn thảo văn bản có định dạng (contenteditable): đậm/nghiêng/gạch chân, căn lề, danh sách, kiểu đoạn.
export function RichEditor({ value, onChange, label, placeholder, header, footer }: Props) {
  const box = useRef<HTMLDivElement>(null);

  // Đồng bộ khi nội dung đổi từ bên ngoài (nạp mẫu); không đụng vào khi người dùng đang gõ
  useEffect(() => {
    const el = box.current;
    if (el && el.innerHTML !== value && document.activeElement !== el) el.innerHTML = value;
  }, [value]);

  const run = (cmd: string, arg?: string) => {
    box.current?.focus();
    document.execCommand(cmd, false, arg);
    if (box.current) onChange(box.current.innerHTML);
  };
  const keep = (e: React.MouseEvent) => e.preventDefault(); // bấm nút không làm mất vùng chọn

  return (
    <div className="overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">
      <div role="toolbar" aria-label={`Định dạng ${label}`} className="flex items-center gap-1 overflow-x-auto border-b border-rm-line p-1">
        <select
          aria-label="Kiểu đoạn"
          defaultValue="p"
          onChange={(e) => run('formatBlock', e.target.value)}
          className="h-11 flex-none rounded-rm border border-rm-line bg-rm-surface px-2 text-base md:text-sm"
        >
          {BLOCKS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {TOOLS.map(([cmd, name, Icon]) => (
          <button
            key={cmd}
            type="button"
            aria-label={name}
            title={name}
            onMouseDown={keep}
            onClick={() => run(cmd)}
            className="flex size-11 flex-none items-center justify-center rounded-rm text-rm-text active:bg-rm-line md:hover:bg-rm-bg"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
      <div className="max-h-[70dvh] overflow-y-auto bg-rm-bg p-2 md:p-4">
        <div className="mx-auto max-w-[44rem] bg-white p-4 text-[#111] shadow-sm md:p-8">
          {header}
          <div
            ref={box}
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            data-placeholder={placeholder}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            className={cn(
              'min-h-48 text-sm leading-relaxed outline-none empty:before:text-rm-muted empty:before:content-[attr(data-placeholder)] [&_h3]:my-2 [&_h3]:text-base [&_h3]:font-bold [&_h4]:my-1 [&_h4]:font-bold [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-6',
            )}
          />
          {footer}
        </div>
      </div>
    </div>
  );
}
