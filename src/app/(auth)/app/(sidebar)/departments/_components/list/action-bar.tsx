'use client';

import { useState } from 'react';
import { useCan } from '@/hooks';
import { Plus } from 'lucide-react';
import { Button } from '@/components-remake';
import DepartmentFormModal from './form-modal';

const ActionBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { can } = useCan();

  if (!can('department:create')) return null;

  return (
    <>
      <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setIsOpen(true)}>
        Thêm phòng ban
      </Button>
      <DepartmentFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ActionBar;
