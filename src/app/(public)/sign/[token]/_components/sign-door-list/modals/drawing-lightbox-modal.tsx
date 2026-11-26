'use client';

import { Modal } from '@/components';
import type { PublicSigningItem } from '@/types';
import { formatNumber } from '@/utils/public-signing';
import { SignDoorDrawing } from '../sign-door-drawing';

interface DrawingLightboxModalProps {
  item: PublicSigningItem | null;
  onClose: () => void;
}

export function DrawingLightboxModal({ item, onClose }: DrawingLightboxModalProps) {
  return (
    <Modal
      isOpen={item !== null}
      onClose={onClose}
      size="xl"
      title={item ? `Bản vẽ ${item.code}${item.name ? ` · ${item.name}` : ''}` : ''}
    >
      {item && (
        <div className="space-y-3">
          <SignDoorDrawing
            item={item}
            hideDimensions={false}
            className="mx-auto h-[60vh] max-h-[640px] w-full rounded-lg border border-slate-200 bg-white p-2"
          />
          <p className="text-center font-mono text-sm tabular-nums text-slate-700">
            {formatNumber(item.spec.width, 0)} × {formatNumber(item.spec.height, 0)} mm ·{' '}
            {formatNumber(item.spec.areaM2)} m²
          </p>
        </div>
      )}
    </Modal>
  );
}
