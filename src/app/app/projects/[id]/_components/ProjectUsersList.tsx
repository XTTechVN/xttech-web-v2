'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { User } from '@/types/shared/user';
import Loading from '@/components/ui/icons/Loading';

interface ProjectUsersListProps {
  projectId: string;
}

export default function ProjectUsersList({ projectId }: ProjectUsersListProps) {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ['project-users', projectId],
    queryFn: () => api.get(`/api/v1/projects/${projectId}/users`).then((res) => res.data),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-8">
        <Loading size={24} />
        <span className="ml-2 text-xs text-gray-500 font-medium">Đang tải nhân sự...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500 text-xs bg-red-50 rounded-xl border border-red-100">
        Lỗi tải danh sách nhân sự
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
        Chưa có nhân sự nào được gán cho dự án này
      </div>
    );
  }

  return (
    <div className="px-4 flex-1 overflow-y-auto max-h-[220px]">
      <div className="grid grid-cols-1 divide-y divide-gray-200">
        {users.map((user: User, index: number) => (
          <div key={user.id} className="text-gray-500 flex gap-2 text-sm font-semibold py-2">
            <span className="">{String(index + 1).padStart(2, '0')}.</span>
            <div className="">
              {user.fullName || 'Chưa đặt tên'} - {user.phone || 'Không có số điện thoại'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
