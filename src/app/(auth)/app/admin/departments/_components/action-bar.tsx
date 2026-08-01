'use client';

import React, { useState } from 'react';

// Thành phần dùng chung cho toàn bộ trang
import { Input, Button } from '@/components';
import { useQueryParam } from '@/hooks';

// Icon thư viện lucide-react
import { Plus } from 'lucide-react';

// Component con dùng riêng cho phòng ban
import DepartmentFormModal from './form-modal';

const ActionBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useQueryParam('search');

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
          onClick={() => setIsOpen(true)}
        >
          Thêm phòng ban
        </Button>
      </div>

      {/* Modal Thêm phòng ban mới */}
      <DepartmentFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Thêm phòng ban mới"
        submitText="Xác nhận tạo"
      />
    </div>
  );
};

export default ActionBar;
