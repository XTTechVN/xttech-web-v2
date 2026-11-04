'use client';

import React from 'react';
import { Building2, CalendarCheck2, MapPin, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import type { PositionQrView, WarrantyState } from '@/types';
import { formatDateVi } from './qr-helpers';

interface QrProjectHeaderProps {
  view: PositionQrView;
  onOpenWarrantyBook: () => void;
}

const STATE_STYLE: Record<
  WarrantyState,
  {
    badgeBg: string;
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  active: {
    badgeBg: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40',
    label: 'Đang bảo hành',
    Icon: ShieldCheck,
  },
  not_started: {
    badgeBg: 'bg-amber-400/20 text-amber-100 border-amber-300/40',
    label: 'Chờ kích hoạt BH',
    Icon: ShieldAlert,
  },
  expired: {
    badgeBg: 'bg-rose-400/20 text-rose-100 border-rose-300/40',
    label: 'Hết hạn BH (Hỗ trợ sửa chữa)',
    Icon: ShieldOff,
  },
};

export function QrProjectHeader({ view, onOpenWarrantyBook }: QrProjectHeaderProps) {
  const { warrantyHeader } = view;
  const stateConfig = STATE_STYLE[warrantyHeader.state];
  const StatusIcon = stateConfig.Icon;

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#045863] via-[#034952] to-slate-900 p-4 lg:p-6 text-white shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 lg:gap-8">
        <div className="flex items-start justify-between gap-2 lg:flex-1 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-teal-200">
              <Building2 size={13} />
              <span>Hồ sơ Công trình & Bảo hành Điện tử</span>
            </div>
            <h1 className="mt-1 truncate text-base font-bold tracking-tight text-white sm:text-lg lg:text-xl">
              {view.projectName}
            </h1>
            {view.projectAddress && (
              <p className="mt-0.5 flex items-center gap-1 text-xs lg:text-sm text-slate-200/90">
                <MapPin size={12} className="shrink-0 text-teal-300" />
                <span className="line-clamp-1">{view.projectAddress}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenWarrantyBook}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3 lg:px-4 py-1.5 text-[11px] lg:text-xs font-semibold transition active:scale-95 cursor-pointer ${stateConfig.badgeBg}`}
          >
            <StatusIcon size={13} />
            <span>{stateConfig.label}</span>
          </button>
        </div>

        <div className="lg:w-[440px] xl:w-[480px] shrink-0 space-y-2">
          <div className="grid grid-cols-3 divide-x divide-white/15 rounded-xl bg-white/10 px-2 py-2.5 backdrop-blur-sm">
            <div className="px-2 text-center">
              <div className="text-[10px] uppercase tracking-wider text-teal-100/80">Quy mô</div>
              <div className="mt-0.5 font-mono text-sm lg:text-base font-bold tabular-nums text-white">
                {view.totalProjectDoors}{' '}
                <span className="font-sans text-[11px] font-normal">bộ cửa</span>
              </div>
            </div>

            <div className="px-2 text-center">
              <div className="text-[10px] uppercase tracking-wider text-teal-100/80">
                Thời hạn BH
              </div>
              <div className="mt-0.5 font-mono text-sm lg:text-base font-bold tabular-nums text-white">
                {warrantyHeader.warrantyMonths}{' '}
                <span className="font-sans text-[11px] font-normal">tháng</span>
              </div>
            </div>

            <div className="px-2 text-center">
              <div className="text-[10px] uppercase tracking-wider text-teal-100/80">
                {warrantyHeader.state === 'active' ? 'Còn lại' : 'Phiếu đang mở'}
              </div>
              <div className="mt-0.5 font-mono text-sm lg:text-base font-bold tabular-nums text-white">
                {warrantyHeader.state === 'active' &&
                warrantyHeader.daysRemaining !== null &&
                warrantyHeader.daysRemaining !== undefined ? (
                  <>
                    {warrantyHeader.daysRemaining}{' '}
                    <span className="font-sans text-[11px] font-normal">ngày</span>
                  </>
                ) : (
                  <>
                    {warrantyHeader.openClaimsCount}{' '}
                    <span className="font-sans text-[11px] font-normal">phiếu</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {warrantyHeader.startDate && warrantyHeader.endDate && (
            <div className="flex items-center justify-between text-[11px] text-teal-100/90 px-1">
              <span className="flex items-center gap-1">
                <CalendarCheck2 size={12} />
                Hiệu lực:{' '}
                <b className="font-mono tabular-nums text-white">
                  {formatDateVi(warrantyHeader.startDate)}
                </b>{' '}
                →{' '}
                <b className="font-mono tabular-nums text-white">
                  {formatDateVi(warrantyHeader.endDate)}
                </b>
              </span>
              <span className="font-mono tabular-nums">{warrantyHeader.elapsedPercent}%</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
