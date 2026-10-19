'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getProjectQuotations,
  getProjectFloors,
  previewProjectQuotation,
  createProjectQuotationOfficial,
  cloneProjectQuotation,
  selectProjectQuotation,
  updateProjectQuotation,
  deleteProjectQuotation,
} from '@/actions';
import { Button, Input, Select, Badge, Tabs, Modal, Skeleton } from '@/components';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import type {
  ProjectFloor,
  ProjectQuotationItem,
  ProjectQuotationPreviewRequest,
  ProjectQuotationPreviewResponse,
  QuotationDoorItemSnapshot,
} from '@/types';
import {
  CheckCircle2,
  Copy,
  AlertTriangle,
  FolderOpen,
  Lock,
  Loader2,
  Wallet,
  BarChart3,
  Eye,
  Pencil,
  Check,
  X,
  Trash2,
} from 'lucide-react';

interface ProjectQuotationsPricingProps {
  projectId: number;
}

// Giá trị mặc định đồng bộ với schema backend
const DEFAULT_PRICING_CONFIG: ProjectQuotationPreviewRequest = {
  scopeType: 'all',
  floorIds: [],
  laborCalcUnit: 'vnd_per_m2',
  laborProductionRate: 150000,
  laborInstallRate: 120000,
  laborCleanRate: 30000,
  otherCost: 0,
  managementRatePercent: 16,
  pricingMode: 'markup',
  markupPercent: 45,
  marginPercent: 30,
  discountPercent: 0,
  vatPercent: 10,
  accessoryMode: 'combined',
};

const PREVIEW_DEBOUNCE_MS = 500;

const PRICING_TABS = [
  { value: 'config', label: 'Cấu thành giá', icon: <Wallet size={15} /> },
  { value: 'analysis', label: 'Phân tích', icon: <BarChart3 size={15} /> },
];

const formatVND = (num?: number) =>
  num !== undefined ? num.toLocaleString('vi-VN') + ' đ' : '0 đ';

// Khối nhập liệu: tiêu đề + mô tả dễ hiểu
function PriceBlock({
  title,
  description,
  className = '',
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4 ${className}`}>
      <div>
        <span className="text-xs font-bold text-slate-700 block">{title}</span>
        <span className="text-[11px] text-slate-400 block mt-0.5">{description}</span>
      </div>
      {children}
    </section>
  );
}

// Chuyển chuỗi bất kỳ thành chuỗi chỉ gồm chữ số
const onlyDigits = (raw: string): string => raw.replace(/\D/g, '');

// Hiển thị số tiền theo định dạng Việt Nam: 000.000.000
const formatMoneyInput = (digits: string): string =>
  digits === '' ? '' : Number(digits).toLocaleString('vi-VN');

// Ô nhập tiền, luôn hiển thị dấu chấm ngăn cách hàng nghìn
function MoneyInput({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
}) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      label={label}
      value={value === undefined ? '' : formatMoneyInput(String(value))}
      onChange={(e) => {
        const digits = onlyDigits(e.target.value);
        onValueChange(digits === '' ? undefined : Number(digits));
      }}
      fullWidth
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-slate-400 -mt-1.5">{children}</p>;
}

// Một dòng "tên - số tiền" trong bảng phân tích
function ResultRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: 'red' | 'green' | 'primary';
}) {
  const toneClass =
    tone === 'red'
      ? 'text-red-600'
      : tone === 'green'
      ? 'text-emerald-600'
      : tone === 'primary'
      ? 'text-primary'
      : 'text-slate-700';
  return (
    <div className="flex justify-between gap-3 py-1.5 text-xs">
      <span className={strong ? 'font-bold text-slate-600' : 'text-slate-400'}>{label}</span>
      <span className={`${strong ? 'font-bold' : ''} ${toneClass}`}>{value}</span>
    </div>
  );
}

// Nút thao tác dạng icon, di chuột vào hiện chữ giải thích
function IconAction({
  title,
  onClick,
  disabled,
  tone = 'default',
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'primary';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-md border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        tone === 'primary'
          ? 'bg-primary text-white border-primary hover:bg-primary/90'
          : 'bg-white text-slate-500 border-slate-200 hover:text-primary hover:border-primary/40'
      }`}
    >
      {children}
    </button>
  );
}

// Panel trực quan: giá chưa thuế gồm những khoản nào, mỗi khoản chiếm bao nhiêu %
interface CompositionData {
  materialCost: number;
  laborCost: number;
  aluminumWasteCost: number;
  otherCost: number;
  workshopPrice: number;
  totalProfit: number;
  totalAmountBeforeVat: number;
}

