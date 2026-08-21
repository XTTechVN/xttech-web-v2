'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '@/actions';
import { Modal, Button } from '@/components';
import { formatMaterialUnit } from '@/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

// ==========================================
// 1. MODAL GÁN HỆ NHÔM CHO TÙY CHỌN PHÁT SINH
// ==========================================
interface AssignOptionMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMaterialIds: number[];
  onSave: (selectedIds: number[]) => Promise<void>;
  isSaving: boolean;
}

export function AssignOptionMaterialsModal({
  isOpen,
  onClose,
  activeMaterialIds,
  onSave,
  isSaving,
}: AssignOptionMaterialsModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset selected state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(activeMaterialIds);
      setSearchTerm('');
    }
  }, [isOpen, activeMaterialIds]);

  const { data: allMaterials, isLoading } = useQuery({
    queryKey: ['all-materials-assignment-option'],
    queryFn: () => getMaterials({ limit: 9999 }),
    enabled: isOpen,
  });

  const handleConfirm = async () => {
    await onSave(selectedIds);
    onClose();
  };

  const filteredMaterials = allMaterials?.items.filter((material) => 
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.code && material.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình hệ nhôm áp dụng tùy chọn phát sinh"
      className="m-2 max-w-2xl w-full"
    >
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-xs text-slate-400">
          Chọn các hệ nhôm sẽ áp dụng tùy chọn phát sinh này. Nhấn Xác nhận lưu để cập nhật liên kết.
        </p>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm hệ nhôm theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-slate-500 text-xs">Đang tải danh sách hệ nhôm...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => {
                const isChecked = selectedIds.includes(material.id);
                return (
                  <label
                    key={material.id}
                    className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                      isChecked
                        ? 'bg-teal-50/20 border-teal-500/30 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/30 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, material.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== material.id));
                        }
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm leading-snug text-slate-800">{material.name}</span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {material.code && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {material.code}
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          ĐVT: {formatMaterialUnit(material.unit)}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400 italic">Không tìm thấy hệ nhôm nào phù hợp</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end w-full mt-4 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            onClick={handleConfirm}
            disabled={isSaving || isLoading}
            loading={isSaving}
          >
            Xác nhận lưu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
