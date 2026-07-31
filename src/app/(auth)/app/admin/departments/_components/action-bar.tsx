'use client';

import React, { useState } from 'react';

// Thành phần dùng chung cho toàn bộ trang
import { Input, Button, Modal } from '@/components';
import { useQueryParam } from '@/hooks';

// Icon thư viện lucide-react
import { Briefcase, Building2, Camera, Code, Coffee, Heart, Megaphone, Music, Phone, Plus, Search, User2, Wrench, CheckCircle2 } from 'lucide-react';

// Các màu sắc
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

// Các icon biểu tượng
const availableIcons = [
  { name: 'Building2', Icon: Building2 },
  { name: 'Megaphone', Icon: Megaphone },
  { name: 'Users', Icon: User2 },
  { name: 'Search', Icon: Search },
  { name: 'Heart', Icon: Heart },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'Wrench', Icon: Wrench },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Camera', Icon: Camera },
  { name: 'Music', Icon: Music },
  { name: 'Phone', Icon: Phone },
  { name: 'Code', Icon: Code },
];

const ActionBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenIconPicker, setIsOpenIconPicker] = useState(false);
  const [search, setSearch] = useQueryParam('search');

  // Form states
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedIcon, setSelectedIcon] = useState('Building2');

  const SelectedIconComponent = availableIcons.find((i) => i.name === selectedIcon)?.Icon || Code;

  // Xử lý tạo phòng ban
  const handleConfirmCreate = () => {
    if (!name.trim()) {
      setError('Tên phòng ban không được để trống');
      return;
    }
    setError('');
    alert(`Mock Tạo: ${name} | Màu: ${selectedColor} | Icon: ${selectedIcon}`);
    setIsOpen(false);
  };

  // Mở modal tất cả dữ liệu set bằng rỗng
  const handleOpenModal = () => {
    setName('');
    setError('');
    setIsOpen(true);
  };

  return (
    <div className="p-2 border border-gray-100 shadow-sm rounded-lg bg-white flex justify-between">
      <div className="flex justify-between w-full gap-4">
        <div className="relative max-w-xs w-full">
          <Input placeholder="Tìm kiếm phòng ban..." value={search || ''} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={handleOpenModal}
        >
          Thêm phòng ban
        </Button>
      </div>

      {/* Modal Thêm phòng ban mới */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Thêm phòng ban mới"
        className="m-2 max-w-md w-full"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={16} />}
              onClick={handleConfirmCreate}
            >
              Xác nhận tạo
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
    </div>
  );
};

export default ActionBar;
