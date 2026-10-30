'use client';

import React, { useEffect, useState } from 'react';
import { Button, Input, Modal } from '@/components';
import type { ProjectDoorPosition, ProjectDoorPositionUpdate, ProjectFloor } from '@/types';

interface PositionEditModalProps {
  position: ProjectDoorPosition | null;
  floors: ProjectFloor[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (posId: number, payload: ProjectDoorPositionUpdate) => void;
}

export function PositionEditModal({
  position,
  floors,
  isSubmitting,
  onClose,
  onSubmit,
}: PositionEditModalProps) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [floorId, setFloorId] = useState<number>(0);
  const [doorType, setDoorType] = useState('door');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!position) return;
    setCode(position.code);
    setDescription(position.description || '');
    setFloorId(position.floorId);
    setDoorType(position.doorType || 'door');
    setWidth(position.width);
    setHeight(position.height);
  }, [position]);

  const handleSave = () => {
    if (!position) return;
    onSubmit(position.id, {
      code: code.trim(),
      description: description.trim() || undefined,
      floorId,
      doorType,
      width: Number(width),
      height: Number(height),
      revision: position.revision,
    });
  };

  return (
    <Modal
      isOpen={Boolean(position)}
      onClose={onClose}
      title={`Chỉnh sửa thông tin cửa - ${position?.code || ''}`}
      className="max-w-md w-full"
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Mã cửa (Code) *"
            placeholder="VD: D1-01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-700 select-none">
              Tầng bố trí *
            </label>
            <select
              value={floorId}
              onChange={(e) => setFloorId(Number(e.target.value))}
              className="w-full h-10 px-3 text-base md:text-sm bg-white border border-gray-200 rounded-md outline-none hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 transition-all duration-200"
            >
              {floors.map((fl) => (
                <option key={fl.id} value={fl.id}>
                  {fl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 items-start">
          <Input
            label="Mô tả"
            placeholder="VD: Cửa đi phòng khách"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-700 select-none">
              Loại cửa
            </label>
            <select
              value={doorType}
              onChange={(e) => setDoorType(e.target.value)}
              className="w-full h-10 px-3 text-base md:text-sm bg-white border border-gray-200 rounded-md outline-none hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 transition-all duration-200"
            >
              <option value="door">Cửa đi</option>
              <option value="window">Cửa sổ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Chiều rộng (mm) *"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            min={100}
            fullWidth
          />
          <Input
            type="number"
            label="Chiều cao (mm) *"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min={100}
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!code.trim() || width <= 0 || height <= 0 || isSubmitting}
            loading={isSubmitting}
            onClick={handleSave}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
}

