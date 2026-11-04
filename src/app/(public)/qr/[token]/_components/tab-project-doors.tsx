'use client';

import React, { useMemo, useState } from 'react';
import { CheckSquare, Eye, Layers, Search, Square, Wrench } from 'lucide-react';
import { Badge, Button, Input, Modal, Skeleton } from '@/components';
import { DOOR_STATUS_MAP } from '@/config';
import type { QrProjectDoorItem } from '@/types';
import { mediaUrl } from './qr-helpers';

interface TabProjectDoorsProps {
  doors: QrProjectDoorItem[];
  isLoading: boolean;
  scannedPositionId: number;
  selectedDoorIds: number[];
  onToggleDoor: (doorId: number) => void;
  onSelectAllFloor: (doorIds: number[]) => void;
  onProceedToClaim: () => void;
}

export function TabProjectDoors({
  doors,
  isLoading,
  scannedPositionId,
  selectedDoorIds,
  onToggleDoor,
  onSelectAllFloor,
  onProceedToClaim,
}: TabProjectDoorsProps) {
  const [search, setSearch] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [previewDoor, setPreviewDoor] = useState<QrProjectDoorItem | null>(null);

  const floorNames = useMemo(() => {
    const names = Array.from(new Set(doors.map((d) => d.floorName || 'Tầng / Khu vực chung')));
    return names;
  }, [doors]);

  const groupedDoors = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = doors.filter((door) => {
      const floorLabel = door.floorName || 'Tầng / Khu vực chung';
      if (selectedFloor !== 'ALL' && floorLabel !== selectedFloor) return false;
      if (!keyword) return true;
      return (
        door.code.toLowerCase().includes(keyword) ||
        (door.name || '').toLowerCase().includes(keyword) ||
        door.doorName.toLowerCase().includes(keyword)
      );
    });

    const groups = new Map<string, QrProjectDoorItem[]>();
    for (const door of filtered) {
      const key = door.floorName || 'Tầng / Khu vực chung';
      const current = groups.get(key) || [];
      current.push(door);
      groups.set(key, current);
    }
    return Array.from(groups.entries());
  }, [doors, search, selectedFloor]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  const selectedSet = new Set(selectedDoorIds);

  return (
    <div className="space-y-3.5">
      <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-3.5">
        <div className="relative">
          <Input
            placeholder="Tìm theo mã cửa (D1, W1) hoặc tên vị trí..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
          <Search
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
        {floorNames.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedFloor('ALL')}
              className={`min-h-[44px] shrink-0 rounded-full px-3.5 text-xs font-semibold transition ${
                selectedFloor === 'ALL'
                  ? 'bg-[#045863] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({doors.length})
            </button>
            {floorNames.map((floor) => (
              <button
                key={floor}
                type="button"
                onClick={() => setSelectedFloor(floor)}
                className={`min-h-[44px] shrink-0 rounded-full px-3.5 text-xs font-semibold transition ${
                  selectedFloor === floor
                    ? 'bg-[#045863] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        )}
        <p className="text-[11px] text-slate-500">
          Chạm vào từng bộ cửa để chọn nhiều cửa cần bảo hành / sửa chữa cùng lúc.
        </p>
      </div>

      {groupedDoors.map(([floorLabel, floorDoors]) => {
        const floorIds = floorDoors.map((d) => d.id);
        const isAllSelected = floorIds.every((id) => selectedSet.has(id));
        return (
          <section
            key={floorLabel}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Layers size={14} className="text-[#045863]" />
                <span>{floorLabel}</span>
                <span className="font-mono text-[11px] font-normal text-slate-500">
                  ({floorDoors.length} cửa)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectAllFloor(floorIds)}
                className="min-h-[44px] px-2.5 text-xs font-semibold text-[#045863] active:opacity-75"
              >
                {isAllSelected ? 'Bỏ chọn tầng' : 'Chọn cả tầng'}
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {floorDoors.map((door) => {
                const isSelected = selectedSet.has(door.id);
                const isScanned = door.id === scannedPositionId;
                const statusBadge = DOOR_STATUS_MAP[door.status];
                return (
                  <div
                    key={door.id}
                    className={`flex min-h-[68px] items-center justify-between gap-2.5 px-3.5 py-2.5 transition ${
                      isSelected ? 'bg-[#045863]/5' : 'bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleDoor(door.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="shrink-0 text-[#045863]">
                        {isSelected ? (
                          <CheckSquare size={20} className="fill-[#045863]/10 text-[#045863]" />
                        ) : (
                          <Square size={20} className="text-slate-300" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {door.code}
                          </span>
                          {isScanned && (
                            <span className="rounded bg-[#045863] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              Cửa vừa quét
                            </span>
                          )}
                          <Badge
                            variant={statusBadge ? statusBadge.variant : 'default'}
                            size="sm"
                          >
                            {door.statusLabel}
                          </Badge>
                        </div>
                        <div className="mt-0.5 truncate text-xs font-medium text-slate-700">
                          {door.name || door.doorName}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] tabular-nums text-slate-500">
                          {door.width} × {door.height} mm · {door.areaM2} m²
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewDoor(door)}
                      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#045863] hover:text-[#045863]"
                      title="Xem chi tiết bộ cửa"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {groupedDoors.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-xs text-slate-400">
          Không tìm thấy bộ cửa phù hợp với từ khóa.
        </div>
      )}

      {selectedDoorIds.length > 0 && (
        <div className="sticky bottom-20 z-30 flex items-center justify-between gap-3 rounded-2xl bg-slate-900 p-3.5 text-white shadow-lg">
          <div className="text-xs">
            Đã chọn{' '}
            <b className="font-mono text-sm tabular-nums text-teal-300">
              {selectedDoorIds.length}
            </b>{' '}
            bộ cửa
          </div>
          <Button size="sm" onClick={onProceedToClaim} leftIcon={<Wrench size={15} />}>
            Gửi yêu cầu bảo hành ({selectedDoorIds.length})
          </Button>
        </div>
      )}

      <Modal
        isOpen={Boolean(previewDoor)}
        onClose={() => setPreviewDoor(null)}
        title={previewDoor ? `Chi tiết cửa ${previewDoor.code}` : ''}
        className="max-w-md w-full"
      >
        {previewDoor && (
          <div className="space-y-3 text-xs">
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-3 py-1">
              {[
                ['Tên vị trí', previewDoor.name || previewDoor.doorName],
                ['Khu vực / Tầng', previewDoor.floorName],
                [
                  'Kích thước',
                  `${previewDoor.width} × ${previewDoor.height} mm (${previewDoor.areaM2} m²)`,
                ],
                ['Hãng nhôm', previewDoor.brandName],
                ['Hệ nhôm', previewDoor.seriesName],
                ['Màu sắc', previewDoor.colorName],
                ['Kính', previewDoor.glassName],
              ].map(([label, val]) =>
                val ? (
                  <div key={label} className="flex justify-between py-2">
                    <span className="text-slate-500">{label}</span>
                    <b className="font-mono tabular-nums text-slate-900">{val}</b>
                  </div>
                ) : null,
              )}
            </div>
            {previewDoor.designImage && (
              <img
                src={mediaUrl(previewDoor.designImage)}
                alt={previewDoor.code}
                className="max-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
