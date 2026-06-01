'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Search from '@/components/ui/Search';
import ModalWrapper from '@/components/modal/ModalWrapper';
import UserProjectTable from './_components/UserProjectTable';
import UserProjectModal from './_components/UserProjectModal';

// Hooks
import { useState } from 'react';

// Types
import { User } from '@/types/shared/user';

export default function UserProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleManageProjects = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <Heading>Phân quyền dự án</Heading>
        <SubHeading>Cấp quyền truy cập công trường/dự án thi công và phân vùng giám sát AI cho người dùng</SubHeading>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-fit">
          <Search
            size="sm"
            className="w-full md:w-96"
            placeholder="Tìm kiếm người dùng..."
            onChange={(val) => setSearchVal(val)}
          />
        </div>
      </div>

      {/* Table */}
      <UserProjectTable
        searchQuery={searchVal}
        onManageProjects={handleManageProjects}
      />

      {/* Modals */}
      <>
        {/* Manage Projects for User Modal */}
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {selectedUser && (
            <UserProjectModal user={selectedUser} onClose={() => setIsModalOpen(false)} />
          )}
        </ModalWrapper>
      </>
    </div>
  );
}
