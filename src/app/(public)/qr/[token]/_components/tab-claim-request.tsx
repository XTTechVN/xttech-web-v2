'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createPublicWarrantyClaim } from '@/actions';
import { Button, Input, Textarea } from '@/components';
import { WARRANTY_ISSUE_TAG_OPTIONS } from '@/config';
import type {
  EvidenceMediaItem,
  PositionQrView,
  QrProjectDoorItem,
  WarrantyIssueTag,
} from '@/types';
import { getErrorMessage } from './qr-helpers';
import { QrMediaUploader } from './qr-media-uploader';

interface TabClaimRequestProps {
  token: string;
  view: PositionQrView;
  doors: QrProjectDoorItem[];
  isLoadingDoors: boolean;
  selectedDoorIds: number[];
  onChangeSelectedDoorIds: (ids: number[]) => void;
  onClaimCreated: () => void;
}

export function TabClaimRequest({
  token,
  view,
  doors,
  isLoadingDoors,
  selectedDoorIds,
  onChangeSelectedDoorIds,
  onClaimCreated,
}: TabClaimRequestProps) {
  const [showDoorPicker, setShowDoorPicker] = useState(false);
  const [issueTags, setIssueTags] = useState<WarrantyIssueTag[]>([]);
  const [issueDescription, setIssueDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerPhotos, setCustomerPhotos] = useState<EvidenceMediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isExpired = view.warrantyHeader.state === 'expired';
  const effectiveDoorIds =
    selectedDoorIds.length > 0 ? selectedDoorIds : [view.positionId];

  const toggleTag = (tag: WarrantyIssueTag) => {
    setIssueTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const toggleDoorId = (doorId: number) => {
    if (effectiveDoorIds.includes(doorId)) {
      if (effectiveDoorIds.length === 1) {
        toast.error('Cần chọn ít nhất 1 bộ cửa cần kiểm tra');
        return;
      }
      onChangeSelectedDoorIds(effectiveDoorIds.filter((id) => id !== doorId));
    } else {
      onChangeSelectedDoorIds([...effectiveDoorIds, doorId]);
    }
  };

  const handleSubmit = async () => {
    if (requesterName.trim().length < 2) {
      toast.error('Vui lòng nhập họ tên người liên hệ');
      return;
    }
    if (requesterPhone.trim().length < 8) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (issueDescription.trim().length < 5) {
      toast.error('Vui lòng nhập mô tả tình trạng cửa (tối thiểu 5 ký tự)');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPublicWarrantyClaim(token, {
        positionIds: effectiveDoorIds,
        requesterName: requesterName.trim(),
        requesterPhone: requesterPhone.trim(),
        scheduledDate: scheduledDate || null,
        issueTags,
        issueDescription: issueDescription.trim(),
        customerPhotos,
      });
      toast.success('Đã gửi yêu cầu thành công! Kỹ thuật viên sẽ liên hệ xác nhận lịch hẹn.');
      onClaimCreated();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không gửi được yêu cầu bảo hành'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDoorItems = doors.filter((d) => effectiveDoorIds.includes(d.id));

  return (
    <div className="space-y-4">
      <div
        className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs ${
          isExpired
            ? 'border-amber-200 bg-amber-50 text-amber-900'
            : 'border-emerald-200 bg-emerald-50 text-emerald-900'
        }`}
      >
        {isExpired ? (
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
        ) : (
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
        )}
        <div className="space-y-0.5">
          <div className="font-bold">
            {isExpired
              ? 'Yêu cầu Sửa chữa & Bảo trì Dịch vụ (Ngoài hạn bảo hành)'
              : 'Yêu cầu Bảo hành Chính hãng (Trong thời hạn bảo hành)'}
          </div>
          <p className="text-[11px] opacity-90">
            {isExpired
              ? 'Kỹ thuật viên sẽ đến kiểm tra thực tế và báo giá chi tiết vật tư / nhân công (nếu có) trước khi tiến hành sửa chữa.'
              : 'Kỹ thuật viên sẽ đến kiểm tra thực tế và cập nhật biên bản xử lý vào Sổ bảo hành điện tử của công trình.'}
          </p>
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Bộ cửa cần kiểm tra ({effectiveDoorIds.length} cửa)
            </h3>
            <p className="text-[11px] text-slate-500">
              Mặc định chọn bộ cửa vừa quét, có thể chọn thêm các cửa khác.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDoorPicker((prev) => !prev)}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-[#045863]"
          >
            <span>{showDoorPicker ? 'Thu gọn' : 'Chọn thêm cửa'}</span>
            {showDoorPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(selectedDoorItems.length > 0
            ? selectedDoorItems
            : [{ id: view.positionId, code: view.code, name: view.name, doorName: view.doorName }]
          ).map((door) => (
            <span
              key={door.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#045863]/10 px-2.5 py-1 text-xs font-semibold text-[#045863]"
            >
              <span className="font-mono">{door.code}</span>
              <span className="text-[11px] font-normal text-slate-600">
                · {door.name || door.doorName}
              </span>
            </span>
          ))}
        </div>

        {showDoorPicker && (
          <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl bg-slate-50 p-2 text-xs">
            {isLoadingDoors ? (
              <div className="py-4 text-center text-slate-400">Đang tải danh sách cửa...</div>
            ) : (
              doors.map((door) => {
                const checked = effectiveDoorIds.includes(door.id);
                return (
                  <button
                    key={door.id}
                    type="button"
                    onClick={() => toggleDoorId(door.id)}
                    className="flex min-h-[44px] w-full items-center justify-between px-2.5 py-2 text-left"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{door.code}</span>
                      <span className="ml-1.5 text-slate-600">{door.name || door.doorName}</span>
                      {door.floorName && (
                        <span className="ml-1.5 text-[11px] text-slate-400">({door.floorName})</span>
                      )}
                    </div>
                    <CheckCircle2
                      size={18}
                      className={checked ? 'text-[#045863]' : 'text-slate-300'}
                    />
                  </button>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          2. Hiện tượng & Mô tả tình trạng
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {WARRANTY_ISSUE_TAG_OPTIONS.map((opt) => {
            const active = issueTags.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleTag(opt.value)}
                className={`flex min-h-[44px] items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? 'border-[#045863] bg-[#045863] text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <Textarea
          label="Mô tả chi tiết cho kỹ thuật viên *"
          placeholder="Ví dụ: Cửa ban công tầng 2 bị xệ nhẹ, đóng khóa hơi nặng tay khi trời mưa..."
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          rows={3}
          fullWidth
        />

        <QrMediaUploader
          token={token}
          value={customerPhotos}
          onChange={setCustomerPhotos}
          onUploadingChange={setIsUploadingMedia}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          3. Thông tin liên hệ & Lịch hẹn kiểm tra
        </h3>
        <Input
          label="Họ và tên người liên hệ *"
          placeholder="Nhập tên của bạn..."
          value={requesterName}
          onChange={(e) => setRequesterName(e.target.value)}
          fullWidth
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Số điện thoại liên hệ *"
            type="tel"
            placeholder="09xx xxx xxx"
            value={requesterPhone}
            onChange={(e) => setRequesterPhone(e.target.value)}
            fullWidth
          />
          <Input
            label="Ngày mong muốn kỹ thuật đến"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            fullWidth
          />
        </div>

        <Button
          fullWidth
          loading={isSubmitting}
          disabled={isUploadingMedia}
          leftIcon={<Send size={16} />}
          onClick={() => void handleSubmit()}
          className="min-h-[48px]"
        >
          Gửi yêu cầu cho Kỹ thuật viên
        </Button>
      </section>
    </div>
  );
}
