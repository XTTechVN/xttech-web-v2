'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getProjectContracts,
  createProjectContract,
  createProjectContractAppendix,
  signProjectContract,
  getProjectLedgerSummary,
  getProjectPaymentTransactions,
  createPaymentTransaction,
  reversePaymentTransaction,
} from '@/actions';
import { Button, Input, Modal, Select, Badge } from '@/components';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import type {
  ProjectContractItem,
  ProjectLedgerSummary,
  PaymentTransactionItem,
  ProjectQuotationItem,
} from '@/types';
import {
  FileText,
  Plus,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RotateCcw,
  Receipt,
  ChevronDown,
  Trash2,
} from 'lucide-react';

interface ProjectContractsLedgerProps {
  projectId: number;
  quotations: ProjectQuotationItem[];
}

interface MilestoneDraft {
  milestoneOrder: number;
  installmentName: string;
  percentage: number;
  dueDate: string;
  note: string;
}

const DEFAULT_MAIN_MILESTONES: MilestoneDraft[] = [
  {
    milestoneOrder: 1,
    installmentName: 'Tạm ứng đợt 1 (Ký hợp đồng)',
    percentage: 40,
    dueDate: '',
    note: 'Tạm ứng mua nguyên vật liệu nhôm kính',
  },
  {
    milestoneOrder: 2,
    installmentName: 'Thanh toán đợt 2 (Giao hàng đến chân công trình)',
    percentage: 40,
    dueDate: '',
    note: 'Tập kết cửa tại công trình',
  },
  {
    milestoneOrder: 3,
    installmentName: 'Quyết toán đợt 3 (Nghiệm thu bàn giao)',
    percentage: 20,
    dueDate: '',
    note: 'Bàn giao chìa khóa và bảo hành',
  },
];

const DEFAULT_APPENDIX_MILESTONES: MilestoneDraft[] = [
  {
    milestoneOrder: 1,
    installmentName: 'Thanh toán phụ lục khi nghiệm thu',
    percentage: 100,
    dueDate: '',
    note: 'Thanh toán 100% sau khi hoàn thành nghiệm thu phụ lục',
  },
];

