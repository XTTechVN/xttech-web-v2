/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { UseFormSetError, UseFormClearErrors } from 'react-hook-form';
import { checkUserExists } from '@/actions/employee';
import { Employee } from '@/types';

import { z } from 'zod';

interface UseEmployeeCheckProps {
  emailValue: string;
  identifyCodeValue: string;
  isEditMode: boolean;
  isOpen: boolean;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
}

export function useEmployeeCheck({
  emailValue,
  identifyCodeValue,
  isEditMode,
  isOpen,
  setError,
  clearErrors,
}: UseEmployeeCheckProps) {
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'duplicate'>('idle');
  const [cccdStatus, setCccdStatus] = useState<'idle' | 'checking' | 'valid' | 'duplicate'>('idle');
  const [existingUser, setExistingUser] = useState<Employee | null>(null);
  const [duplicateField, setDuplicateField] = useState<'email' | 'identifyCode' | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  // Reset khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    setEmailStatus('idle');
    setCccdStatus('idle');
    setExistingUser(null);
    setDuplicateField(null);
    setIsDuplicateModalOpen(false);
  }, [isOpen]);

  // Regex kiểm tra định dạng email chuẩn (TLD tối thiểu 2 chữ cái như .com, .vn, ...)
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Regex kiểm tra CCCD/CMND chuẩn Việt Nam (9 số hoặc 12 số)
  const CCCD_REGEX = /^\d{9,12}$/;

  // Kiểm tra Email
  const checkEmailExistence = async (val?: string) => {
    const email = (val !== undefined ? val : emailValue)?.trim().toLowerCase();
    if (isEditMode || !email) {
      setEmailStatus('idle');
      return;
    }

    // 1. Kiểm tra định dạng Email TRƯỚC TIÊN
    const isEmailValid = EMAIL_REGEX.test(email) && z.string().email().safeParse(email).success;
    if (!isEmailValid) {
      setEmailStatus('idle');
      setError('email', { type: 'manual', message: 'Email không đúng định dạng (Ví dụ: name@gmail.com)' });
      return;
    }

    // 2. Nếu đã đúng định dạng Email hợp lệ -> Xóa lỗi định dạng & Gửi API check tồn tại
    clearErrors('email');
    setEmailStatus('checking');
    try {
      const user = await checkUserExists({ email });
      if (user) {
        setEmailStatus('duplicate');
        setExistingUser(user);
        setDuplicateField('email');
        setIsDuplicateModalOpen(true);
        setError('email', { type: 'manual', message: 'Email này đã tồn tại trên hệ thống' });
      } else {
        setEmailStatus('valid');
        clearErrors('email');
      }
    } catch {
      setEmailStatus('idle');
    }
  };

  // Kiểm tra CCCD
  const checkCccdExistence = async (val?: string) => {
    const cccd = (val !== undefined ? val : identifyCodeValue)?.trim();
    if (isEditMode || !cccd) {
      setCccdStatus('idle');
      return;
    }

    // 1. Kiểm tra định dạng CCCD TRƯỚC TIÊN (9-12 chữ số)
    if (!CCCD_REGEX.test(cccd)) {
      setCccdStatus('idle');
      setError('identifyCode', { type: 'manual', message: 'Căn cước công dân phải từ 9 đến 12 chữ số' });
      return;
    }

    // 2. Nếu đã đúng định dạng CCCD hợp lệ -> Xóa lỗi & Gửi API check tồn tại
    clearErrors('identifyCode');
    setCccdStatus('checking');
    try {
      const user = await checkUserExists({ identifyCode: cccd });
      if (user) {
        setCccdStatus('duplicate');
        setExistingUser(user);
        setDuplicateField('identifyCode');
        setIsDuplicateModalOpen(true);
        setError('identifyCode', { type: 'manual', message: 'Căn cước công dân này đã tồn tại trên hệ thống' });
      } else {
        setCccdStatus('valid');
        clearErrors('identifyCode');
      }
    } catch {
      setCccdStatus('idle');
    }
  };

  // Debounce kiểm tra
  useEffect(() => {
    if (isEditMode || !isOpen || !emailValue) return;
    const timer = setTimeout(() => checkEmailExistence(emailValue), 600);
    return () => clearTimeout(timer);
  }, [emailValue, isEditMode, isOpen]);

  useEffect(() => {
    if (isEditMode || !isOpen || !identifyCodeValue) return;
    const timer = setTimeout(() => checkCccdExistence(identifyCodeValue), 600);
    return () => clearTimeout(timer);
  }, [identifyCodeValue, isEditMode, isOpen]);

  const handleCancelDuplicate = () => {
    setIsDuplicateModalOpen(false);
    const field = duplicateField === 'email' ? 'email' : 'identifyCode';
    const label = duplicateField === 'email' ? 'Email' : 'Căn cước công dân';
    setError(field, { type: 'manual', message: `${label} này đã tồn tại, không thể tạo mới` });
  };

  return {
    emailStatus,
    cccdStatus,
    existingUser,
    duplicateField,
    isDuplicateModalOpen,
    setIsDuplicateModalOpen,
    setExistingUser,
    checkEmailExistence,
    checkCccdExistence,
    handleCancelDuplicate,
  };
}
