'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal } from '@/components';
import { useQuotationStore } from '@/stores';
import { DEFAULT_TERMS_AND_CONDITIONS } from './config';

export const QuotationTermsEditor: React.FC = () => {
  const store = useQuotationStore();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Đồng bộ nội dung từ store vào contentEditable khi mount hoặc store thay đổi từ ngoài
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== store.termsAndConditions) {
      editorRef.current.innerHTML = store.termsAndConditions || '';
    }
  }, [store.termsAndConditions]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      store.setTermsAndConditions(html);
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const handleConfirmReset = () => {
    store.setTermsAndConditions(DEFAULT_TERMS_AND_CONDITIONS);
    if (editorRef.current) {
      editorRef.current.innerHTML = DEFAULT_TERMS_AND_CONDITIONS;
    }
    setIsResetModalOpen(false);
    toast.success('Đã khôi phục nội dung ghi chú về mặc định!');
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Heading giống "Cấu trúc các tầng" */}
        <div className="flex justify-between items-center pb-1.5">
          <h3 className="text-base font-bold text-primary">Ghi chú & Điều khoản</h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            onClick={() => setIsResetModalOpen(true)}
            className="h-7 text-xs px-2.5 hover:bg-slate-50 border-slate-200"
          >
            Đặt lại
          </Button>
        </div>

        {/* Vùng soạn thảo - luôn mở */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
          {/* Thanh công cụ định dạng */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 border-b border-slate-200">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded hover:bg-white hover:shadow-xs text-gray-700 hover:text-primary transition-colors cursor-pointer"
              title="In đậm (Ctrl+B)"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded hover:bg-white hover:shadow-xs text-gray-700 hover:text-primary transition-colors cursor-pointer"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-1.5 rounded hover:bg-white hover:shadow-xs text-gray-700 hover:text-primary transition-colors cursor-pointer"
              title="Gạch chân (Ctrl+U)"
            >
              <Underline size={14} />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 rounded hover:bg-white hover:shadow-xs text-gray-700 hover:text-primary transition-colors cursor-pointer"
              title="Danh sách gạch đầu dòng"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 rounded hover:bg-white hover:shadow-xs text-gray-700 hover:text-primary transition-colors cursor-pointer"
              title="Danh sách đánh số"
            >
              <ListOrdered size={14} />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            <select
              onChange={(e) => executeCommand('formatBlock', e.target.value)}
              className="text-xs h-7 px-2 bg-white border border-slate-200 rounded text-gray-700 focus:outline-hidden focus:border-primary cursor-pointer"
              defaultValue="p"
            >
              <option value="p">Văn bản thường</option>
              <option value="h3">Tiêu đề lớn (H3)</option>
              <option value="h4">Tiêu đề vừa (H4)</option>
              <option value="blockquote">Trích dẫn</option>
            </select>
          </div>

          {/* ContentEditable soạn thảo trực tiếp */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="min-h-48 max-h-96 overflow-y-auto p-3.5 text-xs leading-[1.6] text-slate-800 focus:outline-hidden
              [&_p]:my-1 [&_p]:text-slate-800
              [&_ul]:my-1 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-0.5
              [&_ol]:my-1 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-0.5
              [&_li]:my-0.5 [&_li]:text-slate-700
              [&_strong]:font-bold [&_strong]:text-slate-900
              [&_u]:underline [&_em]:italic [&_em]:text-slate-600
              [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1.5 [&_h3]:text-slate-900
              [&_h4]:text-xs [&_h4]:font-bold [&_h4]:my-1 [&_h4]:text-slate-900
              [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_blockquote]:my-1"
            style={{ wordBreak: 'break-word' }}
          />
        </div>
      </div>

      {/* Modal xác nhận đặt lại */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Đặt lại nội dung ghi chú"
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmReset}
              className="text-xs"
            >
              Đặt lại
            </Button>
          </div>
        }
      >
        <div className="py-2 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertCircle size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-slate-900">
              Đặt lại về nội dung mặc định?
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toàn bộ nội dung ghi chú đang chỉnh sửa sẽ được thay thế bằng nội dung báo giá gốc mặc định.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
