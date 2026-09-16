/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Heading } from '@/components';
import { motion, AnimatePresence } from 'motion/react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  disabled?: boolean;
  className?: string;
  bodyClassName?: string;
  fullScreenMobile?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  disabled = false,
  className,
  bodyClassName,
  fullScreenMobile = true,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Khóa cuộn trang khi Modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Đóng Modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !disabled) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, disabled]);

  if (!mounted) return null;

  const sizes = {
    sm: 'md:max-w-md',
    md: 'md:max-w-lg',
    lg: 'md:max-w-2xl',
    xl: 'md:max-w-5xl',
    full: 'max-w-full h-full m-0 rounded-none',
  };

  const isFullScreenMobile = fullScreenMobile && size !== 'full';
  
  const modalElement = (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center outline-none',
            isFullScreenMobile ? 'max-md:p-0 overflow-x-hidden max-md:overflow-hidden md:overflow-y-auto' : 'overflow-x-hidden overflow-y-auto'
          )}
        >
          {/* Overlay / Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlayClick && !disabled ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full bg-white flex flex-col',
              sizes[size],
              size === 'full'
                ? 'h-full m-0 rounded-none'
                : isFullScreenMobile
                ? 'max-md:!fixed max-md:!inset-0 max-md:!m-0 max-md:!my-0 max-md:!h-dvh max-md:!h-[100dvh] max-md:!max-h-dvh max-md:!max-h-[100dvh] max-md:!w-full max-md:!max-w-none max-md:!rounded-none max-md:!border-none max-md:!shadow-none md:mx-auto md:my-6 md:rounded-xl md:border md:border-gray-100 md:shadow-xl md:max-h-[calc(100vh-3rem)]'
                : 'mx-auto my-6 rounded-xl border border-gray-100 shadow-xl max-h-[calc(100vh-3rem)]',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 bg-white">
              {title ? (
                <Heading size="h3" className="text-gray-900 font-semibold truncate pr-4 text-base sm:text-lg">
                  {title}
                </Heading>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={disabled}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent shrink-0"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content (Body) */}
            <div className={cn("flex-1 min-h-0 overflow-y-auto p-4 text-sm text-gray-600 leading-relaxed", bodyClassName)}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/80 rounded-b-none md:rounded-b-xl shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalElement, document.body);
};

Modal.displayName = 'Modal';

export default Modal;
export { Modal };

