'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import SpaceAddModal, { SpaceAddFormData } from './SpaceAddModal';
import SpaceEditModal, { SpaceEditFormData } from './SpaceEditModal';
import SpaceUsersModal from './SpaceUsersModal';
import Button from '@/components/ui/Button';
import { TableData } from '@/components/table2/table-data';
import { BaseResponseWithPagination } from '@/components/table2/types';
import { Users, Edit2, Trash2, Plus, LayoutGrid } from 'lucide-react';

// Hooks
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryParam } from '@/hooks/useQueryParam';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// Types
import { Space } from '@/types/shared/space';

export default function SpacesContent({
  initialData,
}: {
  initialData?: BaseResponseWithPagination<Space>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useQueryParam('search');
  const [status, setStatus] = useQueryParam('status');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  // Selection states
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [selectedSpaceName, setSelectedSpaceName] = useState<string>('');
  const [editDefaultValues, setEditDefaultValues] = useState<Space | undefined>(undefined);

  // Fetch all spaces to create a lookup map for parent names
  const { data: allSpaces = [] } = useQuery<Space[]>({
    queryKey: ['spaces-flat-all'],
    queryFn: () => api.get('/api/v1/spaces/flat').then((res: any) => res.data || res.items || []),
  });

  // Create a map to quickly look up parent names by id
  const spaceMap = useMemo(() => {
    const map = new Map<string, string>();
    const list = Array.isArray(allSpaces) ? allSpaces : (allSpaces as any)?.items || [];
    list.forEach((s: any) => {
      map.set(s.id, s.name);
    });
    return map;
  }, [allSpaces]);

  // Fetcher for table2 matching backend paginated schema
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    return api
      .get(`/api/v1/spaces/flat`, {
        params: {
          search: search || undefined,
          status: status || undefined,
          offset,
          limit,
        },
      })
      .then((res: any) => res.data);
  };

  const handleAddSpace = async (data: SpaceAddFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/spaces', {
        name: data.name,
        spaceId: data.spaceId,
        parentId: data.parentId || null,
        meta: {
          description: data.description || '',
        },
      });
      toast.success('Thêm khu vực thành công');
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['spaces-flat'] });
      queryClient.invalidateQueries({ queryKey: ['spaces-flat-all'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Thêm khu vực thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSpace = async (data: SpaceEditFormData) => {
    setIsLoading(true);
    try {
      await api.patch(`/api/v1/spaces/${selectedSpaceId}`, {
        name: data.name,
        parentId: data.parentId || null,
        meta: {
          description: data.description || '',
        },
      });
      toast.success('Cập nhật khu vực thành công');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['spaces-flat'] });
      queryClient.invalidateQueries({ queryKey: ['spaces-flat-all'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật khu vực thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSpace = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/spaces/${selectedSpaceId}`);
      toast.success('Xóa khu vực thành công');
      setIsConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['spaces-flat'] });
      queryClient.invalidateQueries({ queryKey: ['spaces-flat-all'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xóa khu vực thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'spaceId',
      label: 'Mã khu vực',
      minWidth: '150px',
      cell: (row: Space) => <span>{row.spaceId}</span>,
    },
    {
      key: 'name',
      label: 'Tên khu vực',
      minWidth: '200px',
      cell: (row: Space) => <span>{row.name}</span>,
    },
    {
      key: 'parentSpace',
      label: 'Khu vực cha',
      minWidth: '180px',
      cell: (row: Space) => {
        if (!row.parentId) return <span className="text-gray-400 italic">Không có (Gốc)</span>;
        const parentName = spaceMap.get(row.parentId);
        return <span>{parentName || row.parentId}</span>;
      },
    },
    {
      key: 'level',
      label: 'Cấp độ',
      minWidth: '100px',
      cell: (row: Space) => <span>Cấp {row.level}</span>,
    },
    {
      key: 'createdAt',
      label: 'Thời gian tạo',
      minWidth: '180px',
      cell: (row: Space) => (
        <span>{row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm:ss') : '---'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '140px',
      cell: (row: Space) => (
        <div className="flex items-center gap-3">
          <button
            title="Gán nhân sự"
            className="text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedSpaceId(row.id);
              setSelectedSpaceName(row.name);
              setIsUsersOpen(true);
            }}
          >
            <Users size={16} />
          </button>
          <button
            title="Sửa khu vực"
            className="text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
            onClick={() => {
              setEditDefaultValues(row);
              setSelectedSpaceId(row.id);
              setIsEditOpen(true);
            }}
          >
            <Edit2 size={16} />
          </button>
          <button
            title="Xóa khu vực"
            className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedSpaceId(row.id);
              setSelectedSpaceName(row.name);
              setIsConfirmOpen(true);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const renderCard = (row: Space, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-gray-900">{row.name}</span>
        <span className="font-mono text-xs text-gray-800 bg-gray-50 px-2 py-0.5 rounded">
          {row.spaceId}
        </span>
      </div>
      <div className="text-xs text-gray-500 flex flex-col gap-1 mt-1">
        <div className="flex justify-between">
          <span>Khu vực cha:</span>
          <span className="font-medium text-gray-700">
            {row.parentId ? spaceMap.get(row.parentId) || row.parentId : 'Không có (Gốc)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cấp độ:</span>
          <span className="font-semibold text-indigo-700">Cấp {row.level}</span>
        </div>
        <div className="flex justify-between">
          <span>Thời gian tạo:</span>
          <span>{row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm:ss') : '---'}</span>
        </div>
      </div>
      <div className="flex justify-end gap-4 border-t border-gray-100 pt-2 mt-1">
        <button
          onClick={() => {
            setSelectedSpaceId(row.id);
            setSelectedSpaceName(row.name);
            setIsUsersOpen(true);
          }}
          className="flex items-center gap-1 text-xs text-indigo-600 font-semibold cursor-pointer"
        >
          <Users size={14} /> Gán nhân sự
        </button>
        <button
          onClick={() => {
            setEditDefaultValues(row);
            setSelectedSpaceId(row.id);
            setIsEditOpen(true);
          }}
          className="flex items-center gap-1 text-xs text-gray-600 font-semibold cursor-pointer"
        >
          <Edit2 size={14} /> Sửa
        </button>
        <button
          onClick={() => {
            setSelectedSpaceId(row.id);
            setSelectedSpaceName(row.name);
            setIsConfirmOpen(true);
          }}
          className="flex items-center gap-1 text-xs text-red-600 font-semibold cursor-pointer"
        >
          <Trash2 size={14} /> Xóa
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading>Quản lý khu vực</Heading>
          <SubHeading>
            Quản lý danh sách các khu vực, phân khu, phòng ban trực thuộc hệ thống giám sát.
          </SubHeading>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<LayoutGrid size={16} />}
            onClick={() => {
              toast.loading('Đang phát triển...');
              setTimeout(() => {
                toast.dismiss();
              }, 1000);
            }}
          >
            Xem sơ đồ cây
          </Button>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setIsAddOpen(true)}>
            Thêm khu vực
          </Button>
        </div>
      </div>

      {/* Table Data Rework (Table2) */}
      <TableData<Space>
        queryKey={['spaces-flat', search, status]}
        fetcher={fetcher}
        initialData={initialData}
        columns={columns}
        renderCard={renderCard}
        filters={[
          {
            label: 'Trạng thái',
            value: status,
            options: [
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Không hoạt động' },
              { value: undefined, label: 'Tất cả' },
            ],
            className: 'w-fit',
            onChange: setStatus,
          },
        ]}
        search={{
          placeholder: 'Tìm kiếm theo tên hoặc mã khu vực...',
          value: search,
          onChange: setSearch,
          className: 'w-fit',
        }}
      />

      {/* Modals */}
      <>
        {/* Add Modal */}
        <ModalWrapper isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
          <SpaceAddModal
            isLoading={isLoading}
            onClose={() => setIsAddOpen(false)}
            onAdd={handleAddSpace}
          />
        </ModalWrapper>

        {/* Edit Modal */}
        <ModalWrapper isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
          <SpaceEditModal
            isLoading={isLoading}
            onClose={() => setIsEditOpen(false)}
            onEdit={handleEditSpace}
            defaultValues={editDefaultValues}
          />
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa khu vực"
            description={`Bạn có chắc chắn muốn xóa khu vực "${selectedSpaceName}"? Hành động này sẽ xóa toàn bộ các phân khu trực thuộc và không thể hoàn tác.`}
            isLoading={isLoading}
            onCancel={() => setIsConfirmOpen(false)}
            onConfirm={handleDeleteSpace}
          />
        </ModalWrapper>

        {/* Space Users Modal */}
        <ModalWrapper isOpen={isUsersOpen} onClose={() => setIsUsersOpen(false)}>
          <SpaceUsersModal
            spaceId={selectedSpaceId}
            spaceName={selectedSpaceName}
            onClose={() => setIsUsersOpen(false)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
