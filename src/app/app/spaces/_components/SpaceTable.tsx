'use client';

// Components
import Table from '@/components/table/Table';
import TableLoading from '@/components/table/TableLoading';
import { Users, Edit2, Trash2 } from 'lucide-react';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// Utils
import api from '@/utils/api';
import dayjs from 'dayjs';

// Types
import { Space } from '@/types/shared/space';

export default function SpaceTable({
  searchQuery,
  onDelete,
  onEdit,
  onAssignUsers,
}: {
  searchQuery: string;
  onDelete: (id: string, name: string) => void;
  onEdit: (space: Space) => void;
  onAssignUsers: (space: Space) => void;
}) {
  const {
    data: spaces = [],
    isLoading,
    error,
  } = useQuery<Space[]>({
    queryKey: ['spaces-flat'],
    queryFn: () => api.get('/api/v1/spaces/flat').then((res: any) => res.data),
  });

  // Create a map to quickly look up parent names by id
  const spaceMap = useMemo(() => {
    const map = new Map<string, string>();
    spaces.forEach((s) => {
      map.set(s.id, s.name);
    });
    return map;
  }, [spaces]);

  // Filter spaces client-side
  const filteredSpaces = useMemo(() => {
    if (!searchQuery.trim()) return spaces;
    const query = searchQuery.toLowerCase();
    return spaces.filter(
      (s) => s.name.toLowerCase().includes(query) || s.spaceId.toLowerCase().includes(query),
    );
  }, [spaces, searchQuery]);

  const columns = [
    {
      key: 'spaceId',
      label: 'Mã khu vực',
      width: '20%',
      render: (item: Space) => <span>{item.spaceId}</span>,
    },
    {
      key: 'name',
      label: 'Tên khu vực',
      width: '25%',
      render: (item: Space) => <span>{item.name}</span>,
    },
    {
      key: 'parentSpace',
      label: 'Khu vực cha',
      width: '20%',
      render: (item: Space) => {
        if (!item.parentId) return <span>Không có (Gốc)</span>;
        const parentName = spaceMap.get(item.parentId);
        return <span>{parentName || item.parentId}</span>;
      },
    },
    {
      key: 'level',
      label: 'Cấp độ',
      width: '10%',
      render: (item: Space) => <span>Cấp {item.level}</span>,
    },
    {
      key: 'createdAt',
      label: 'Thời gian tạo',
      width: '15%',
      render: (item: Space) => (
        <span>{item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : '---'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '15%',
      render: (item: Space) => (
        <div className="flex items-center gap-3">
          <button
            title="Gán nhân sự"
            className="text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
            onClick={() => onAssignUsers(item)}
          >
            <Users size={16} />
          </button>
          <button
            title="Sửa khu vực"
            className="text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
            onClick={() => onEdit(item)}
          >
            <Edit2 size={16} />
          </button>
          <button
            title="Xóa khu vực"
            className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            onClick={() => onDelete(item.id, item.name)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const cardView = (items: Space[]) => (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-gray-900">{item.name}</span>
            <span className="font-mono text-xs text-gray-800 bg-gray-50 px-2 py-0.5 rounded">
              {item.spaceId}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex flex-col gap-1 mt-1">
            <div className="flex justify-between">
              <span>Khu vực cha:</span>
              <span className="font-medium text-gray-700">
                {item.parentId ? spaceMap.get(item.parentId) || item.parentId : 'Không có (Gốc)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cấp độ:</span>
              <span className="font-semibold text-indigo-700">Cấp {item.level}</span>
            </div>
            <div className="flex justify-between">
              <span>Thời gian tạo:</span>
              <span>
                {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : '---'}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-4 border-t border-gray-100 pt-2 mt-1">
            <button
              onClick={() => onAssignUsers(item)}
              className="flex items-center gap-1 text-xs text-indigo-600 font-semibold"
            >
              <Users size={14} /> Gán nhân sự
            </button>
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1 text-xs text-gray-600 font-semibold"
            >
              <Edit2 size={14} /> Sửa
            </button>
            <button
              onClick={() => onDelete(item.id, item.name)}
              className="flex items-center gap-1 text-xs text-red-600 font-semibold"
            >
              <Trash2 size={14} /> Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {isLoading && <TableLoading cols={columns} />}
      {error && <div className="text-red-500 p-4 text-center">Đã xảy ra lỗi: {error.message}</div>}
      {!isLoading && !error && (
        <Table data={filteredSpaces} columns={columns} cardView={cardView} />
      )}
    </div>
  );
}
