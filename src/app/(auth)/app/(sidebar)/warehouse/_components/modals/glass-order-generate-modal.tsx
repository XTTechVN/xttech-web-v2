'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Select } from '@/components';
import { WarehouseSupplier } from '@/types';
import { previewProjectGlassPanes, createProjectGlassOrder } from '@/actions';
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
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(
    glassSuppliers[0]?.id,
  );
  const [defaultUnitPrice, setDefaultUnitPrice] = useState('350000');
  const [expectedDate, setExpectedDate] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [panes, setPanes] = useState<EditablePaneItem[]>([]);
  const [knownDoors, setKnownDoors] = useState<DoorOption[]>([]);
  const [isLoadingPanes, setIsLoadingPanes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && glassSuppliers.length > 0) {
      if (!selectedSupplierId || !glassSuppliers.some((s) => s.id === selectedSupplierId)) {
        setSelectedSupplierId(glassSuppliers[0].id);
      }
    }
  }, [isOpen, glassSuppliers, selectedSupplierId]);

  const defaultPriceRef = useRef(defaultUnitPrice);
  defaultPriceRef.current = defaultUnitPrice;

  const fetchPreviewPanes = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingPanes(true);
    try {
      const price = Number(defaultPriceRef.current) || 350000;
      const data = await previewProjectGlassPanes(projectId, {
        productionOrderId,
        defaultUnitPrice: price,
      });

      const initialPanes: EditablePaneItem[] = data.map((item, idx) => ({
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
        unitPrice: item.unitPrice || price,
        isMeasured: item.isMeasured !== false,
      }));

      const doorMap = new Map<number, DoorOption>();
      for (const item of data) {
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
  }, [projectId, productionOrderId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchPreviewPanes();
    } else if (!isOpen) {
      setPanes([]);
      setOrderNote('');
      setExpectedDate('');
    }
  }, [isOpen, projectId, productionOrderId, fetchPreviewPanes]);

  const handleApplyUnitPriceToAll = () => {
    const price = Number(defaultUnitPrice) || 0;
    setPanes((prev) => prev.map((p) => ({ ...p, unitPrice: price })));
    toast.success(`Đã áp dụng đơn giá ${price.toLocaleString('vi-VN')} đ/m² cho toàn bộ ô kính`);
  };

  const summary = useMemo(() => {
    let manualCount = 0;
    let unmeasuredCount = 0;
    let totalArea = 0;
    let totalAmount = 0;

    for (const p of panes) {
      const area = (p.widthMm * p.heightMm) / 1_000_000.0;
      totalArea += area;
      totalAmount += Math.round(area * p.unitPrice);
      if (p.paneSource === 'manual' || !p.positionId) manualCount++;
      else if (p.isMeasured === false) unmeasuredCount++;
    }

    return {
      totalPanes: panes.length,
      manualCount,
      unmeasuredCount,
      totalArea: Number(totalArea.toFixed(3)),
      totalAmount,
    };
  }, [panes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedSupplierId) {
      toast.error('Vui lòng chọn nhà máy tôi kính');
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
            unitPrice: p.unitPrice,
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
          Diện tích: <b className="text-emerald-700">{summary.totalArea} m²</b>
        </span>
        <span>
          Tổng tiền: <b className="text-emerald-700">{summary.totalAmount.toLocaleString('vi-VN')} đ</b>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nhà Máy Tôi Kính <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedSupplierId || ''}
              onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
              options={glassSuppliers.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.phone || 'Chưa có SĐT'})`,
              }))}
              required
              className="text-xs h-8"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Đơn Giá Bình Quân (đ/m²)
            </label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={defaultUnitPrice}
                onChange={(e) => setDefaultUnitPrice(e.target.value)}
                step="1000"
                className="text-xs h-8"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyUnitPriceToAll}
                className="text-xs h-8 px-2 whitespace-nowrap text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              >
                Áp dụng
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ngày Hẹn Giao Dự Kiến
            </label>
            <Input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ghi Chú Đơn Hàng (Nếu có)
            </label>
            <Input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="VD: Giao hàng vào giờ hành chính, kèm nẹp kính..."
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
