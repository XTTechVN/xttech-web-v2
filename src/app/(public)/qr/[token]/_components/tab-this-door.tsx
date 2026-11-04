'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Ruler,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components';
import { DOOR_STATUS_MAP } from '@/config';
import type { PositionQrView, ProgressStepCode } from '@/types';
import { formatDateTimeVi, formatDateVi, mediaUrl } from './qr-helpers';
import { QrStaffProgressBox } from './qr-staff-progress-box';

const INSTALL_STEP_VALUES: ProgressStepCode[] = ['factory_done', 'installed'];

interface TabThisDoorProps {
  token: string;
  view: PositionQrView;
  isLoggedIn: boolean;
  onRequestWarrantyThisDoor: () => void;
  onRefresh: () => void;
}

export function TabThisDoor({
  token,
  view,
  isLoggedIn,
  onRequestWarrantyThisDoor,
  onRefresh,
}: TabThisDoorProps) {
  const [showBars, setShowBars] = useState(false);

  const statusBadge = DOOR_STATUS_MAP[view.status];
  const actionSteps = view.allowedNextSteps.filter((step) => INSTALL_STEP_VALUES.includes(step));
  const totalBarsCount = view.bars.reduce((sum, bar) => sum + (bar.qty || 0), 0);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#045863]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#045863]">
                {view.code}
              </span>
              {view.floorName && (
                <span className="text-xs font-medium text-slate-500">· {view.floorName}</span>
              )}
            </div>
            <h2 className="mt-1 text-base font-bold text-slate-900">
              {view.name || view.doorName}
            </h2>
          </div>
          <Badge variant={statusBadge ? statusBadge.variant : 'default'}>{view.statusLabel}</Badge>
        </div>

        <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-2.5 text-center">
          <div className="px-2">
            <div className="text-[10px] font-medium uppercase text-slate-400">Rộng</div>
            <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-slate-900">
              {view.width}
            </div>
            <div className="text-[10px] text-slate-400">mm</div>
          </div>
          <div className="px-2">
            <div className="text-[10px] font-medium uppercase text-slate-400">Cao</div>
            <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-slate-900">
              {view.height}
            </div>
            <div className="text-[10px] text-slate-400">mm</div>
          </div>
          <div className="px-2">
            <div className="text-[10px] font-medium uppercase text-slate-400">Diện tích</div>
            <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-slate-900">
              {view.areaM2}
            </div>
            <div className="text-[10px] text-slate-400">m²</div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Ruler size={12} className="text-[#045863]" />
          <span>
            {view.isMeasured
              ? `Đã đo thực tế${view.measuredAt ? ` ngày ${formatDateVi(view.measuredAt)}` : ''}`
              : 'Đang hiển thị kích thước thiết kế'}
          </span>
        </div>

        <button
          type="button"
          onClick={onRequestWarrantyThisDoor}
          className="mt-3.5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#045863] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03444d] active:scale-[0.99]"
        >
          <Wrench size={17} />
          <span>Báo bảo hành / Sửa chữa bộ cửa này</span>
        </button>
      </section>

      <section className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4 py-1 text-xs">
        {[
          ['Mẫu cửa', view.doorName],
          ['Hãng nhôm', view.brandName],
          ['Hệ nhôm', view.seriesName],
          ['Màu sơn bề mặt', view.colorName],
          ['Cấu hình kính', view.glassName],
        ].map(([label, value]) =>
          value ? (
            <div key={label} className="flex items-center justify-between py-2.5">
              <span className="text-slate-500">{label}</span>
              <span className="font-semibold text-slate-900">{value}</span>
            </div>
          ) : null,
        )}
      </section>

      {view.designImage && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bản vẽ kỹ thuật bộ cửa
          </div>
          <img
            src={mediaUrl(view.designImage)}
            alt={`Bản vẽ ${view.code}`}
            className="max-h-80 w-full rounded-xl bg-slate-50 object-contain"
          />
        </section>
      )}

      {view.bars.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setShowBars((prev) => !prev)}
            className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold text-slate-700"
          >
            <span className="flex items-center gap-2">
              <Layers size={15} className="text-[#045863]" />
              <span>Bóc tách thanh nhôm ({totalBarsCount} thanh)</span>
            </span>
            {showBars ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showBars && (
            <div className="divide-y divide-slate-100 border-t border-slate-100 text-xs">
              {view.bars.map((bar, index) => (
                <div
                  key={`${bar.name}-${index}`}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-slate-700">
                    {bar.profileCode ? `${bar.profileCode} · ` : ''}
                    {bar.name}
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">
                    {bar.length} mm × {bar.qty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Nhật ký sản xuất & lắp đặt
        </h3>
        <ol className="space-y-3 border-l-2 border-slate-200 pl-3.5">
          {[...view.timeline].reverse().map((item, index) => (
            <li key={`${item.stepCode}-${index}`} className="space-y-1 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <CheckCircle2
                  size={13}
                  className={
                    item.direction === 'backward' ? 'text-amber-500' : 'text-emerald-600'
                  }
                />
                <b className="text-slate-800">
                  {item.direction === 'backward' ? 'Lùi về: ' : ''}
                  {item.stepLabel}
                </b>
                <span className="font-mono text-[11px] tabular-nums text-slate-400">
                  {formatDateTimeVi(item.createdAt)}
                  {item.updatedBy ? ` · ${item.updatedBy}` : ''}
                </span>
              </div>
              {item.note && <p className="text-slate-600">{item.note}</p>}
              {item.evidenceMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.evidenceMedia.map((media) => (
                    <img
                      key={media.url}
                      src={mediaUrl(media.url)}
                      alt={media.name || 'Minh chứng'}
                      className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
          {view.timeline.length === 0 && (
            <li className="text-xs text-slate-400">Chưa có cập nhật tiến độ cho bộ cửa này.</li>
          )}
        </ol>
      </section>

      {isLoggedIn && actionSteps.length > 0 && (
        <QrStaffProgressBox
          token={token}
          projectId={view.projectId}
          actionSteps={actionSteps}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
