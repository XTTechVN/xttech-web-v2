'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Select } from '@/components';
import { WarehouseSupplier, ProjectFloor } from '@/types';
import { previewProjectGlassPanes, createProjectGlassOrder } from '@/actions';
import { getProjectFloors } from '@/actions/project';
import {
  GlassOrderPanesEditor,
  EditablePaneItem,
  DoorOption,
} from './glass-order-panes-editor';

interface GlassOrderGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  productionOrderId?: number;
  glassSuppliers: WarehouseSupplier[];
  onSuccess: () => void;
}

export function GlassOrderGenerateModal({
  isOpen,
  onClose,
  projectId,
  productionOrderId,
  glassSuppliers,
  onSuccess,
}: GlassOrderGenerateModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
  const [expectedDate, setExpectedDate] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [panes, setPanes] = useState<EditablePaneItem[]>([]);
  const [knownDoors, setKnownDoors] = useState<DoorOption[]>([]);
  const [isLoadingPanes, setIsLoadingPanes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [floors, setFloors] = useState<ProjectFloor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [filterGlassType, setFilterGlassType] = useState<string>('');

  // Load project floors
  useEffect(() => {
    if (isOpen && projectId) {
      getProjectFloors(projectId)
        .then((data) => setFloors(data || []))
        .catch(() => setFloors([]));
    }
  }, [isOpen, projectId]);

  const fetchPreviewPanes = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingPanes(true);
    try {
      const data = await previewProjectGlassPanes(projectId, {
        productionOrderId,
        defaultUnitPrice: 0,
        floorId: selectedFloorId,
      });

      // Filter by glass type if selected
      const filteredData = filterGlassType
        ? data.filter((item) => item.glassType === filterGlassType)
        : data;

      const initialPanes: EditablePaneItem[] = filteredData.map((item, idx) => ({
        tempId: `preview_${idx}_${Date.now()}`,
        positionId: item.positionId,
        positionCode: item.positionCode,
        doorName: item.doorName,
        sourcePositionRevision: item.sourcePositionRevision,
        paneSource: 'door',
        manualReason: null,
        paneLabel: item.paneLabel || `Ô kính ${idx + 1}`,
        widthMm: item.widthMm,
        heightMm: item.heightMm,
        glassType: item.glassType,
        grindType: item.grindType || 'grind_edge',
        unitPrice: 0,
        isMeasured: item.isMeasured !== false,
      }));

      const doorMap = new Map<number, DoorOption>();
      for (const item of filteredData) {
        if (item.positionId && !doorMap.has(item.positionId)) {
          doorMap.set(item.positionId, {
            id: item.positionId,
            code: item.positionCode || `Cửa #${item.positionId}`,
            name: item.doorName,
            isMeasured: item.isMeasured !== false,
          });
        }
      }

      setPanes(initialPanes);
      setKnownDoors(Array.from(doorMap.values()));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Không thể bóc tách ô kính tự động');
      setPanes([]);
    } finally {
      setIsLoadingPanes(false);
    }
  }, [projectId, productionOrderId, selectedFloorId, filterGlassType]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchPreviewPanes();
    } else if (!isOpen) {
      setPanes([]);
      setOrderNote('');
      setExpectedDate('');
      setSelectedFloorId(undefined);
      setFilterGlassType('');
    }
  }, [isOpen, projectId, productionOrderId, fetchPreviewPanes]);

  // Unique glass types extracted from all available panes or known doors for filter dropdown
  const availableGlassTypes = useMemo(() => {
    const set = new Set<string>();
    for (const p of panes) {
      if (p.glassType) set.add(p.glassType);
    }
    return Array.from(set);
  }, [panes]);

  const summary = useMemo(() => {
    let manualCount = 0;
    let unmeasuredCount = 0;
    let totalArea = 0;

    for (const p of panes) {
      const area = (p.widthMm * p.heightMm) / 1_000_000.0;
      totalArea += area;
      if (p.paneSource === 'manual' || !p.positionId) manualCount++;
      else if (p.isMeasured === false) unmeasuredCount++;
    }

    return {
      totalPanes: panes.length,
      manualCount,
      unmeasuredCount,
      totalArea: Number(totalArea.toFixed(3)),
    };
  }, [panes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('Dự án không hợp lệ');
      return;
    }
    if (panes.length === 0) {
      toast.error('Đơn đặt kính cần có ít nhất 1 tấm kính');
      return;
    }

    const unmeasuredPanes = panes.filter(
      (p) => (p.paneSource === 'door' || p.positionId) && p.isMeasured === false,
    );
    if (unmeasuredPanes.length > 0) {
      const codes = Array.from(new Set(unmeasuredPanes.map((p) => p.positionCode || 'N/A'))).join(', ');
      toast.error(
        `Không thể tạo đơn kính: Các cửa [${codes}] chưa được khảo sát đo ô chờ thực tế (chưa có kích thước chuẩn)!`,
      );
      return;
    }

    const invalidManualPanes = panes.filter(
      (p) =>
        (p.paneSource === 'manual' || !p.positionId) &&
        (!p.manualReason || !p.paneLabel || p.paneLabel.trim().length < 2),
    );
    if (invalidManualPanes.length > 0) {
      toast.error(
        'Ô kính lẻ bắt buộc phải chọn Lý do đặt kính và nhập Ký hiệu/nhãn tấm kính (ít nhất 2 ký tự)!',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createProjectGlassOrder(projectId, {
        supplierId: selectedSupplierId,
        productionOrderId,
        expectedDate: expectedDate || undefined,
        note: orderNote.trim() || undefined,
        items: panes.map((p) => {
          const isManual = p.paneSource === 'manual' || !p.positionId;
          return {
            positionId: isManual ? null : p.positionId,
            sourcePositionRevision: isManual ? null : (p.sourcePositionRevision ?? 1),
            manualReason: isManual ? (p.manualReason || 'spare') : undefined,
            paneLabel: p.paneLabel,
            widthMm: p.widthMm,
            heightMm: p.heightMm,
            glassType: p.glassType,
            grindType: p.grindType,
            unitPrice: 0,
          };
        }),
      });

      toast.success('Đã lập đơn đặt kính thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || 'Lỗi tạo đơn đặt kính');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerNode = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
        <span>
          Số tấm: <b className="text-emerald-700">{summary.totalPanes}</b>
          {summary.manualCount > 0 && (
            <span className="text-amber-600 font-normal ml-1">({summary.manualCount} kính lẻ)</span>
          )}
        </span>
        {summary.unmeasuredCount > 0 && (
          <span className="text-red-600 font-semibold">
            ⚠️ {summary.unmeasuredCount} tấm chưa đo ô chờ
          </span>
        )}
        <span>
          Tổng diện tích: <b className="text-emerald-700">{summary.totalArea} m²</b>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          type="submit"
          form="glass-order-form"
          variant="primary"
          size="sm"
          disabled={isSubmitting || panes.length === 0 || summary.unmeasuredCount > 0}
        >
          {isSubmitting ? 'Đang Xử Lý...' : 'Tạo Đơn Đặt Kính'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lập Đơn Đặt Kính Tôi Nhà Máy"
      size="xl"
      footer={footerNode}
    >
      <form
        id="glass-order-form"
        onSubmit={handleSubmit}
        className="flex flex-col h-full md:h-[84vh] space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Lọc Theo Tầng
            </label>
            <Select
              value={selectedFloorId ? String(selectedFloorId) : ''}
              onChange={(e) => setSelectedFloorId(e.target.value ? Number(e.target.value) : undefined)}
              options={[
                { value: '', label: '— Tất cả các tầng —' },
                ...floors.map((f) => ({
                  value: String(f.id),
                  label: f.name,
                })),
              ]}
              className="text-xs h-8"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Lọc Loại Kính
            </label>
            <Select
              value={filterGlassType}
              onChange={(e) => setFilterGlassType(e.target.value)}
              options={[
                { value: '', label: '— Tất cả loại kính —' },
                ...availableGlassTypes.map((gt) => ({
                  value: gt,
                  label: gt,
                })),
              ]}
              className="text-xs h-8"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ngày Hẹn Giao Kính
            </label>
            <Input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ghi Chú Đơn
            </label>
            <Input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="VD: Giao trước 10h, kèm nẹp..."
              className="text-xs h-8"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <GlassOrderPanesEditor
            panes={panes}
            onChange={setPanes}
            doorOptions={knownDoors}
            isLoading={isLoadingPanes}
          />
        </div>
      </form>
    </Modal>
  );
}
