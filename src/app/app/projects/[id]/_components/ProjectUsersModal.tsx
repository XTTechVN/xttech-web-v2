'use client';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { SaveIcon, X, Search, User } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { User as UserType } from '@/types/shared/user';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';

interface ProjectUsersModalProps {
  projectId: string;
  onClose: () => void;
}

export default function ProjectUsersModal({ projectId, onClose }: ProjectUsersModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [initialUserIds, setInitialUserIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch up to 1000 users in system
        const resAllUsers = await api.get('/api/v1/users?limit=1000');
        setAllUsers(resAllUsers.data.items || []);

        // 2. Fetch current active users for this project
        const resActiveUsers = await api.get(`/api/v1/projects/${projectId}/users`);
        const activeIds = (resActiveUsers.data || []).map((u: UserType) => u.id);
        setInitialUserIds(activeIds);
        setSelectedUserIds(activeIds);
      } catch (error) {
        toast.error('Lấy dữ liệu nhân sự dự án thất bại');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const filteredUsers = useMemo(() => {
    if (!searchVal.trim()) return allUsers;
    const query = searchVal.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        (u.fullName && u.fullName.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)),
    );
  }, [allUsers, searchVal]);

  const handleToggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uId) => uId !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const added = selectedUserIds.filter((id) => !initialUserIds.includes(id));
      const removed = initialUserIds.filter((id) => !selectedUserIds.includes(id));

      // 1. Gán thêm các nhân sự mới
      if (added.length > 0) {
        await api.post(`/api/v1/projects/${projectId}/users`, {
          user_ids: added,
        });
      }

      // 2. Thu hồi quyền các nhân sự đã bỏ chọn
      if (removed.length > 0) {
        await api.delete(`/api/v1/projects/${projectId}/users`, {
          data: { user_ids: removed },
        });
      }

      toast.success('Cập nhật nhân sự cho dự án thành công');
      queryClient.invalidateQueries({ queryKey: ['project-users', projectId] });
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Lưu cấu hình nhân sự thất bại';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-2xl h-[85vh] max-h-[620px] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>Phân quyền nhân sự cho dự án</Heading>
          <SubHeading>Gán quyền giám sát và quản trị công trường cho nhân sự</SubHeading>
        </div>

        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loading size={32} />
        </div>
      ) : (
        <>
          {/* Search Toolbar */}
          <div className="px-6 py-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm nhân sự theo tên, username hoặc email..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Không tìm thấy nhân sự nào khớp với từ khóa
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredUsers.map((item) => {
                  const isChecked = selectedUserIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleUser(item.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Ngăn cảnh báo React, click được handle ở div cha
                        className="mt-1 rounded border-gray-300 text-primary focus:primary w-4.5 h-4.5 cursor-pointer"
                      />
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                          <User size={14} className="text-gray-400" />
                          {item.fullName || (item as any).full_name || 'Chưa đặt tên'}
                        </span>
                        {item.email && (
                          <span className="text-xs text-gray-500 truncate">{item.email}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              icon={<SaveIcon size={16} />}
              disabled={isSaving}
            >
              Lưu phân quyền ({selectedUserIds.length} người)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
