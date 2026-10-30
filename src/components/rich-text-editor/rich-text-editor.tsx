'use client';

import React, { useEffect, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  isReadOnly?: boolean;
  minHeightClass?: string;
}

interface ToolbarAction {
  command: string;
  title: string;
  icon: React.ReactNode;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { command: 'bold', title: 'In đậm (Ctrl+B)', icon: <Bold size={14} /> },
  { command: 'italic', title: 'In nghiêng (Ctrl+I)', icon: <Italic size={14} /> },
  { command: 'underline', title: 'Gạch chân (Ctrl+U)', icon: <Underline size={14} /> },
  { command: 'insertUnorderedList', title: 'Danh sách gạch đầu dòng', icon: <List size={14} /> },
  { command: 'insertOrderedList', title: 'Danh sách đánh số', icon: <ListOrdered size={14} /> },
];

const CONTENT_CLASS = `p-3.5 text-xs leading-[1.6] text-slate-800 focus:outline-hidden overflow-y-auto no-scrollbar
  [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-1 [&_ol]:pl-5 [&_ol]:list-decimal
  [&_li]:my-0.5 [&_strong]:font-bold [&_u]:underline [&_em]:italic
  [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1.5 [&_h4]:text-xs [&_h4]:font-bold [&_h4]:my-1`;

// Trình soạn thảo văn bản có định dạng (HTML) dùng chung, điều khiển qua value/onChange
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  isReadOnly = false,
  minHeightClass = 'min-h-48 max-h-96',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Đồng bộ nội dung từ ngoài vào vùng soạn thảo (không ghi đè khi chính người dùng đang gõ)
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) editor.innerHTML = value;
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const executeCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
      {!isReadOnly && (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 border-b border-slate-200">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.command}
              type="button"
              title={action.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand(action.command)}
              className="p-1.5 rounded hover:bg-white hover:shadow-xs text-gray-700 hover:text-primary transition-colors cursor-pointer bg-transparent border-0"
            >
              {action.icon}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            defaultValue="p"
            className="text-xs h-7 px-2 bg-white border border-slate-200 rounded text-gray-700 focus:outline-hidden focus:border-primary cursor-pointer"
          >
            <option value="p">Văn bản thường</option>
            <option value="h3">Tiêu đề lớn</option>
            <option value="h4">Tiêu đề vừa</option>
          </select>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        className={`${minHeightClass} ${CONTENT_CLASS} ${isReadOnly ? 'bg-slate-50/60' : ''}`}
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
}
