'use client';

import React from 'react';
import { Modal, Button, Avatar } from '@/components';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Employee } from '@/types';
import { BASE_MINIO_URL } from '@/config';

interface DuplicateUserModalProps {
  isOpen: boolean;
  user: Employee | null;
  duplicateField: 'email' | 'identifyCode' | null;
  isRestoring: boolean;
  onRestore: () => void;
  onCancel: () => void;
}

export function DuplicateUserModal({
  isOpen,
  user,
  duplicateField,
  isRestoring,
  onRestore,
  onCancel,
}: DuplicateUserModalProps) {
  if (!isOpen || !user) return null;

  const fieldLabel = duplicateField === 'email' ? 'Email' : 'Căn cước công dân';
  const avatarUrl = user.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${BASE_MINIO_URL}${user.avatar}`
    : undefined;

  return (
    <Modal
      size="md"
      isOpen={isOpen}
      onClose={onCancel}
      title="Tài khoản đã tồn tại"
      className="m-2 max-w-md w-full"
      disabled={isRestoring}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isRestoring}
            className="w-full sm:w-auto"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw size={15} />}
            loading={isRestoring}
            onClick={onRestore}
            className="w-full sm:w-auto"
          >
            Khôi phục tài khoản
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Banner Cảnh báo */}
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-amber-800 leading-relaxed">
            Phát hiện thông tin <strong>{fieldLabel}</strong> trùng khớp với một nhân sự đã có trong hệ thống.
          </div>
        </div>

        {/* Card thông tin User tồn tại */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <Avatar src={avatarUrl} name={user.fullName || user.username} size="md" />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 text-sm truncate">
                {user.fullName || user.username}
              </span>
              <span className="text-xs text-slate-500 truncate">{user.email}</span>
              <span className="text-[11px] text-slate-400 truncate">@{user.username}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 block text-[11px]">CCCD / Định danh</span>
              <p className="font-semibold text-slate-700">{user.identifyCode || '---'}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Số điện thoại</span>
              <p className="font-semibold text-slate-700">{user.phoneNumber || '---'}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Trạng thái tài khoản</span>
              <p className="font-semibold mt-0.5">
                {user.deletedAt ? (
                  <span className="inline-block text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[11px]">
                    Đã xóa / Vô hiệu hóa
                  </span>
                ) : (
                  <span className="inline-block text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Đang hoạt động
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Ngày tạo</span>
              <p className="font-semibold text-slate-700">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
