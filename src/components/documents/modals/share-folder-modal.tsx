'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Button } from '@/components';
import {
  getDocumentCategoryShares,
  revokeDocumentCategoryShare,
  shareDocument,
  updateDocument,
  getDocumentShares,
  revokeDocumentShare,
} from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import type { DocumentCategory, DocumentItem, FolderShare } from '@/types';
import { useAuthStore } from '@/stores';
import toast from 'react-hot-toast';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/utils';
import { ShareFolderAccessList, ShareTargetSelector } from './share-folder-access-list';
import { ConfirmActionModal } from './confirm-action-modal';
import {
  submitCategoryShares,
  filterNonOwnerShares,
  buildShareEmployeeOptions,
  buildShareDepartmentOptions,
} from './share-folder-helpers';

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
  const [confirmRevokeState, setConfirmRevokeState] = useState<{ id: number | string; name: string } | null>(null);

  const { data: shares = [], isLoading: isLoadingShares, refetch: refetchShares } = useQuery<FolderShare[]>({
    queryKey: isDoc ? DOC_QUERY_KEYS.documents.shares(targetId, document?.shareScope) : DOC_QUERY_KEYS.categories.shares(targetId),
    queryFn: async () => {
      if (!targetId) return [];
      if (isDoc && document) {
        const docShares = await getDocumentShares(document.id);
        if (document.shareScope === 'all') {
          return [
            {
              id: 'all_system',
              categoryId: document.id,
              userId: null,
              departmentId: null,
              permission: (document as any).permission || 'view',
              userName: 'Toàn bộ hệ thống',
              isSystem: true,
              isAll: true,
              shareType: 'all',
            } as any,
            ...docShares,
          ];
        }
        return docShares;
      }
      return folder ? getDocumentCategoryShares(folder.id) : [];
    },
    enabled: Boolean(isOpen && targetId),
  });

  const { data: employeesData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.employees,
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  const { data: departmentsData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.departments,
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  const employees = useMemo(
    () => (Array.isArray(employeesData?.items) ? employeesData.items : Array.isArray(employeesData) ? employeesData : []),
    [employeesData],
  );
  const departments = useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }, [departmentsData]);

  const employeeMap = useMemo(() => new Map<string, any>(employees.map((e: any) => [String(e.id), e])), [employees]);
  const departmentMap = useMemo(() => new Map<string, any>(departments.map((d: any) => [String(d.id), d])), [departments]);

  const ownerId = String(document?.createdById || (document as any)?.createdBy?.id || (folder as any)?.createdById || currentUser?.id || '');
  const ownerEmail = ((document as any)?.createdBy?.email || (folder as any)?.createdBy?.email || currentUser?.email || '').toLowerCase().trim();
  const ownerName = (document as any)?.createdBy?.fullName || (folder as any)?.createdBy?.fullName || currentUser?.fullName || 'Chủ sở hữu';

  const filteredShares = useMemo(
    () => filterNonOwnerShares({ shares, ownerId, ownerEmail, ownerName, currentUserId: currentUser?.id }),
    [shares, ownerId, ownerEmail, ownerName, currentUser],
  );

  const existingUserIds = useMemo(() => filteredShares.filter((s) => Boolean(s.userId)).map((s) => String(s.userId)), [filteredShares]);
  const existingDepartmentIds = useMemo(() => filteredShares.filter((s) => Boolean(s.departmentId)).map((s) => String(s.departmentId)), [filteredShares]);

  const syncKey = `${isOpen}::${targetId ?? ''}::${existingUserIds.join(',')}::${existingDepartmentIds.join(',')}`;
  const [prevSyncKey, setPrevSyncKey] = useState('');
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (isOpen) {
      if (isDoc && document) {
        if (document.shareScope === 'all') setShareTarget('all');
        else if (document.shareScope === 'department' || existingDepartmentIds.length > 0) setShareTarget('department');
        else setShareTarget('user');
      }
      setSelectedUserIds(existingUserIds);
      setSelectedDepartmentIds(existingDepartmentIds);
      setPermission('view');
      setConfirmRevokeState(null);
    }
  }

  const employeeOptions = useMemo(
    () => buildShareEmployeeOptions({ employees, existingUserIds, ownerId, ownerEmail, currentUserId: currentUser?.id }),
    [employees, existingUserIds, ownerId, ownerEmail, currentUser],
  );
  const departmentOptions = useMemo(() => buildShareDepartmentOptions(departments, existingDepartmentIds), [departments, existingDepartmentIds]);

  const invalidateShareQueries = () => {
    void refetchShares();
    invalidateDocumentQueries(queryClient);
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    if (!isDoc && shareTarget === 'user' && selectedUserIds.length === 0) return void toast.error('Vui lòng chọn ít nhất một nhân sự để chia sẻ');
    if (!isDoc && shareTarget === 'department' && selectedDepartmentIds.length === 0) return void toast.error('Vui lòng chọn ít nhất một phòng ban để chia sẻ');

    try {
      setIsSubmitting(true);
      if (isDoc && document) {
        const scope = shareTarget === 'all' ? 'all' : shareTarget === 'department' ? 'department' : selectedUserIds.length > 0 ? 'user' : 'private';
        await shareDocument(document.id, {
          shareScope: scope,
          recipientUserIds: shareTarget === 'user' ? selectedUserIds : [],
          recipientDepartmentIds: shareTarget === 'department' ? selectedDepartmentIds : [],
          permission,
        });
        toast.success('Đã cập nhật quyền chia sẻ tài liệu thành công!');
        invalidateShareQueries();
        onSuccess?.();
        onClose();
        return;
      }
      if (folder) {
        await submitCategoryShares({ folderId: folder.id, shareTarget, selectedUserIds, selectedDepartmentIds, permission, departments, employees });
        invalidateShareQueries();
        onSuccess?.();
        if (shareTarget === 'all') onClose();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Không thể chia sẻ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!targetId || !confirmRevokeState) return;
    const { id: shareId, name } = confirmRevokeState;
    try {
      setRevokingId(shareId);
      if (isDoc && document) {
        if (shareId === 'all_system') await updateDocument(document.id, { shareScope: 'private' } as any);
        else await revokeDocumentShare(document.id, shareId);
      } else if (folder) {
        await revokeDocumentCategoryShare(folder.id, shareId);
      }
      toast.success(`Đã hủy quyền chia sẻ của "${name}"`);
      setConfirmRevokeState(null);
      invalidateShareQueries();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi thu hồi quyền chia sẻ');
    } finally {
      setRevokingId(null);
    }
  };

  if (!folder && !document) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" title={`Chia sẻ ${isDoc ? 'tài liệu' : 'thư mục'} "${itemName.toUpperCase()}"`}>
        <form onSubmit={handleShareSubmit} className="space-y-6 pt-2 select-none">
          <ShareTargetSelector
            isDoc={isDoc}
            shareTarget={shareTarget}
            onShareTargetChange={setShareTarget}
            permission={permission}
            onPermissionChange={setPermission}
            employeeOptions={employeeOptions}
            selectedUserIds={selectedUserIds}
            onSelectedUserIdsChange={setSelectedUserIds}
            departmentOptions={departmentOptions}
            selectedDepartmentIds={selectedDepartmentIds}
            onSelectedDepartmentIdsChange={setSelectedDepartmentIds}
          />
          <ShareFolderAccessList
            isDoc={isDoc}
            ownerId={ownerId}
            ownerName={ownerName}
            ownerEmail={ownerEmail}
            currentUserId={currentUser?.id}
            filteredShares={filteredShares}
            isLoadingShares={isLoadingShares}
            employeeMap={employeeMap}
            departmentMap={departmentMap}
            onRevokeClick={(id, name) => setConfirmRevokeState({ id, name })}
          />
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="px-4 text-xs font-medium">
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting} className="px-5 text-xs font-medium">
              Chia sẻ {isDoc ? 'tài liệu' : 'thư mục'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmActionModal
        isOpen={Boolean(confirmRevokeState)}
        onClose={() => setConfirmRevokeState(null)}
        title="Xác nhận thu hồi quyền chia sẻ"
        description={
          <>
            Bạn có chắc chắn muốn thu hồi quyền chia sẻ của{' '}
            <strong className="text-gray-900 font-semibold">{confirmRevokeState?.name}</strong> đối với{' '}
            {isDoc ? 'tài liệu' : 'thư mục'} này không?
          </>
        }
        confirmText="Xác nhận thu hồi"
        loading={revokingId !== null && revokingId === confirmRevokeState?.id}
        onConfirm={handleRevokeConfirm}
      />
    </>
  );
};

export default ShareFolderModal;
