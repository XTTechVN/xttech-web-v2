'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getProductionOrders,
  createProductionOrder,
  cancelProductionOrder,
  checkProductionOrderItems,
  getProjectProgressMatrix,
  getProjectPositions,
} from '@/actions';
import { Button, Input, Modal, Badge } from '@/components';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import type {
  ProductionOrder,
  ProjectProgressMatrix,
  ProjectDoorPosition,
} from '@/types';
import {
  Factory,
  Plus,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Clock,
  Printer,
  Calendar,
  Layers,
} from 'lucide-react';

interface ProjectProductionProgressProps {
  projectId: number;
}

export function ProjectProductionProgress({ projectId }: ProjectProductionProgressProps) {
  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderName, setOrderName] = useState('Lệnh sản xuất đợt 1');
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  // KCS Checking State
  const [checkingOrder, setCheckingOrder] = useState<ProductionOrder | null>(null);
  const [kcsNotes, setKcsNotes] = useState('');

  // Queries
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['production_orders', projectId],
    queryFn: () => getProductionOrders(projectId),
    enabled: !!projectId,
  });

  const { data: progressMatrix, isLoading: isLoadingMatrix } = useQuery<ProjectProgressMatrix>({
    queryKey: ['progress_matrix', projectId],
    queryFn: () => getProjectProgressMatrix(projectId),
    enabled: !!projectId,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['project_positions', projectId, 'all'],
    queryFn: () => getProjectPositions(projectId, { limit: 100 }),
    enabled: !!projectId,
  });

  const orders: ProductionOrder[] = ordersData?.items || [];
  const allPositions: ProjectDoorPosition[] = positionsData?.items || [];

  // Mutations
  const { mutate: createOrderMutate, isPending: isCreatingOrder } = useMutation({
    mutationFn: () => {
      const unmeasured = allPositions.filter(
        (p) => selectedPositionIds.includes(p.id) && !p.isMeasured
      );
      if (unmeasured.length > 0) {
        const codes = unmeasured.map((u) => u.code).join(', ');
        throw new Error(
          `Bộ cửa [${codes}] chưa chốt số đo thực tế. Vui lòng đo đạc trước khi đưa vào sản xuất!`
        );
      }
      return createProductionOrder(projectId, {
        name: orderName.trim(),
        positionIds: selectedPositionIds,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['production_orders', projectId] });
      queryClient.invalidateQueries({ queryKey: ['progress_matrix', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      toast.success(`Đã lập lệnh sản xuất ${res.code}`);
      setIsOrderModalOpen(false);
      setSelectedPositionIds([]);
    },
    onError: (err) => showErrorToast(err, 'Lỗi lập lệnh sản xuất'),
  });

  const { mutate: cancelOrderMutate } = useMutation({
    mutationFn: (orderId: number) => cancelProductionOrder(projectId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_orders', projectId] });
      queryClient.invalidateQueries({ queryKey: ['progress_matrix', projectId] });
      toast.success('Đã hủy lệnh sản xuất');
    },
    onError: (err) => showErrorToast(err, 'Lỗi hủy lệnh'),
  });

  const { mutate: checkKcsMutate, isPending: isCheckingKcs } = useMutation({
    mutationFn: ({ orderId, itemIds }: { orderId: number; itemIds: number[] }) =>
      checkProductionOrderItems(projectId, orderId, {
        completedItemIds: itemIds,
        kcsNotes: kcsNotes.trim() || undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['production_orders', projectId] });
      queryClient.invalidateQueries({ queryKey: ['progress_matrix', projectId] });
      toast.success(
        res.status === 'completed'
          ? 'Đã nghiệm thu KCS 100% - Lệnh sản xuất tự động hoàn thành!'
          : 'Đã cập nhật KCS bộ cửa',
      );
      setCheckingOrder(null);
    },
    onError: (err) => showErrorToast(err, 'Lỗi nghiệm thu KCS'),
  });

  const toggleSelectPosition = (pos: ProjectDoorPosition) => {
    if (!pos.isMeasured) {
      toast.error(
        `Bộ cửa ${pos.code} chưa chốt số đo thực tế! Không thể đưa vào Lệnh sản xuất.`,
        { duration: 4000 }
      );
      return;
    }
    setSelectedPositionIds((prev) =>
      prev.includes(pos.id) ? prev.filter((p) => p !== pos.id) : [...prev, pos.id],
    );
  };

  return (
    <div className="space-y-6">
      {/* Widget Ma trận tiến độ tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">
            TỔNG SỐ BỘ CỬA
          </span>
          <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">
            {progressMatrix?.totalPositions ?? allPositions.length} bộ
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Quy mô công trình</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-bold text-primary block uppercase">
            TIẾN ĐỘ SẢN XUẤT (XƯỞNG)
          </span>
          <span className="text-2xl font-bold font-mono text-primary mt-1 block">
            {(progressMatrix?.factoryProgressPercent ?? 0).toFixed(1)}%
          </span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressMatrix?.factoryProgressPercent ?? 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 block uppercase">
            TIẾN ĐỘ TỔNG THỂ (M² TRỌNG SỐ)
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
            {(progressMatrix?.overallProgressPercent ?? 0).toFixed(1)}%
          </span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressMatrix?.overallProgressPercent ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Danh sách Lệnh sản xuất */}
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Factory size={15} className="text-primary" /> Lệnh sản xuất & In Thẻ cắt A4 ({orders.length})
            </h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Gom cửa theo đợt thi công, đóng băng thẻ cắt mBOM và nghiệm thu KCS từng bộ cửa
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsOrderModalOpen(true)}
            className="h-8 text-xs font-semibold"
          >
            Lập Lệnh sản xuất mới
          </Button>
        </div>

        {isLoadingOrders ? (
          <p className="text-xs text-slate-400 text-center py-6">Đang tải lệnh sản xuất...</p>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có lệnh sản xuất nào được kích hoạt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Mã Lệnh</th>
                  <th className="py-2.5 px-3">Tên đợt</th>
                  <th className="py-2.5 px-3">Số cửa</th>
                  <th className="py-2.5 px-3">Tiến độ KCS</th>
                  <th className="py-2.5 px-3">Thời hạn</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-primary">{ord.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{ord.name}</td>
                    <td className="py-3 px-3 text-slate-600 font-semibold">
                      {ord.completedItems} / {ord.totalItems} bộ
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] text-slate-700">
                          {(ord.progressPercent ?? 0).toFixed(0)}%
                        </span>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${ord.progressPercent ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {ord.startDate ? new Date(ord.startDate).toLocaleDateString('vi-VN') : '—'} ➔{' '}
                      {ord.dueDate ? new Date(ord.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          ord.status === 'completed'
                            ? 'success'
                            : ord.status === 'in_progress'
                            ? 'primary'
                            : ord.status === 'cancelled'
                            ? 'danger'
                            : 'default'
                        }
                        size="sm"
                      >
                        {ord.status === 'completed'
                          ? 'Hoàn tất KCS'
                          : ord.status === 'in_progress'
                          ? 'Đang gia công'
                          : ord.status === 'cancelled'
                          ? 'Đã hủy'
                          : 'Chờ xưởng'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status !== 'completed' && ord.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-2"
                            onClick={() => {
                              setCheckingOrder(ord);
                              setKcsNotes('');
                            }}
                          >
                            Nghiệm thu KCS
                          </Button>
                        )}
                        <button
                          type="button"
                          title="In Thẻ cắt A4 xưởng"
                          onClick={() =>
                            window.open(
                              `/api/v1/projects/${projectId}/production-orders/${ord.id}/sheets`,
                              '_blank',
                            )
                          }
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Printer size={14} />
                        </button>
                        {ord.status !== 'completed' && ord.status !== 'cancelled' && (
                          <button
                            type="button"
                            title="Hủy lệnh"
                            onClick={() => {
                              if (confirm(`Hủy lệnh sản xuất ${ord.code}?`))
                                cancelOrderMutate(ord.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bảng Ma Trận Tiến Độ Chi Tiết Từng Cửa Theo Tầng */}
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <FileSpreadsheet size={15} className="text-primary" /> Bảng Ma trận tiến độ thi công từng bộ cửa
        </h3>

        {isLoadingMatrix ? (
          <p className="text-xs text-slate-400 text-center py-6">Đang tải ma trận tiến độ...</p>
        ) : !progressMatrix?.matrix || progressMatrix.matrix.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Chưa có dữ liệu ma trận tiến độ.
          </div>
        ) : (
          <div className="space-y-4">
            {progressMatrix.matrix.map((row) => (
              <div key={row.floorId} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  {row.floorName} ({row.positions.length} bộ cửa)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {row.positions.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex flex-col justify-between gap-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary text-xs">{p.code}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.areaM2?.toFixed(1)} m²
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 truncate">{p.name}</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lập Lệnh Sản Xuất */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Lập Lệnh sản xuất theo đợt thi công"
        className="max-w-lg w-full"
      >
        <div className="space-y-4">
          <Input
            label="Tên đợt sản xuất *"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Ngày bắt đầu"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
            <Input
              type="date"
              label="Hạn hoàn thành"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Chọn các bộ cửa đưa vào lệnh ({selectedPositionIds.length} đã chọn) *
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                (Chỉ chọn cửa đã chốt số đo)
              </span>
            </div>
            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1.5">
              {allPositions.map((pos) => {
                const isSelected = selectedPositionIds.includes(pos.id);
                const isMeasured = !!pos.isMeasured;

                if (!isMeasured) {
                  return (
                    <div
                      key={pos.id}
                      onClick={() => toggleSelectPosition(pos)}
                      title="Chưa chốt số đo thực tế - Không thể đưa vào lệnh sản xuất"
                      className="p-2 rounded flex items-center justify-between text-xs cursor-not-allowed bg-slate-50/70 border border-slate-100 opacity-60 text-slate-400 select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          disabled
                          checked={false}
                          className="rounded text-slate-300 cursor-not-allowed"
                        />
                        <span className="font-bold text-slate-500">{pos.code}</span>
                        <span className="truncate">
                          - {pos.description || (pos.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 font-medium">
                          Chờ đo thực tế
                        </span>
                        <span className="text-slate-400">
                          {pos.width}x{pos.height} mm
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={pos.id}
                    onClick={() => toggleSelectPosition(pos)}
                    className={`p-2 rounded flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30 text-primary font-semibold'
                        : 'hover:bg-slate-50 border border-slate-200/60 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-primary"
                      />
                      <span className="font-bold">{pos.code}</span>
                      <span className="truncate">
                        - {pos.description || (pos.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                        Đã chốt số đo
                      </span>
                      <span className="text-slate-500">
                        {pos.width}x{pos.height} mm
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsOrderModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!orderName.trim() || selectedPositionIds.length === 0 || isCreatingOrder}
              loading={isCreatingOrder}
              onClick={() => createOrderMutate()}
            >
              Tạo Lệnh ({selectedPositionIds.length} bộ)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nghiệm Thu KCS */}
      <Modal
        isOpen={!!checkingOrder}
        onClose={() => setCheckingOrder(null)}
        title={`Nghiệm thu KCS - ${checkingOrder?.code}`}
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
            <span className="font-bold text-slate-800 block">Đợt sản xuất: {checkingOrder?.name}</span>
            <span>Tổng số cửa: {checkingOrder?.totalItems} bộ. Đã KCS: {checkingOrder?.completedItems} bộ.</span>
          </div>

          <Input
            label="Ghi chú đánh giá chất lượng KCS"
            placeholder="VD: Mối ghép ép góc phẳng, keo silicon kín khít..."
            value={kcsNotes}
            onChange={(e) => setKcsNotes(e.target.value)}
            fullWidth
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setCheckingOrder(null)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={16} />}
              loading={isCheckingKcs}
              onClick={() =>
                checkKcsMutate({
                  orderId: checkingOrder!.id,
                  itemIds: (checkingOrder?.items || []).map((it) => it.id),
                })
              }
            >
              Nghiệm thu KCS Đạt 100%
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
