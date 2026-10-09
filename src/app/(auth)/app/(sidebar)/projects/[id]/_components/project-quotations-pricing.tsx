'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getProjectQuotations,
  previewProjectQuotation,
  createProjectQuotationOfficial,
  cloneProjectQuotation,
  selectProjectQuotation,
} from '@/actions';
import { Button, Input, Modal, Select, Badge } from '@/components';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import type {
  ProjectQuotationItem,
  ProjectQuotationPreviewRequest,
  ProjectQuotationPreviewResponse,
} from '@/types';
import {
  Calculator,
  Plus,
  CheckCircle2,
  Copy,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FolderOpen,
  Lock,
} from 'lucide-react';

interface ProjectQuotationsPricingProps {
  projectId: number;
}

export function ProjectQuotationsPricing({ projectId }: ProjectQuotationsPricingProps) {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [quotationName, setQuotationName] = useState('Phương án 1 - Tiêu chuẩn');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(10);
  const [laborProductionRate, setLaborProductionRate] = useState<number>(150000);
  const [laborInstallRate, setLaborInstallRate] = useState<number>(120000);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [pricingMode, setPricingMode] = useState<'markup' | 'margin'>('markup');
  const [markupPercent, setMarkupPercent] = useState<number>(35);
  const [marginPercent, setMarginPercent] = useState<number>(25);

  // Queries
  const { data: quotationsData, isLoading: isLoadingQuotations } = useQuery({
    queryKey: ['project_quotations_v2', projectId],
    queryFn: () => getProjectQuotations(projectId),
    enabled: !!projectId,
  });

  const quotations: ProjectQuotationItem[] = quotationsData?.items || [];

  // Live Preview Mutation
  const {
    mutate: calculatePreview,
    data: previewResult,
    isPending: isCalculating,
  } = useMutation({
    mutationFn: (payload: ProjectQuotationPreviewRequest) =>
      previewProjectQuotation(projectId, payload),
    onError: (err) => showErrorToast(err, 'Lỗi tính dự toán'),
  });

  // Save Official Quotation Mutation
  const { mutate: saveOfficialQuotation, isPending: isSaving } = useMutation({
    mutationFn: () =>
      createProjectQuotationOfficial(projectId, {
        name: quotationName.trim(),
        discountPercent: Number(discountPercent),
        vatPercent: Number(vatPercent),
        laborProductionRate: Number(laborProductionRate),
        laborInstallRate: Number(laborInstallRate),
        otherCost: Number(otherCost),
        pricingMode,
        markupPercent: Number(markupPercent),
        marginPercent: Number(marginPercent),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã lưu phương án báo giá ${res.code}`);
      setIsPricingModalOpen(false);
    },
    onError: (err) => showErrorToast(err, 'Lỗi lưu báo giá'),
  });

  // Clone Quotation Mutation
  const { mutate: cloneMutate } = useMutation({
    mutationFn: (item: ProjectQuotationItem) =>
      cloneProjectQuotation(projectId, item.id, `Bản sao - ${item.name}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      toast.success(`Đã nhân bản phương án mới: ${res.code}`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi nhân bản báo giá'),
  });

  // Select Official Quotation Mutation
  const { mutate: selectMutate } = useMutation({
    mutationFn: (item: ProjectQuotationItem) => selectProjectQuotation(projectId, item.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã chốt phương án chính thức: ${res.code}`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi chốt báo giá'),
  });

  const handleOpenPricingModal = () => {
    setIsPricingModalOpen(true);
    calculatePreview({
      discountPercent: Number(discountPercent),
      vatPercent: Number(vatPercent),
      laborProductionRate: Number(laborProductionRate),
      laborInstallRate: Number(laborInstallRate),
      otherCost: Number(otherCost),
      pricingMode,
      markupPercent: Number(markupPercent),
      marginPercent: Number(marginPercent),
    });
  };

  const handleTriggerRecalculate = () => {
    calculatePreview({
      discountPercent: Number(discountPercent),
      vatPercent: Number(vatPercent),
      laborProductionRate: Number(laborProductionRate),
      laborInstallRate: Number(laborInstallRate),
      otherCost: Number(otherCost),
      pricingMode,
      markupPercent: Number(markupPercent),
      marginPercent: Number(marginPercent),
    });
  };

  const formatVND = (num?: number) =>
    num !== undefined ? num.toLocaleString('vi-VN') + ' đ' : '0 đ';

  return (
    <div className="space-y-6">
      {/* Thanh tác vụ đầu mục */}
      <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-700 block">
            Danh sách các phương án báo giá ({quotations.length})
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Lập nhiều phương án (PA1, PA2...), so sánh tỷ suất lợi nhuận và chốt phương án ký hợp đồng
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Calculator size={15} />}
          onClick={handleOpenPricingModal}
          className="h-8 text-xs font-semibold"
        >
          Mở Pricing Engine & Lập báo giá
        </Button>
      </div>

      {/* Danh sách bảng các phương án báo giá */}
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        {isLoadingQuotations ? (
          <p className="text-xs text-slate-400 text-center py-8">Đang tải danh sách báo giá...</p>
        ) : quotations.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <FolderOpen className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400">Chưa có phương án báo giá nào được lập.</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Calculator size={15} />}
              onClick={handleOpenPricingModal}
              className="mt-3 text-xs"
            >
              Mở công cụ tính giá ngay
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Mã BG & Tên</th>
                  <th className="py-2.5 px-3">Phiên bản</th>
                  <th className="py-2.5 px-3">Giá vốn (xưởng)</th>
                  <th className="py-2.5 px-3">Tổng thanh toán</th>
                  <th className="py-2.5 px-3">Lợi nhuận</th>
                  <th className="py-2.5 px-3">Biên lãi</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {quotations.map((q) => (
                  <tr
                    key={q.id}
                    className={`transition-colors ${
                      q.isSelected ? 'bg-primary/5 font-medium' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-primary">{q.code}</span>
                          {q.isSelected && (
                            <span className="text-[10px] bg-primary text-white px-1.5 py-0.2 rounded font-semibold">
                              CHÍNH THỨC
                            </span>
                          )}
                          {q.isLocked && <Lock size={12} className="text-amber-500" />}
                        </div>
                        <span className="text-slate-700 mt-0.5">{q.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">v{q.version}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {formatVND(q.workshopPrice)}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 font-mono">
                      {formatVND(q.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold font-mono">
                      +{formatVND(q.totalProfit)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        {(q.effectiveMarginPercent ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          q.status === 'accepted'
                            ? 'success'
                            : q.status === 'sent'
                            ? 'primary'
                            : 'default'
                        }
                        size="sm"
                      >
                        {q.status === 'accepted'
                          ? 'Đã chốt'
                          : q.status === 'sent'
                          ? 'Đã gửi'
                          : 'Bản thảo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!q.isSelected && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="h-7 text-[11px] px-2"
                            onClick={() => selectMutate(q)}
                          >
                            Chốt phương án
                          </Button>
                        )}
                        <button
                          type="button"
                          title="Nhân bản phương án"
                          onClick={() => cloneMutate(q)}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Pricing Engine Live Calculator */}
      <Modal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        title="Công cụ tính giá tự động (Pricing Engine Live)"
        className="max-w-4xl w-full"
      >
        <div className="space-y-5 max-h-[80vh] overflow-y-auto px-1 py-1">
          <Input
            label="Tên phương án báo giá *"
            value={quotationName}
            onChange={(e) => setQuotationName(e.target.value)}
            fullWidth
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Định giá & Biên lãi</span>
              <div className="space-y-3">
                <Select
                  label="Cơ chế định giá"
                  fullWidth
                  value={pricingMode}
                  onChange={(e) => {
                    setPricingMode(e.target.value as any);
                    handleTriggerRecalculate();
                  }}
                  options={[
                    { value: 'markup', label: 'Markup (% trên giá vốn)' },
                    { value: 'margin', label: 'Target Margin (% doanh thu)' },
                  ]}
                />
                {pricingMode === 'markup' ? (
                  <Input
                    type="number"
                    label="% Markup trên vốn"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    onBlur={handleTriggerRecalculate}
                    fullWidth
                  />
                ) : (
                  <Input
                    type="number"
                    label="% Margin mục tiêu"
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(Number(e.target.value))}
                    onBlur={handleTriggerRecalculate}
                    fullWidth
                  />
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Nhân công & Chi phí</span>
              <div className="space-y-3">
                <Input
                  type="number"
                  label="Công sản xuất (đ/m2)"
                  value={laborProductionRate}
                  onChange={(e) => setLaborProductionRate(Number(e.target.value))}
                  onBlur={handleTriggerRecalculate}
                  fullWidth
                />
                <Input
                  type="number"
                  label="Công lắp đặt (đ/m2)"
                  value={laborInstallRate}
                  onChange={(e) => setLaborInstallRate(Number(e.target.value))}
                  onBlur={handleTriggerRecalculate}
                  fullWidth
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Đàm phán & Thuế</span>
              <div className="space-y-3">
                <Input
                  type="number"
                  label="% Chiết khấu giảm giá"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  onBlur={handleTriggerRecalculate}
                  fullWidth
                />
                <Input
                  type="number"
                  label="% Thuế VAT"
                  value={vatPercent}
                  onChange={(e) => setVatPercent(Number(e.target.value))}
                  onBlur={handleTriggerRecalculate}
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* Bảng tổng kết Live Analytics từ Backend */}
          {previewResult && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <TrendingUp size={15} /> Kết quả dự toán thời gian thực (Live Analytics):
              </span>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-bold">TỔNG GIÁ VỐN</span>
                  <span className="font-mono text-sm font-bold text-slate-700 mt-0.5 block">
                    {formatVND(previewResult.workshopPrice)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-bold">GIÁ BÁN TRƯỚC VAT</span>
                  <span className="font-mono text-sm font-bold text-slate-800 mt-0.5 block">
                    {formatVND(previewResult.totalAmountBeforeVat)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-bold">LỢI NHUẬN RÒNG</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 mt-0.5 block">
                    +{formatVND(previewResult.totalProfit)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-bold">TỔNG TIỀN (GỒM VAT)</span>
                  <span className="font-mono text-base font-bold text-primary mt-0.5 block">
                    {formatVND(previewResult.totalAmount)}
                  </span>
                </div>
              </div>

              {previewResult.isLoss && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>Cảnh báo: Phương án này đang bán dưới giá vốn (Lỗ dự kiến)!</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsPricingModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={isCalculating}
              onClick={handleTriggerRecalculate}
            >
              Tính lại
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={16} />}
              loading={isSaving}
              disabled={!quotationName.trim() || isSaving}
              onClick={() => saveOfficialQuotation()}
            >
              Lưu phương án báo giá
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
