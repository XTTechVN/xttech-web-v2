'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createWarrantyVisit, getProjectPositions, getUsers, updateWarrantyVisit } from '@/actions';
import { Button } from '../button';
import { Input } from '../input';
import { Modal } from '../modal';
import { Select } from '../select';
import { Textarea } from '../textarea';
import { WARRANTY_ISSUE_TAG_OPTIONS } from '@/config';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { WarrantyIssueTag, WarrantyVisit } from '@/types';

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
      title={visit ? `Chỉnh đợt bảo hành ${visit.code}` : 'Tạo yêu cầu bảo hành / sửa chữa'}
      className="max-w-lg w-full"
    >
      {isOpen && (
        <WarrantyVisitForm
          key={visit ? visit.id : 'new'}
          projectId={projectId}
          visit={visit}
          onClose={onClose}
        />
      )}
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
  const [title, setTitle] = useState(visit?.title || '');
  const [scheduledDate, setScheduledDate] = useState(
    visit?.scheduledDate || new Date().toISOString().slice(0, 10),
  );
  const [assigneeId, setAssigneeId] = useState(visit?.assigneeId || '');
  const [requesterName, setRequesterName] = useState(visit?.requesterName || '');
  const [requesterPhone, setRequesterPhone] = useState(visit?.requesterPhone || '');
  const [positionIds, setPositionIds] = useState<number[]>(visit?.positionIds || []);
  const [issueTags, setIssueTags] = useState<WarrantyIssueTag[]>(visit?.issueTags || []);
  const [issue, setIssue] = useState(visit?.issueDescription || '');
  const [isChargeable, setIsChargeable] = useState(visit?.isChargeable ?? false);
  const [feeAmount, setFeeAmount] = useState(String(visit?.feeAmount ?? 0));
  const [scopeNote, setScopeNote] = useState(visit?.scopeNote || '');

  const { data: users } = useQuery({
    queryKey: ['users', 'warranty-assignees'],
    queryFn: () => getUsers({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: positionsRes } = useQuery({
    queryKey: ['project_positions_warranty', projectId],
    queryFn: () => getProjectPositions(projectId, { limit: 200 }),
    staleTime: 2 * 60 * 1000,
  });

  const togglePosition = (id: number) => {
    setPositionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleTag = (tag: WarrantyIssueTag) => {
    setIssueTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const save = useMutation({
    mutationFn: () => {
      const common = {
        title: title.trim(),
        scheduledDate,
        assigneeId: assigneeId || undefined,
        positionIds,
        requesterName: requesterName.trim() || undefined,
        requesterPhone: requesterPhone.trim() || undefined,
        issueTags,
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
      void queryClient.invalidateQueries({ queryKey: ['project_warranty', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['global_warranty_queue'] });
      void queryClient.invalidateQueries({ queryKey: ['global_warranty_badge'] });
      toast.success(visit ? 'Đã cập nhật đợt bảo hành' : 'Đã tạo yêu cầu bảo hành');
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không lưu được đợt bảo hành'),
  });

  const positions = positionsRes?.items || [];

  return (
    <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1 text-xs">
      <Input
        label="Nội dung / tiêu đề *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
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
          options={(users?.items || []).map((user) => ({ value: user.id, label: user.fullName }))}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Người liên hệ báo"
          value={requesterName}
          onChange={(e) => setRequesterName(e.target.value)}
          fullWidth
        />
        <Input
          label="SĐT liên hệ"
          value={requesterPhone}
          onChange={(e) => setRequesterPhone(e.target.value)}
          fullWidth
        />
      </div>

      {positions.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-700">
            Các cửa cần kiểm tra ({positionIds.length} cửa đã chọn)
          </div>
          <div className="max-h-36 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
            {positions.map((pos) => {
              const checked = positionIds.includes(pos.id);
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => togglePosition(pos.id)}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left hover:bg-slate-50"
                >
                  <span>
                    <b className="font-mono text-slate-900">{pos.code}</b> ·{' '}
                    {pos.description || `${pos.width}×${pos.height} mm`}
                  </span>
                  <CheckCircle2
                    size={15}
                    className={checked ? 'text-[#045863]' : 'text-slate-300'}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="font-semibold text-slate-700">Hiện tượng lỗi</div>
        <div className="flex flex-wrap gap-1.5">
          {WARRANTY_ISSUE_TAG_OPTIONS.map((opt) => {
            const active = issueTags.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleTag(opt.value)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-[#045863] bg-[#045863] text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <Textarea
        label="Mô tả sự cố"
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        rows={2}
        fullWidth
      />

      <div className="space-y-2 rounded-lg border border-slate-200 p-3">
        <div className="font-semibold text-slate-700">Phạm vi & phí bảo hành</div>
        <label className="flex cursor-pointer items-center gap-2 text-slate-700">
          <input
            type="checkbox"
            checked={isChargeable}
            onChange={(e) => setIsChargeable(e.target.checked)}
          />
          <span>Tính phí đợt bảo hành / sửa chữa này</span>
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
        <Input
          label="Ghi chú phạm vi"
          value={scopeNote}
          onChange={(e) => setScopeNote(e.target.value)}
          fullWidth
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          disabled={title.trim().length < 3}
          loading={save.isPending}
          onClick={() => save.mutate()}
        >
          Lưu
        </Button>
      </div>
    </div>
  );
}
