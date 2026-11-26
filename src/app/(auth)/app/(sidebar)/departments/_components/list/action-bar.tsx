'use client';

import React, { useState } from 'react';

// Thành phần dùng chung cho toàn bộ trang
import { Button } from '@/components';

// Icon thư viện lucide-react
import { Plus } from 'lucide-react';

// Component con dùng riêng cho phòng ban
import DepartmentFormModal from './form-modal';

const ActionBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        className="h-10 rounded-full px-5 text-sm shrink-0"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => setIsOpen(true)}
      >
        Thêm phòng ban
      </Button>

      {/* Modal Thêm phòng ban mới */}
      <DepartmentFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Thêm phòng ban mới" submitText="Xác nhận tạo" />
    </>
  );
};

export default ActionBar;
