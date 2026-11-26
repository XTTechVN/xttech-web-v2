'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, Save } from 'lucide-react';
import { Alert, Button, Input, Modal, Select, Textarea } from '@/components';
import { createCashCount } from '@/actions/finance';
import { getEmployees } from '@/actions/employee';
import { VN_BANKNOTE_DENOMINATIONS } from '@/config/finance';
import { getLocalDateString } from '@/hooks/use-local-today';
import type { CashCountMinute } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { showErrorToast, showSuccessToast } from '@/utils/error';

export interface CashCountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookBalanceHint?: number;
  onSuccess?: (minute: CashCountMinute) => void;
}

function CashCountFormBody({
  bookBalanceHint = 0,
  onClose,
  onSuccess,
}: {
  bookBalanceHint?: number;
  onClose: () => void;
  onSuccess?: (minute: CashCountMinute) => void;
}) {
  const queryClient = useQueryClient();
  const [countDate, setCountDate] = useState(() => getLocalDateString());
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(VN_BANKNOTE_DENOMINATIONS.map((d) => [d, 0])),
  );
  const [cashierId, setCashierId] = useState('');
  const [accountantId, setAccountantId] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [differenceReason, setDifferenceReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: employeesRes } = useQuery({
    queryKey: ['finance', 'lookups', 'employees'],
    queryFn: () => getEmployees({ limit: 200 }),
    staleTime: 60_000,
  });

  const employeeOptions = useMemo(() => {
    const items = employeesRes?.items || [];
    return [
      { value: '', label: '-- Chọn nhân sự --' },
      ...items.map((emp) => ({
        value: emp.id,
        label: emp.fullName || emp.username || emp.id,
      })),
    ];
  }, [employeesRes]);

  const actualBalance = useMemo(
    () =>
      VN_BANKNOTE_DENOMINATIONS.reduce(
        (sum, denom) => sum + denom * Math.max(0, quantities[denom] || 0),
        0,
      ),
    [quantities],
  );

  const estimatedDiff = actualBalance - bookBalanceHint;

  const handleQtyChange = (denom: number, raw: string) => {
    const parsed = Math.max(0, Math.floor(Number(raw) || 0));
    setQuantities((prev) => ({ ...prev, [denom]: parsed }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countDate) {
      showErrorToast('Vui lòng chọn ngày kiểm kê quỹ.');
      return;
    }
    const breakdown = VN_BANKNOTE_DENOMINATIONS.map((denomination) => {
      const quantity = Math.max(0, quantities[denomination] || 0);
      return {
        denomination,
        quantity,
        subtotal: denomination * quantity,
      };
    });
    setSubmitting(true);
    try {
      const created = await createCashCount({
        countDate,
        denominationBreakdown: breakdown,
        cashierId: cashierId || undefined,
        accountantId: accountantId || undefined,
        witnessName: witnessName.trim() || undefined,
        differenceReason: differenceReason.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(`Đã lập Biên bản kiểm kê ${created.minuteNo}`);
      onSuccess?.(created);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Không thể lập biên bản kiểm kê quỹ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          label="Ngày kiểm kê *"
          type="date"
          value={countDate}
          onChange={(e) => setCountDate(e.target.value)}
          disabled={submitting}
          fullWidth
        />
        <Select
          label="Thủ quỹ"
          value={cashierId}
          onChange={(e) => setCashierId(e.target.value)}
          options={employeeOptions}
          searchable
          disabled={submitting}
          fullWidth
        />
        <Select
          label="Kế toán kiểm kê"
          value={accountantId}
          onChange={(e) => setAccountantId(e.target.value)}
          options={employeeOptions}
          searchable
          disabled={submitting}
          fullWidth
        />
        <Input
          label="Người chứng kiến (nếu có)"
          value={witnessName}
          placeholder="Họ tên người chứng kiến..."
          onChange={(e) => setWitnessName(e.target.value)}
          disabled={submitting}
          fullWidth
        />
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Banknote size={14} className="text-primary" />
            Bảng kê chi tiết mệnh giá tiền mặt thực kiểm (VNĐ)
          </span>
          <span className="font-mono font-bold text-primary tabular-nums">
            Tổng thực kiểm: {formatCurrency(actualBalance)}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:gap-px bg-slate-200">
          {VN_BANKNOTE_DENOMINATIONS.map((denom) => {
            const qty = quantities[denom] || 0;
            const sub = denom * qty;
            return (
              <div
                key={denom}
                className="bg-white px-3 py-2 flex items-center justify-between gap-2"
              >
                <span className="font-mono font-semibold text-slate-700 w-24">
                  {formatCurrency(denom)}
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={qty}
                  disabled={submitting}
                  onChange={(e) => handleQtyChange(denom, e.target.value)}
                  className="w-20 px-2 py-1 text-right font-mono rounded-lg border border-slate-200 focus:border-primary focus:outline-none"
                />
                <span className="font-mono tabular-nums text-right text-slate-900 font-semibold w-28">
                  {formatCurrency(sub)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Alert variant={estimatedDiff === 0 ? 'info' : 'warning'} title="Đối chiếu tạm tính với Sổ Quỹ hiện tại">
        Số dư Sổ Quỹ (tham khảo): <strong>{formatCurrency(bookBalanceHint)}</strong> • Thực kiểm:{' '}
        <strong>{formatCurrency(actualBalance)}</strong> • Chênh lệch dự kiến:{' '}
        <strong className={estimatedDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
          {estimatedDiff >= 0 ? '+' : ''}
          {formatCurrency(estimatedDiff)}
        </strong>{' '}
        (Hệ thống sẽ chốt chính xác số dư Sổ Quỹ tại cuối ngày kiểm kê khi lưu).
      </Alert>

      <Textarea
        label="Nguyên nhân chênh lệch / Ghi chú kiểm kê"
        rows={2}
        fullWidth
        disabled={submitting}
        value={differenceReason}
        placeholder="VD: Kiểm kê định kỳ cuối tháng, khớp 100% hoặc ghi rõ nguyên nhân thừa/thiếu..."
        onChange={(e) => setDifferenceReason(e.target.value)}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting} leftIcon={<Save size={14} />}>
          Lưu Biên bản Kiểm kê
        </Button>
      </div>
    </form>
  );
}

export function CashCountFormModal({
  isOpen,
  onClose,
  bookBalanceHint = 0,
  onSuccess,
}: CashCountFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Lập Biên bản Kiểm kê Quỹ Tiền mặt (TT99)"
    >
      {isOpen && (
        <CashCountFormBody
          bookBalanceHint={bookBalanceHint}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