export function ProjectContractsLedger({ projectId, quotations }: ProjectContractsLedgerProps) {
  // Queries
  const { data: contractsData, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['project_contracts', projectId],
    queryFn: () => getProjectContracts(projectId),
    enabled: !!projectId,
  });

  const { data: ledgerSummary } = useQuery<ProjectLedgerSummary>({
    queryKey: ['project_ledger_summary', projectId],
    queryFn: () => getProjectLedgerSummary(projectId),
    enabled: !!projectId,
  });

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['project_transactions', projectId],
    queryFn: () => getProjectPaymentTransactions(projectId),
    enabled: !!projectId,
  });

  const contracts: ProjectContractItem[] = contractsData?.items || [];
  const transactions: PaymentTransactionItem[] = transactionsData?.items || [];

  // Xác định hợp đồng chính
  const mainContract = contracts.find((c) => c.kind === 'main');
  const hasMainContract = !!mainContract;
  const isMainContractSigned =
    mainContract?.status === 'active' ||
    mainContract?.status === 'signed' ||
    mainContract?.status === 'completed';

  // Bộ lọc loại hợp đồng: 'all' | 'main' | 'appendix'
  const [contractKindFilter, setContractKindFilter] = useState<'all' | 'main' | 'appendix'>('all');

  const filteredContracts = contracts.filter((c) => {
    if (contractKindFilter === 'all') return true;
    return c.kind === contractKindFilter;
  });
  const mainContractsCount = contracts.filter((c) => c.kind === 'main').length;
  const appendixContractsCount = contracts.filter((c) => c.kind === 'appendix').length;

  // Modal states
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | ''>('');
  const [contractName, setContractName] = useState('Hợp đồng thi công nhôm kính');
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(DEFAULT_MAIN_MILESTONES);

  // Transaction Modal state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txMethod, setTxMethod] = useState<string>('bank_transfer');
  const [txReference, setTxReference] = useState('');
  const [txNote, setTxNote] = useState('');

  // Reversal Modal state
  const [reversingTx, setReversingTx] = useState<PaymentTransactionItem | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Contract milestone expand state
  const [expandedContractId, setExpandedContractId] = useState<number | null>(null);

  const selectedQuotation = quotations.find((q) => q.id === Number(selectedQuotationId));

  const totalPercentage = milestones.reduce(
    (sum, m) => sum + (Number(m.percentage) || 0),
    0,
  );

  const handleOpenContractModal = () => {
    if (hasMainContract && mainContract) {
      setContractName(`Phụ lục hợp đồng - ${mainContract.contractCode}`);
      setMilestones(DEFAULT_APPENDIX_MILESTONES);
    } else {
      setContractName('Hợp đồng thi công nhôm kính');
      setMilestones(DEFAULT_MAIN_MILESTONES);
    }
    setSelectedQuotationId('');
    setIsContractModalOpen(true);
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof MilestoneDraft,
    val: any,
  ) => {
    setMilestones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        milestoneOrder: prev.length + 1,
        installmentName: `Đợt ${prev.length + 1}`,
        percentage: 0,
        dueDate: '',
        note: '',
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((m, idx) => ({ ...m, milestoneOrder: idx + 1 })),
    );
  };

  // Mutations
  const { mutate: createContractMutate, isPending: isCreatingContract } = useMutation({
    mutationFn: () => {
      const formattedMilestones = milestones.map((m, idx) => ({
        milestoneOrder: idx + 1,
        installmentName: m.installmentName.trim() || `Đợt ${idx + 1}`,
        percentage: Number(m.percentage) || 0,
        dueDate: m.dueDate || undefined,
        note: m.note.trim() || undefined,
      }));

      // Nếu đã có HĐ chính -> Lập phụ lục hợp đồng (POST .../contracts/appendices)
      if (hasMainContract && mainContract) {
        return createProjectContractAppendix(projectId, {
          parentContractId: mainContract.id,
          quotationId: Number(selectedQuotationId),
          contractName: contractName.trim(),
          milestones: formattedMilestones,
        });
      }

      // Chưa có HĐ chính -> Tạo hợp đồng chính (POST .../contracts)
      return createProjectContract(projectId, {
        quotationId: Number(selectedQuotationId),
        contractName: contractName.trim(),
        milestones: formattedMilestones,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_contracts', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_ledger_summary', projectId] });
      const isAppendix = res.kind === 'appendix';
      toast.success(
        isAppendix
          ? `Đã tạo phụ lục hợp đồng ${res.contractCode}`
          : `Đã tạo hợp đồng chính ${res.contractCode}`
      );
      setIsContractModalOpen(false);
      setMilestones(hasMainContract ? DEFAULT_APPENDIX_MILESTONES : DEFAULT_MAIN_MILESTONES);
    },
    onError: (err) =>
      showErrorToast(
        err,
        hasMainContract ? 'Lỗi khi tạo phụ lục hợp đồng' : 'Lỗi khi tạo hợp đồng'
      ),
  });

  const { mutate: signContractMutate } = useMutation({
    mutationFn: (contractId: number) => signProjectContract(projectId, contractId, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_contracts', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã ký và kích hoạt hợp đồng ${res.contractCode}`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi ký hợp đồng'),
  });

  const { mutate: createTxMutate, isPending: isCreatingTx } = useMutation({
    mutationFn: () =>
      createPaymentTransaction(projectId, {
        projectId,
        amount: Number(txAmount),
        paymentMethod: txMethod,
        bankReference: txReference.trim() || undefined,
        note: txNote.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_transactions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_ledger_summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_contracts', projectId] });
      toast.success('Đã lưu phiếu thu tiền thành công');
      setIsTxModalOpen(false);
      setTxAmount(0);
      setTxReference('');
      setTxNote('');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lưu phiếu thu'),
  });

  const { mutate: reverseTxMutate, isPending: isReversing } = useMutation({
    mutationFn: () =>
      reversePaymentTransaction(projectId, {
        reversalOfId: reversingTx!.id,
        note: reversalReason.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_transactions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_ledger_summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_contracts', projectId] });
      toast.success('Đã tạo phiếu hoàn tiền thành công');
      setReversingTx(null);
      setReversalReason('');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi tạo phiếu hoàn tiền'),
  });

  const formatVND = (num?: number) =>
    num !== undefined ? num.toLocaleString('vi-VN') + ' đ' : '0 đ';

  const totalContractVal = ledgerSummary?.totalContractValue || 0;
  const totalCollectedVal = ledgerSummary?.totalCollected || 0;
  const collectionPercent = totalContractVal > 0
    ? Math.min(100, Math.round((totalCollectedVal / totalContractVal) * 100))
    : 0;

  return (
    <div className="space-y-4">
      {/* 4 Thẻ chỉ số tài chính tóm tắt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng giá trị hợp đồng</span>
            <FileText size={15} className="text-slate-400" />
          </div>
          <div className="text-base font-bold text-slate-800 mt-1">
            {formatVND(ledgerSummary?.totalContractValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Gồm hợp đồng chính và phụ lục
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600">Số tiền đã thu</span>
            <CheckCircle2 size={15} className="text-emerald-500" />
          </div>
          <div className="text-base font-bold text-emerald-600 mt-1">
            {formatVND(ledgerSummary?.totalCollected)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {ledgerSummary?.isFullyPaid ? 'Đã thu đủ 100%' : 'Đang thu theo từng đợt'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600">Số tiền còn lại</span>
            <AlertCircle size={15} className="text-amber-500" />
          </div>
          <div className="text-base font-bold text-amber-600 mt-1">
            {formatVND(ledgerSummary?.remainingDebt)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cần thu theo các đợt thi công
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">Lượt thu tiền</span>
            <Receipt size={15} className="text-primary" />
          </div>
          <div className="text-base font-bold text-primary mt-1">
            {ledgerSummary?.totalTransactionsCount ?? 0} lần thu
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tổng số lần đã thu tiền
          </div>
        </div>
      </div>

      {/* Bố cục 2 Cột: Hợp đồng (Trái) & Lịch sử thanh toán (Phải) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Cột 1: Danh sách hợp đồng & phụ lục (7 cột) */}
        <div className="xl:col-span-7 bg-white rounded-lg border border-slate-200/70 p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                Hợp đồng và phụ lục
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  {contracts.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {hasMainContract
                  ? 'Dự án đã có hợp đồng chính. Bạn có thể tạo thêm các phụ lục phát sinh.'
                  : 'Ký hợp đồng để chốt giá và chuyển sang sản xuất'}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={handleOpenContractModal}
              className="h-7.5 text-xs font-semibold px-2.5"
            >
              {hasMainContract ? 'Tạo phụ lục hợp đồng' : 'Tạo hợp đồng mới'}
            </Button>
          </div>

          {/* Tabs bộ lọc loại hợp đồng (All / Main / Appendix) */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <button
              type="button"
              onClick={() => setContractKindFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border-0 ${
                contractKindFilter === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              type="button"
              onClick={() => setContractKindFilter('main')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border-0 ${
                contractKindFilter === 'main'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Hợp đồng chính ({mainContractsCount})
            </button>
            <button
              type="button"
              onClick={() => setContractKindFilter('appendix')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border-0 ${
                contractKindFilter === 'appendix'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Phụ lục ({appendixContractsCount})
            </button>
          </div>

          {isLoadingContracts ? (
            <p className="text-xs text-slate-400 text-center py-6">Đang tải danh sách hợp đồng...</p>
          ) : filteredContracts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
              {contractKindFilter === 'all'
                ? 'Chưa có hợp đồng nào được tạo từ báo giá.'
                : contractKindFilter === 'main'
                ? 'Chưa có hợp đồng chính nào.'
                : 'Chưa có phụ lục hợp đồng nào.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {filteredContracts.map((c) => {
                const isExpanded = expandedContractId === c.id;
                const hasPayments = c.payments && c.payments.length > 0;
                return (
                  <div key={c.id} className="transition-colors hover:bg-slate-50/40">
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-xs">{c.contractCode}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                              c.kind === 'appendix'
                                ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                                : 'bg-blue-50 text-blue-700 border-blue-200/60'
                            }`}
                          >
                            {c.kind === 'appendix' ? 'Phụ lục hợp đồng' : 'Hợp đồng chính'}
                          </span>
                          {c.kind === 'appendix' && mainContract && (
                            <span className="text-[10px] text-slate-400">
                              (HĐ gốc: {mainContract.contractCode})
                            </span>
                          )}
                          <Badge
                            variant={
                              c.status === 'active' || c.status === 'signed'
                                ? 'success'
                                : c.status === 'draft'
                                ? 'default'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {c.status === 'active' || c.status === 'signed'
                              ? 'Đã ký'
                              : c.status === 'draft'
                              ? 'Chưa ký'
                              : c.status}
                          </Badge>
                        </div>
                        <div className="text-xs font-medium text-slate-700 truncate">{c.contractName}</div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-bold text-slate-800">{formatVND(c.totalAmount)}</div>
                          <div className="text-[11px] text-slate-400">
                            Đã thu: <span className="text-emerald-600 font-medium">{formatVND(c.paidAmount)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {c.status === 'draft' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-7 text-xs px-2.5"
                              onClick={() => {
                                if (confirm(`Xác nhận ký hợp đồng ${c.contractCode}?`))
                                  signContractMutate(c.id);
                              }}
                            >
                              Ký hợp đồng
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 size={13} /> Đã kích hoạt
                            </span>
                          )}

                          {c.kind === 'main' && (c.status === 'active' || c.status === 'signed') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                              onClick={handleOpenContractModal}
                              title="Lập phụ lục phát sinh từ hợp đồng chính này"
                            >
                              + Thêm phụ lục
                            </Button>
                          )}

                          {hasPayments && (
                            <button
                              type="button"
                              onClick={() => setExpandedContractId(isExpanded ? null : c.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer bg-transparent border-0"
                              title={isExpanded ? 'Thu gọn các đợt thanh toán' : 'Xem các đợt thanh toán'}
                            >
                              <ChevronDown
                                size={15}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Danh sách các đợt thanh toán chi tiết khi mở rộng */}
                    {isExpanded && hasPayments && (
                      <div className="px-3.5 pb-3.5 pt-1 bg-slate-50/70 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] font-semibold text-slate-500">Kế hoạch thanh toán theo đợt:</div>
                        <div className="space-y-1.5">
                          {c.payments!.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200/60"
                            >
                              <div>
                                <span className="font-medium text-slate-700">
                                  Đợt {p.milestoneOrder}: {p.installmentName}
                                </span>
                                <span className="text-slate-400 ml-1.5 text-[11px]">({p.percentage}%)</span>
                                {p.dueDate && (
                                  <span className="text-[11px] text-slate-400 block">
                                    Hạn thanh toán: {new Date(p.dueDate).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-slate-800">{formatVND(p.expectedAmount)}</div>
                                <div className="text-[11px] text-emerald-600">Đã thu: {formatVND(p.paidAmount)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cột 2: Lịch sử thanh toán & Thu tiền (5 cột) */}
        <div className="xl:col-span-5 bg-white rounded-lg border border-slate-200/70 p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                Lịch sử thanh toán
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  {transactions.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Danh sách các lần thu tiền và hoàn tiền
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<DollarSign size={14} />}
              onClick={() => setIsTxModalOpen(true)}
              className="h-7.5 text-xs font-semibold px-2.5"
            >
              Tạo phiếu thu
            </Button>
          </div>

          {/* Thanh tiến độ thu tiền tổng thể */}
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Tiến độ thanh toán</span>
              <span className="font-bold text-emerald-600">{collectionPercent}%</span>
            </div>
            <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${collectionPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Đã thu: {formatVND(ledgerSummary?.totalCollected)}</span>
              <span>Còn lại: {formatVND(ledgerSummary?.remainingDebt)}</span>
            </div>
          </div>

          {/* Danh sách các lần thanh toán dạng feed */}
          {isLoadingTransactions ? (
            <p className="text-xs text-slate-400 text-center py-6">Đang tải lịch sử thanh toán...</p>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
              <Receipt size={22} className="mx-auto text-slate-300 mb-1.5" />
              Chưa có lượt thu tiền nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden max-h-[460px] overflow-y-auto">
              {transactions.map((tx) => {
                const isNegative = tx.amount < 0;
                const formattedDate = new Date(tx.transactionDate || tx.createdAt).toLocaleDateString('vi-VN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={tx.id}
                    className={`p-3 text-xs flex items-start justify-between gap-3 transition-colors ${
                      isNegative ? 'bg-red-50/40 text-red-700' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800">{tx.transactionCode}</span>
                        <span className="text-[11px] text-slate-400">{formattedDate}</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                          {tx.paymentMethod === 'bank_transfer'
                            ? 'Chuyển khoản'
                            : tx.paymentMethod === 'cash'
                            ? 'Tiền mặt'
                            : tx.paymentMethod}
                        </span>
                      </div>
                      {tx.note && <p className="text-slate-600 text-[11px] truncate">{tx.note}</p>}
                      {tx.bankReference && (
                        <span className="text-[10px] text-slate-400 block">Mã GD ngân hàng: {tx.bankReference}</span>
                      )}
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div
                        className={`font-bold text-xs ${
                          isNegative ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {tx.amount > 0 ? `+${formatVND(tx.amount)}` : formatVND(tx.amount)}
                      </div>
                      {tx.amount > 0 && !tx.reversalOfId && (
                        <button
                          type="button"
                          title="Hoàn tiền cho khoản này"
                          onClick={() => {
                            setReversingTx(tx);
                            setReversalReason('');
                          }}
                          className="px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-650 rounded text-[10px] font-medium cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCcw size={10} /> Hoàn tiền
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tạo hợp đồng chính / Phụ lục hợp đồng */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        title={hasMainContract ? 'Tạo phụ lục hợp đồng' : 'Tạo hợp đồng chính từ báo giá'}
        size="lg"
        className="md:!max-w-3xl w-full"
      >
        <div className="space-y-4">
          {/* Thông tin loại văn bản (kind: main / appendix) */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Loại văn bản:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold text-[11px] border ${
                  hasMainContract
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {hasMainContract ? 'Phụ lục hợp đồng (kind: appendix)' : 'Hợp đồng chính (kind: main)'}
              </span>
            </div>
            {hasMainContract && mainContract ? (
              <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-1">
                <span>
                  Hợp đồng gốc liên kết: <strong className="text-slate-800">{mainContract.contractCode}</strong> ({mainContract.contractName})
                </span>
                <span className={`font-semibold ${isMainContractSigned ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isMainContractSigned ? '✓ HĐ gốc đã ký' : '⚠ HĐ gốc chưa ký'}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                Đây là hợp đồng chính của dự án. Sau khi ký kết, mọi phát sinh bổ sung sẽ được lập dưới dạng Phụ lục hợp đồng.
              </p>
            )}
          </div>

          {/* Cảnh báo nếu hợp đồng chính chưa ký */}
          {hasMainContract && !isMainContractSigned && mainContract && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" />
                Hợp đồng chính chưa được ký
              </div>
              <p className="text-[11px] text-amber-700">
                Hợp đồng chính <b>{mainContract.contractCode}</b> đang ở trạng thái <i>Chưa ký</i>. Bạn cần bấm nút <b>"Ký hợp đồng"</b> cho hợp đồng chính trước khi có thể lập phụ lục phát sinh.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label={hasMainContract ? 'Tên phụ lục hợp đồng *' : 'Tên hợp đồng chính *'}
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              fullWidth
            />
            <Select
              label={hasMainContract ? 'Chọn bảng báo giá phát sinh áp dụng *' : 'Chọn bảng báo giá đã duyệt *'}
              value={selectedQuotationId}
              onChange={(e) => setSelectedQuotationId(Number(e.target.value))}
              options={quotations.map((q) => {
                const isUsedInMain = hasMainContract && mainContract?.quotationId === q.id;
                return {
                  value: q.id,
                  label: `${q.code} - ${q.name} (${formatVND(q.totalAmount)})${
                    isUsedInMain ? ' [Đã dùng cho HĐ chính]' : ''
                  }`,
                };
              })}
              fullWidth
            />
          </div>

          {/* Cài đặt các kỳ thanh toán (paymentStages / milestones) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Cài đặt các đợt thanh toán {hasMainContract ? 'cho phụ lục' : ''}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Phân chia tỷ lệ % và hạn thanh toán theo các mốc tiến độ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    totalPercentage === 100
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  Tổng: {totalPercentage}%
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={handleAddMilestone}
                  className="h-7 text-xs px-2.5 font-semibold"
                >
                  Thêm đợt
                </Button>
              </div>
            </div>

            {/* Bảng phân bổ các đợt thanh toán */}
            <div className="border border-slate-200/80 rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500">
                <div className="col-span-1 text-center">Đợt</div>
                <div className="col-span-5">Tên đợt thanh toán</div>
                <div className="col-span-3">Tỷ lệ & Số tiền dự kiến</div>
                <div className="col-span-3">Hạn thanh toán</div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {milestones.map((m, idx) => {
                  const stageAmount = selectedQuotation
                    ? Math.round((selectedQuotation.totalAmount * (Number(m.percentage) || 0)) / 100)
                    : 0;
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2.5 px-3 py-2.5 items-center hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Đợt */}
                      <div className="col-span-1 text-center font-bold text-slate-700 text-xs">
                        #{idx + 1}
                      </div>

                      {/* Tên đợt */}
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="VD: Thanh toán đợt..."
                          value={m.installmentName}
                          onChange={(e) => handleMilestoneChange(idx, 'installmentName', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-800"
                        />
                      </div>

                      {/* Tỷ lệ % & Số tiền dự kiến */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-18 shrink-0">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              placeholder="0"
                              value={m.percentage}
                              onChange={(e) => handleMilestoneChange(idx, 'percentage', Number(e.target.value))}
                              className="w-full text-xs px-2 py-1.5 pr-5 rounded border border-slate-200 bg-white focus:outline-none focus:border-primary font-bold text-slate-800"
                            />
                            <span className="absolute right-1.5 top-1.5 text-slate-400 text-xs pointer-events-none">%</span>
                          </div>
                          {selectedQuotation && (
                            <span
                              className="text-[11px] text-emerald-600 font-semibold truncate"
                              title={formatVND(stageAmount)}
                            >
                              {formatVND(stageAmount)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hạn thanh toán & Xóa */}
                      <div className="col-span-3 flex items-center gap-1.5">
                        <input
                          type="date"
                          value={m.dueDate}
                          onChange={(e) => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-600"
                        />
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded cursor-pointer transition-colors shrink-0"
                            title="Xóa đợt này"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {totalPercentage !== 100 && (
              <p className="text-[11px] text-amber-600 font-medium">
                * Lưu ý: Tổng tỷ lệ phần trăm của các đợt thanh toán phải bằng đúng 100% để tạo hợp đồng.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsContractModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={
                !contractName.trim() ||
                !selectedQuotationId ||
                totalPercentage !== 100 ||
                (hasMainContract && !isMainContractSigned) ||
                isCreatingContract
              }
              loading={isCreatingContract}
              onClick={() => createContractMutate()}
            >
              {hasMainContract ? 'Tạo phụ lục' : 'Tạo hợp đồng'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Tạo phiếu thu tiền */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="Tạo phiếu thu tiền"
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Số tiền thu thực tế (VNĐ) *"
            value={txAmount}
            onChange={(e) => setTxAmount(Number(e.target.value))}
            fullWidth
          />
          <Select
            label="Hình thức thanh toán *"
            value={txMethod}
            onChange={(e) => setTxMethod(e.target.value)}
            options={[
              { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
              { value: 'cash', label: 'Tiền mặt' },
              { value: 'card', label: 'Thẻ tín dụng / POS' },
            ]}
            fullWidth
          />
          <Input
            label="Mã giao dịch ngân hàng (nếu có)"
            placeholder="VD: MBBANK-FT12345678"
            value={txReference}
            onChange={(e) => setTxReference(e.target.value)}
            fullWidth
          />
          <Input
            label="Ghi chú"
            placeholder="VD: Thu tiền đặt cọc đợt 1..."
            value={txNote}
            onChange={(e) => setTxNote(e.target.value)}
            fullWidth
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsTxModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={16} />}
              disabled={txAmount <= 0 || isCreatingTx}
              loading={isCreatingTx}
              onClick={() => createTxMutate()}
            >
              Lưu phiếu thu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Tạo phiếu hoàn tiền / Hủy thu */}
      <Modal
        isOpen={!!reversingTx}
        onClose={() => setReversingTx(null)}
        title="Tạo phiếu hoàn tiền"
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
            <span className="font-bold block">Xác nhận hoàn tiền cho giao dịch:</span>
            <span>Mã GD: {reversingTx?.transactionCode}</span>
            <span className="block font-bold">
              Số tiền hoàn trả: -{formatVND(reversingTx?.amount)}
            </span>
          </div>

          <Input
            label="Lý do hoàn tiền (bắt buộc) *"
            placeholder="VD: Khách chuyển thừa tiền cần hoàn trả lại..."
            value={reversalReason}
            onChange={(e) => setReversalReason(e.target.value)}
            fullWidth
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReversingTx(null)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={reversalReason.trim().length < 5 || isReversing}
              loading={isReversing}
              onClick={() => reverseTxMutate()}
            >
              Xác nhận hoàn tiền
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
