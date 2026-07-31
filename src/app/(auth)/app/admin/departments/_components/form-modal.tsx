'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, Modal } from '@/components';
import * as LucideIcons from 'lucide-react';
import { Plus, CheckCircle2 } from 'lucide-react';

const colors = [
  '#EF4444', // Đỏ
  '#3F6212', // Xanh lục đậm
  '#06B6D4', // Cyan
  '#1D4ED8', // Xanh biển
  '#8B5CF6', // Tím
  '#FACC15', // Vàng
  '#EA580C', // Cam
  '#D1D5DB', // Xám
];

const availableIcons = [
  { name: 'Building2', Icon: LucideIcons.Building2 },
  { name: 'Megaphone', Icon: LucideIcons.Megaphone },
  { name: 'Users', Icon: LucideIcons.User2 },
  { name: 'Search', Icon: LucideIcons.Search },
  { name: 'Heart', Icon: LucideIcons.Heart },
  { name: 'Briefcase', Icon: LucideIcons.Briefcase },
  { name: 'Wrench', Icon: LucideIcons.Wrench },
  { name: 'Coffee', Icon: LucideIcons.Coffee },
  { name: 'Camera', Icon: LucideIcons.Camera },
  { name: 'Music', Icon: LucideIcons.Music },
  { name: 'Phone', Icon: LucideIcons.Phone },
  { name: 'Code', Icon: LucideIcons.Code },
];

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; mainColor: string; mainIcon: string }) => void;
  title: string;
  submitText?: string;
  initialData?: {
    name: string;
    mainColor: string;
    mainIcon: string;
  };
}

export default function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText = 'Xác nhận tạo',
  initialData,
}: DepartmentFormModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedIcon, setSelectedIcon] = useState('Building2');
  const [isOpenIconPicker, setIsOpenIconPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setSelectedColor(initialData?.mainColor || colors[0]);
      setSelectedIcon(initialData?.mainIcon || 'Building2');
      setError('');
    }
  }, [isOpen, initialData]);

  const SelectedIconComponent = availableIcons.find((i) => i.name === selectedIcon)?.Icon || LucideIcons.Code;

  const handleConfirm = () => {
    if (!name.trim()) {
      setError('Tên phòng ban không được để trống');
      return;
    }
    setError('');
    onSubmit({
      name,
      mainColor: selectedColor,
      mainIcon: selectedIcon,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        className="m-2 max-w-md w-full"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={16} />}
              onClick={handleConfirm}
            >
              {submitText}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Input
              label="Tên phòng ban *"
              placeholder="Nhập tên phòng ban"
              fullWidth
              value={name}
              error={error || undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setError('');
                }
              }}
            />
          </div>

          {/* Chọn màu sắc đại diện */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-800">Chọn màu sắc đại diện</span>
            <div className="flex flex-wrap items-center gap-2.5 p-2 border border-slate-200 rounded-lg bg-white">
              {colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-7 h-7 rounded-full border border-primary active:scale-95 animate-transition"
                    style={{
                      backgroundColor: color,
                      borderColor: isSelected ? 'var(--primary)' : 'transparent',
                      boxShadow: isSelected ? '0 0 0 2px var(--primary)' : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Chọn biểu tượng */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-800">Chọn biểu tượng</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpenIconPicker(true)}
                className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors shadow-sm"
                style={{ color: selectedColor }}
              >
                <SelectedIconComponent size={22} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpenIconPicker(true)}
                className="w-11 h-11 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition bg-white"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Chọn biểu tượng */}
      <Modal
        isOpen={isOpenIconPicker}
        onClose={() => setIsOpenIconPicker(false)}
        title="Chọn biểu tượng"
        className="m-2 max-w-sm w-full"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setIsOpenIconPicker(false)}>
              Hủy
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <span className="text-sm font-semibold text-primary">Biểu tượng icon</span>
          <div className="grid grid-cols-6 gap-2.5 p-4.5 border border-slate-200 rounded-2xl bg-white max-h-64 overflow-y-auto">
            {availableIcons.map(({ name, Icon }) => {
              const isSelected = selectedIcon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(name);
                    setIsOpenIconPicker(false);
                  }}
                  className={`aspect-square rounded-xl border flex items-center justify-center transition p-2 hover:bg-slate-50 ${
                    isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2' : 'border-slate-150 text-slate-600'
                  }`}
                >
                  <Icon size={20} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
