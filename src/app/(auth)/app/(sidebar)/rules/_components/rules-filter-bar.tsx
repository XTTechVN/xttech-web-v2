'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  Globe,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  UserCheck,
  Users,
  X,
  Check,
} from 'lucide-react';
import { MultiSelect, Select, type MultiSelectOption } from '@/components';
import { cn } from '@/utils';
import { DOCUMENT_TYPE_MAP, RULES_SCOPE_LABEL_MAP, RULE_FILTER_TYPES } from '@/types';
import {
  CURRENT_SCOPE_CHIPS,
  CURRENT_STATUS_OPTIONS,
  EMPLOYEE_SCOPE_CHIPS,
  type CurrentScopeChip,
  type RulesTab,
} from '../_utils/rules-constants';

interface RulesFilterBarProps {
  tab: RulesTab;
  chip: CurrentScopeChip;
  canManage?: boolean;
  documentType: string;
  status: string;
  isUnreadOnly: boolean;
  isExpiringOnly: boolean;
  expiringSoonCount: number;
  departmentIds: string[];
  recipientUserIds: string[];
  departmentOptions: MultiSelectOption[];
  employeeOptions: MultiSelectOption[];
  hasActiveFilters: boolean;
  onChipChange: (chip: CurrentScopeChip) => void;
  onDocumentTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onUnreadOnlyChange: (isOn: boolean) => void;
  onExpiringOnlyChange: (isOn: boolean) => void;
  onDepartmentIdsChange: (ids: (string | number)[]) => void;
  onRecipientUserIdsChange: (ids: (string | number)[]) => void;
  onResetFilters: () => void;
}

const SCOPE_ICON_MAP: Record<CurrentScopeChip, React.ReactNode> = {
  all: <Layers size={13} />,
  company: <Globe size={13} />,
  department: <Building2 size={13} />,
  user: <Users size={13} />,
  mine: <UserCheck size={13} />,
};

const PILL_BASE =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer select-none transition-all whitespace-nowrap';
const PILL_ON = 'bg-primary text-white border-primary shadow-2xs font-semibold';
const PILL_OFF = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300';

