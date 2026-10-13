'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Select, MultiSelect } from '@/components';
import {
  shareDocumentCategory,
  getDocumentCategoryShares,
  revokeDocumentCategoryShare,
  shareDocument,
  updateDocument,
  updateDocumentCategory,
  getDocumentShares,
  revokeDocumentShare,
} from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import type { DocumentCategory, DocumentItem, FolderShare } from '@/types';
import { useAuthStore } from '@/stores';
import toast from 'react-hot-toast';
import {
  Building2,
  User,
  Globe,
  Trash2,
  Eye,
  Edit3,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils';

interface ShareFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: DocumentCategory | null;
  document?: DocumentItem | null;
  onSuccess?: () => void;
}

export const ShareFolderModal: React.FC<ShareFolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  document,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const isDoc = Boolean(document);
  const targetId = isDoc ? document?.id : folder?.id;
  const itemName = isDoc ? document?.title || '' : folder?.name || '';

  const [shareTarget, setShareTarget] = useState<'user' | 'department' | 'all'>('user');
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<(string | number)[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<number | string | null>(null);
  const [confirmRevokeState, setConfirmRevokeState] = useState<{
    id: number | string;
    name: string;
  } | null>(null);

  // 1. Fetch current shares of folder / document
  const {
    data: shares = [],
    isLoading: isLoadingShares,
    refetch: refetchShares,
  } = useQuery<FolderShare[]>({
    queryKey: isDoc ? ['document-shares', targetId] : ['document-category-shares', targetId],
    queryFn: () => {
      if (!targetId) return Promise.resolve([]);
      if (isDoc && document) return getDocumentShares(document.id);
      if (folder) return getDocumentCategoryShares(folder.id);
      return Promise.resolve([]);
    },
    enabled: Boolean(isOpen && targetId),
  });

  // 2. Fetch Employees list
  const { data: employeesData } = useQuery({
    queryKey: ['users', 'share-options'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  // 3. Fetch Departments list
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'share-options'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  const employees = useMemo(() => {
    if (Array.isArray(employeesData?.items)) return employeesData.items;
    if (Array.isArray(employeesData)) return employeesData;
    return [];
  }, [employeesData]);

  const departments = useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }, [departmentsData]);

  const employeeMap = useMemo(() => {
    const map = new Map<string, any>();
    employees.forEach((emp: any) => {
      if (emp?.id) map.set(String(emp.id), emp);
    });
    return map;
  }, [employees]);

  const departmentMap = useMemo(() => {
    const map = new Map<string, any>();
    departments.forEach((dept: any) => {
      if (dept?.id) map.set(String(dept.id), dept);
    });
    return map;
  }, [departments]);

  // Extract existing shared IDs
  const existingUserIds = useMemo(() => {
    return shares
      .filter((s) => Boolean(s.userId))
      .map((s) => String(s.userId));
  }, [shares]);

  const existingDepartmentIds = useMemo(() => {
    return shares
      .filter((s) => Boolean(s.departmentId))
      .map((s) => String(s.departmentId));
  }, [shares]);

  // Formatted options for MultiSelect
  const employeeOptions = useMemo(() => {
    const existingSet = new Set(existingUserIds);
    return employees.map((emp: any) => {
      const isShared = existingSet.has(String(emp.id));
      const baseSub = emp.email || (emp.code ? `Mã: ${emp.code}` : '');
      return {
        value: String(emp.id),
        label: emp.fullName || emp.username || 'Nhân sự',
        subLabel: isShared ? `Đã chia sẻ${baseSub ? ` • ${baseSub}` : ''}` : baseSub,
      };
    });
  }, [employees, existingUserIds]);

  const departmentOptions = useMemo(() => {
    const existingSet = new Set(existingDepartmentIds);
    return departments.map((dept: any) => {
      const isShared = existingSet.has(String(dept.id));
      const baseSub = dept.code ? `[${dept.code}]` : undefined;
      return {
        value: String(dept.id),
        label: dept.name,
        subLabel: isShared ? `Đã chia sẻ${baseSub ? ` • ${baseSub}` : ''}` : baseSub,
      };
    });
  }, [departments, existingDepartmentIds]);

  const permissionOptions = [
    { value: 'view', label: 'Người xem (Chỉ xem & tải)' },
    { value: 'edit', label: 'Người sửa (Upload & sửa)' },
  ];

  // Sync selected IDs on open or when shares change
  useEffect(() => {
    if (isOpen) {
      setSelectedUserIds(existingUserIds);
      setSelectedDepartmentIds(existingDepartmentIds);
      setPermission('view');
      setConfirmRevokeState(null);
    }
  }, [isOpen, targetId, existingUserIds, existingDepartmentIds]);

  const invalidateShareQueries = () => {
    refetchShares();
    if (isDoc && document) {
      queryClient.invalidateQueries({ queryKey: ['document-shares', document.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-detail', document.id] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
    } else if (folder) {
      queryClient.invalidateQueries({ queryKey: ['document-category-shares', folder.id] });
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
    }
  };

  // Handle Share Submit
  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    // Đối với TÀI LIỆU: Gọi API update PUT /api/v1/documents/{id} cập nhật shareScope & recipientUserIds / recipientDepartmentIds
    if (isDoc && document) {
      try {
        setIsSubmitting(true);
        const scope =
          shareTarget === 'all'
            ? 'all'
            : shareTarget === 'department'
            ? 'department'
            : selectedUserIds.length > 0
            ? 'user'
            : 'private';

        await shareDocument(document.id, {
          shareScope: scope,
          recipientUserIds: shareTarget === 'user' ? selectedUserIds : [],
          recipientDepartmentIds: shareTarget === 'department' ? selectedDepartmentIds : [],
        });

        toast.success('Đã cập nhật quyền chia sẻ tài liệu thành công!');
        invalidateShareQueries();
        onSuccess?.();
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Không thể chia sẻ tài liệu');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Đối với THƯ MỤC: Gọi API share thư mục POST /api/v1/document-categories/{id}/shares
    if (shareTarget === 'user') {
      if (selectedUserIds.length === 0) {
        toast.error('Vui lòng chọn ít nhất một nhân sự để chia sẻ');
        return;
      }

      try {
        setIsSubmitting(true);
        let successCount = 0;
        for (const userId of selectedUserIds) {
          try {
            if (folder) {
              await shareDocumentCategory(folder.id, {
                userId: String(userId),
                permission: permission,
              });
              successCount++;
            }
          } catch (err: any) {
            console.error('Lỗi chia sẻ thư mục cho nhân sự:', userId, err);
          }
        }

        if (successCount > 0) {
          toast.success(`Đã cập nhật quyền chia sẻ cho ${successCount} nhân sự thành công`);
        } else {
          toast.error('Không thể chia sẻ cho các nhân sự đã chọn');
        }

        invalidateShareQueries();
        onSuccess?.();
      } catch (error: any) {
        toast.error(error.message || 'Lỗi khi chia sẻ thư mục');
      } finally {
        setIsSubmitting(false);
      }
    } else if (shareTarget === 'department') {
      if (selectedDepartmentIds.length === 0) {
        toast.error('Vui lòng chọn ít nhất một phòng ban để chia sẻ');
        return;
      }

      try {
        setIsSubmitting(true);
        let successCount = 0;
        for (const deptId of selectedDepartmentIds) {
          try {
            if (folder) {
              await shareDocumentCategory(folder.id, {
                departmentId: Number(deptId),
                permission: permission,
              });
              successCount++;
            }
          } catch (err: any) {
            console.error('Lỗi chia sẻ thư mục cho phòng ban:', deptId, err);
          }
        }

        if (successCount > 0) {
          toast.success(`Đã cập nhật quyền chia sẻ cho ${successCount} phòng ban thành công`);
        } else {
          toast.error('Không thể chia sẻ cho các phòng ban đã chọn');
        }

        invalidateShareQueries();
        onSuccess?.();
      } catch (error: any) {
        toast.error(error.message || 'Lỗi khi chia sẻ thư mục');
      } finally {
        setIsSubmitting(false);
      }
    } else if (shareTarget === 'all') {
      try {
        setIsSubmitting(true);
        if (folder) {
          // Thử cập nhật shareScope lên thư mục nếu backend hỗ trợ
          try {
            await updateDocumentCategory(folder.id, {
              shareScope: 'all',
              share_scope: 'all',
            } as any);
          } catch (e) {
            // ignore
          }

          // Backend API /document-categories/{id}/shares yêu cầu departmentId hoặc userId.
          // Để chia sẻ cho toàn bộ hệ thống, ta chia sẻ cho tất cả các phòng ban (hoặc tất cả nhân sự)
          const perm = permission;
          let shareSuccessCount = 0;

          if (departments.length > 0) {
            for (const dept of departments) {
              try {
                await shareDocumentCategory(folder.id, {
                  departmentId: Number(dept.id),
                  permission: perm,
                });
                shareSuccessCount++;
              } catch (err) {
                console.warn(`Lỗi chia sẻ cho phòng ban ${dept.id}:`, err);
              }
            }
          } else if (employees.length > 0) {
            for (const emp of employees) {
              try {
                await shareDocumentCategory(folder.id, {
                  userId: String(emp.id),
                  permission: perm,
                });
                shareSuccessCount++;
              } catch (err) {
                console.warn(`Lỗi chia sẻ cho nhân sự ${emp.id}:`, err);
              }
            }
          }

          if (shareSuccessCount === 0 && departments.length === 0 && employees.length === 0) {
            toast.error('Không tìm thấy danh sách phòng ban hoặc nhân sự để chia sẻ');
            return;
          }
        }

        toast.success('Đã chia sẻ thư mục cho toàn bộ hệ thống thành công!');
        invalidateShareQueries();
        onSuccess?.();
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Lỗi khi chia sẻ thư mục cho toàn hệ thống');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Open confirm revoke modal
  const handleRevokeClick = (shareId: number | string, name: string) => {
    setConfirmRevokeState({ id: shareId, name });
  };

  // Execute Revoke Share
  const handleRevokeConfirm = async () => {
    if (!targetId || !confirmRevokeState) return;
    const { id: shareId, name } = confirmRevokeState;
    try {
      setRevokingId(shareId);
      if (isDoc && document) {
        await revokeDocumentShare(document.id, shareId);
      } else if (folder) {
        await revokeDocumentCategoryShare(folder.id, shareId);
      }
      toast.success(`Đã hủy quyền chia sẻ của "${name}"`);
      setConfirmRevokeState(null);
      invalidateShareQueries();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi thu hồi quyền chia sẻ');
    } finally {
      setRevokingId(null);
    }
  };

  if (!folder && !document) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={`Chia sẻ ${isDoc ? 'tài liệu' : 'thư mục'} "${itemName.toUpperCase()}"`}
      >
        <form onSubmit={handleShareSubmit} className="space-y-6 pt-2 select-none">
          {/* Form thêm đối tượng chia sẻ */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Tab selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 select-none">
                  Đối tượng chia sẻ
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-md border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShareTarget('user')}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all cursor-pointer truncate',
                      shareTarget === 'user'
                        ? 'bg-white text-primary shadow-xs font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <User size={14} className="shrink-0" />
                    <span className="truncate">Cá nhân</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareTarget('department')}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all cursor-pointer truncate',
                      shareTarget === 'department'
                        ? 'bg-white text-primary shadow-xs font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Building2 size={14} className="shrink-0" />
                    <span className="truncate">Phòng ban</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareTarget('all')}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all cursor-pointer truncate',
                      shareTarget === 'all'
                        ? 'bg-white text-primary shadow-xs font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Globe size={14} className="shrink-0" />
                    <span className="truncate">Cả hệ thống</span>
                  </button>
                </div>
              </div>

              {/* Lựa chọn quyền hạn */}
              <div className="flex flex-col gap-1.5">
                <Select
                  label="Quyền hạn"
                  options={permissionOptions}
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                />
              </div>
            </div>

            {/* Selector chi tiết */}
            {shareTarget === 'user' && (
              <MultiSelect
                label="Chọn nhân sự muốn chia sẻ"
                options={employeeOptions}
                value={selectedUserIds}
                onChange={setSelectedUserIds}
                placeholder="Chọn nhân sự..."
                searchPlaceholder="Tìm kiếm nhân sự..."
              />
            )}

            {shareTarget === 'department' && (
              <MultiSelect
                label="Chọn phòng ban muốn chia sẻ"
                options={departmentOptions}
                value={selectedDepartmentIds}
                onChange={setSelectedDepartmentIds}
                placeholder="Chọn phòng ban..."
                searchPlaceholder="Tìm kiếm phòng ban..."
              />
            )}

            {shareTarget === 'all' && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-xs font-semibold text-primary">
                <Globe size={16} className="text-primary shrink-0" />
                <span>{isDoc ? 'Tài liệu' : 'Thư mục'} sẽ được chia sẻ cho Tất cả người dùng trong hệ thống.</span>
              </div>
            )}
          </div>

          {/* Danh sách những người đang có quyền truy cập */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Những người có quyền truy cập
              </h4>
              <span className="text-xs text-gray-400 font-medium">
                {shares.length + 1} đối tượng
              </span>
            </div>

            <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto pr-1">
              {/* Owner */}
              <div className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser?.fullName?.charAt(0) || 'T'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">
                        {currentUser?.fullName || 'Tôi'} (Bạn)
                      </span>
                      {(currentUser?.identifyCode || (currentUser as any)?.code) && (
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded font-mono font-medium border border-slate-200 shrink-0">
                          {currentUser?.identifyCode || (currentUser as any)?.code}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 truncate">
                      {currentUser?.email || 'Chủ sở hữu'}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  <ShieldCheck size={11} className="inline-block mr-1 text-gray-500" />
                  Chủ sở hữu
                </span>
              </div>

              {/* Shared List */}
              {isLoadingShares ? (
                <div className="py-4 text-center text-xs text-gray-400">
                  Đang tải danh sách...
                </div>
              ) : shares.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400 italic">
                  Chưa chia sẻ thư mục này cho ai khác.
                </div>
              ) : (
                shares.map((share) => {
                  const isAllSystem = Boolean(
                    (share as any).isAll ||
                      (share as any).isSystem ||
                      (share as any).shareType === 'all' ||
                      (!share.userId && !share.departmentId && !share.department)
                  );
                  const isDept = !isAllSystem && Boolean(share.departmentId || share.department || share.departmentName);

                  const emp = share.userId ? employeeMap.get(String(share.userId)) : null;
                  const dept = share.departmentId ? departmentMap.get(String(share.departmentId)) : null;

                  const displayName = isAllSystem
                    ? 'Toàn bộ hệ thống'
                    : isDept
                    ? dept?.name || share.departmentName || share.department?.name || `Phòng ban #${share.departmentId}`
                    : emp?.fullName || emp?.username || (share.userName && share.userName !== 'Người nhận' ? share.userName : '') || share.user?.fullName || `Nhân sự #${share.userId}`;

                  const displayCode = isAllSystem
                    ? null
                    : isDept
                    ? dept?.code || (share.department as any)?.code
                    : emp?.identifyCode || emp?.code || (share as any).code || (share.user as any)?.identifyCode;

                  const displayEmail = isAllSystem
                    ? null
                    : isDept
                    ? null
                    : emp?.email || share.user?.email;

                  const displayDept = isAllSystem
                    ? null
                    : isDept
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
                            <span className="font-semibold text-gray-900 truncate">
                              {displayName}
                            </span>
                            {displayCode && (
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded font-mono font-medium border border-slate-200 shrink-0">
                                {displayCode}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 truncate">
                            {subText}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1',
                            isEditing
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}
                        >
                          {isEditing ? <Edit3 size={11} /> : <Eye size={11} />}
                          <span>{isEditing ? 'Người sửa' : 'Người xem'}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRevokeClick(share.id, displayName)}
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

          {/* Nút hành động modal (Chuyển xuống dưới cùng) */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-4 text-xs font-medium"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              className="px-5 text-xs font-medium"
            >
              Chia sẻ thư mục
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xác nhận thu hồi quyền */}
      {confirmRevokeState && (
        <Modal
          isOpen={Boolean(confirmRevokeState)}
          onClose={() => setConfirmRevokeState(null)}
          size="sm"
          title="Xác nhận thu hồi quyền chia sẻ"
        >
          <div className="flex gap-4 items-center py-2 select-none">
            <div className="flex flex-col gap-1.5">
              <p className="text-gray-600 text-sm leading-relaxed">
                Bạn có chắc chắn muốn thu hồi quyền chia sẻ của{' '}
                <strong className="text-gray-900 font-semibold">
                  {confirmRevokeState.name}
                </strong>
                {' '}đối với thư mục này không?
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end w-full mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmRevokeState(null)}
              disabled={revokingId === confirmRevokeState.id}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={revokingId === confirmRevokeState.id}
              onClick={handleRevokeConfirm}
            >
              Xác nhận thu hồi
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ShareFolderModal;
