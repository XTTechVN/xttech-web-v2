'use client';

import { useState } from 'react';

// Thành phần dùng chung cho toàn bộ trang
import { Button } from '@/components';

// Icon thư viện lucide-react
import { Plus } from 'lucide-react';

// Component con dùng riêng cho nhân sự
import EmployeeFormModal from './form-modal';

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
        Thêm nhân sự
      </Button>

      {/* Modal Thêm nhân sự mới */}
      <EmployeeFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Thêm nhân sự mới" submitText="Xác nhận tạo" />
    </>
  );
};

export default ActionBar;