export const RulesFilterBar: React.FC<RulesFilterBarProps> = (props) => {
  const {
    tab,
    chip,
    canManage = false,
    documentType,
    status,
    isUnreadOnly,
    isExpiringOnly,
    expiringSoonCount,
    departmentIds,
    recipientUserIds,
    departmentOptions,
    employeeOptions,
    hasActiveFilters,
  } = props;

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const isCurrentTab = tab === 'current';
  const scopeChips = canManage ? CURRENT_SCOPE_CHIPS : EMPLOYEE_SCOPE_CHIPS;

  const deptLabelMap = useMemo(
    () => new Map(departmentOptions.map((opt) => [String(opt.value), opt.label])),
    [departmentOptions],
  );
  const empLabelMap = useMemo(
    () => new Map(employeeOptions.map((opt) => [String(opt.value), opt.label])),
    [employeeOptions],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (chip !== 'all') count += 1;
    if (documentType) count += 1;
    if (status) count += 1;
    if (isUnreadOnly) count += 1;
    if (isExpiringOnly) count += 1;
    if (departmentIds.length > 0) count += departmentIds.length;
    if (recipientUserIds.length > 0) count += recipientUserIds.length;
    return count;
  }, [chip, documentType, status, isUnreadOnly, isExpiringOnly, departmentIds.length, recipientUserIds.length]);

  const removeDepartment = (id: string) => {
    props.onDepartmentIdsChange(departmentIds.filter((item) => item !== id));
  };

  const removeEmployee = (id: string) => {
    props.onRecipientUserIdsChange(recipientUserIds.filter((item) => item !== id));
  };

  if (!isCurrentTab) {
    return (
      <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0">Loại cơ chế:</span>
        <button
          type="button"
          onClick={() => props.onDocumentTypeChange('')}
          className={cn(PILL_BASE, 'py-1', !documentType ? PILL_ON : PILL_OFF)}
        >
          Tất cả
        </button>
        {RULE_FILTER_TYPES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => props.onDocumentTypeChange(documentType === key ? '' : key)}
            className={cn(PILL_BASE, 'py-1', documentType === key ? PILL_ON : PILL_OFF)}
          >
            {DOCUMENT_TYPE_MAP[key]?.label || key}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ============================================================== */}
      {/* MOBILE BAR: Thanh lọc nhanh 1 dòng siêu gọn cho Touch Devices */}
      {/* ============================================================== */}
      <div className="flex md:hidden items-center gap-1.5 px-3 py-2 border-b border-slate-200/80 bg-slate-50/70 overflow-x-auto no-scrollbar">
        {/* Nút kích hoạt Bottom Sheet Bộ lọc đầy đủ */}
        <button
          type="button"
          onClick={() => setIsMobileSheetOpen(true)}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 transition-colors cursor-pointer shadow-2xs',
            activeFiltersCount > 0
              ? 'bg-primary text-white border-primary font-semibold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
          )}
        >
          <SlidersHorizontal size={12} />
          <span>Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Quick Toggles */}
        <button
          type="button"
          onClick={() => props.onChipChange('all')}
          className={cn(PILL_BASE, 'py-1 px-2.5', chip === 'all' && !isUnreadOnly && !isExpiringOnly ? PILL_ON : PILL_OFF)}
        >
          Tất cả
        </button>

        <button
          type="button"
          onClick={() => props.onUnreadOnlyChange(!isUnreadOnly)}
          className={cn(PILL_BASE, 'py-1 px-2.5', isUnreadOnly ? PILL_ON : PILL_OFF)}
        >
          Chưa đọc
        </button>

        <button
          type="button"
          onClick={() => props.onExpiringOnlyChange(!isExpiringOnly)}
          className={cn(PILL_BASE, 'py-1 px-2.5', isExpiringOnly ? PILL_ON : PILL_OFF)}
        >
          Sắp hết hạn{expiringSoonCount > 0 ? ` (${expiringSoonCount})` : ''}
        </button>

        <button
          type="button"
          onClick={() => props.onChipChange(chip === 'company' ? 'all' : 'company')}
          className={cn(PILL_BASE, 'py-1 px-2.5', chip === 'company' ? PILL_ON : PILL_OFF)}
        >
          Toàn công ty
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={props.onResetFilters}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
            title="Xóa toàn bộ bộ lọc"
          >
            <RotateCcw size={11} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* DESKTOP BAR: Giữ nguyên 100% giao diện đầy đủ cho máy tính */}
      {/* ============================================================== */}
      <div className="hidden md:flex flex-col gap-2.5 px-4 py-3 border-b border-slate-200/80 bg-slate-50/60">
        {/* Row 1: Phạm vi áp dụng + Bộ lọc Phòng ban & Cá nhân dành cho Manager */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Phạm vi:
            </span>
            {scopeChips.map((key) => (
              <button
                key={key}
                id={`rules-chip-${key}`}
                type="button"
                onClick={() => props.onChipChange(key)}
                className={cn(PILL_BASE, chip === key ? PILL_ON : PILL_OFF)}
              >
                {SCOPE_ICON_MAP[key]}
                <span>{RULES_SCOPE_LABEL_MAP[key]}</span>
              </button>
            ))}
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
              <div className="w-full sm:w-56">
                <MultiSelect
                  id="rules-filter-departments"
                  options={departmentOptions}
                  value={departmentIds}
                  onChange={props.onDepartmentIdsChange}
                  placeholder="🏢 Lọc theo phòng ban..."
                  searchPlaceholder="Tìm phòng ban..."
                  className="h-8! text-xs! rounded-lg!"
                  fullWidth
                />
              </div>
              <div className="w-full sm:w-60">
                <MultiSelect
                  id="rules-filter-employees"
                  options={employeeOptions}
                  value={recipientUserIds}
                  onChange={props.onRecipientUserIdsChange}
                  placeholder="👤 Lọc theo cá nhân..."
                  searchPlaceholder="Tìm tên hoặc email nhân sự..."
                  className="h-8! text-xs! rounded-lg!"
                  fullWidth
                />
              </div>
            </div>
          )}
        </div>

        {/* Selected Department / Individual Tag Chips (Manager) */}
        {canManage && (departmentIds.length > 0 || recipientUserIds.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {departmentIds.map((id) => (
              <span
                key={`dept-${id}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <Building2 size={11} className="shrink-0" />
                <span>{deptLabelMap.get(id) || `Phòng ban #${id}`}</span>
                <button
                  type="button"
                  onClick={() => removeDepartment(id)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-indigo-200/60 cursor-pointer"
                  title="Bỏ lọc phòng ban này"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {recipientUserIds.map((id) => (
              <span
                key={`user-${id}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
              >
                <Users size={11} className="shrink-0" />
                <span>{empLabelMap.get(id) || 'Nhân sự'}</span>
                <button
                  type="button"
                  onClick={() => removeEmployee(id)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-amber-200/60 cursor-pointer"
                  title="Bỏ lọc cá nhân này"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Row 2: Loại văn bản (Quick Pills) + Trạng thái + Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
              Loại văn bản:
            </span>
            <button
              type="button"
              onClick={() => props.onDocumentTypeChange('')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                !documentType
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100',
              )}
            >
              Tất cả
            </button>
            {RULE_FILTER_TYPES.map((key) => {
              const isSelected = documentType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => props.onDocumentTypeChange(isSelected ? '' : key)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                    isSelected
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100',
                  )}
                >
                  {DOCUMENT_TYPE_MAP[key]?.label || key}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="w-40">
              <Select
                fullWidth
                value={status}
                onChange={(e) => props.onStatusChange(e.target.value)}
                options={CURRENT_STATUS_OPTIONS}
                className="h-8! text-xs! py-0!"
              />
            </div>

            <button
              id="rules-filter-unread"
              type="button"
              onClick={() => props.onUnreadOnlyChange(!isUnreadOnly)}
              className={cn(PILL_BASE, 'py-1', isUnreadOnly ? PILL_ON : PILL_OFF)}
            >
              Chưa đọc
            </button>

            <button
              id="rules-filter-expiring"
              type="button"
              onClick={() => props.onExpiringOnlyChange(!isExpiringOnly)}
              className={cn(PILL_BASE, 'py-1', isExpiringOnly ? PILL_ON : PILL_OFF)}
            >
              Sắp hết hiệu lực{expiringSoonCount > 0 ? ` (${expiringSoonCount})` : ''}
            </button>

            {hasActiveFilters && (
              <button
                id="rules-filter-reset"
                type="button"
                onClick={props.onResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM SHEET MODAL: Bộ lọc chuyên sâu cho Mobile Touch */}
      {/* ============================================================== */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileSheetOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-slate-800">Bộ lọc quy chế &amp; văn bản</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Phạm vi áp dụng */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phạm vi áp dụng
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {scopeChips.map((key) => {
                    const isSelected = chip === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => props.onChipChange(key)}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-colors text-left',
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700',
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          {SCOPE_ICON_MAP[key]}
                          <span>{RULES_SCOPE_LABEL_MAP[key]}</span>
                        </span>
                        {isSelected && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Loại văn bản */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Loại văn bản
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => props.onDocumentTypeChange('')}
                    className={cn(PILL_BASE, 'py-1 px-2.5', !documentType ? PILL_ON : PILL_OFF)}
                  >
                    Tất cả
                  </button>
                  {RULE_FILTER_TYPES.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => props.onDocumentTypeChange(documentType === key ? '' : key)}
                      className={cn(PILL_BASE, 'py-1 px-2.5', documentType === key ? PILL_ON : PILL_OFF)}
                    >
                      {DOCUMENT_TYPE_MAP[key]?.label || key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Trạng thái hiệu lực
                </label>
                <Select
                  fullWidth
                  value={status}
                  onChange={(e) => props.onStatusChange(e.target.value)}
                  options={CURRENT_STATUS_OPTIONS}
                  className="h-9 text-xs"
                />
              </div>

              {/* Bộ lọc phòng ban & nhân sự nếu là Manager */}
              {canManage && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      🏢 Lọc theo phòng ban
                    </label>
                    <MultiSelect
                      options={departmentOptions}
                      value={departmentIds}
                      onChange={props.onDepartmentIdsChange}
                      placeholder="Chọn phòng ban..."
                      searchPlaceholder="Tìm phòng ban..."
                      className="text-xs rounded-lg"
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      👤 Lọc theo cá nhân
                    </label>
                    <MultiSelect
                      options={employeeOptions}
                      value={recipientUserIds}
                      onChange={props.onRecipientUserIdsChange}
                      placeholder="Chọn nhân sự..."
                      searchPlaceholder="Tìm tên hoặc email..."
                      className="text-xs rounded-lg"
                      fullWidth
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    props.onResetFilters();
                  }}
                  className="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-rose-600 text-xs font-medium hover:bg-rose-50"
                >
                  Xóa bộ lọc
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
