'use client';

import React from 'react';
import { Button, Input, Modal, Select } from '@/components';
import { WarehouseSupplier } from '@/types';
import { GlassOrderPanesEditor } from './glass-order-panes-editor';
import { useGlassOrderGenerate } from './use-glass-order-generate';

export interface GlassOrderGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  productionOrderId?: number;
  glassSuppliers?: WarehouseSupplier[];
  onSuccess: () => void;
}

function GlassOrderGenerateModalBody({
  onClose,
  projectId,
  productionOrderId,
  onSuccess,
}: Omit<GlassOrderGenerateModalProps, 'isOpen' | 'glassSuppliers'>) {
  const {
    expectedDate,
    setExpectedDate,
    orderNote,
    setOrderNote,
    panes,
    setPanes,
    knownDoors,
    floors,
    selectedFloorId,
    handleFloorChange,
    filterGlassType,
    handleFilterGlassChange,
    availableGlassTypes,
    glassCatalogNames,
    defaultGlassType,
    summary,
    isLoadingPanes,
    isSubmitting,
    handleSubmit,
  } = useGlassOrderGenerate({ projectId, productionOrderId, onSuccess, onClose });

  const footerNode = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
        <span>
          Số tấm: <b className="font-mono tabular-nums text-primary">{summary.totalPanes}</b>
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
          Tổng diện tích: <b className="font-mono tabular-nums text-primary">{summary.totalArea} m²</b>
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
      isOpen
      onClose={onClose}
      title="Lập Đơn Đặt Kính Tôi Nhà Máy"
      size="xl"
      footer={footerNode}
    >
      <form id="glass-order-form" onSubmit={handleSubmit} className="flex flex-col h-full md:h-[84vh] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Lọc Theo Tầng
            </label>
            <Select
              value={selectedFloorId ? String(selectedFloorId) : ''}
              onChange={(e) => handleFloorChange(e.target.value ? Number(e.target.value) : undefined)}
              options={[
                { value: '', label: '— Tất cả các tầng —' },
                ...floors.map((f) => ({ value: String(f.id), label: f.name })),
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
              onChange={(e) => handleFilterGlassChange(e.target.value)}
              options={[
                { value: '', label: '— Tất cả loại kính —' },
                ...availableGlassTypes.map((gt) => ({ value: gt, label: gt })),
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
            glassOptions={glassCatalogNames}
            defaultGlassType={defaultGlassType}
            isLoading={isLoadingPanes}
          />
        </div>
      </form>
    </Modal>
  );
}

export function GlassOrderGenerateModal({
  isOpen,
  onClose,
  projectId,
  productionOrderId,
  onSuccess,
}: GlassOrderGenerateModalProps) {
  if (!isOpen) return null;
  return (
    <GlassOrderGenerateModalBody
      key={`${projectId ?? 0}-${productionOrderId ?? 0}`}
      onClose={onClose}
      projectId={projectId}
      productionOrderId={productionOrderId}
      onSuccess={onSuccess}
    />
  );
}