function CompositionPanel({ data }: { data: CompositionData }) {
  // Chi phí chung của xưởng = giá xưởng - (vật tư + công + hao hụt + chi phí khác)
  const managementCost =
    data.workshopPrice -
    data.materialCost -
    data.laborCost -
    data.aluminumWasteCost -
    data.otherCost;

  const rows = [
    { key: 'A', label: 'Vật tư', value: data.materialCost, bar: 'bg-sky-400' },
    { key: 'B', label: 'Tiền công thợ', value: data.laborCost, bar: 'bg-amber-400' },
    { key: 'C', label: 'Nhôm hao hụt', value: data.aluminumWasteCost, bar: 'bg-orange-400' },
    { key: 'D', label: 'Chi phí khác', value: data.otherCost, bar: 'bg-slate-400' },
    { key: 'E', label: 'Chi phí chung của xưởng', value: managementCost, bar: 'bg-violet-400' },
    { key: 'F', label: 'Tiền lãi', value: data.totalProfit, bar: 'bg-emerald-500' },
  ];
  const total = data.totalAmountBeforeVat;

  return (
    <div>
      {rows.map((row) => {
        const percent = total > 0 ? (row.value / total) * 100 : 0;
        return (
          <div key={row.key} className="py-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-slate-600">
                {row.key} · {row.label}
              </span>
              <span className="flex items-baseline gap-3">
                <span className="text-[11px] text-slate-400">{percent.toFixed(0)}%</span>
                <span className="font-bold text-slate-800 min-w-20 text-right">
                  {row.value.toLocaleString('vi-VN')}
                </span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${row.bar}`}
                style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between gap-3 border-t border-slate-100 mt-2 pt-2 text-xs">
        <span className="font-bold text-slate-700">Tổng giá (chưa tính thuế)</span>
        <span className="font-bold text-slate-800">{total.toLocaleString('vi-VN')}</span>
      </div>
    </div>
  );
}

export function ProjectQuotationsPricing({ projectId }: ProjectQuotationsPricingProps) {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState<ProjectQuotationPreviewRequest>(DEFAULT_PRICING_CONFIG);
  const [quotationName, setQuotationName] = useState('Phương án 1 - Tiêu chuẩn');
  const [note, setNote] = useState('');
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const patchConfig = (patch: Partial<ProjectQuotationPreviewRequest>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const onNumber =
    (key: keyof ProjectQuotationPreviewRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
      patchConfig({ [key]: Number(e.target.value) });

  // Queries
  const { data: quotationsData, isLoading: isLoadingQuotations } = useQuery({
    queryKey: ['project_quotations_v2', projectId],
    queryFn: () => getProjectQuotations(projectId),
    enabled: !!projectId,
  });

  const { data: floors = [] } = useQuery<ProjectFloor[]>({
    queryKey: ['project_floors', projectId],
    queryFn: () => getProjectFloors(projectId),
    enabled: !!projectId,
  });

  const quotations: ProjectQuotationItem[] = quotationsData?.items || [];

  // Tính thử giá
  const {
    mutate: calculatePreview,
    data: previewResult,
    isPending: isCalculating,
  } = useMutation({
    mutationFn: (payload: ProjectQuotationPreviewRequest) =>
      previewProjectQuotation(projectId, payload),
    onError: (err) => showErrorToast(err, 'Lỗi tính dự toán'),
  });

  const isMissingFloors = config.scopeType === 'by_floor' && !config.floorIds?.length;

  // Debounce tính lại khi cấu hình thay đổi
  useEffect(() => {
    if (isMissingFloors) return;
    const timer = setTimeout(() => calculatePreview(config), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [config, isMissingFloors, calculatePreview]);

  // Lưu phương án: tạo mới hoặc cập nhật nếu đang chỉnh sửa
  const { mutate: saveOfficialQuotation, isPending: isSaving } = useMutation({
    mutationFn: () =>
      editingId
        ? updateProjectQuotation(projectId, editingId, {
            ...config,
            name: quotationName.trim(),
            note: note.trim(),
          })
        : createProjectQuotationOfficial(projectId, {
            ...config,
            projectId,
            name: quotationName.trim(),
            note: note.trim() || undefined,
          }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(
        editingId ? `Đã cập nhật phương án ${res.code}` : `Đã lưu phương án báo giá ${res.code}`,
      );
      if (editingId) resetForm();
    },
    onError: (err) => showErrorToast(err, editingId ? 'Lỗi cập nhật báo giá' : 'Lỗi lưu báo giá'),
  });

  const { mutate: cloneMutate } = useMutation({
    mutationFn: (item: ProjectQuotationItem) =>
      cloneProjectQuotation(projectId, item.id, `Bản sao - ${item.name}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      toast.success(`Đã nhân bản phương án mới: ${res.code}`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi nhân bản báo giá'),
  });

  const { mutate: selectMutate } = useMutation({
    mutationFn: (item: ProjectQuotationItem) => selectProjectQuotation(projectId, item.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã chọn phương án chính thức: ${res.code}`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi chọn phương án'),
  });

  // Xóa báo giá (có xác nhận)
  const [deletingItem, setDeletingItem] = useState<ProjectQuotationItem | null>(null);
  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: (item: ProjectQuotationItem) => deleteProjectQuotation(projectId, item.id),
    onSuccess: (_res, item) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã xóa phương án ${item.code}`);
      if (analysisId === item.id) setAnalysisId(null);
      if (editingId === item.id) resetForm();
      setDeletingItem(null);
    },
    onError: (err) => showErrorToast(err, 'Lỗi xóa báo giá'),
  });

  const toggleFloor = (floorId: number) => {
    const current = config.floorIds ?? [];
    patchConfig({
      floorIds: current.includes(floorId)
        ? current.filter((id) => id !== floorId)
        : [...current, floorId],
    });
  };

  const laborUnitLabel = config.laborCalcUnit === 'vnd_per_kg' ? 'đ/kg nhôm' : 'đ/m² cửa';
  const result: ProjectQuotationPreviewResponse | undefined = previewResult;
  const belowCostCount = result?.items.filter((i) => i.isBelowCost).length ?? 0;

  // Báo giá đang xem ở tab Phân tích, gom các bộ cửa theo tầng
  const analysisQuotation =
    quotations.find((q) => q.id === analysisId) ??
    quotations.find((q) => q.isSelected) ??
    quotations[0];
  const analysisItems: QuotationDoorItemSnapshot[] = Array.isArray(analysisQuotation?.snapshotItems)
    ? analysisQuotation.snapshotItems
    : [];
  const analysisFloorGroups = Object.entries(
    analysisItems.reduce<Record<string, QuotationDoorItemSnapshot[]>>((acc, item) => {
      (acc[item.floorName] ??= []).push(item);
      return acc;
    }, {}),
  );

  // Giá bán đang nhập dở (chưa lưu), theo positionId
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({});
  // Giá cửa và giá phụ kiện đang nhập dở (chỉ dùng khi tính riêng phụ kiện)
  const [doorDrafts, setDoorDrafts] = useState<Record<number, string>>({});
  const [accDrafts, setAccDrafts] = useState<Record<number, string>>({});
  const resetDrafts = () => {
    setPriceDrafts({});
    setDoorDrafts({});
    setAccDrafts({});
  };
  const isSeparated = analysisQuotation?.accessoryMode === 'separated';

  // Giá phụ kiện coi là nhập tay khi khác giá gợi ý (bị trần bởi giá bộ cửa)
  const isAccessoryManual = (item: QuotationDoorItemSnapshot): boolean =>
    item.accessoryMode === 'separated' &&
    item.accessorySellingPrice !== Math.min(item.accessorySuggestedPrice, item.sellingPrice);
  // Khi tính riêng phụ kiện: bộ đã có giá tay (giá cửa hoặc giá phụ kiện)
  const isSepManual = (item: QuotationDoorItemSnapshot): boolean =>
    item.isManuallyEdited || isAccessoryManual(item);
  // Giá cửa / phụ kiện đang có hiệu lực: đang nhập > giá tay đã lưu > giá gợi ý
  const getDoorLive = (item: QuotationDoorItemSnapshot): number => {
    const d = doorDrafts[item.positionId];
    if (d !== undefined) return d === '' ? item.doorOnlySuggestedPrice : Number(d);
    return isSepManual(item) ? item.doorOnlySellingPrice : item.doorOnlySuggestedPrice;
  };
  const getAccLive = (item: QuotationDoorItemSnapshot): number => {
    const a = accDrafts[item.positionId];
    if (a !== undefined) return a === '' ? item.accessorySuggestedPrice : Number(a);
    return isSepManual(item) ? item.accessorySellingPrice : item.accessorySuggestedPrice;
  };
  // Tổng giá bộ cửa đang có hiệu lực
  const getTotalLive = (item: QuotationDoorItemSnapshot): number => {
    if (isSeparated) return getDoorLive(item) + getAccLive(item);
    const draft = priceDrafts[item.positionId];
    if (draft !== undefined && draft !== '') return Number(draft);
    return item.isManuallyEdited && draft === undefined ? item.sellingPrice : item.suggestedPrice;
  };
  const isBelowCostLive = (item: QuotationDoorItemSnapshot): boolean =>
    getTotalLive(item) < item.costPrice;

  // Giá tay mới nhập, và các bộ bị xóa giá tay (ô để trống -> quay về giá gợi ý)
  const changedPrices: Record<number, number> = {};
  const clearedIds = new Set<number>();
  // Riêng cho chế độ tính riêng phụ kiện: tổng = giá cửa + giá phụ kiện
  const sepOverrides: Record<number, { total: number; acc: number }> = {};
  analysisItems.forEach((item) => {
    const id = item.positionId;
    if (isSeparated) {
      if (doorDrafts[id] === undefined && accDrafts[id] === undefined) return;
      const door = getDoorLive(item);
      const acc = getAccLive(item);
      if (door === item.doorOnlySuggestedPrice && acc === item.accessorySuggestedPrice) {
        if (isSepManual(item)) clearedIds.add(id);
      } else if (
        !(isSepManual(item) && door === item.doorOnlySellingPrice && acc === item.accessorySellingPrice)
      ) {
        sepOverrides[id] = { total: door + acc, acc };
      }
      return;
    }
    const raw = priceDrafts[id];
    if (raw === undefined) return;
    if (raw === '') {
      if (item.isManuallyEdited) clearedIds.add(id);
      return;
    }
    const value = Number(raw);
    const current = item.isManuallyEdited ? item.sellingPrice : undefined;
    if (Number.isFinite(value) && value >= 0 && value !== current) {
      changedPrices[id] = value;
    }
  });
  const changedCount =
    Object.keys(changedPrices).length + Object.keys(sepOverrides).length + clearedIds.size;

  // Backend không gộp giá tay cũ nên phải gửi lại đủ cả giá cũ và mới
  const { mutate: savePricesMutate, isPending: isSavingPrices } = useMutation({
    mutationFn: () => {
      const manual: Record<number, number> = {};
      const manualAcc: Record<number, number> = {};
      analysisItems.forEach((i) => {
        const id = i.positionId;
        if (clearedIds.has(id)) return;
        if (isSeparated) {
          if (sepOverrides[id]) {
            manual[id] = sepOverrides[id].total;
            manualAcc[id] = sepOverrides[id].acc;
          } else if (isSepManual(i)) {
            manual[id] = i.sellingPrice;
            manualAcc[id] = i.accessorySellingPrice;
          }
        } else if (i.isManuallyEdited) {
          manual[id] = i.sellingPrice;
        }
      });
      return updateProjectQuotation(projectId, analysisQuotation!.id, {
        customSellingPrices: { ...manual, ...changedPrices },
        customAccessoryPrices: manualAcc,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã lưu giá bán, phiên bản mới: v${res.version}`);
      resetDrafts();
    },
    onError: (err) => showErrorToast(err, 'Lỗi lưu giá bán'),
  });

  const handleViewAnalysis = (id: number) => {
    setAnalysisId(id);
    resetDrafts();
    setActiveTab('analysis');
  };

  // Đưa form về trạng thái tạo mới
  const resetForm = () => {
    setEditingId(null);
    setConfig(DEFAULT_PRICING_CONFIG);
    setQuotationName('Phương án 1 - Tiêu chuẩn');
    setNote('');
  };

  // Đổ dữ liệu báo giá đã lưu lên form để sửa
  const handleEdit = (q: ProjectQuotationItem) => {
    const manualPrices: Record<number, number> = {};
    const manualAccPrices: Record<number, number> = {};
    if (Array.isArray(q.snapshotItems)) {
      q.snapshotItems.forEach((item) => {
        if (item.isManuallyEdited) manualPrices[item.positionId] = item.sellingPrice;
        if (isAccessoryManual(item)) manualAccPrices[item.positionId] = item.accessorySellingPrice;
      });
    }
    setEditingId(q.id);
    setQuotationName(q.name);
    setNote(q.note ?? '');
    setConfig({
      scopeType: q.scopeType,
      floorIds: [], // API chưa trả danh sách tầng đã chọn, cần chọn lại nếu báo giá theo tầng
      laborCalcUnit: q.laborCalcUnit,
      laborProductionRate: q.laborProductionRate,
      laborInstallRate: q.laborInstallRate,
      laborCleanRate: q.laborCleanRate,
      otherCost: q.otherCost,
      otherSellingPrice: q.otherSellingPrice === q.otherCost ? undefined : q.otherSellingPrice,
      managementRatePercent: q.managementRatePercent,
      pricingMode: q.pricingMode,
      markupPercent: q.markupPercent,
      marginPercent: q.marginPercent,
      discountPercent: q.discountPercent,
      vatPercent: q.vatPercent,
      accessoryMode: q.accessoryMode,
      customSellingPrices: manualPrices,
      customAccessoryPrices: manualAccPrices,
    });
    setActiveTab('config');
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      <div ref={topRef} className="space-y-4 scroll-mt-4">
        <Tabs tabs={PRICING_TABS} activeTab={activeTab} onChange={setActiveTab} size="sm" />

        {/* ===== TAB: CẤU THÀNH GIÁ ===== */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 items-start">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {editingId && (
                <div className="xl:col-span-2 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  <span>
                    Đang chỉnh sửa phương án{' '}
                    <b>{quotations.find((q) => q.id === editingId)?.code}</b>. Sửa các ô bên dưới rồi bấm
                    "Cập nhật phương án".
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 font-semibold hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    <X size={13} /> Hủy sửa
                  </button>
                </div>
              )}
              <PriceBlock
                className="xl:col-span-2"
                title="1. Thông tin phương án"
                description="Đặt tên để phân biệt khi bạn lập nhiều phương án cho cùng một công trình"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tên phương án *"
                    value={quotationName}
                    onChange={(e) => setQuotationName(e.target.value)}
                    fullWidth
                  />
                  <Input
                    label="Ghi chú cho khách (thời hạn báo giá, bảo hành...)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    fullWidth
                  />
                </div>
              </PriceBlock>

              <PriceBlock
                title="2. Báo giá cho phần nào?"
                description="Chọn báo giá cho cả công trình hay chỉ một số tầng"
              >
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    label="Báo giá cho"
                    fullWidth
                    value={config.scopeType}
                    onChange={(e) =>
                      patchConfig({ scopeType: e.target.value as 'all' | 'by_floor' })
                    }
                    options={[
                      { value: 'all', label: 'Cả công trình' },
                      { value: 'by_floor', label: 'Chỉ một số tầng' },
                    ]}
                  />
                  <Select
                    label="Cách hiển thị phụ kiện"
                    fullWidth
                    value={config.accessoryMode}
                    onChange={(e) =>
                      patchConfig({ accessoryMode: e.target.value as 'combined' | 'separated' })
                    }
                    options={[
                      { value: 'combined', label: 'Tính gộp vào giá mỗi bộ cửa' },
                      { value: 'separated', label: 'Liệt kê riêng phụ kiện' },
                    ]}
                  />
                </div>
                {config.scopeType === 'by_floor' && (
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 block">Bấm để chọn các tầng cần báo giá:</span>
                    <div className="flex flex-wrap gap-2">
                      {floors.map((floor) => {
                        const active = config.floorIds?.includes(floor.id);
                        return (
                          <button
                            key={floor.id}
                            type="button"
                            onClick={() => toggleFloor(floor.id)}
                            className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-colors ${
                              active
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
                            }`}
                          >
                            {floor.name}
                          </button>
                        );
                      })}
                      {floors.length === 0 && (
                        <span className="text-xs text-slate-400">Công trình chưa có tầng nào.</span>
                      )}
                    </div>
                    {isMissingFloors && (
                      <span className="text-[11px] text-amber-600 block">
                        Hãy chọn ít nhất 1 tầng để xem giá.
                      </span>
                    )}
                  </div>
                )}
              </PriceBlock>

              <PriceBlock
                title="3. Tiền công thợ"
                description="Tiền trả cho thợ làm cửa, lắp đặt và vệ sinh sau khi lắp"
              >
                <Select
                  label="Tính tiền công theo"
                  fullWidth
                  value={config.laborCalcUnit}
                  onChange={(e) =>
                    patchConfig({ laborCalcUnit: e.target.value as 'vnd_per_m2' | 'vnd_per_kg' })
                  }
                  options={[
                    { value: 'vnd_per_m2', label: 'Diện tích cửa (m²)' },
                    { value: 'vnd_per_kg', label: 'Trọng lượng nhôm (kg)' },
                  ]}
                />
                <div className="grid grid-cols-1 gap-4">
                  <MoneyInput
                    label={`Làm cửa (${laborUnitLabel})`}
                    value={config.laborProductionRate}
                    onValueChange={(v) => patchConfig({ laborProductionRate: v ?? 0 })}
                  />
                  <MoneyInput
                    label={`Lắp đặt (${laborUnitLabel})`}
                    value={config.laborInstallRate}
                    onValueChange={(v) => patchConfig({ laborInstallRate: v ?? 0 })}
                  />
                  <MoneyInput
                    label={`Vệ sinh (${laborUnitLabel})`}
                    value={config.laborCleanRate}
                    onValueChange={(v) => patchConfig({ laborCleanRate: v ?? 0 })}
                  />
                </div>
              </PriceBlock>

              <PriceBlock
                title="4. Chi phí khác"
                description="Các khoản ngoài vật tư và tiền công"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <MoneyInput
                      label="Chi phí phát sinh (đ)"
                      value={config.otherCost}
                      onValueChange={(v) => patchConfig({ otherCost: v ?? 0 })}
                    />
                    <Hint>Ví dụ: thuê xe cẩu, tiền vận chuyển đến công trình.</Hint>
                  </div>
                  <div className="space-y-2">
                    <MoneyInput
                      label="Số tiền thu của khách cho khoản này (đ)"
                      value={config.otherSellingPrice}
                      onValueChange={(v) => patchConfig({ otherSellingPrice: v })}
                    />
                    <Hint>Để trống nếu thu đúng bằng chi phí phát sinh.</Hint>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      label="Chi phí chung của xưởng (%)"
                      value={config.managementRatePercent}
                      onChange={onNumber('managementRatePercent')}
                      fullWidth
                    />
                    <Hint>
                      Điện, nước, mặt bằng, quản lý... Phần % này được cộng thêm vào chi phí làm ra mỗi bộ cửa.
                    </Hint>
                  </div>
                </div>
              </PriceBlock>

              <PriceBlock
                title="5. Tiền lãi, giảm giá và thuế"
                description="Quyết định giá bán cho khách và khoản lãi bạn muốn có"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Select
                      label="Cách tính giá bán"
                      fullWidth
                      value={config.pricingMode}
                      onChange={(e) =>
                        patchConfig({ pricingMode: e.target.value as 'markup' | 'margin' })
                      }
                      options={[
                        { value: 'markup', label: 'Cộng thêm % lãi vào chi phí' },
                        { value: 'margin', label: 'Đặt % lãi mong muốn trên giá bán' },
                      ]}
                    />
                    <Hint>
                      {config.pricingMode === 'markup'
                        ? 'Ví dụ: chi phí 100 đồng, cộng 45% lãi -> giá bán 145 đồng.'
                        : 'Ví dụ: muốn lãi 30% trên giá bán -> giá bán = chi phí chia 0,7.'}
                    </Hint>
                  </div>
                  {config.pricingMode === 'markup' ? (
                    <Input
                      type="number"
                      label="% lãi cộng thêm vào chi phí"
                      value={config.markupPercent}
                      onChange={onNumber('markupPercent')}
                      fullWidth
                    />
                  ) : (
                    <Input
                      type="number"
                      label="% lãi mong muốn trên giá bán"
                      value={config.marginPercent}
                      onChange={onNumber('marginPercent')}
                      fullWidth
                    />
                  )}
                  <div className="space-y-2">
                    <Input
                      type="number"
                      label="Giảm giá cho khách (%)"
                      value={config.discountPercent}
                      onChange={onNumber('discountPercent')}
                      fullWidth
                    />
                    <Hint>Phần giảm khi thương lượng với khách.</Hint>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      label="Thuế VAT (%)"
                      value={config.vatPercent}
                      onChange={onNumber('vatPercent')}
                      fullWidth
                    />
                    <Hint>Thuế giá trị gia tăng, thường là 10%.</Hint>
                  </div>
                </div>
              </PriceBlock>
            </div>

            {/* Kết quả tính thử (preview đầy đủ) + nút lưu */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Kết quả tính thử</span>
                {isCalculating && <Loader2 size={14} className="animate-spin text-slate-400" />}
              </div>

              {result ? (
                <div className={`space-y-4 transition-opacity ${isCalculating ? 'opacity-50' : ''}`}>
                  {result.isLoss && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0" />
                      <span>Giá bán đang thấp hơn chi phí, bạn sẽ bị lỗ!</span>
                    </div>
                  )}
                  {belowCostCount > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      Có {belowCostCount} bộ cửa đang bán thấp hơn chi phí làm ra.
                    </div>
                  )}
                  {result.warningFlags.map((flag) => (
                    <div
                      key={flag}
                      className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700"
                    >
                      {flag}
                    </div>
                  ))}

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Khối lượng công trình</span>
                    <div className="divide-y divide-slate-100">
                      <ResultRow label="Số bộ cửa" value={result.totalPositions.toLocaleString('vi-VN')} />
                      <ResultRow label="Tổng diện tích cửa" value={`${result.totalAreaM2.toLocaleString('vi-VN')} m²`} />
                      <ResultRow label="Tổng trọng lượng nhôm" value={`${result.totalAluminumKg.toLocaleString('vi-VN')} kg`} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Cơ cấu tổng báo giá</span>
                    <CompositionPanel data={result} />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Từ giá bán đến số tiền khách trả</span>
                    <div className="divide-y divide-slate-100">
                      <ResultRow label="Giá bán khi chưa giảm" value={formatVND(result.subtotalSellingPrice)} />
                      <ResultRow label="Giảm giá cho khách" value={`-${formatVND(result.discountAmount)}`} tone="red" />
                      <ResultRow label="Khách trả (chưa thuế)" value={formatVND(result.totalAmountBeforeVat)} strong />
                      <ResultRow label="Thuế VAT" value={formatVND(result.vatAmount)} />
                      <ResultRow label="Khách phải trả (đã gồm thuế)" value={formatVND(result.totalAmount)} strong tone="primary" />
                      <ResultRow
                        label="Tiền lãi thực tế"
                        value={`${formatVND(result.totalProfit)} (${result.effectiveMarginPercent.toFixed(1)}%)`}
                        strong
                        tone={result.isLoss ? 'red' : 'green'}
                      />
                    </div>
                  </div>
                </div>
              ) : isMissingFloors ? (
                <p className="text-xs text-slate-400 py-4 text-center">Chọn tầng để xem giá.</p>
              ) : (
                <div className="space-y-5">
                  {[3, 6, 5].map((rows) => (
                    <div key={rows} className="space-y-2.5">
                      <Skeleton className="h-3 w-32" />
                      {Array.from({ length: rows }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<CheckCircle2 size={16} />}
                loading={isSaving}
                disabled={!quotationName.trim() || isSaving || isMissingFloors}
                onClick={() => saveOfficialQuotation()}
              >
                {editingId ? 'Cập nhật phương án' : 'Lưu phương án báo giá'}
              </Button>
            </div>
          </div>
        )}

        {/* ===== TAB: PHÂN TÍCH (snapshotItems của báo giá đã chọn) ===== */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {quotations.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-xs">
                <Select
                  label="Chọn phương án báo giá cần xem"
                  fullWidth
                  value={String(analysisQuotation?.id ?? '')}
                  onChange={(e) => {
                    setAnalysisId(Number(e.target.value));
                    resetDrafts();
                  }}
                  options={quotations.map((q) => ({
                    value: String(q.id),
                    label: `${q.code} - ${q.name} (v${q.version})${q.isSelected ? ' - Đã chọn' : ''}`,
                  }))}
                />
              </div>
            )}
            {!analysisQuotation ? (
              <div className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-xs text-center text-xs text-slate-400">
                Chưa có phương án báo giá nào. Hãy lập và lưu ở tab "Cấu thành giá".
              </div>
            ) : (
              <>
                <PriceBlock
                  title={`Chi tiết từng bộ cửa (${analysisItems.length})`}
                  description="Chi phí và giá bán của từng bộ cửa tại thời điểm lưu báo giá"
                >
                  {analysisItems.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      Phương án này chưa có dữ liệu chi tiết từng bộ cửa.
                    </p>
                  ) : (
                    <div>
                      {changedCount > 0 && (
                        <div className="flex items-center justify-between gap-3 mb-3 px-3 py-2 rounded-md bg-primary/5 border border-primary/20 text-xs text-primary">
                          <span>Bạn đã sửa {changedCount} giá bán. Lưu sẽ tạo phiên bản mới của phương án.</span>
                          <span className="flex gap-2">
                            <button type="button" onClick={resetDrafts} className="px-2 py-1 rounded border border-primary/30 hover:bg-primary/10">
                              Hoàn tác
                            </button>
                            <button
                              type="button"
                              disabled={isSavingPrices}
                              onClick={() => savePricesMutate()}
                              className="px-2 py-1 rounded bg-primary text-white font-semibold disabled:opacity-60"
                            >
                              {isSavingPrices ? 'Đang lưu...' : 'Lưu giá bán'}
                            </button>
                          </span>
                        </div>
                      )}
                      <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="min-w-[240px] py-2.5 px-2">Vị trí</th>
                            <th className="py-2.5 px-2 whitespace-nowrap">Kích thước (mm)</th>
                            <th className="py-2.5 px-2 whitespace-nowrap text-right">Diện tích (m²)</th>
                            <th className="py-2.5 px-2 whitespace-nowrap text-right">Chi phí làm ra</th>
                            {isSeparated && (
                              <>
                                <th className="py-2.5 px-2 whitespace-nowrap text-right">Giá cửa</th>
                                <th className="py-2.5 px-2 whitespace-nowrap text-right">Giá phụ kiện</th>
                              </>
                            )}
                            <th className="py-2.5 px-2 whitespace-nowrap text-right">
                              {isSeparated ? 'Tổng' : 'Giá bán'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {analysisFloorGroups.map(([floorName, items]) => (
                            <React.Fragment key={floorName}>
                              <tr className="bg-slate-50">
                                <td colSpan={isSeparated ? 7 : 5} className="py-2 px-3 font-bold text-slate-600">
                                  {floorName} ({items.length} bộ)
                                </td>
                              </tr>
                              {items.map((item) => (
                                <tr
                                  key={item.positionId}
                                  className={`border-b border-slate-100 ${
                                    isBelowCostLive(item) ? 'bg-red-50/60' : 'hover:bg-slate-50/60'
                                  }`}
                                >
                                  <td className="py-2 px-2 whitespace-nowrap">
                                    <span className="font-bold text-slate-800">{item.positionCode}</span>
                                    <span className="text-slate-500"> · {item.doorName}</span>
                                  </td>
                                  <td className="py-2 px-2 whitespace-nowrap text-slate-600">
                                    {item.width} x {item.height}
                                  </td>
                                  <td className="py-2 px-2 whitespace-nowrap text-right text-slate-600">
                                    {item.areaM2.toLocaleString('vi-VN')}
                                  </td>
                                  <td className="py-2 px-2 whitespace-nowrap text-right font-semibold text-slate-700">
                                    {formatVND(item.costPrice)}
                                  </td>
                                  {isSeparated ? (
                                    <>
                                      <td className="py-2 px-2 whitespace-nowrap text-right">
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          disabled={analysisQuotation.isLocked}
                                          placeholder={formatMoneyInput(String(item.doorOnlySuggestedPrice ?? 0))}
                                          value={formatMoneyInput(
                                            doorDrafts[item.positionId] ??
                                              (isSepManual(item) ? String(item.doorOnlySellingPrice) : ''),
                                          )}
                                          onChange={(e) =>
                                            setDoorDrafts((prev) => ({
                                              ...prev,
                                              [item.positionId]: onlyDigits(e.target.value),
                                            }))
                                          }
                                          className="w-28 text-right text-xs font-bold placeholder:font-normal placeholder:text-slate-400 text-slate-800 border border-slate-200 rounded px-2 py-1 outline-none focus:border-primary disabled:bg-slate-50"
                                        />
                                      </td>
                                      <td className="py-2 px-2 whitespace-nowrap text-right">
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          disabled={analysisQuotation.isLocked}
                                          placeholder={formatMoneyInput(String(item.accessorySuggestedPrice ?? 0))}
                                          value={formatMoneyInput(
                                            accDrafts[item.positionId] ??
                                              (isSepManual(item) ? String(item.accessorySellingPrice) : ''),
                                          )}
                                          onChange={(e) =>
                                            setAccDrafts((prev) => ({
                                              ...prev,
                                              [item.positionId]: onlyDigits(e.target.value),
                                            }))
                                          }
                                          className="w-28 text-right text-xs font-bold placeholder:font-normal placeholder:text-slate-400 text-slate-800 border border-slate-200 rounded px-2 py-1 outline-none focus:border-primary disabled:bg-slate-50"
                                        />
                                      </td>
                                      <td className="py-2 px-2 whitespace-nowrap text-right">
                                        <span
                                          className={`font-bold ${
                                            isBelowCostLive(item) ? 'text-red-600' : 'text-slate-800'
                                          }`}
                                        >
                                          {formatVND(getTotalLive(item))}
                                        </span>
                                        {isBelowCostLive(item) && (
                                          <span className="block text-[10px] text-red-600">Thấp hơn chi phí</span>
                                        )}
                                      </td>
                                    </>
                                  ) : (
                                    <td className="py-2 px-2 whitespace-nowrap text-right">
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        disabled={analysisQuotation.isLocked}
                                        placeholder={formatMoneyInput(String(item.suggestedPrice))}
                                        value={formatMoneyInput(
                                          priceDrafts[item.positionId] ??
                                            (item.isManuallyEdited ? String(item.sellingPrice) : ''),
                                        )}
                                        onChange={(e) =>
                                          setPriceDrafts((prev) => ({
                                            ...prev,
                                            [item.positionId]: onlyDigits(e.target.value),
                                          }))
                                        }
                                        className={`w-32 text-right text-xs font-bold placeholder:font-normal placeholder:text-slate-400 border rounded px-2 py-1 outline-none focus:border-primary disabled:bg-slate-50 ${
                                          isBelowCostLive(item) ? 'text-red-600 border-red-300' : 'text-slate-800 border-slate-200'
                                        }`}
                                      />
                                      {item.isManuallyEdited && (
                                        <span className="block text-[10px] text-amber-600">Đã sửa giá tay</span>
                                      )}
                                      {isBelowCostLive(item) && (
                                        <span className="block text-[10px] text-red-600">Thấp hơn chi phí</span>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  )}
                </PriceBlock>
              </>
            )}
          </div>
        )}
      </div>

      {activeTab === 'config' && (
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-700 block">
            Các phương án báo giá đã lưu ({quotations.length})
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Lập nhiều phương án (PA1, PA2...) để so sánh tiền lãi, rồi chọn phương án để ký hợp đồng
          </span>
        </div>

        {isLoadingQuotations ? (
          <p className="text-xs text-slate-400 text-center py-8">Đang tải danh sách báo giá...</p>
        ) : quotations.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <FolderOpen className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400">Chưa có phương án báo giá nào được lưu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Mã & Tên</th>
                  <th className="py-2.5 px-3">Phiên bản</th>
                  <th className="py-2.5 px-3">Chi phí làm ra</th>
                  <th className="py-2.5 px-3">Khách trả</th>
                  <th className="py-2.5 px-3">Tiền lãi</th>
                  <th className="py-2.5 px-3">Lãi (%)</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {quotations.map((q) => (
                  <tr
                    key={q.id}
                    className={`transition-colors ${
                      q.id === analysisId
                        ? 'bg-primary/10'
                        : q.isSelected
                        ? 'bg-primary/5 font-medium'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-primary">{q.code}</span>
                          {q.isSelected && (
                            <span className="text-[10px] bg-primary text-white px-1.5 py-0.2 rounded font-semibold">
                              ĐÃ CHỌN
                            </span>
                          )}
                          {q.isLocked && <Lock size={12} className="text-amber-500" />}
                        </div>
                        <span className="text-slate-700 mt-0.5">{q.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">v{q.version}</td>
                    <td className="py-3 px-3 text-slate-600">{formatVND(q.workshopPrice)}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{formatVND(q.totalAmount)}</td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">
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
                          ? 'Khách đồng ý'
                          : q.status === 'sent'
                          ? 'Đã gửi khách'
                          : 'Bản nháp'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconAction title="Xem phân tích" onClick={() => handleViewAnalysis(q.id)}>
                          <Eye size={14} />
                        </IconAction>
                        <IconAction
                          title={q.isLocked ? 'Báo giá đã khóa theo hợp đồng, không thể sửa' : 'Chỉnh sửa'}
                          disabled={q.isLocked}
                          onClick={() => handleEdit(q)}
                        >
                          <Pencil size={14} />
                        </IconAction>
                        <IconAction title="Tạo bản sao để chỉnh sửa" onClick={() => cloneMutate(q)}>
                          <Copy size={14} />
                        </IconAction>
                        {!q.isSelected && (
                          <IconAction
                            title="Chọn phương án này để ký hợp đồng"
                            tone="primary"
                            onClick={() => selectMutate(q)}
                          >
                            <Check size={14} />
                          </IconAction>
                        )}
                        <IconAction
                          title={
                            q.isLocked
                              ? 'Báo giá đã khóa theo hợp đồng, không thể xóa'
                              : q.isSelected
                              ? 'Phương án đang được chọn, hãy chọn phương án khác trước khi xóa'
                              : 'Xóa phương án'
                          }
                          disabled={q.isLocked || q.isSelected}
                          onClick={() => setDeletingItem(q)}
                        >
                          <Trash2 size={14} />
                        </IconAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      <Modal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Xóa phương án báo giá"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc muốn xóa phương án <b>{deletingItem?.code}</b> - {deletingItem?.name}? Sau khi xóa
            sẽ không khôi phục được.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingItem(null)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isDeleting}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 border-red-600"
              onClick={() => deletingItem && deleteMutate(deletingItem)}
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
