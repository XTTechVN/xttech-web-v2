'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getProjectFloors,
  createProjectFloor,
  deleteProjectFloor,
  getProjectPositions,
  createProjectPosition,
  deleteProjectPosition,
  duplicateProjectPosition,
  measureProjectPosition,
  bulkCreateProjectPositions,
} from '@/actions';
import { Button, Input, Modal, Badge } from '@/components';
import { DOOR_STATUS_MAP } from '@/config';
import type { ProjectDoorPosition, ProjectFloor, MeasurePositionResponse, Door } from '@/types';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import {
  Plus,
  Layers,
  Copy,
  Trash2,
  Ruler,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  FolderOpen,
  LayoutGrid,
  Edit,
  Building,
  ImageOff,
} from 'lucide-react';
import { TemplateDoorPickerModal } from './template-door-picker-modal';
import { DoorThumbnail } from '../../configuration/door-templates/_components/door-thumbnail';

interface ProjectFloorsPositionsProps {
  projectId: number;
}

export function ProjectFloorsPositions({ projectId }: ProjectFloorsPositionsProps) {
  const [selectedFloorId, setSelectedFloorId] = useState<number | 'all'>('all');
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');

  // Template Picker Modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Bulk create modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFloorId, setBulkFloorId] = useState<number | ''>('');
  const [baseCode, setBaseCode] = useState('D1');
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(2200);
  const [doorType, setDoorType] = useState('door');
  const [description, setDescription] = useState('');

  // Measure modal state
  const [measuringPos, setMeasuringPos] = useState<ProjectDoorPosition | null>(null);
  const [actualWidth, setActualWidth] = useState(0);
  const [actualHeight, setActualHeight] = useState(0);
  const [measureNote, setMeasureNote] = useState('');
  const [measureWarning, setMeasureWarning] = useState<string | null>(null);

  // QR Modal state
  const [qrModalPos, setQrModalPos] = useState<ProjectDoorPosition | null>(null);

  // Queries
  const { data: floors = [], isLoading: isLoadingFloors } = useQuery({
    queryKey: ['project_floors', projectId],
    queryFn: () => getProjectFloors(projectId),
    enabled: !!projectId,
  });

  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['project_positions', projectId, selectedFloorId],
    queryFn: () =>
      getProjectPositions(projectId, {
        floorId: selectedFloorId === 'all' ? undefined : selectedFloorId,
        limit: 100,
      }),
    enabled: !!projectId,
  });

  const positions = positionsData?.items || [];

  // Floor Mutations
  const { mutate: createFloorMutate, isPending: isCreatingFloor } = useMutation({
    mutationFn: () => createProjectFloor(projectId, { name: newFloorName.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_floors', projectId] });
      toast.success('Thêm tầng thành công');
      setNewFloorName('');
      setIsFloorModalOpen(false);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm tầng'),
  });

  const { mutate: deleteFloorMutate } = useMutation({
    mutationFn: (floorId: number) => deleteProjectFloor(projectId, floorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_floors', projectId] });
      toast.success('Xóa tầng thành công');
      if (selectedFloorId !== 'all') setSelectedFloorId('all');
    },
    onError: (err) => showErrorToast(err, 'Không thể xóa tầng (có thể đang có cửa)'),
  });

  // Create Position from Template
  const { mutate: addDoorFromTemplateMutate } = useMutation({
    mutationFn: (door: Door) => {
      const sc = (door.systemConfig || {}) as Record<string, any>;
      const targetFloorId =
        typeof selectedFloorId === 'number'
          ? selectedFloorId
          : floors[0]?.id;

      // Sinh mã code cửa tiếp theo
      const nextIndex = positions.length + 1;
      const code = `${door.code || 'D'}-${nextIndex.toString().padStart(2, '0')}`;

      return createProjectPosition(projectId, {
        projectId,
        code,
        floorId: targetFloorId,
        templateDoorId: door.id,
        description: door.name,
        doorType: door.type || 'door',
        width: Number(sc.w) || 1200,
        height: Number(sc.h) || 2200,
        brandId: door.doorSeries?.brandId || undefined,
        doorSeriesId: door.doorSeriesId || undefined,
        systemConfig: sc,
      });
    },
    onSuccess: (newPos) => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã thêm cửa ${newPos.code} từ mẫu thiết kế`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi thêm cửa từ mẫu'),
  });

  // Bulk Create
  const { mutate: bulkCreateMutate, isPending: isBulkCreating } = useMutation({
    mutationFn: () =>
      bulkCreateProjectPositions(projectId, {
        projectId,
        floorId: bulkFloorId ? Number(bulkFloorId) : undefined,
        baseCode: baseCode.trim(),
        quantity: Number(quantity),
        width: Number(width),
        height: Number(height),
        doorType,
        description: description.trim() || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã sinh nhanh ${data.length} vị trí cửa`);
      setIsBulkModalOpen(false);
    },
    onError: (err) => showErrorToast(err, 'Lỗi sinh cửa hàng loạt'),
  });

  const { mutate: duplicateMutate } = useMutation({
    mutationFn: (pos: ProjectDoorPosition) =>
      duplicateProjectPosition(projectId, pos.id, {
        newCode: `${pos.code}-COPY`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      toast.success('Nhân bản vị trí cửa thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi nhân bản'),
  });

  const { mutate: deletePositionMutate } = useMutation({
    mutationFn: (posId: number) => deleteProjectPosition(projectId, posId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      toast.success('Xóa vị trí cửa thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi xóa vị trí cửa'),
  });

  const { mutate: measureMutate, isPending: isMeasuring } = useMutation({
    mutationFn: () =>
      measureProjectPosition(projectId, measuringPos!.id, {
        width: Number(actualWidth),
        height: Number(actualHeight),
        measureNote: measureNote || undefined,
      }),
    onSuccess: (res: MeasurePositionResponse) => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      if (res.toleranceExceeded && res.warningMessage) {
        setMeasureWarning(res.warningMessage);
        toast.error('Dung sai vượt ngưỡng hợp đồng!', { duration: 5000 });
      } else {
        toast.success('Đã lưu số đo thực tế');
        setMeasuringPos(null);
      }
    },
    onError: (err) => showErrorToast(err, 'Lỗi lưu kích thước đo đạc'),
  });

  // Lấy tên tầng hiện tại
  const currentFloorName =
    selectedFloorId === 'all'
      ? 'Tất cả các tầng'
      : floors.find((f) => f.id === selectedFloorId)?.name || 'Tầng đã chọn';

  return (
    <div className="flex flex-col md:flex-row items-start gap-4">
      {/* ========================================================================= */}
      {/* SIDEBAR BÊN TRÁI: QUẢN LÝ TẦNG (WINDOVA STYLE) */}
      {/* ========================================================================= */}
      <div className="w-full md:w-56 shrink-0 bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building size={13} className="text-primary" /> PHÂN LOẠI TẦNG
          </span>
          <button
            type="button"
            onClick={() => setIsFloorModalOpen(true)}
            className="text-xs text-primary hover:text-primary/80 font-bold inline-flex items-center gap-0.5 cursor-pointer"
          >
            <Plus size={13} /> Thêm
          </button>
        </div>

        <div className="space-y-1">
          {/* Mục Tất Cả */}
          <button
            type="button"
            onClick={() => setSelectedFloorId('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
              selectedFloorId === 'all'
                ? 'bg-amber-50/80 text-amber-900 border border-amber-200/70 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Tất cả
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {positions.length}
            </span>
          </button>

          {/* Danh sách từng tầng */}
          {isLoadingFloors ? (
            <p className="text-[11px] text-slate-400 py-3 text-center">Đang tải...</p>
          ) : (
            floors.map((fl) => {
              const isSelected = selectedFloorId === fl.id;
              return (
                <div
                  key={fl.id}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 text-amber-900 border border-amber-200/70 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => setSelectedFloorId(fl.id)}
                >
                  <span className="truncate flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary" />
                    {fl.name}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn xóa tầng ${fl.name}?`))
                          deleteFloorMutate(fl.id);
                      }}
                      title="Xóa tầng"
                      className="p-1 hover:text-red-500 rounded text-slate-400 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KHU VỰC BÊN PHẢI: HIỂN THỊ CỬA THEO TẦNG (GRID THẺ CỬA WINDOVA) */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{positions.length} vị trí cửa</span>
              <span className="text-xs text-slate-400 font-normal">
                ({currentFloorName})
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => {
                setBulkFloorId(
                  typeof selectedFloorId === 'number'
                    ? selectedFloorId
                    : floors[0]?.id || ''
                );
                setIsBulkModalOpen(true);
              }}
              className="h-8 text-xs font-semibold"
            >
              Sinh nhanh (Bulk)
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<LayoutGrid size={14} />}
              onClick={() => setIsPickerOpen(true)}
              className="h-8 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white"
            >
              + Mẫu cửa
            </Button>
          </div>
        </div>

        {/* Nội dung danh sách cửa: Card View dạng Windova */}
        {isLoadingPositions ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Đang tải dữ liệu cửa...
          </div>
        ) : positions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-slate-50 text-slate-300 rounded-full">
              <FolderOpen size={36} />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Chưa có vị trí cửa nào trong {currentFloorName.toLowerCase()}.
            </p>
            <Button
              size="sm"
              leftIcon={<LayoutGrid size={14} />}
              onClick={() => setIsPickerOpen(true)}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white"
            >
              Chọn Mẫu Cửa Ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {positions.map((pos, idx) => {
              const sc = (pos.systemConfig || {}) as Record<string, any>;
              const hasSvg = !!sc.rootCell;
              const statusConfig = DOOR_STATUS_MAP[pos.status] || {
                label: pos.status,
                variant: 'default',
              };

              return (
                <div
                  key={pos.id}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Bar: Số thứ tự / Mã & Trạng thái */}
                  <div className="p-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-700 text-white font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {pos.code}
                      </span>
                    </div>
                    <Badge variant={statusConfig.variant} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Bản vẽ SVG CAD Viewport dạng Windova */}
                  <div className="aspect-[4/3] w-full p-2 bg-slate-50/40 flex items-center justify-center overflow-hidden relative">
                    {hasSvg ? (
                      <div className="w-full h-full p-1 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
                        <DoorThumbnail
                          systemConfig={sc}
                          hideDimensions={false}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300">
                        <ImageOff size={26} />
                        <span className="text-[10px]">Chưa có bản vẽ CAD</span>
                      </div>
                    )}
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="p-3 border-t border-slate-100 space-y-1.5 bg-white">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {pos.code}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate">
                          {pos.description || (pos.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi')}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-500 shrink-0 font-mono">
                        1x
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                      <span>
                        {pos.width} × {pos.height} mm
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {(pos.areaM2 ?? 0).toFixed(2)} m²
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{pos.floor?.name || 'Tầng 1'}</span>
                      {pos.status !== 'draft' ? (
                        <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                          <CheckCircle2 size={11} /> Đã đo ô chờ
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium inline-flex items-center gap-0.5">
                          <AlertTriangle size={11} /> Chưa đo ô chờ
                        </span>
                      )}
                    </div>

                    {/* Action buttons hàng dưới giống Windova */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Đo đạc ô chờ thực tế"
                        onClick={() => {
                          setMeasuringPos(pos);
                          setActualWidth(pos.width);
                          setActualHeight(pos.height);
                          setMeasureNote('');
                          setMeasureWarning(null);
                        }}
                        className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/70 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit size={12} className="text-amber-600" />
                        <span>Đo đạc</span>
                      </button>

                      <button
                        type="button"
                        title="Xem mã QR"
                        onClick={() => setQrModalPos(pos)}
                        className="p-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md cursor-pointer transition-colors"
                      >
                        <QrCode size={13} />
                      </button>

                      <button
                        type="button"
                        title="Nhân bản bộ cửa"
                        onClick={() => duplicateMutate(pos)}
                        className="p-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md cursor-pointer transition-colors"
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        type="button"
                        title="Xóa bộ cửa"
                        onClick={() => {
                          if (confirm(`Xóa bộ cửa ${pos.code}?`))
                            deletePositionMutate(pos.id);
                        }}
                        className="p-1.5 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS: MẪU CỬA, THÊM TẦNG, SINH NHANH, ĐO ĐẠC, QR */}
      {/* ========================================================================= */}
      <TemplateDoorPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectDoor={(door) => addDoorFromTemplateMutate(door)}
      />

      {/* Modal Thêm Tầng */}
      <Modal
        isOpen={isFloorModalOpen}
        onClose={() => setIsFloorModalOpen(false)}
        title="Thêm tầng / phân khu mới"
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <Input
            label="Tên tầng / phân khu *"
            placeholder="Ví dụ: Tầng 1, Tầng 2, Tum..."
            value={newFloorName}
            onChange={(e) => setNewFloorName(e.target.value)}
            fullWidth
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsFloorModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newFloorName.trim() || isCreatingFloor}
              loading={isCreatingFloor}
              onClick={() => createFloorMutate()}
            >
              Lưu tầng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Sinh cửa nhanh */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Sinh cửa nhanh theo số lượng (Bulk)"
        className="max-w-md w-full"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn tầng bố trí *
            </label>
            <select
              value={bulkFloorId}
              onChange={(e) => setBulkFloorId(Number(e.target.value) || '')}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="">-- Chưa chọn tầng --</option>
              {floors.map((fl) => (
                <option key={fl.id} value={fl.id}>
                  {fl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tiền tố mã (Code) *"
              value={baseCode}
              onChange={(e) => setBaseCode(e.target.value)}
              placeholder="VD: D1"
              fullWidth
            />
            <Input
              type="number"
              label="Số lượng bộ cửa *"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={100}
              fullWidth
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Chiều rộng (mm) *"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              fullWidth
            />
            <Input
              type="number"
              label="Chiều cao (mm) *"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              fullWidth
            />
          </div>

          <Input
            label="Mô tả / vị trí"
            placeholder="VD: Cửa đi phòng khách"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!baseCode.trim() || quantity <= 0 || isBulkCreating}
              loading={isBulkCreating}
              onClick={() => bulkCreateMutate()}
            >
              Sinh {quantity} bộ cửa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Đo đạc ô chờ */}
      <Modal
        isOpen={!!measuringPos}
        onClose={() => setMeasuringPos(null)}
        title={`Khảo sát đo ô chờ thực tế - ${measuringPos?.code}`}
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <span className="text-slate-400 block font-semibold">
              Kích thước thiết kế ban đầu:
            </span>
            <span className="font-mono text-slate-800 font-bold text-sm block">
              {measuringPos?.width} × {measuringPos?.height} mm
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
            <Button variant="outline" size="sm" onClick={() => setMeasuringPos(null)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={16} />}
              disabled={actualWidth <= 0 || actualHeight <= 0 || isMeasuring}
              loading={isMeasuring}
              onClick={() => measureMutate()}
            >
              Xác nhận số đo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal QR Code */}
      <Modal
        isOpen={!!qrModalPos}
        onClose={() => setQrModalPos(null)}
        title={`Mã QR Hiện trường - ${qrModalPos?.code}`}
        className="max-w-xs w-full text-center"
      >
        <div className="space-y-4 py-2 flex flex-col items-center">
          <div className="p-4 bg-slate-100 rounded-xl inline-block border border-slate-200">
            <QrCode size={120} className="text-slate-800" />
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <span className="font-mono font-bold text-slate-800 block text-sm">
              Token: {qrModalPos?.qrCodeToken?.slice(0, 16)}...
            </span>
            <span>Mã QR công khai dán trên tem cửa để thợ/giám sát quét kiểm tra</span>
          </div>
          <Button variant="outline" size="sm" fullWidth onClick={() => setQrModalPos(null)}>
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
}
