'use client';

import React from 'react';
import { QrCode } from 'lucide-react';
import { Button, Modal } from '@/components';
import type { ProjectDoorPosition } from '@/types';

interface PositionQrModalProps {
  position: ProjectDoorPosition | null;
  onClose: () => void;
}

export function PositionQrModal({ position, onClose }: PositionQrModalProps) {
  return (
    <Modal
      isOpen={Boolean(position)}
      onClose={onClose}
      title={`Mã QR Hiện trường - ${position?.code || ''}`}
      className="max-w-xs w-full text-center"
    >
      <div className="space-y-4 py-2 flex flex-col items-center">
        <div className="p-4 bg-slate-100 rounded-xl inline-block border border-slate-200">
          <QrCode size={120} className="text-slate-800" />
        </div>
        <div className="text-xs text-slate-500 space-y-1">
          <span className="font-bold text-slate-800 block text-sm">
            Token: {position?.qrCodeToken?.slice(0, 16)}...
          </span>
          <span>Mã QR công khai dán trên tem cửa để thợ/giám sát quét kiểm tra</span>
        </div>
        <Button variant="outline" size="sm" fullWidth onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
}

