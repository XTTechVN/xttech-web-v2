'use client';

import React, { useState } from 'react';

// Thành phần dùng chung cho toàn bộ trang
import { Input, Button, Modal } from '@/components';

// Icon thư viện lucide-react
import { Search, Plus } from 'lucide-react';

const ActionBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-2 border border-gray-100 shadow-sm rounded-lg bg-white flex justify-between">
      <div className="flex justify-between w-full">
        <Input placeholder="Tìm kiếm phòng ban" />
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsOpen(true)}>
          Thêm phòng ban
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Thêm phòng ban mới"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsOpen(false)}>
              Xác nhận
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Tên phòng ban" placeholder="Nhập tên phòng ban" fullWidth />
        </div>
      </Modal>
    </div>
  );
};

export default ActionBar;
