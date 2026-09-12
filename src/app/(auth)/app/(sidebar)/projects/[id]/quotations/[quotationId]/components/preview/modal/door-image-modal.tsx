/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getDoor } from '@/actions';
import { getFileUrl } from '@/utils';
import type { Door, DoorImage } from '@/types';
import { Loader2, Check, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoorImageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  doorId?: number;
  doorName?: string;
  currentImagePath?: string | null;
  onSelectImage: (imagePath: string) => void;
}

export const DoorImageSelectModal: React.FC<DoorImageSelectModalProps> = ({
  isOpen,
  onClose,
  doorId,
  doorName = 'mẫu cửa',
  currentImagePath,
  onSelectImage,
}) => {
  const [doorDetail, setDoorDetail] = useState<Door | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
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

  // Đóng khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !doorId) {
      setDoorDetail(null);
      setSelectedPath(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getDoor(doorId)
      .then((data) => {
        if (isMounted) {
          setDoorDetail(data);
          const primaryImg = data?.images?.find((img) => img.isPrimary)?.imagePath || data?.imagePath;
          setSelectedPath(currentImagePath || primaryImg || null);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải thông tin ảnh cửa:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, doorId, currentImagePath]);

  // Gom danh sách ảnh của cửa
  const images: Array<{ path: string; name?: string | null; isPrimary?: boolean }> = [];

  if (doorDetail?.images && doorDetail.images.length > 0) {
    doorDetail.images.forEach((img: DoorImage) => {
      images.push({
        path: img.imagePath,
        name: img.name,
        isPrimary: img.isPrimary,
      });
    });
  } else if (doorDetail?.imagePath) {
    images.push({
      path: doorDetail.imagePath,
      name: 'Ảnh mặc định',
      isPrimary: true,
    });
  }

  // Active path hiện tại
  const activeImage = images.find((img) => img.path === selectedPath) || images[0];
  const activeFullUrl = getFileUrl(activeImage?.path) || null;

  const handleApply = () => {
    if (activeImage?.path) {
      onSelectImage(activeImage.path);
    }
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col justify-between select-none"
        >
          {/* 1. OVERLAY MỜ TỐI GIẢN (MINIMALISTIC BACKDROP) */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-all cursor-pointer"
          />

          {/* 2. THANH TIÊU ĐỀ TRÊN CÙNG (TRONG SUỐT, TỐI GIẢN) */}
          <div className="relative z-10 w-full flex items-center justify-between px-6 py-5 text-white">
            <h3 className="text-lg font-bold text-white tracking-wide drop-shadow-sm">{doorName}</h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleApply}
                disabled={!activeImage?.path || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark active:scale-95 text-white text-xs font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>Xác nhận</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                title="Đóng (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 3. KHU VỰC ẢNH CHÍNH Ở GIỮA MÀN HÌNH */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0 pointer-events-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-white/80">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center text-white/50 text-sm italic">
                Mẫu cửa này chưa có hình ảnh nào trong thư viện
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeFullUrl && (
                  <motion.div
                    key={activeImage?.path}
                    initial={{ opacity: 0, y: 70, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.92 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 26,
                      mass: 0.7,
                    }}
                    className="relative max-w-2xl max-h-[62vh] sm:max-h-[68vh] flex items-center justify-center pointer-events-auto"
                  >
                    <img
                      src={activeFullUrl}
                      alt="Ảnh chính"
                      className="max-w-full max-h-[62vh] sm:max-h-[68vh] object-contain rounded-2xl shadow-2xl drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] select-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* 4. DÃY ẢNH CON SÁT CHÂN MÀN HÌNH (KHÔNG CÓ KHUNG NỀN ĐEN) */}
          {images.length > 0 && (
            <div className="relative z-10 w-full flex items-center justify-center pb-6 pt-2 px-4">
              <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 px-2 scrollbar-none max-w-full">
                {images.map((img, idx) => {
                  const isSelected = activeImage?.path === img.path;
                  const thumbUrl = getFileUrl(img.path);

                  return (
                    <motion.button
                      type="button"
                      key={`${img.path}-${idx}`}
                      whileHover={{ scale: 1.12, y: -4 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedPath(img.path)}
                      className={`relative shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden transition-all cursor-pointer shadow-lg ${
                        isSelected
                          ? 'ring-2.5 ring-primary ring-offset-2 ring-offset-black/80 shadow-primary/40 scale-105'
                          : 'opacity-40 hover:opacity-100 ring-1 ring-white/20'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover select-none"
                      />

                      {img.isPrimary && (
                        <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                          Gốc
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-white p-1 rounded-full shadow-md">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
