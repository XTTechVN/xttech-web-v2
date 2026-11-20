'use client';

import React from 'react';
import { Alert } from '@/components';
import { formatCurrency } from '@/utils/currency';
import type { VoucherType } from '@/types';
import { DEFAULT_NON_CASH_VAT_THRESHOLD } from './voucher-editor.constants';

export interface InvoiceDeductibilityBannerProps {
  voucherType: VoucherType;
  hasValidInvoice: boolean;
  totalAmount: number;
  nonCashVatThreshold?: number;
  nonInvoiceMediumThreshold?: number;
  nonInvoiceLargeThreshold?: number;
  hasVatInputLine?: boolean;
  hasLinkedInvoices?: boolean;
  hasCostAccountLine?: boolean;
  hasArchFix6ExemptLine?: boolean;
  hasProjectContext?: boolean;
  has811WithProject?: boolean;
}

export function InvoiceDeductibilityBanner({
  voucherType,
  hasValidInvoice,
  totalAmount,
  nonCashVatThreshold = DEFAULT_NON_CASH_VAT_THRESHOLD,
  nonInvoiceMediumThreshold = 500_000,
  nonInvoiceLargeThreshold = 2_000_000,
  hasVatInputLine = false,
  hasLinkedInvoices = false,
  hasArchFix6ExemptLine = false,
  hasProjectContext = false,
  has811WithProject = false,
}: InvoiceDeductibilityBannerProps) {
  const isPaymentOrJournal =
    voucherType === 'cash_payment' ||
    voucherType === 'bank_payment' ||
    voucherType === 'general_journal';
  const showCashThresholdWarning =
    voucherType === 'cash_payment' && totalAmount >= nonCashVatThreshold;
  const showMissingLinkedInvoice =
    hasValidInvoice && hasVatInputLine && !hasLinkedInvoices;

  const evidenceRequirementText =
    totalAmount >= nonInvoiceLargeThreshold
      ? `Mức lớn (≥ ${formatCurrency(nonInvoiceLargeThreshold)}): bắt buộc CẢ HAI Ảnh/PDF biên nhận đính kèm VÀ Người duyệt nội bộ trước khi ghi sổ.`
      : totalAmount >= nonInvoiceMediumThreshold
        ? `Mức trung bình (${formatCurrency(nonInvoiceMediumThreshold)} – < ${formatCurrency(nonInvoiceLargeThreshold)}): bắt buộc có Ảnh/PDF biên nhận đính kèm HOẶC Người duyệt nội bộ.`
        : `Mức nhỏ (< ${formatCurrency(nonInvoiceMediumThreshold)}): bắt buộc nhập đủ lý do chi và người nhận tiền/đối tác.`;

  return (
    <div className="space-y-2">
      {showCashThresholdWarning && (
        <Alert
          variant="danger"
          title={`Cảnh báo chi tiền mặt ≥ ${formatCurrency(nonCashVatThreshold)} (cộng dồn trong ngày)`}
        >
          Theo quy định thanh toán không dùng tiền mặt, khoản chi tiền mặt từ{' '}
          <strong>{formatCurrency(nonCashVatThreshold)}</strong> trở lên (hoặc tổng chi tiền mặt cùng ngày cho 1 NCC đạt ngưỡng) sẽ{' '}
          <strong>không được khấu trừ GTGT</strong> và bị loại sang{' '}
          <strong>Không được trừ thuế (B4)</strong>. Khuyến nghị chuyển sang{' '}
          <strong>Ủy nhiệm chi Ngân hàng</strong>.
        </Alert>
      )}

      {showMissingLinkedInvoice && (
        <Alert variant="warning" title="Yêu cầu gắn Hóa đơn GTGT đầu vào (TK 133*)">
          Chứng từ đang bật <strong>Có Hóa đơn GTGT hợp lệ</strong> và có dòng hạch toán{' '}
          <strong>Nợ TK 133*</strong>. Vui lòng chuyển sang tab{' '}
          <strong>2. Hóa đơn &amp; Thuế GTGT</strong> để tải XML hoặc gắn hóa đơn trước khi lưu.
        </Alert>
      )}

      {!hasValidInvoice && isPaymentOrJournal && (
        <Alert
          variant={hasArchFix6ExemptLine ? 'info' : 'warning'}
          title={
            hasArchFix6ExemptLine
              ? 'Bút toán tổng hợp / nội bộ miễn hóa đơn đầu vào'
              : 'Chi phí không có Hóa đơn GTGT — Kiểm soát Nội bộ & Chỉ tiêu B4'
          }
        >
          {hasArchFix6ExemptLine ? (
            <span>
              Các bút toán trích khấu hao (<strong>Có 214*</strong>), phân bổ (<strong>Có 242*</strong>), trích lương/BH (<strong>Có 334*/338*</strong>), thuế (<strong>333*/Nợ 821*</strong>), tạm ứng (<strong>141*</strong>) hoặc xuất kho (<strong>Có 152–156</strong>) mặc định <strong>Được trừ thuế</strong>. Bạn có thể bỏ tick từng dòng ngay trên lưới nếu cần loại trừ B4 (vd <em>Nợ 632 / Có 154</em> hoặc trích lương không đủ hồ sơ).
            </span>
          ) : (
            <div className="space-y-1.5">
              <div>
                {hasProjectContext ? (
                  <>
                    Đang gắn <strong>Công trình / Dự án</strong> — hạch toán đúng bản chất (<strong>621/622/623/627/154</strong>) để phản ánh trung thực lãi/lỗ công trình; hệ thống tự đánh dấu{' '}
                    <strong>Không được trừ thuế (B4)</strong> khi quyết toán TNDN.
                  </>
                ) : (
                  <>
                    Chi vặt vận hành hạch toán vào đúng TK bộ phận phát sinh (<strong>6278</strong> xưởng hoặc <strong>6428</strong> văn phòng, không dồn về 811) và tự động đánh dấu{' '}
                    <strong>Không được trừ thuế (B4)</strong> khi tính TNDN.
                  </>
                )}
              </div>
              <div className="text-[11px] bg-white/70 rounded px-2 py-1 border border-amber-200/70">
                <strong>Chứng từ nội bộ 3 mức:</strong> {evidenceRequirementText}
              </div>
              <div className="text-[11px] font-semibold text-rose-700">
                Lưu ý: Chứng từ nội bộ &amp; phê duyệt chỉ phục vụ kiểm soát nội bộ và giải trình thanh tra, KHÔNG biến khoản chi không hóa đơn (B4) thành chi phí được trừ thuế TNDN.
              </div>
            </div>
          )}
        </Alert>
      )}

      {has811WithProject && (
        <Alert variant="info" title="TK 811 đang gắn Công trình">
          Khoản chi phí khác (<strong>TK 811</strong>) chỉ dùng cho chi phí bất thường ngoài sản xuất kinh doanh (phạt, thanh lý TSCĐ) và kết chuyển thẳng vào Lãi/Lỗ kỳ hiện tại.
        </Alert>
      )}

      {hasValidInvoice && !showCashThresholdWarning && !showMissingLinkedInvoice && (
        <Alert variant="info" title="Chứng từ có Hóa đơn GTGT hợp lệ">
          Các khoản chi phí hợp lý có hóa đơn GTGT hợp lệ sẽ được tổng hợp vào{' '}
          <strong>Chi phí được trừ thuế TNDN</strong> và bảng kê khấu trừ GTGT (nếu có đính kèm hóa đơn ở tab 2).
        </Alert>
      )}
    </div>
  );
}
