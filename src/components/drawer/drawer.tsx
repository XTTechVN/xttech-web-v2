'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/utils/cn';

const emptySubscribe = () => () => {};

const DRAWER_SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
} as const;

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  subHeader?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  size?: keyof typeof DRAWER_SIZE_CLASSES;
  zIndexClass?: string;
  closeOnOverlayClick?: boolean;
  disabled?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  ariaLabel?: string;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  subHeader,
  children,
  footer,
  side = 'right',
  size = 'xl',
  zIndexClass = 'z-40',
  closeOnOverlayClick = true,
  disabled = false,
  className,
  headerClassName,
  bodyClassName,
  ariaLabel,
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || disabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, disabled, onClose]);

  if (!isMounted) return null;

  const slideOffset = side === 'right' ? '100%' : '-100%';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 flex overflow-hidden',
            side === 'right' ? 'justify-end' : 'justify-start',
            zIndexClass,
          )}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || (typeof title === 'string' ? title : 'Ngăn kéo chi tiết')}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeOnOverlayClick && !disabled ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
          />

          <motion.div
            initial={{ x: slideOffset }}
            animate={{ x: 0 }}
            exit={{ x: slideOffset }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              'relative w-full h-full bg-white shadow-2xl flex flex-col will-change-transform',
              side === 'right' ? 'border-l border-slate-200' : 'border-r border-slate-200',
              DRAWER_SIZE_CLASSES[size],
              className,
            )}
          >
            <div
              className={cn(
                'flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-white shrink-0',
                headerClassName,
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {icon && <div className="shrink-0">{icon}</div>}
                <div className="min-w-0 flex-1 space-y-0.5">
                  {typeof title === 'string' ? (
                    <h3 className="text-base font-bold text-slate-900 truncate">{title}</h3>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <div className="text-xs text-slate-500 truncate">{subtitle}</div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={disabled}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {subHeader && (
              <div className="border-b border-slate-200 bg-white shrink-0">{subHeader}</div>
            )}

            <div className={cn('flex-1 min-h-0 overflow-y-auto p-5', bodyClassName)}>
              {children}
            </div>

            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

Drawer.displayName = 'Drawer';

export default Drawer;
export { Drawer };
