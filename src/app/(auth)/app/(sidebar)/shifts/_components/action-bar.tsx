'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components';
import ShiftFormModal from './form-modal';

interface ShiftActionBarProps {
  defaultDepartmentId?: number;
}

export const ShiftActionBar: React.FC<ShiftActionBarProps> = ({ defaultDepartmentId }) => {
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
        Thêm ca làm việc
      </Button>

      {/* Modal Thêm ca làm việc */}
      <ShiftFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Thêm ca làm việc mới"
        submitText="Xác nhận tạo"
        defaultDepartmentId={defaultDepartmentId}
      />
    </div>
  );
};

export default ShiftActionBar;
