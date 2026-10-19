'use client';

import React from 'react';
import type { ProjectDetail } from '@/types';
import { 
  Building2, 
  Layers, 
  MapPin, 
  Clock, 
  UserCheck, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  Hash, 
  Calendar,
  Plus,
  ArrowUpRight,
  Calculator,
  DoorOpen
} from 'lucide-react';

interface ProjectInspectorProps {
  project: ProjectDetail;
  formattedDate: string;
  onSelectTab?: (tab: string) => void;
  onOpenQuotationModal?: () => void;
}

export function ProjectInspector({ 
  project, 
  formattedDate, 
  onSelectTab, 
  onOpenQuotationModal 
}: ProjectInspectorProps) {
  const customer = project.customer;
  const user = project.user;

  const getInitials = (name?: string, fallback = 'KH') => {
    if (!name) return fallback;
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Khối Thao tác nhanh (Quick Actions) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Thao tác nghiệp vụ
        </span>
        <div className="grid grid-cols-1 gap-2">
          {onOpenQuotationModal && (
            <button
              type="button"
              onClick={onOpenQuotationModal}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110 transition-all shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Calculator size={14} />
                Lập báo giá mới
              </span>
              <Plus size={14} />
            </button>
          )}

          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab('positions')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/70 text-xs font-semibold hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <DoorOpen size={14} className="text-slate-500" />
                Vị trí & Bản vẽ cửa ({project.totalPositions ?? 0})
              </span>
              <ArrowUpRight size={13} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Hồ sơ Đối tác & Phụ trách */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {/* 1. Chủ đầu tư / Khách hàng */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={13} className="text-primary" />
              Chủ đầu tư / Khách hàng
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Active
            </span>
          </div>

          {customer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70">
                  {getInitials(customer.name, 'KH')}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate" title={customer.name || ''}>
                    {customer.name || 'Chưa đặt tên'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {customer.type || 'Khách hàng cá nhân'}
                  </div>
                </div>
              </div>

              {/* Nút hành động nhanh: Gọi điện & Email */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50/70 border border-teal-200/60 text-primary text-xs font-semibold hover:bg-teal-100 transition-colors"
                  >
                    <Phone size={12} />
                    <span>Gọi điện</span>
                  </a>
                ) : (
                  <span className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-300 text-xs">
                    <Phone size={12} />
                    <span>Không có số</span>
                  </span>
                )}

                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    <Mail size={12} />
                    <span>Gửi Mail</span>
                  </a>
                ) : (
                  <span className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-300 text-xs">
                    <Mail size={12} />
                    <span>Không email</span>
                  </span>
                )}
              </div>

              {/* Thông tin chi tiết */}
              <div className="pt-2 space-y-2 text-xs border-t border-slate-100">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 text-xs leading-snug">
                    {customer.address || 'Chưa có địa chỉ khách hàng'}
                  </span>
                </div>

                {customer.identifyCode && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <CreditCard size={13} className="text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-700 text-xs">
                      {customer.identifyCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-2">Chưa liên kết thông tin khách hàng</p>
          )}
        </div>

        {/* 2. Người phụ trách kỹ thuật */}
        <div className="p-4 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-primary" />
            Nhân sự phụ trách
          </span>

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200/70">
                  {getInitials(user.fullName as string, 'NV')}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate" title={(user.fullName as string) || ''}>
                    {(user.fullName as string) || 'Chưa gán nhân sự'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Quản lý dự án / Kỹ thuật
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2 text-xs border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${user.email}`}
                    className="font-medium text-slate-700 hover:text-primary transition-colors truncate block text-xs"
                    title={(user.email as string) || ''}
                  >
                    {(user.email as string) || '—'}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Hash size={13} className="text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-700 text-xs">
                    Mã NV: {(user.identifyCode as string) || '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-2">Chưa phân công nhân sự quản lý</p>
          )}
        </div>
      </div>
    </div>
  );
}
