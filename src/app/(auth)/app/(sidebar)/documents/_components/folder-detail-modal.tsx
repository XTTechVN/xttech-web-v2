'use client';

import React from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { Eye, Copy } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import toast from 'react-hot-toast';

interface FolderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: DocumentCategory | null;
  locationName?: string;
}

export const FolderDetailModal: React.FC<FolderDetailModalProps> = ({
  isOpen,
  onClose,
  folder,
}) => {
  if (!folder) return null;

  const handleCopyCode = () => {
    if (!folder.code) return;
    navigator.clipboard.writeText(folder.code);
    toast.success(`Đã sao chép mã: ${folder.code}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Eye className="text-primary" size={18} />
          <span>Chi tiết thư mục</span>
        </div>
      }
      className="m-2 max-w-md w-full"
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Mã thư mục */}
        <div className="relative">
          <Input
            label="Mã thư mục"
            fullWidth
            readOnly
            value={folder.code || '---'}
            className="bg-slate-50 text-slate-800 font-mono font-medium pr-10 cursor-default select-all"
          />
          {folder.code && (
            <button
              type="button"
              onClick={handleCopyCode}
              title="Sao chép mã thư mục"
              className="absolute right-2.5 top-[27px] text-slate-400 hover:text-primary transition-colors p-1 cursor-pointer"
            >
              <Copy size={15} />
            </button>
          )}
        </div>

        {/* Tên thư mục */}
        <div>
          <Input
            label="Tên thư mục"
            fullWidth
            readOnly
            value={folder.name || ''}
            className="bg-slate-50 text-slate-800 font-medium cursor-default"
          />
        </div>

        {/* Mô tả mục đích */}
        <div>
          <Textarea
            label="Mô tả mục đích"
            fullWidth
            rows={3}
            readOnly
            value={folder.description || ''}
            placeholder="Chưa có mô tả mục đích..."
            className="bg-slate-50 text-slate-800 cursor-default"
          />
        </div>

        {/* Nút Đóng */}
        <div className="flex justify-end w-full mt-2">
          <Button variant="primary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
