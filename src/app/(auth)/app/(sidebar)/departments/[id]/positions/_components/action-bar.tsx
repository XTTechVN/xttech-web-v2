'use client';

import React, { useState } from 'react';

// Thành phần dùng chung cho toàn bộ trang
import { Button, Heading } from '@/components';

// Icon thư viện lucide-react
import { Plus } from 'lucide-react';

// Component con dùng riêng cho phòng ban
import PositionFormModal from './form-modal';

const ActionBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-end w-full">
      <Button
        variant="primary"
        size="sm"
        className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
        leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        onClick={() => setIsOpen(true)}
      >
        Thêm vị trí
      </Button>

      {/* Modal Thêm phòng ban mới */}
      <PositionFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Thêm vị trí mới" submitText="Xác nhận tạo" />
    </div>
  );
};

export default ActionBar;
