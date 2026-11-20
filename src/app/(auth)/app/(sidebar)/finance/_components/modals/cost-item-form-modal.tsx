'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Input, Modal, Select, Switch } from '@/components';
import { createCostItem, updateCostItem } from '@/actions/finance';
import { COST_FLOW_TYPE_OPTIONS, COST_GROUP_OPTIONS } from '@/config/finance';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type { CostFlowType, CostGroup, CostItem } from '@/types';

export interface CostItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CostItem | null;
  onSuccess?: (item: CostItem) => void;
}

function CostItemFormBody({
  initialData,
  onClose,
  onSuccess,
}: Omit<CostItemFormModalProps, 'isOpen'>) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState(initialData?.code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [flowType, setFlowType] = useState<CostFlowType>(
    initialData?.flowType || 'expense',
  );
  const [costGroup, setCostGroup] = useState<CostGroup>(
    initialData?.costGroup || 'direct_material',
  );
  const [defaultIsTaxDeductible, setDefaultIsTaxDeductible] = useState(
    initialData?.defaultIsTaxDeductible ?? true,
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showErrorToast('Vui lòng nhập Mã và Tên khoản mục chi phí.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        code: code.trim(),
        name: name.trim(),
        flowType,
        costGroup,
        defaultIsTaxDeductible,
        isActive,
      };
      const saved = initialData
        ? await updateCostItem(initialData.id, payload)
        : await createCostItem(payload);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(
        initialData ? 'Đã cập nhật khoản mục chi phí' : 'Đã thêm khoản mục chi phí',
      );
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Lỗi lưu khoản mục chi phí');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Mã khoản mục *"
          fullWidth
          value={code}
          placeholder="VD: KM_NHOM"
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Tên khoản mục *"
            fullWidth
            value={name}
            placeholder="VD: Nhôm thanh định hình"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Loại dòng thu/chi *"
          fullWidth
          value={flowType}
          options={COST_FLOW_TYPE_OPTIONS}
          onChange={(e) => setFlowType(e.target.value as CostFlowType)}
        />
        <Select
          label="Nhóm chi phí giá thành *"
          fullWidth
          value={costGroup}
          options={COST_GROUP_OPTIONS}
          onChange={(e) => setCostGroup(e.target.value as CostGroup)}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-1">
        <Checkbox
          label="Mặc định được tính chi phí hợp lệ TNDN"
          checked={defaultIsTaxDeductible}
          onChange={(e) => setDefaultIsTaxDeductible(e.target.checked)}
        />
        <Switch
          label="Đang hoạt động"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting}>
          {initialData ? 'Lưu thay đổi' : 'Thêm khoản mục'}
        </Button>
      </div>
    </form>
  );
}

export function CostItemFormModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: CostItemFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={initialData ? `Sửa Khoản mục ${initialData.code}` : 'Thêm Khoản Mục Chi Phí'}
    >
      {isOpen && (
        <CostItemFormBody
          key={initialData?.id ?? 'new'}
          initialData={initialData}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
