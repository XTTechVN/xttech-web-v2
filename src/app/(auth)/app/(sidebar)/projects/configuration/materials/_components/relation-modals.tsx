'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAccessories, getExtraOptions, getFormulas } from '@/actions';
import { Modal, Button } from '@/components';
import { formatAccessoryUnit, EXTRA_OPTION_UNIT_MAP, type ExtraOptionUnit } from '@/types';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils';

// ==========================================
// 1. MODAL GÁN PHỤ KIỆN (ACCESSORIES)
// ==========================================
interface AssignAccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccessoryIds: number[];
  onSave: (selectedIds: number[]) => Promise<void>;
  isSaving: boolean;
}

export function AssignAccessoriesModal({
  isOpen,
  onClose,
  activeAccessoryIds,
  onSave,
  isSaving,
}: AssignAccessoriesModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset selected state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(activeAccessoryIds);
      setSearchTerm('');
    }
  }, [isOpen, activeAccessoryIds]);

  const { data: allAccessories, isLoading } = useQuery({
    queryKey: ['all-accessories-assignment'],
    queryFn: () => getAccessories({ limit: 9999 }),
    enabled: isOpen,
  });

  const handleConfirm = async () => {
    await onSave(selectedIds);
    onClose();
  };

  const filteredAccessories = allAccessories?.items.filter((acc) => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.code && acc.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình phụ kiện áp dụng"
      className="m-2 max-w-2xl w-full"
    >
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-xs text-slate-400">
          Chọn các phụ kiện sẽ được áp dụng cho hệ nhôm này. Nhấn Xác nhận lưu để cập nhật liên kết.
        </p>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm phụ kiện theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-slate-500 text-xs">Đang tải danh sách phụ kiện...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredAccessories.length > 0 ? (
              filteredAccessories.map((acc) => {
                const isChecked = selectedIds.includes(acc.id);
                return (
                  <label
                    key={acc.id}
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
                          setSelectedIds([...selectedIds, acc.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== acc.id));
                        }
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm leading-snug text-slate-800">{acc.name}</span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {acc.code && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {acc.code}
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          ĐVT: {formatAccessoryUnit(acc.unit)}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary">
                          {formatCurrency(acc.retailPrice)}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400 italic">Không tìm thấy phụ kiện nào phù hợp</p>
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

// ==========================================
// 2. MODAL GÁN TÙY CHỌN PHÁT SINH (EXTRA OPTIONS)
// ==========================================
interface AssignExtraOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExtraOptionIds: number[];
  onSave: (selectedIds: number[]) => Promise<void>;
  isSaving: boolean;
}

export function AssignExtraOptionsModal({
  isOpen,
  onClose,
  activeExtraOptionIds,
  onSave,
  isSaving,
}: AssignExtraOptionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset selected state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(activeExtraOptionIds);
      setSearchTerm('');
    }
  }, [isOpen, activeExtraOptionIds]);

  const { data: allExtraOptions, isLoading } = useQuery({
    queryKey: ['all-extra-options-assignment'],
    queryFn: () => getExtraOptions({ limit: 9999 }),
    enabled: isOpen,
  });

  const handleConfirm = async () => {
    await onSave(selectedIds);
    onClose();
  };

  const filteredExtraOptions = allExtraOptions?.items.filter((opt) => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.code && opt.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình tùy chọn phát sinh áp dụng"
      className="m-2 max-w-2xl w-full"
    >
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-xs text-slate-400">
          Chọn các tùy chọn phát sinh sẽ được áp dụng cho hệ nhôm này. Nhấn Xác nhận lưu để cập nhật liên kết.
        </p>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm tùy chọn phát sinh theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-slate-500 text-xs">Đang tải danh sách tùy chọn phát sinh...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredExtraOptions.length > 0 ? (
              filteredExtraOptions.map((opt) => {
                const isChecked = selectedIds.includes(opt.id);
                return (
                  <label
                    key={opt.id}
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
                          setSelectedIds([...selectedIds, opt.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== opt.id));
                        }
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm leading-snug text-slate-800">{opt.name}</span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {opt.code && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {opt.code}
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          ĐVT: {EXTRA_OPTION_UNIT_MAP[opt.unit as ExtraOptionUnit] || opt.unit}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary">
                          {formatCurrency(opt.retailPrice)}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400 italic">Không tìm thấy tùy chọn phát sinh nào phù hợp</p>
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

// ==========================================
// 3. MODAL GÁN CÔNG THỨC (FORMULAS)
// ==========================================
interface AssignFormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFormulaIds: number[];
  onSave: (selectedIds: number[]) => Promise<void>;
  isSaving: boolean;
}

export function AssignFormulasModal({
  isOpen,
  onClose,
  activeFormulaIds,
  onSave,
  isSaving,
}: AssignFormulasModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset selected state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(activeFormulaIds);
      setSearchTerm('');
    }
  }, [isOpen, activeFormulaIds]);

  const { data: allFormulas, isLoading } = useQuery({
    queryKey: ['all-formulas-assignment'],
    queryFn: () => getFormulas({ limit: 9999 }),
    enabled: isOpen,
  });

  const handleConfirm = async () => {
    await onSave(selectedIds);
    onClose();
  };

  const filteredFormulas = allFormulas?.items.filter((f) => 
    (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.code && f.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình công thức áp dụng"
      className="m-2 max-w-2xl w-full"
    >
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-xs text-slate-400">
          Chọn các công thức sẽ được áp dụng cho hệ nhôm này. Nhấn Xác nhận lưu để cập nhật liên kết.
        </p>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm công thức theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-slate-500 text-xs">Đang tải danh sách công thức...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredFormulas.length > 0 ? (
              filteredFormulas.map((f) => {
                const isChecked = selectedIds.includes(f.id);
                return (
                  <label
                    key={f.id}
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
                          setSelectedIds([...selectedIds, f.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== f.id));
                        }
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm leading-snug text-slate-800">{f.name}</span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {f.code && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {f.code}
                          </span>
                        )}
                        {f.doorType && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                            Cửa: {f.doorType === 'cd' ? 'Cửa đi' : f.doorType === 'cs' ? 'Cửa sổ' : 'Khác'}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400 italic">Không tìm thấy công thức nào phù hợp</p>
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
