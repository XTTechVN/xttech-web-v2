'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, RefreshCw } from 'lucide-react';
import { Modal, Button, Input, Select, MultiSelect } from '@/components';
import { getDocumentById } from '@/actions/document';
import type { DocumentItem, PublishDocumentPayload } from '@/types';
import { RULES_QUERY_KEYS } from '@/utils';
import { useRulesShareOptions } from '../../_hooks/use-rules-share-options';

type PublishScope = PublishDocumentPayload['shareScope'];

interface RulePublishModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  canPublishCompany: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (payload: PublishDocumentPayload) => void;
}

const SCOPE_LABELS: Record<PublishScope, string> = {
  all: 'Toàn công ty',
  department: 'Theo phòng ban',
  user: 'Theo cá nhân chỉ định',
};

const getInitialScope = (doc: DocumentItem | null | undefined, canPublishCompany: boolean): PublishScope => {
  if (doc?.shareScope === 'all' || doc?.shareScope === 'department' || doc?.shareScope === 'user') {
    return doc.shareScope as PublishScope;
  }
  return canPublishCompany ? 'all' : 'department';
};

export const RulePublishModal: React.FC<RulePublishModalProps> = ({
  isOpen,
  document: doc,
  canPublishCompany,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const { data: detailDoc } = useQuery({
    queryKey: RULES_QUERY_KEYS.detail(doc?.id ?? 0),
    queryFn: () => getDocumentById(doc!.id),
    enabled: isOpen && Boolean(doc?.id),
  });

  const activeDoc = detailDoc ?? doc;

  const [shareScope, setShareScope] = useState<PublishScope>(() => getInitialScope(activeDoc, canPublishCompany));
  const [effectiveDate, setEffectiveDate] = useState(() =>
    activeDoc?.effectiveDate ? dayjs(activeDoc.effectiveDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
  );
  const [userIds, setUserIds] = useState<(string | number)[]>(() => activeDoc?.recipients?.map((r) => r.userId) ?? []);
  const [departmentIds, setDepartmentIds] = useState<(string | number)[]>(
    () => activeDoc?.recipientDepartmentIds ?? activeDoc?.recipientDepartments?.map((d) => d.id) ?? [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncedDetailId, setSyncedDetailId] = useState<number | null>(null);

  if (detailDoc && detailDoc.id !== syncedDetailId) {
    setSyncedDetailId(detailDoc.id);
    setShareScope(getInitialScope(detailDoc, canPublishCompany));
    setEffectiveDate(
      detailDoc.effectiveDate ? dayjs(detailDoc.effectiveDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    );
    setUserIds(detailDoc.recipients?.map((r) => r.userId) ?? []);
    setDepartmentIds(detailDoc.recipientDepartmentIds ?? detailDoc.recipientDepartments?.map((d) => d.id) ?? []);
    setErrorMessage(null);
  }

  const { employeeOptions, departmentOptions } = useRulesShareOptions(isOpen, activeDoc?.createdById);

  const scopeOptions = useMemo(
    () =>
      (Object.keys(SCOPE_LABELS) as PublishScope[])
        .filter((key) => key !== 'all' || canPublishCompany)
        .map((key) => ({ value: key, label: SCOPE_LABELS[key] })),
    [canPublishCompany],
  );

  const handleConfirm = () => {
    const isMissingRecipients =
      (shareScope === 'department' && departmentIds.length === 0) || (shareScope === 'user' && userIds.length === 0);
    if (isMissingRecipients) {
      setErrorMessage('Vui lòng chọn ít nhất một người nhận');
      return;
    }
    onConfirm({
      shareScope,
      effectiveDate,
      supersedesId: activeDoc?.supersedesId ?? activeDoc?.supersedesDoc?.id ?? undefined,
      recipientDepartmentIds: shareScope === 'department' ? departmentIds.map(Number) : undefined,
      recipientUserIds: shareScope === 'user' ? userIds.map(String) : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="m-2 max-w-xl w-full"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Megaphone className="text-primary" size={20} />
          <span>Ban hành cơ chế</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-xs">
        <p className="text-slate-600">
          Ban hành: <strong className="text-slate-900">{activeDoc?.title}</strong>
        </p>

        {activeDoc?.supersedesDoc && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <RefreshCw size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-800">Tự động thay thế văn bản:</div>
              <div className="mt-0.5 font-medium">
                <span className="font-mono font-bold text-amber-700">[{activeDoc.supersedesDoc.code}]</span>{' '}
                {activeDoc.supersedesDoc.title}
              </div>
              <p className="mt-0.5 text-[11px] text-amber-700/80">
                Khi ban hành, văn bản cũ này sẽ được tự động chuyển sang trạng thái <strong>&quot;Đã bị thay thế&quot;</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Phạm vi ban hành *"
            fullWidth
            value={shareScope}
            onChange={(e) => setShareScope(e.target.value as PublishScope)}
            options={scopeOptions}
          />
          <Input
            label="Ngày bắt đầu hiệu lực"
            type="date"
            fullWidth
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
        </div>

        {shareScope === 'department' && (
          <MultiSelect
            label="Phòng ban nhận *"
            options={departmentOptions}
            value={departmentIds}
            onChange={setDepartmentIds}
            placeholder="Chọn phòng ban..."
            searchPlaceholder="Tìm tên phòng ban..."
            fullWidth
          />
        )}
        {shareScope === 'user' && (
          <MultiSelect
            label="Người nhận *"
            options={employeeOptions}
            value={userIds}
            onChange={setUserIds}
            placeholder="Chọn nhân sự..."
            searchPlaceholder="Tìm tên hoặc email..."
            fullWidth
          />
        )}

        {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

        <div className="flex gap-3 justify-end w-full mt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button id="rule-publish-confirm" size="sm" loading={isLoading} disabled={isLoading} onClick={handleConfirm}>
            Ban hành
          </Button>
        </div>
      </div>
    </Modal>
  );
};
