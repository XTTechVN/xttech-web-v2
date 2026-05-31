'use client';

import Label from '@/components/ui/Label';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { SaveIcon, X, Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { User } from '@/types/shared/user';
import { Role } from '@/types/shared/role';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function UserRolesModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all roles in system
        const resAll = await api.get('/api/v1/roles?limit=100');
        setAllRoles(resAll.data.items || []);

        // Fetch current active roles for this user
        const resActive = await api.get(`/api/v1/users/${user.id}/roles`);
        const activeIds = (resActive.data || []).map((r: Role) => r.id);
        setInitialRoleIds(activeIds);
        setSelectedRoleIds(activeIds);
      } catch (error) {
        toast.error('Lấy dữ liệu vai trò người dùng thất bại');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const filteredRoles = useMemo(() => {
    if (!searchVal.trim()) return allRoles;
    const query = searchVal.toLowerCase();
    return allRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query)),
    );
  }, [allRoles, searchVal]);

  const handleToggleRole = (id: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const added = selectedRoleIds.filter((id) => !initialRoleIds.includes(id));
      const removed = initialRoleIds.filter((id) => !selectedRoleIds.includes(id));

      // 1. Assign new roles
      if (added.length > 0) {
        await api.post(`/api/v1/users/${user.id}/roles`, {
          role_ids: added,
        });
      }

      // 2. Revoke removed roles
      if (removed.length > 0) {
        await api.delete(`/api/v1/users/${user.id}/roles`, {
          data: { role_ids: removed },
        });
      }

      toast.success('Cập nhật vai trò người dùng thành công');
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Lưu vai trò người dùng thất bại';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-xl h-[80vh] max-h-[500px] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>Cấp vai trò</Heading>
          <SubHeading>Cấp hoặc thu hồi vai trò cho người dùng</SubHeading>
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
                placeholder="Tìm kiếm vai trò..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 overflow-y-auto px-6 space-y-3">
            {filteredRoles.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Không tìm thấy vai trò nào
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredRoles.map((role) => {
                  const isChecked = selectedRoleIds.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                        isChecked ? 'border-primary' : 'border-gray-150 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRole(role.id)}
                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-gray-800">{role.name}</span>
                        <span className="text-xs font-mono text-gray-500">{role.code}</span>
                        {role.description && (
                          <span className="text-xs text-gray-600 mt-1">{role.description}</span>
                        )}
                      </div>
                    </label>
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
              Lưu thay đổi ({selectedRoleIds.length} đã chọn)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
