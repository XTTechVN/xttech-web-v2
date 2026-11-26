'use client';

import { useState } from 'react';
import { useCan } from '@/hooks';
import { Mail, Plus } from 'lucide-react';
import { Button } from '@/components-remake';
import EmployeeFormModal from './form-modal';
import { InviteDrawer } from './invite-drawer';

const ActionBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const { can } = useCan();

  if (!can('user:create')) return null;

  return (
    <>
      <Button variant="outline" icon={<Mail size={16} />} iconOnly="mobile" onClick={() => setInviting(true)}>
        Mời qua email
      </Button>
      <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setIsOpen(true)}>
        Thêm nhân sự
      </Button>
      <InviteDrawer isOpen={inviting} onClose={() => setInviting(false)} />
      <EmployeeFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ActionBar;
