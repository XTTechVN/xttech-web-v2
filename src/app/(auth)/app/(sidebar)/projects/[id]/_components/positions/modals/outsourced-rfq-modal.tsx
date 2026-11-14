'use client';

import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportOutsourcedRfqExcel } from '@/actions';
import { Badge, Button, Modal, Select } from '@/components';
import { POSITION_COST_STATUS_MAP } from '@/config';
import type { ProjectDoorPosition } from '@/types';
import { showErrorToast } from '@/utils';

interface OutsourcedRfqModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  positions: ProjectDoorPosition[];
}

export function OutsourcedRfqModal(props: OutsourcedRfqModalProps) {
  const modalKey = `${props.projectId}-${props.isOpen ? 'open' : 'closed'}`;
  return <OutsourcedRfqModalInner key={modalKey} {...props} />;
}

function OutsourcedRfqModalInner({
  isOpen,
  onClose,
  projectId,
  positions,
}: OutsourcedRfqModalProps) {
  const outsourcedPositions = useMemo(
    () => positions.filter((pos) => pos.fulfillmentType === 'outsourced'),
    [positions],
  );

  const suppliers = useMemo(() => {
    const map = new Map<number, string>();
    outsourcedPositions.forEach((pos) => {
      if (pos.supplierId) {
        map.set(pos.supplierId, pos.supplier?.name || `NCC #${pos.supplierId}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [outsourcedPositions]);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    outsourcedPositions.map((pos) => pos.id),
  );
  const [isExporting, setIsExporting] = useState(false);

  const filteredPositions = useMemo(() => {
    if (!selectedSupplierId) return outsourcedPositions;
    const numericId = Number(selectedSupplierId);
    return outsourcedPositions.filter((pos) => pos.supplierId === numericId);
  }, [outsourcedPositions, selectedSupplierId]);

  const visibleSelectedIds = useMemo(
    () => filteredPositions.filter((pos) => selectedIds.includes(pos.id)).map((pos) => pos.id),
    [filteredPositions, selectedIds],
  );

  const togglePosition = (posId: number) => {
    setSelectedIds((prev) =>
      prev.includes(posId) ? prev.filter((id) => id !== posId) : [...prev, posId],
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = filteredPositions.map((pos) => pos.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleExport = async () => {
    if (visibleSelectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 bộ cửa nhập NCC để xuất Excel');
      return;
    }
    setIsExporting(true);
    try {
      await exportOutsourcedRfqExcel(projectId, {
        supplierId: selectedSupplierId ? Number(selectedSupplierId) : undefined,
        positionIds: visibleSelectedIds,
      });
      toast.success('Đã xuất file Excel yêu cầu báo giá NCC');
      onClose();
    } catch (err) {
      showErrorToast(err, 'Không thể xuất file RFQ Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <span>Xuất Excel yêu cầu báo giá NCC (RFQ)</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500">
            Đã chọn <strong className="text-slate-900">{visibleSelectedIds.length}</strong> /{' '}
            {filteredPositions.length} bộ cửa
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
              Đóng
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isExporting}
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={handleExport}
            >
              Xuất file Excel
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex-1">
            <Select
              label="Lọc theo nhà cung cấp"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              options={[
                { value: '', label: 'Tất cả nhà cung cấp' },
                ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
              ]}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={toggleAllVisible}>
            {visibleSelectedIds.length === filteredPositions.length && filteredPositions.length > 0
              ? 'Bỏ chọn tất cả'
              : 'Chọn tất cả đang lọc'}
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
          {filteredPositions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Không có bộ cửa nhập NCC nào phù hợp bộ lọc.
            </div>
          ) : (
            filteredPositions.map((pos) => {
              const checked = selectedIds.includes(pos.id);
              const costBadge = POSITION_COST_STATUS_MAP[pos.costStatus];
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => togglePosition(pos.id)}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                    checked ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{pos.code}</span>
                        <span className="text-xs text-slate-600 truncate">
                          {pos.description || pos.supplierDoor?.name || 'Cửa nhập NCC'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {pos.supplier?.name || 'Chưa gắn NCC'} • {pos.width}×{pos.height} mm (
                        {(pos.areaM2 ?? 0).toFixed(2)} m²)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={costBadge.variant} size="sm">
                      {costBadge.shortLabel}
                    </Badge>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
