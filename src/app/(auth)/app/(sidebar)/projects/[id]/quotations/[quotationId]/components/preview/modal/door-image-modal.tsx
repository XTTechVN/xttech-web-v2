'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button } from '@/components';
import { getDoor } from '@/actions';
import { BASE_MINIO_URL } from '@/config/app';
import type { Door, DoorImage } from '@/types';
import { Loader2, Check } from 'lucide-react';

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

  useEffect(() => {
    if (!isOpen || !doorId) {
      setDoorDetail(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getDoor(doorId)
      .then((data) => {
        if (isMounted) {
          setDoorDetail(data);
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
  }, [isOpen, doorId]);

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

  const handleSelect = (path: string) => {
    onSelectImage(path);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chọn ảnh cho ${doorName}`}
      className="max-w-lg w-full"
    >
      <div className="py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <span className="text-xs">Đang tải danh sách ảnh...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs italic">
            Mẫu cửa này chưa có hình ảnh nào trong thư viện
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-xs text-slate-500">
              Nhấn vào một ảnh để chọn làm ảnh hiển thị cho cửa này trong báo giá:
            </span>
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
              {images.map((img, idx) => {
                const isSelected =
                  currentImagePath === img.path ||
                  (!currentImagePath && img.isPrimary);
                const fullUrl = img.path.startsWith('http')
                  ? img.path
                  : `${BASE_MINIO_URL}${img.path}`;

                return (
                  <div
                    key={`${img.path}-${idx}`}
                    onClick={() => handleSelect(img.path)}
                    className={`relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer group transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-sm'
                        : 'border-slate-200 hover:border-slate-400 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={fullUrl}
                      alt={img.name || `Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {img.isPrimary && (
                      <div className="absolute top-1.5 left-1.5 bg-blue-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-medium shadow-xs">
                        Gốc
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-primary text-white p-0.5 rounded-full shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4 text-white text-[10px] text-center font-medium truncate">
                      {isSelected ? 'Đang chọn' : 'Chọn ảnh này'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
