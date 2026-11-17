'use client';

import React from 'react';
import { Modal } from '@/components';
import { DOOR_FULFILLMENT_TYPE_MAP } from '@/config';
import type { QrProjectDoorItem } from '@/types';
import { QrDoorVisual } from '../qr-door-visual';

interface QrDoorPreviewModalProps {
  previewDoor: QrProjectDoorItem | null;
  onClose: () => void;
}

export function QrDoorPreviewModal({ previewDoor, onClose }: QrDoorPreviewModalProps) {
  const isOutsourced = previewDoor?.fulfillmentType === 'outsourced';

  return (
    <Modal
      isOpen={Boolean(previewDoor)}
      onClose={onClose}
      title={previewDoor ? `Chi tiết cửa ${previewDoor.code}` : ''}
      className="max-w-lg w-full"
    >
      {previewDoor && (
        <div className="space-y-3 text-xs">
          <QrDoorVisual
            code={previewDoor.code}
            doorName={previewDoor.doorName}
            name={previewDoor.name}
            width={previewDoor.width}
            height={previewDoor.height}
            areaM2={previewDoor.areaM2}
            designImage={previewDoor.designImage}
            systemConfig={previewDoor.systemConfig}
            fulfillmentType={previewDoor.fulfillmentType}
            variant="card"
          />

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-3 py-1">
            {[
              ['Tên vị trí', previewDoor.name || previewDoor.doorName],
              ['Khu vực / Tầng', previewDoor.floorName],
              [
                'Kích thước',
                `${previewDoor.width} × ${previewDoor.height} mm (${previewDoor.areaM2} m²)`,
              ],
              ['Hình thức', isOutsourced ? DOOR_FULFILLMENT_TYPE_MAP.outsourced.label : null],
              ['Nhà cung cấp', previewDoor.supplierName],
              ['Hãng nhôm', previewDoor.brandName],
              ['Hệ nhôm', previewDoor.seriesName],
              ['Màu sắc', previewDoor.colorName],
              ['Kính', previewDoor.glassName],
            ].map(([label, val]) =>
              val ? (
                <div key={label} className="flex justify-between gap-3 py-2">
                  <span className="text-slate-500 shrink-0">{label}</span>
                  <b className="font-mono tabular-nums text-right text-slate-900">{val}</b>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
