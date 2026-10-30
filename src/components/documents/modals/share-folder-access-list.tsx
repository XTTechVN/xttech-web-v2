'use client';

import React from 'react';
import { Building2, Edit3, Eye, Globe, ShieldCheck, Trash2, User } from 'lucide-react';
import { MultiSelect } from '@/components';
import type { FolderShare } from '@/types';
import { cn } from '@/utils';

interface ShareTargetSelectorProps {
  isDoc: boolean;
  shareTarget: 'user' | 'department' | 'all';
  onShareTargetChange: (target: 'user' | 'department' | 'all') => void;
  permission: 'view' | 'edit';
  onPermissionChange: (perm: 'view' | 'edit') => void;
  employeeOptions: any[];
  selectedUserIds: (string | number)[];
  onSelectedUserIdsChange: (ids: (string | number)[]) => void;
  departmentOptions: any[];
  selectedDepartmentIds: (string | number)[];
  onSelectedDepartmentIdsChange: (ids: (string | number)[]) => void;
}

export const ShareTargetSelector: React.FC<ShareTargetSelectorProps> = ({
  isDoc,
  shareTarget,
  onShareTargetChange,
  permission,
  onPermissionChange,
  employeeOptions,
  selectedUserIds,
  onSelectedUserIdsChange,
  departmentOptions,
  selectedDepartmentIds,
  onSelectedDepartmentIdsChange,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700">Đối tượng chia sẻ</label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-md border border-gray-200">
          {([
            { key: 'user', label: 'Cá nhân', icon: <User size={14} className="shrink-0" /> },
            { key: 'department', label: 'Phòng ban', icon: <Building2 size={14} className="shrink-0" /> },
            { key: 'all', label: 'Cả hệ thống', icon: <Globe size={14} className="shrink-0" /> },
          ] as const).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onShareTargetChange(item.key)}
              className={cn(
                'flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all cursor-pointer truncate',
                shareTarget === item.key ? 'bg-white text-primary shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700">Quyền hạn</label>
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-md border border-gray-200">
          {([
            { key: 'view', label: 'Người xem', icon: <Eye size={14} className="shrink-0" /> },
            { key: 'edit', label: 'Người sửa', icon: <Edit3 size={14} className="shrink-0" /> },
          ] as const).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onPermissionChange(item.key)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-all cursor-pointer truncate',
                permission === item.key ? 'bg-white text-primary shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    {shareTarget === 'user' && (
      <MultiSelect
        label="Chọn nhân sự muốn chia sẻ"
        options={employeeOptions}
        value={selectedUserIds}
        onChange={onSelectedUserIdsChange}
        placeholder="Chọn nhân sự..."
        searchPlaceholder="Tìm kiếm nhân sự..."
      />
    )}
    {shareTarget === 'department' && (
      <MultiSelect
        label="Chọn phòng ban muốn chia sẻ"
        options={departmentOptions}
        value={selectedDepartmentIds}
        onChange={onSelectedDepartmentIdsChange}
        placeholder="Chọn phòng ban..."
        searchPlaceholder="Tìm kiếm phòng ban..."
      />
    )}
    {shareTarget === 'all' && (
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-xs font-medium text-primary">
        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
          <Globe size={18} />
        </div>
        <div>
          <p className="font-semibold text-primary">Chia sẻ toàn hệ thống</p>
          <p className="text-[11px] text-primary/80 mt-0.5">
            {isDoc ? 'Tài liệu' : 'Thư mục'} sẽ được mở cho Tất cả người dùng trong hệ thống với quyền{' '}
            <strong>{permission === 'edit' ? 'Người sửa (Upload & sửa)' : 'Người xem (Chỉ xem & tải)'}</strong>.
          </p>
        </div>
      </div>
    )}
  </div>
);

interface ShareFolderAccessListProps {
  isDoc: boolean;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  currentUserId?: string | number;
  filteredShares: FolderShare[];
  isLoadingShares: boolean;
  employeeMap: Map<string, any>;
  departmentMap: Map<string, any>;
  onRevokeClick: (shareId: number | string, displayName: string) => void;
}

export const ShareFolderAccessList: React.FC<ShareFolderAccessListProps> = ({
  isDoc,
  ownerId,
  ownerName,
  ownerEmail,
  currentUserId,
  filteredShares,
  isLoadingShares,
  employeeMap,
  departmentMap,
  onRevokeClick,
}) => {
  return (
    <div className="pt-4 border-t border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Những người có quyền truy cập
        </h4>
        <span className="text-xs text-gray-400 font-medium">{filteredShares.length + 1} đối tượng</span>
      </div>

      <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto pr-1">
        <div className="py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {ownerName.charAt(0) || 'C'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 truncate">
                {ownerName} {ownerId && currentUserId && ownerId === String(currentUserId) ? '(Bạn)' : ''}
              </span>
              <span className="text-[11px] text-gray-400 truncate">{ownerEmail || 'Chủ sở hữu'}</span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <ShieldCheck size={11} className="inline-block mr-1 text-gray-500" />
            Chủ sở hữu
          </span>
        </div>

        {isLoadingShares ? (
          <div className="py-4 text-center text-xs text-gray-400">Đang tải danh sách...</div>
        ) : filteredShares.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-400 italic">
            Chưa chia sẻ {isDoc ? 'tài liệu' : 'thư mục'} này cho ai khác.
          </div>
        ) : (
          filteredShares.map((share) => {
            const isAllSystem = Boolean(
              (share as any).isAll ||
                (share as any).isSystem ||
                (share as any).shareType === 'all' ||
                (!share.userId && !share.departmentId && !share.department),
            );
            const isDept = !isAllSystem && Boolean(share.departmentId || share.department || share.departmentName);
            const emp = share.userId ? employeeMap.get(String(share.userId)) : null;
            const dept = share.departmentId ? departmentMap.get(String(share.departmentId)) : null;

            const displayName = isAllSystem
              ? 'Toàn bộ hệ thống'
              : isDept
                ? dept?.name || share.departmentName || share.department?.name || `Phòng ban #${share.departmentId}`
                : emp?.fullName ||
                  emp?.username ||
                  (share.userName && share.userName !== 'Người nhận' ? share.userName : '') ||
                  share.user?.fullName ||
                  `Nhân sự #${share.userId}`;

            const displayCode = isAllSystem
              ? null
              : isDept
                ? dept?.code || (share.department as any)?.code
                : emp?.identifyCode || emp?.code || (share as any).code || (share.user as any)?.identifyCode;

            const displayEmail = isAllSystem || isDept ? null : emp?.email || share.user?.email;
            const displayDept =
              isAllSystem || isDept
                ? null
                : emp?.departmentName || emp?.department?.name || share.departmentName || dept?.name;

            const subText = isAllSystem
              ? 'Tất cả nhân viên trên hệ thống'
              : isDept
                ? 'Toàn bộ nhân viên thuộc phòng ban'
                : [displayEmail, displayDept].filter(Boolean).join(' • ') || 'Nhân sự chỉ định';

            const isEditing = share.permission === 'edit';

            return (
              <div key={share.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {isAllSystem ? (
                    <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Globe size={14} />
                    </div>
                  ) : isDept ? (
                    <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 size={14} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">{displayName}</span>
                      {displayCode && (
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded font-mono font-medium border border-slate-200 shrink-0">
                          {displayCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 truncate">{subText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1',
                      isEditing
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    )}
                  >
                    {isEditing ? <Edit3 size={11} /> : <Eye size={11} />}
                    <span>{isEditing ? 'Người sửa' : 'Người xem'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onRevokeClick(share.id, displayName)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Thu hồi quyền chia sẻ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
