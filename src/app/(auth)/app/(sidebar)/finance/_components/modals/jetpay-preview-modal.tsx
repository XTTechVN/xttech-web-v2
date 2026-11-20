'use client';

import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { Alert, Badge, Button, Modal } from '@/components';
import { VIETNAM_BANKS } from '@/config/finance';
import { showSuccessToast } from '@/utils/error';
import type { BankAccount } from '@/types';
import {
  JETPAY_FEATURE_CARDS,
  JETPAY_SECURITY_ITEMS,
} from './modals.constants';

export interface JetpayPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle?: string;
  bankAccount?: BankAccount | null;
}

export function JetpayPreviewModal({
  isOpen,
  onClose,
  actionTitle = 'JetPay Open Banking',
  bankAccount,
}: JetpayPreviewModalProps) {
  const handleNotifyInterest = () => {
    showSuccessToast(
      `Đã ghi nhận yêu cầu kích hoạt sớm tính năng "${actionTitle}" cho doanh nghiệp của bạn!`,
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{actionTitle}</span>
          <Badge variant="warning" size="sm" pill>
            Sắp ra mắt
          </Badge>
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles size={15} />}
            onClick={handleNotifyInterest}
          >
            Đăng ký trải nghiệm sớm
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert variant="info" title="Tính năng đang trong lộ trình phát triển (Open Banking)">
          Cổng kết nối ngân hàng trực tuyến <strong>XTTech JetPay</strong> đang được hoàn thiện tích hợp bảo mật với các ngân hàng đối tác. Hiện tại bạn có thể quản lý số dư, Báo Có và Ủy nhiệm chi thủ công hoàn chỉnh tại tab Ngân hàng.
        </Alert>

        {bankAccount && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
            <div>
              <span className="text-slate-500">Tài khoản đang chọn: </span>
              <strong className="text-slate-900">
                {bankAccount.bankName} — {bankAccount.accountNumber}
              </strong>
            </div>
            <Badge variant="primary" size="sm">
              {bankAccount.code} • TK {bankAccount.glAccountCode || '1121'}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {JETPAY_FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{card.title}</h4>
                    <Badge variant="default" size="sm">
                      <Clock size={11} className="mr-1" />
                      {card.etaBadge}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Ngân hàng dự kiến hỗ trợ đồng bộ sao kê &amp; chi hộ:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VIETNAM_BANKS.map((bank) => (
              <span
                key={bank.code}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                <span className="font-mono font-bold text-primary">{bank.code}</span>
                <span>{bank.shortName}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          {JETPAY_SECURITY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-2 rounded-lg"
              >
                <Icon size={14} className="text-primary shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
