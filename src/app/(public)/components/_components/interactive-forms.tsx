'use client';

import React, { useState } from 'react';
import { Input, Checkbox, Radio, Textarea, Switch } from '@/components';
import { toast } from 'react-hot-toast';

export function InteractiveForms() {
  const [inputText, setInputText] = useState('');
  const [textareaText, setTextareaText] = useState('');
  const [selectedGender, setSelectedGender] = useState('male');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [isNotify, setIsNotify] = useState(true);

  const handleCheckboxChange = (hobby: string, checked: boolean) => {
    let updated: string[];
    if (checked) {
      updated = [...selectedHobbies, hobby];
    } else {
      updated = selectedHobbies.filter((h) => h !== hobby);
    }
    setSelectedHobbies(updated);
    toast.success(`Sở thích đã chọn: ${updated.join(', ') || 'Không có'}`);
  };

  const handleRadioChange = (gender: string) => {
    setSelectedGender(gender);
    toast.success(`Đã chọn giới tính: ${gender === 'male' ? 'Nam' : 'Nữ'}`);
  };

  const handleSwitchChange = (checked: boolean) => {
    setIsNotify(checked);
    toast.success(checked ? 'Đã bật thông báo đẩy' : 'Đã tắt thông báo đẩy');
  };

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">1. Text Input</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập của bạn"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Input
            label="Trường hợp bị lỗi (Error)"
            placeholder="Nhập dữ liệu..."
            error="Email không đúng định dạng."
            defaultValue="invalid-email"
          />
          <Input
            label="Trạng thái khóa (Disabled)"
            placeholder="Không thể nhập liệu"
            disabled
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Textarea */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">2. Textarea</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Mô tả bản thân"
            placeholder="Nhập mô tả giới thiệu ngắn về bạn..."
            value={textareaText}
            onChange={(e) => setTextareaText(e.target.value)}
            rows={3}
          />
          <Textarea
            label="Trường hợp bị lỗi (Error)"
            placeholder="Ghi chú thêm..."
            error="Nội dung không được để trống."
            rows={3}
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checkbox - Select Multiple */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            3. Checkbox (Chọn một hoặc nhiều)
          </h3>
          <div className="space-y-2 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
            <Checkbox
              label="Đọc sách"
              checked={selectedHobbies.includes('reading')}
              onChange={(e) => handleCheckboxChange('reading', e.target.checked)}
            />
            <Checkbox
              label="Xem phim"
              checked={selectedHobbies.includes('movies')}
              onChange={(e) => handleCheckboxChange('movies', e.target.checked)}
            />
            <Checkbox
              label="Chơi game"
              checked={selectedHobbies.includes('gaming')}
              onChange={(e) => handleCheckboxChange('gaming', e.target.checked)}
            />
            <Checkbox
              label="Không thể chọn (Disabled)"
              disabled
              defaultChecked
            />
          </div>
        </div>

        {/* Radio - Select Single */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            4. Radio (Chỉ chọn một trong nhóm)
          </h3>
          <div className="space-y-2 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
            <Radio
              name="demo-gender"
              label="Nam (Male)"
              checked={selectedGender === 'male'}
              onChange={() => handleRadioChange('male')}
            />
            <Radio
              name="demo-gender"
              label="Nữ (Female)"
              checked={selectedGender === 'female'}
              onChange={() => handleRadioChange('female')}
            />
            <Radio
              name="demo-gender-disabled"
              label="Không thể chọn (Disabled)"
              disabled
              defaultChecked
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Switch / Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">5. Switch (Toggle Switch)</h3>
        <div className="flex flex-wrap gap-6 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
          <Switch
            label="Bật thông báo đẩy hệ thống"
            checked={isNotify}
            onChange={(e) => handleSwitchChange(e.target.checked)}
          />
          <Switch
            label="Cập nhật tự động (Mặc định bật)"
            defaultChecked
          />
          <Switch
            label="Khóa tính năng (Disabled)"
            disabled
            defaultChecked
          />
        </div>
      </div>
    </div>
  );
}
