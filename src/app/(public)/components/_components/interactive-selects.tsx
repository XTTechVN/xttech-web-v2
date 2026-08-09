'use client';

import React from 'react';
import { Select } from '@/components';
import { toast } from 'react-hot-toast';

export function InteractiveSelects() {
  const options = [
    { value: 'vietnam', label: 'Việt Nam' },
    { value: 'japan', label: 'Nhật Bản' },
    { value: 'singapore', label: 'Singapore' },
  ];

  const handleChange = (name: string, value: string) => {
    toast.success(`[${name}] Đã chọn: ${value}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Select */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">1. Basic Select</h3>
          <Select
            placeholder="Chọn quốc gia"
            options={options}
            onChange={(e) => handleChange('Basic Select', e.target.value)}
          />
        </div>

        {/* With Label */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">2. With Label</h3>
          <Select
            label="Quốc tịch"
            placeholder="Chọn quốc tịch"
            options={options}
            onChange={(e) => handleChange('With Label', e.target.value)}
          />
        </div>

        {/* With Error */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">3. With Error State</h3>
          <Select
            label="Quốc gia bắt buộc"
            placeholder="Vui lòng chọn"
            options={options}
            error="Trường này là bắt buộc, vui lòng chọn một giá trị."
            onChange={(e) => handleChange('With Error', e.target.value)}
          />
        </div>

        {/* Disabled State */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">4. Disabled State</h3>
          <Select
            label="Không khả dụng"
            placeholder="Đang khóa..."
            options={options}
            disabled
            onChange={(e) => handleChange('Disabled', e.target.value)}
          />
        </div>
      </div>

      {/* Full Width */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">5. Full Width</h3>
        <Select
          label="Địa chỉ giao hàng"
          placeholder="Chọn kho hàng"
          fullWidth
          options={[
            { value: 'kho-hn', label: 'Kho Hà Nội' },
            { value: 'kho-hcm', label: 'Kho TP. Hồ Chí Minh' },
          ]}
          onChange={(e) => handleChange('Full Width', e.target.value)}
        />
      </div>
    </div>
  );
}
