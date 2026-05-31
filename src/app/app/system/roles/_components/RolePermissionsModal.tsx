'use client';

import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { SaveIcon, X, Search, CheckCheck, Trash2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Role } from '@/types/shared/role';
import { Permission } from '@/types/shared/permission';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function RolePermissionsModal({
  role,
  onClose,
}: {
  role: Role;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [initialPermissionIds, setInitialPermissionIds] = useState<string[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all permissions in system
        const resAll = await api.get('/api/v1/permissions?limit=200');
        setAllPermissions(resAll.data.items || []);

        // Fetch current active permissions for this role
        const resActive = await api.get(`/api/v1/roles/${role.id}/permissions`);
        const activeIds = (resActive.data || []).map((p: Permission) => p.id);
        setInitialPermissionIds(activeIds);
        setSelectedPermissionIds(activeIds);
      } catch (error) {
        toast.error('Lấy dữ liệu phân quyền thất bại');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [role.id]);

  const filteredPermissions = useMemo(() => {
    if (!searchVal.trim()) return allPermissions;
    const query = searchVal.toLowerCase();
    return allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)),
    );
  }, [allPermissions, searchVal]);

  const handleTogglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissionIds(allPermissions.map((p) => p.id));
  };

  const handleClearAll = () => {
    setSelectedPermissionIds([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const added = selectedPermissionIds.filter((id) => !initialPermissionIds.includes(id));
      const removed = initialPermissionIds.filter((id) => !selectedPermissionIds.includes(id));

      // 1. Assign new permissions
      if (added.length > 0) {
        await api.post(`/api/v1/roles/${role.id}/permissions`, {
          permission_ids: added,
        });
      }

      // 2. Revoke removed permissions
      if (removed.length > 0) {
        await api.delete(`/api/v1/roles/${role.id}/permissions`, {
          data: { permission_ids: removed },
        });
      }

      toast.success('Cập nhật phân quyền vai trò thành công');
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Lưu phân quyền thất bại';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-xl h-[80vh] max-h-[600px] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>Phân quyền vai trò</Heading>
          <SubHeading>Cấp hoặc thu hồi quyền hạn cho vai trò</SubHeading>
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
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm quyền hạn..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSelectAll}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                title="Chọn tất cả"
                aria-label="Chọn tất cả"
              >
                <CheckCheck size={18} />
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                title="Bỏ chọn tất cả"
                aria-label="Bỏ chọn tất cả"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 overflow-y-auto px-6 space-y-3">
            {filteredPermissions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <span>Không tìm thấy quyền hạn nào</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredPermissions.map((perm) => {
                  const isChecked = selectedPermissionIds.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                        isChecked ? 'border-primary' : 'border-gray-150 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-gray-800">{perm.name}</span>
                        <span className="text-xs font-mono text-gray-500">{perm.code}</span>
                        {perm.description && (
                          <span className="text-xs text-gray-600 mt-1">{perm.description}</span>
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
              Lưu thay đổi ({selectedPermissionIds.length} đã chọn)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
