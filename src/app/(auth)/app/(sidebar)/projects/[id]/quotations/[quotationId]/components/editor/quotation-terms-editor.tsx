'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  RotateCcw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal } from '@/components';
import { useQuotationStore } from '@/stores';
import { DEFAULT_TERMS_AND_CONDITIONS } from './config';

export const QuotationTermsEditor: React.FC = () => {
  const store = useQuotationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Đồng bộ nội dung từ store vào contentEditable khi mount hoặc store thay đổi từ ngoài
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== store.termsAndConditions) {
      editorRef.current.innerHTML = store.termsAndConditions || '';
    }
  }, [store.termsAndConditions, isOpen]);

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

  const handleOpenResetModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = () => {
    store.setTermsAndConditions(DEFAULT_TERMS_AND_CONDITIONS);
    if (editorRef.current) {
      editorRef.current.innerHTML = DEFAULT_TERMS_AND_CONDITIONS;
    }
    setIsResetModalOpen(false);
    toast.success('Đã khôi phục nội dung điều khoản mẫu chuẩn!');
  };

  return (
    <>
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs transition-all duration-200">
        {/* Header Accordion: Đóng mở gọn gàng */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer select-none transition-colors border-b border-transparent data-[open=true]:border-slate-200"
          data-open={isOpen}
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown size={16} className="text-primary transition-transform duration-200" />
            ) : (
              <ChevronRight size={16} className="text-gray-400 transition-transform duration-200" />
            )}
            <FileText size={15} className="text-primary" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Lưu ý
            </span>
            <span className="text-[10px] text-gray-400 font-normal ml-1">
              (Hiển thị góc dưới bên trái báo giá)
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleOpenResetModal}
              title="Khôi phục lại nội dung mẫu chuẩn ban đầu"
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Mẫu chuẩn
            </button>
          </div>
        </div>

        {/* Body: Bộ soạn thảo Rich Text */}
        {isOpen && (
          <div className="p-3 flex flex-col gap-2 bg-white">
            {/* Thanh công cụ định dạng Rich Text */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 rounded border border-slate-200">
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

              {/* Chọn kích thước Heading/Paragraph */}
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

            {/* Vùng ContentEditable soạn thảo trực tiếp */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onBlur={handleInput}
              className="min-h-48 max-h-96 overflow-y-auto p-3.5 text-xs leading-[1.6] text-slate-800 border border-slate-200 rounded-md focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white
                [&_p]:my-1 [&_p]:text-slate-800
                [&_ul]:my-1 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-0.5
                [&_ol]:my-1 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-0.5
                [&_li]:my-0.5 [&_li]:text-slate-700
                [&_strong]:font-bold [&_strong]:text-slate-900
                [&_u]:underline [&_em]:italic [&_em]:text-slate-600
                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1.5 [&_h3]:text-slate-900
                [&_h4]:text-xs [&_h4]:font-bold [&_h4]:my-1 [&_h4]:text-slate-900
                [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_blockquote]:my-1"
              style={{
                wordBreak: 'break-word',
              }}
            />
          </div>
        )}
      </div>

      {/* Modal Xác nhận Khôi phục Mẫu chuẩn */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Khôi phục mẫu điều khoản chuẩn"
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
              Khôi phục mẫu chuẩn
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
              Đặt lại nội dung về mẫu điều khoản mặc định?
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toàn bộ nội dung điều khoản đang chỉnh sửa hiện tại sẽ được thay thế bằng mẫu chuẩn ban đầu (phương thức thanh toán 3 đợt, bảo hành 5 năm, phụ phí kính...).
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
