'use client';

import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, FileOutput, Printer, Recycle, Scissors, ShoppingCart } from 'lucide-react';
import { Badge, Button, Modal } from '@/components';
import { getWarehouseItems, getWarehouseSuppliers } from '@/actions';
import queryClient from '@/utils/query';
import type { CuttingPlan, ProductionOrder } from '@/types';
import { ReceiptFormModal } from '../../../../../warehouse/_components/modals';
import {
  buildShortagePurchaseItems,
  getPurchasableShortages,
} from '../../../../../warehouse/_utils/shortage-purchase';
import { CuttingBarStrip } from '../components/cutting-bar-strip';
import { CuttingShortagePanel } from '../components/cutting-shortage-panel';
import { useCuttingPlan, useOrderShortage } from '../hooks';
import { getReturnableBars, groupBarsByProfile, printCuttingPlan } from '../utils';

interface CuttingPlanModalProps {
  projectId: number;
  order: ProductionOrder | null;
  onClose: () => void;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/60 bg-slate-50 p-2.5">
      <span className="block text-[10px] font-bold uppercase text-slate-400">{label}</span>
      <span className="font-mono text-base font-bold text-slate-800">{value}</span>
    </div>
  );
}

function PlanSummary({ plan }: { plan: CuttingPlan }) {
  const { summary } = plan;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      <SummaryCard label="Tổng số cây" value={String(summary.totalBars)} />
      <SummaryCard label="Cây nguyên" value={String(summary.standardBars)} />
      <SummaryCard label="Dùng đoạn dư kho" value={String(summary.offcutBars)} />
      <SummaryCard label="Hao hụt" value={`${summary.wastePercent}%`} />
      <SummaryCard label="Đoạn cắt" value={String(summary.totalPieces)} />
    </div>
  );
}

