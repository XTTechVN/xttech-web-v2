'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components';
import { getOpeningBalances } from '@/actions/finance';
import { getLocalDateString } from '@/hooks/use-local-today';
import type { VoucherDetail } from '@/types';
import { useVoucherLookups } from '../voucher-editor';
import { OpeningBalanceBody } from './opening-balance-body';

export interface OpeningBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (voucher: VoucherDetail) => void;
}

export function OpeningBalanceModal({
  isOpen,
  onClose,
  onSuccess,
}: OpeningBalanceModalProps) {
  const [effectiveDate, setEffectiveDate] = useState<string>(
    `${new Date().getFullYear()}-01-01` || getLocalDateString(),
  );

  const { lookups } = useVoucherLookups(isOpen);

  const {
    data: entries = [],
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['finance', 'opening-balances'],
    queryFn: () => getOpeningBalances(),
    enabled: isOpen,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Nhập Số Dư Đầu Kỳ (Sổ Tài chính hợp nhất)"
    >
      {isOpen && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Đang tải số dư đầu kỳ...
            </div>
          ) : (
            <OpeningBalanceBody
              key={`opening-body-${dataUpdatedAt}`}
              initialEntries={entries}
              accounts={lookups.accounts}
              bankAccounts={lookups.bankAccounts}
              customers={lookups.customers}
              suppliers={lookups.suppliers}
              projects={lookups.projects}
              effectiveDate={effectiveDate}
              onChangeDate={setEffectiveDate}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
