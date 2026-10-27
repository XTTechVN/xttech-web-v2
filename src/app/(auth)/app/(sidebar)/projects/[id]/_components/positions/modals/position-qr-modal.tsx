'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Printer } from 'lucide-react';
import { getPositionQrImage } from '@/actions';
import { Button, Modal } from '@/components';
import type { ProjectDoorPosition } from '@/types';

interface PositionQrModalProps {
  position: ProjectDoorPosition | null;
  onClose: () => void;
}

export function PositionQrModal({ position, onClose }: PositionQrModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Ảnh QR cần Bearer token nên tải dạng blob; thu hồi object URL khi đóng
  useEffect(() => {
    if (!position) return;
    let objectUrl: string | null = null;
    let isCancelled = false;
    getPositionQrImage(position.projectId, position.id)
      .then((url) => {
        objectUrl = url;
        if (isCancelled) URL.revokeObjectURL(url);
        else setImageUrl(url);
      })
      .catch(() => setImageUrl(null));
    return () => {
      isCancelled = true;
      setImageUrl(null);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [position]);

  const handlePrint = () => {
    if (!imageUrl || !position) return;
    const printWindow = window.open('', '_blank', 'width=420,height=520');
    if (!printWindow) return;
    printWindow.document.write(
      `<html><head><title>${position.code}</title></head><body style="text-align:center;font-family:sans-serif">` +
        `<img src="${imageUrl}" style="width:300px"/><h2 style="margin:4px 0">${position.code}</h2>` +
        `<div>${position.width} × ${position.height} mm</div></body></html>`,
    );
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  return (
    <Modal
      isOpen={Boolean(position)}
      onClose={onClose}
      title={`Mã QR Hiện trường - ${position?.code || ''}`}
      className="max-w-xs w-full text-center"
    >
      <div className="space-y-4 py-2 flex flex-col items-center">
        <div className="flex h-52 w-52 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={`QR ${position?.code}`} className="h-full w-full object-contain" />
          ) : (
            <Loader2 className="animate-spin text-slate-400" />
          )}
        </div>
        <div className="text-xs text-slate-500 space-y-1">
          <span className="font-bold text-slate-800 block text-sm">
            {position?.width} × {position?.height} mm
          </span>
          <span>
            Dán lên bộ cửa. Quét sẽ mở trang chi tiết (số đo, thanh nhôm, ảnh, tiến độ) — thợ đăng nhập có thể báo
            tiến độ ngay.
          </span>
          {position?.qrUrl && <span className="block break-all text-[10px] text-slate-400">{position.qrUrl}</span>}
        </div>
        <div className="flex w-full gap-2">
          <Button variant="outline" size="sm" fullWidth leftIcon={<Printer size={14} />} onClick={handlePrint} disabled={!imageUrl}>
            In tem
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
