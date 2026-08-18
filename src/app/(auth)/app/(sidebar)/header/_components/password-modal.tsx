'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Modal, Input, Button } from '@/components';
import { useAuthStore } from '@/stores';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/actions/auth';
import toast from 'react-hot-toast';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  const { user } = useAuthStore();
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const { mutate: updatePassword, isPending } = useMutation({
    mutationFn: async (data: {newPassword: string, confirmPassword: string}) => {
      return changePassword(data.newPassword); 
    },
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Đổi mật khẩu thất bại');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    updatePassword(passwordData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu" size="sm">
      <form id="password-form" onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Input 
            label="Mật khẩu mới" 
            name="newPassword" 
            type={showNewPassword ? 'text' : 'password'} 
            value={passwordData.newPassword} 
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
            placeholder="Nhập mật khẩu mới" 
            fullWidth 
          />
          <button
            type="button"
            className="absolute right-3 bottom-[11px] text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Input 
            label="Xác nhận mật khẩu mới" 
            name="confirmPassword" 
            type={showConfirmPassword ? 'text' : 'password'} 
            value={passwordData.confirmPassword} 
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
            placeholder="Nhập lại mật khẩu mới" 
            fullWidth 
          />
          <button
            type="button"
            className="absolute right-3 bottom-[11px] text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" type="button" onClick={onClose}>Hủy</Button>
          <Button variant="primary" type="submit" loading={isPending} disabled={isPending}>Đổi mật khẩu</Button>
        </div>
      </form>
    </Modal>
  );
}