export function CuttingPlanModal({ projectId, order, onClose }: CuttingPlanModalProps) {
  const orderId = order?.id ?? null;
  const cutting = useCuttingPlan(projectId, orderId);
  const [selectedBarIds, setSelectedBarIds] = useState<number[]>([]);
  const { plan } = cutting;

  const groups = useMemo(() => (plan ? groupBarsByProfile(plan.bars) : []), [plan]);
  const returnableBars = useMemo(() => (plan ? getReturnableBars(plan) : []), [plan]);

  const isOrderCompleted = order?.status === 'completed';
  const isOrderActive = order?.status === 'in_progress';
  const isIssued = plan?.status === 'issued';
  const canReturnOffcuts = isOrderCompleted && returnableBars.length > 0;
  const shouldCheckStock = !!plan && isOrderActive && !isIssued;
  const shortage = useOrderShortage(projectId, orderId, shouldCheckStock);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const { data: itemsData } = useQuery({
    queryKey: ['warehouse_items_for_receipt'],
    queryFn: () => getWarehouseItems({ limit: 200 }),
    enabled: isReceiptOpen,
  });
  const { data: suppliersData } = useQuery({
    queryKey: ['warehouse_suppliers_for_receipt'],
    queryFn: () => getWarehouseSuppliers({ limit: 100 }),
    enabled: isReceiptOpen,
  });

  const toggleBar = (barId: number) =>
    setSelectedBarIds((prev) =>
      prev.includes(barId) ? prev.filter((id) => id !== barId) : [...prev, barId],
    );

  const handleReturn = () =>
    cutting.returnOffcuts(selectedBarIds, { onSuccess: () => setSelectedBarIds([]) });

  const handleIssueOrOpenReceipt = () => {
    if (shortage.shortages.length > 0) {
      const validShortages = getPurchasableShortages(shortage.shortages);
      if (validShortages.length === 0) {
        toast.error('Tất cả mặt hàng thiếu hụt đều chưa được gán profile trong thiết kế cửa!');
        return;
      }
      const skippedCount = shortage.shortages.length - validShortages.length;
      if (skippedCount > 0) {
        toast(`Đã bỏ qua ${skippedCount} thanh nhôm chưa gán profile khi lập phiếu mua.`, {
          icon: '⚠️',
        });
      }
      toast('Kho chưa đủ vật tư, tự động mở phiếu nhập kho mua bù cho lệnh này.', { icon: '📦' });
      setIsReceiptOpen(true);
      return;
    }
    cutting.issuePlan();
  };

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`Tối ưu thanh cắt - ${order?.code ?? ''}`}
      className="w-full max-w-4xl"
      size="lg"
    >
      <div className="space-y-4">
        {cutting.isLoading && (
          <p className="py-6 text-center text-xs text-slate-400">Đang tải kế hoạch cắt...</p>
        )}

        {!cutting.isLoading && !plan && (
          <div className="space-y-3 py-6 text-center text-xs text-slate-500">
            <p>
              Lệnh này chưa có kế hoạch cắt. Hệ thống sẽ xếp các đoạn nhôm của mọi cửa vào cây
              nguyên và đoạn dư trong kho để tiết kiệm vật tư.
            </p>
            {isOrderActive && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Scissors size={14} />}
                loading={cutting.isCreating}
                onClick={() => cutting.createPlan()}
              >
                Tối ưu thanh cắt
              </Button>
            )}
          </div>
        )}

        {plan && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isIssued ? 'success' : 'warning'} size="sm">
                {isIssued ? 'Đã tạo phiếu xuất kho' : 'Bản nháp'}
              </Badge>
              <span className="text-[11px] text-slate-400">
                Bản {plan.version} · Mạch cưa {plan.kerfMm} mm
              </span>
            </div>

            {plan.isEstimated && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                Có cửa chưa có BOM thật hoặc thanh nhôm chưa cấu hình mã kho, kế hoạch dùng số liệu
                ước tính. Cần kiểm tra trước khi cắt và xuất kho.
              </div>
            )}

            <PlanSummary plan={plan} />

            {shouldCheckStock && order && (
              <CuttingShortagePanel
                projectId={projectId}
                orderId={order.id}
                shortages={shortage.shortages}
                isLoading={shortage.isLoading}
                onOpenReceipt={() => setIsReceiptOpen(true)}
              />
            )}

            <div className="max-h-[45vh] space-y-4 overflow-y-auto pr-1">
              {groups.map((group) => (
                <section key={group.key} className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700">
                    {group.profileName}{' '}
                    <span className="font-mono text-slate-400">({group.profileCode})</span> -{' '}
                    {group.colorName} · {group.bars.length} cây
                  </h4>
                  {group.bars.map((bar, index) => (
                    <CuttingBarStrip
                      key={bar.id}
                      bar={bar}
                      index={index + 1}
                      isReturnSelectable={
                        canReturnOffcuts && returnableBars.some((item) => item.id === bar.id)
                      }
                      isReturnSelected={selectedBarIds.includes(bar.id)}
                      onToggleReturn={toggleBar}
                    />
                  ))}
                </section>
              ))}
            </div>

            {canReturnOffcuts && (
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                <span>
                  Lệnh đã xong: tích các cây còn đoạn dư từ 1 m để thủ kho nhập lại kho.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Recycle size={14} />}
                  disabled={selectedBarIds.length === 0}
                  loading={cutting.isReturning}
                  onClick={handleReturn}
                >
                  Trả {selectedBarIds.length} đoạn dư về kho
                </Button>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
          {plan && order && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={() => printCuttingPlan(order, plan)}
            >
              In sơ đồ cắt
            </Button>
          )}
          {plan && isOrderActive && !isIssued && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Scissors size={14} />}
                loading={cutting.isCreating}
                onClick={() => cutting.createPlan()}
              >
                Tối ưu lại
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={
                  shortage.shortages.length > 0 ? (
                    <ShoppingCart size={14} />
                  ) : (
                    <FileOutput size={14} />
                  )
                }
                className={
                  shortage.shortages.length > 0
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : undefined
                }
                loading={cutting.isIssuing}
                onClick={handleIssueOrOpenReceipt}
              >
                {shortage.shortages.length > 0
                  ? 'Tạo phiếu xuất kho (Mở nhập mua bù)'
                  : 'Tạo phiếu xuất kho'}
              </Button>
            </>
          )}
        </div>

        <ReceiptFormModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          onSuccess={() => {
            setIsReceiptOpen(false);
            queryClient.invalidateQueries({ queryKey: ['order_shortage', projectId, orderId] });
            queryClient.invalidateQueries({ queryKey: ['warehouse_items'] });
            queryClient.invalidateQueries({ queryKey: ['cutting_plan', projectId, orderId] });
            toast.success('Nhập kho thành công! Có thể tiến hành tạo phiếu xuất kho.');
          }}
          itemsList={itemsData?.items ?? []}
          suppliersList={suppliersData?.items ?? []}
          initialItems={buildShortagePurchaseItems(shortage.shortages, `#${projectId}`)}
        />
      </div>
    </Modal>
  );
}

