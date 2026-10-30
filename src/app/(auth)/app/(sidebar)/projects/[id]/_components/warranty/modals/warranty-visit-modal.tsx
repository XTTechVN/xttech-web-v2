'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createWarrantyVisit, getUsers, updateWarrantyVisit } from '@/actions';
import { Button, Input, Modal, Select, Textarea } from '@/components';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { WarrantyVisit } from '@/types';

interface WarrantyVisitModalProps {
  projectId: number;
  isOpen: boolean;
  /** null = tạo mới (yêu cầu bảo hành của khách), có giá trị = chỉnh đợt đang chọn */
  visit: WarrantyVisit | null;
  onClose: () => void;
}

export function WarrantyVisitModal({ projectId, isOpen, visit, onClose }: WarrantyVisitModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={visit ? `Chỉnh đợt bảo hành ${visit.code}` : 'Tạo yêu cầu bảo hành'}
      className="max-w-lg w-full"
    >
      {isOpen && <WarrantyVisitForm projectId={projectId} visit={visit} onClose={onClose} />}
    </Modal>
  );
}

function WarrantyVisitForm({
  projectId,
  visit,
  onClose,
}: {
  projectId: number;
  visit: WarrantyVisit | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(visit?.title ?? '');
  const [scheduledDate, setScheduledDate] = useState(visit?.scheduledDate ?? new Date().toISOString().slice(0, 10));
  const [assigneeId, setAssigneeId] = useState(visit?.assigneeId ?? '');
  const [issue, setIssue] = useState(visit?.issueDescription ?? '');
  const [isChargeable, setIsChargeable] = useState(visit?.isChargeable ?? false);
  const [feeAmount, setFeeAmount] = useState(String(visit?.feeAmount ?? 0));
  const [scopeNote, setScopeNote] = useState(visit?.scopeNote ?? '');

  const { data: users } = useQuery({
    queryKey: ['users', 'warranty-assignees'],
    queryFn: () => getUsers({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: () => {
      const common = {
        title: title.trim(),
        scheduledDate,
        assigneeId: assigneeId || undefined,
        issueDescription: issue.trim() || undefined,
        isChargeable,
        feeAmount: Number(feeAmount) || 0,
        scopeNote: scopeNote.trim() || undefined,
      };
      return visit
        ? updateWarrantyVisit(projectId, visit.id, common)
        : createWarrantyVisit(projectId, { ...common, kind: 'claim' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_warranty', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
      toast.success(visit ? 'Đã cập nhật đợt bảo hành' : 'Đã tạo yêu cầu bảo hành');
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không lưu được đợt bảo hành'),
  });

  return (
    <div className="space-y-3">
      <Input label="Nội dung / tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Ngày hẹn"
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          fullWidth
        />
        <Select
          label="Người phụ trách bảo hành"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          placeholder="Chưa phân công"
          options={(users?.items ?? []).map((user) => ({ value: user.id, label: user.fullName }))}
          fullWidth
        />
      </div>
      <Textarea label="Mô tả sự cố" value={issue} onChange={(e) => setIssue(e.target.value)} rows={2} fullWidth />

      <div className="space-y-2 rounded-lg border border-slate-200 p-3">
        <div className="text-xs font-semibold text-slate-700">Phạm vi & phí bảo hành</div>
        <p className="text-[11px] text-slate-500">
          Mặc định: trong hạn bảo hành thì miễn phí, ngoài hạn thì tính phí. Có thể chỉnh theo quyết định của công ty.
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={isChargeable} onChange={(e) => setIsChargeable(e.target.checked)} />
          Tính phí đợt bảo hành này
        </label>
        {isChargeable && (
          <Input
            label="Phí dự kiến (VND)"
            type="number"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            fullWidth
          />
        )}
        <Input label="Ghi chú phạm vi" value={scopeNote} onChange={(e) => setScopeNote(e.target.value)} fullWidth />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button size="sm" disabled={title.trim().length < 3} loading={save.isPending} onClick={() => save.mutate()}>
          Lưu
        </Button>
      </div>
    </div>
  );
}
