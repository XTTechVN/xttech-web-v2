'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge, Button } from '@/components';
import type { BankAccount } from '@/types';
import { JETPAY_ACTIONS } from './bank-tab.constants';

export interface JetpayBankingBannerProps {
  selectedBank?: BankAccount | null;
  onOpenPreview: (actionTitle: string, bank?: BankAccount | null) => void;
}

export function JetpayBankingBanner({
  selectedBank,
  onOpenPreview,
}: JetpayBankingBannerProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-white to-sky-50/70 border border-primary/20 shadow-2xs">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
            <Sparkles size={16} />
            XTTech JetPay — Open Banking
          </span>
          <Badge variant="warning" size="sm" pill>
            Sắp ra mắt / Đang phát triển
          </Badge>
        </div>
        <p className="text-xs text-slate-600">
          Kết nối trực tiếp ngân hàng doanh nghiệp để tự động đồng bộ sao kê Báo Có / Báo Nợ và duyệt Ủy nhiệm chi trực tuyến.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {JETPAY_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              type="button"
              size="xs"
              variant={idx === 0 ? 'primary' : 'outline'}
              leftIcon={<Icon size={13} />}
              onClick={() => onOpenPreview(action.modalTitle, selectedBank)}
            >
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
