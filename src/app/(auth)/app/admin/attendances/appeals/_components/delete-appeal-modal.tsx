'use client';

import { Button } from '@/components';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  appealId: number | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteAppealModal({ open, appealId, onClose, onConfirm, isLoading }: Props) {
  if (!open || !appealId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Xác nhận xóa</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">Xóa khiếu nại #{appealId}?</p>
            <p className="mt-1 text-sm text-slate-500">
              Hành động này không thể hoàn tác. Khiếu nại sẽ bị xóa vĩnh viễn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition"
          >
            {isLoading ? 'Đang xóa...' : 'Xóa khiếu nại'}
          </button>
        </div>
      </div>
    </div>
  );
}
