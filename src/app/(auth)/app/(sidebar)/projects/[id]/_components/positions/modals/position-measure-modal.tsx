'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Modal } from '@/components';
import type { MeasurePositionResponse, ProjectDoorPosition } from '@/types';

interface PositionMeasureModalProps {
  position: ProjectDoorPosition | null;
  isSubmitting: boolean;
  onClose: () => void;
  onMeasure: (
    payload: { posId: number; width: number; height: number; measureNote?: string },
    onSuccess: (res: MeasurePositionResponse) => void,
  ) => void;
}

export function PositionMeasureModal({
  position,
  isSubmitting,
  onClose,
  onMeasure,
}: PositionMeasureModalProps) {
  const [actualWidth, setActualWidth] = useState(0);
  const [actualHeight, setActualHeight] = useState(0);
  const [measureNote, setMeasureNote] = useState('');
  const [measureWarning, setMeasureWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!position) return;
    setActualWidth(position.width);
    setActualHeight(position.height);
    setMeasureNote('');
    setMeasureWarning(null);
  }, [position]);

  const handleConfirm = () => {
    if (!position) return;
    onMeasure(
      {
        posId: position.id,
        width: Number(actualWidth),
        height: Number(actualHeight),
        measureNote: measureNote.trim() || undefined,
      },
      (res) => {
        if (res.toleranceExceeded && res.warningMessage) {
          setMeasureWarning(res.warningMessage);
        } else {
          onClose();
        }
      },
    );
  };

  return (
    <Modal
      isOpen={Boolean(position)}
      onClose={onClose}
      title={`Khảo sát đo ô chờ thực tế - ${position?.code || ''}`}
      className="max-w-md w-full"
    >
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
          <span className="text-slate-400 block font-semibold">
            Kích thước thiết kế ban đầu:
          </span>
          <span className="text-slate-800 font-bold text-sm block">
            {position?.width} × {position?.height} mm
          </span>
        </div>

        {measureWarning && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{measureWarning}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Rộng thực tế (mm) *"
            value={actualWidth}
            onChange={(e) => setActualWidth(Number(e.target.value))}
            fullWidth
          />
          <Input
            type="number"
            label="Cao thực tế (mm) *"
            value={actualHeight}
            onChange={(e) => setActualHeight(Number(e.target.value))}
            fullWidth
          />
        </div>

        <Input
          label="Ghi chú hiện trường"
          placeholder="Nhập ghi chú đo đạc"
          value={measureNote}
          onChange={(e) => setMeasureNote(e.target.value)}
          fullWidth
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            disabled={actualWidth <= 0 || actualHeight <= 0 || isSubmitting}
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            Xác nhận số đo
          </Button>
        </div>
      </div>
    </Modal>
  );
}

