'use client';

import React, { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Badge } from '@/components';

export function RegimeHelpTooltip() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const isOpen = hovered || pinned;

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setHovered(false);
          setPinned(false);
        }
      }}
    >
      <button
        type="button"
        aria-label="Tìm hiểu Thông tư 200 và Thông tư 133"
        aria-expanded={isOpen}
        onFocus={() => setHovered(true)}
        onClick={() => setPinned((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-slate-400 hover:text-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors cursor-pointer"
      >
        <CircleHelp size={15} />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-0 top-full mt-2 z-50 w-[320px] sm:w-[440px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl text-left font-normal"
        >
          <div className="absolute -top-1.5 left-2.5 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white" />

          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-bold text-slate-900">
                Phân biệt Thông tư 200 &amp; Thông tư 133
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Cả hai đều là chế độ kế toán của Bộ Tài chính quy định hệ thống tài khoản (COA) và cách tập hợp chi phí, lên báo cáo tài chính.
              </p>
            </div>

            <div className="space-y-2">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Thông tư 200/2014/TT-BTC
                  </span>
                  <Badge variant="primary" size="sm">
                    Đầy đủ / Sản xuất
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Phù hợp:</strong> Doanh nghiệp vừa &amp; lớn, hoặc xưởng nhôm kính / thi công công trình cần bóc tách giá thành sâu.
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Hạch toán:</strong> Tách riêng chi phí sản xuất qua{' '}
                  <span className="font-mono font-semibold text-primary">621</span> (NVL),{' '}
                  <span className="font-mono font-semibold text-primary">622</span> (Nhân công),{' '}
                  <span className="font-mono font-semibold text-primary">623</span> (Máy),{' '}
                  <span className="font-mono font-semibold text-primary">627</span> (SX chung) trước khi kết chuyển sang{' '}
                  <span className="font-mono font-semibold text-primary">154</span>; tách riêng{' '}
                  <span className="font-mono font-semibold text-primary">641</span> (Bán hàng) &amp;{' '}
                  <span className="font-mono font-semibold text-primary">642</span> (Quản lý).
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Thông tư 133/2016/TT-BTC
                  </span>
                  <Badge variant="info" size="sm">
                    Tinh gọn SME
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Phù hợp:</strong> Doanh nghiệp nhỏ &amp; siêu nhỏ (SME), thương mại/dịch vụ ít công đoạn sản xuất.
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Hạch toán:</strong> Bỏ các tài khoản{' '}
                  <span className="font-mono font-semibold text-slate-800">621, 622, 623, 627</span> — tập hợp thẳng chi phí sản xuất vào{' '}
                  <span className="font-mono font-semibold text-slate-800">154</span>; gộp chi phí bán hàng &amp; quản lý vào{' '}
                  <span className="font-mono font-semibold text-slate-800">642</span> (
                  <span className="font-mono">6421</span>, <span className="font-mono">6422</span>).
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200/70 bg-amber-50/80 px-2.5 py-1.5 text-[11px] text-amber-800 leading-relaxed">
              <strong>Lưu ý:</strong> Chỉ có thể chuyển đổi chế độ kế toán khi hệ thống{' '}
              <strong>chưa phát sinh chứng từ</strong> để đảm bảo đồng nhất sổ cái.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
