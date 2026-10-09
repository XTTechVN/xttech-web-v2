'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getProjectContracts,
  createProjectContract,
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
  FolderOpen,
  CreditCard,
} from 'lucide-react';

interface ProjectContractsLedgerProps {
  projectId: number;
  quotations: ProjectQuotationItem[];
}

export function ProjectContractsLedger({ projectId, quotations }: ProjectContractsLedgerProps) {
  // Modal states
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | ''>('');
  const [contractName, setContractName] = useState('Hợp đồng thi công nhôm kính');

  // Transaction Modal state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txMethod, setTxMethod] = useState<string>('bank_transfer');
  const [txReference, setTxReference] = useState('');
  const [txNote, setTxNote] = useState('');

  // Reversal Modal state
  const [reversingTx, setReversingTx] = useState<PaymentTransactionItem | null>(null);
  const [reversalReason, setReversalReason] = useState('');

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

  // Mutations
  const { mutate: createContractMutate, isPending: isCreatingContract } = useMutation({
    mutationFn: () =>
      createProjectContract(projectId, {
        quotationId: Number(selectedQuotationId),
        contractName: contractName.trim(),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_contracts', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_ledger_summary', projectId] });
      toast.success(`Đã tạo hợp đồng ${res.contractCode}`);
      setIsContractModalOpen(false);
    },
    onError: (err) => showErrorToast(err, 'Lỗi tạo hợp đồng'),
  });

  const { mutate: signContractMutate } = useMutation({
    mutationFn: (contractId: number) => signProjectContract(projectId, contractId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project_contracts', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_quotations_v2', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã ký kết và kích hoạt Hợp đồng ${res.contractCode}`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi ký hợp đồng'),
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
      toast.success('Đã ghi nhận bút toán thu tiền vào sổ cái');
      setIsTxModalOpen(false);
      setTxAmount(0);
      setTxReference('');
      setTxNote('');
    },
    onError: (err) => showErrorToast(err, 'Lỗi ghi nhận bút toán'),
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
      toast.success('Đã lập bút toán đảo điều chỉnh thành công');
      setReversingTx(null);
      setReversalReason('');
    },
    onError: (err) => showErrorToast(err, 'Lỗi thực hiện bút toán đảo'),
  });

  const formatVND = (num?: number) =>
    num !== undefined ? num.toLocaleString('vi-VN') + ' đ' : '0 đ';

  return (
    <div className="space-y-6">
      {/* Widget Báo cáo Sổ cái Tài chính Dòng tiền (Ledger Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">
            TỔNG GIÁ TRỊ HỢP ĐỒNG
          </span>
          <span className="text-xl font-bold font-mono text-slate-800 mt-1 block">
            {formatVND(ledgerSummary?.totalContractValue)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Bao gồm HĐ chính & Phụ lục đã ký
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 block uppercase">
            ĐÃ THU THỰC TẾ (SỔ CÁI)
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
            {formatVND(ledgerSummary?.totalCollected)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {ledgerSummary?.isFullyPaid ? 'Đã hoàn tất thanh toán' : 'Đang thu theo tiến độ'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 block uppercase">
            CÔNG NỢ CÒN PHẢI THU
          </span>
          <span className="text-xl font-bold font-mono text-amber-600 mt-1 block">
            {formatVND(ledgerSummary?.remainingDebt)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Cần thu theo các mốc lắp đặt/bàn giao
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-bold text-primary block uppercase">
            TỔNG SỐ BÚT TOÁN
          </span>
          <span className="text-xl font-bold font-mono text-primary mt-1 block">
            {ledgerSummary?.totalTransactionsCount ?? 0} bút toán
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Sổ cái kế toán ghi nhận bất biến
          </span>
        </div>
      </div>

      {/* Danh sách Hợp đồng kinh tế */}
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Danh sách Hợp đồng & Phụ lục ({contracts.length})
            </h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Ký hợp đồng để khóa cứng báo giá và bắt đầu điều phối sản xuất
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsContractModalOpen(true)}
            className="h-8 text-xs font-semibold"
          >
            Lập Hợp đồng mới
          </Button>
        </div>

        {isLoadingContracts ? (
          <p className="text-xs text-slate-400 text-center py-6">Đang tải hợp đồng...</p>
        ) : contracts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có hợp đồng nào được tạo từ báo giá.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Mã HĐ</th>
                  <th className="py-2.5 px-3">Tên hợp đồng</th>
                  <th className="py-2.5 px-3">Phân loại</th>
                  <th className="py-2.5 px-3">Tổng giá trị</th>
                  <th className="py-2.5 px-3">Đã thu</th>
                  <th className="py-2.5 px-3">Còn lại</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-primary">
                      {c.contractCode}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{c.contractName}</td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {c.kind === 'appendix' ? 'Phụ lục' : 'HĐ Chính'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {formatVND(c.totalAmount)}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600 font-semibold">
                      {formatVND(c.paidAmount)}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-600 font-semibold">
                      {formatVND(c.remainingAmount)}
                    </td>
                    <td className="py-3 px-3">
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
                          ? 'Có hiệu lực'
                          : c.status === 'draft'
                          ? 'Dự thảo'
                          : c.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.status === 'draft' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => {
                            if (confirm(`Xác nhận ký kết Hợp đồng ${c.contractCode}?`))
                              signContractMutate(c.id);
                          }}
                        >
                          Ký hợp đồng
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 size={13} /> Đã kích hoạt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sổ cái kế toán & Bút toán thu tiền (Ledger Transactions) */}
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Receipt size={14} className="text-primary" /> Bút toán giao dịch Sổ cái ({transactions.length})
            </h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Hệ thống lưu trữ bút toán bất biến (Immutable), hỗ trợ hoàn ứng bằng bút toán đảo (Reversal)
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<DollarSign size={14} />}
            onClick={() => setIsTxModalOpen(true)}
            className="h-8 text-xs font-semibold"
          >
            Lập phiếu thu tiền
          </Button>
        </div>

        {isLoadingTransactions ? (
          <p className="text-xs text-slate-400 text-center py-6">Đang tải lịch sử giao dịch...</p>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có phát sinh bút toán thu tiền nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Mã GD</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Hình thức</th>
                  <th className="py-2.5 px-3">Số tiền</th>
                  <th className="py-2.5 px-3">Ghi chú / Tham chiếu</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`transition-colors ${
                      tx.amount < 0 ? 'bg-red-50/40 text-red-700' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold">
                      {tx.transactionCode}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(tx.transactionDate || tx.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {tx.paymentMethod === 'bank_transfer'
                        ? 'Chuyển khoản'
                        : tx.paymentMethod === 'cash'
                        ? 'Tiền mặt'
                        : tx.paymentMethod}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono font-bold text-sm ${
                        tx.amount < 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {tx.amount > 0 ? `+${formatVND(tx.amount)}` : formatVND(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>
                        {tx.note || '—'}
                        {tx.bankReference && (
                          <span className="font-mono text-[11px] text-slate-400 block">
                            Ref: {tx.bankReference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {tx.amount > 0 && !tx.reversalOfId && (
                        <button
                          type="button"
                          title="Hoàn ứng / Bút toán đảo"
                          onClick={() => {
                            setReversingTx(tx);
                            setReversalReason('');
                          }}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCcw size={12} /> Đảo bút toán
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Lập Hợp Đồng */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        title="Tạo Hợp đồng kinh tế từ Báo giá"
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <Input
            label="Tên hợp đồng *"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            fullWidth
          />
          <Select
            label="Chọn phương án báo giá áp dụng *"
            value={selectedQuotationId}
            onChange={(e) => setSelectedQuotationId(Number(e.target.value))}
            options={quotations.map((q) => ({
              value: q.id,
              label: `${q.code} - ${q.name} (${formatVND(q.totalAmount)})`,
            }))}
            fullWidth
          />
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
            Hợp đồng tạo xong sẽ tự động phân bổ 3 đợt thanh toán mặc định: 40% (Đặt cọc) - 40% (Giao hàng) - 20% (Nghiệm thu).
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsContractModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!contractName.trim() || !selectedQuotationId || isCreatingContract}
              loading={isCreatingContract}
              onClick={() => createContractMutate()}
            >
              Xác nhận tạo HĐ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Lập Phiếu Thu Tiền */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="Lập bút toán thu tiền vào Sổ cái"
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Số tiền thu thực tế (VND) *"
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
            label="Mã giao dịch / UNC ngân hàng"
            placeholder="VD: MBBANK-FT12345678"
            value={txReference}
            onChange={(e) => setTxReference(e.target.value)}
            fullWidth
          />
          <Input
            label="Nội dung ghi chú"
            placeholder="VD: Thu cọc đợt 1..."
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
              Ghi nhận vào sổ cái
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Bút Toán Đảo / Hoàn Ứng */}
      <Modal
        isOpen={!!reversingTx}
        onClose={() => setReversingTx(null)}
        title="Lập bút toán đảo (Reversal Entry)"
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
            <span className="font-bold block">Xác nhận đảo bút toán:</span>
            <span>Mã GD: {reversingTx?.transactionCode}</span>
            <span className="block font-mono font-bold">
              Số tiền hoàn trả: -{formatVND(reversingTx?.amount)}
            </span>
          </div>

          <Input
            label="Lý do hoàn ứng / điều chỉnh (Bắt buộc) *"
            placeholder="VD: Khách chuyển nhầm thừa tiền..."
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
              Xác nhận đảo bút toán
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
