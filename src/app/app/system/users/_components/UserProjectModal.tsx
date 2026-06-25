'use client';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { SaveIcon, X, Search, Folder } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { User } from '@/types/shared/user';
import { Space } from '@/types/shared/space';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function UserProjectModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [allSpaces, setAllSpaces] = useState<Space[]>([]);
  const [initialSpaceIds, setInitialSpaceIds] = useState<string[]>([]);
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch all spaces flat list
        const resAllSpaces = await api.get('/api/v1/spaces/flat');
        setAllSpaces(resAllSpaces.data || []);

        // 2. Fetch current active spaces for this user
        const resActiveSpaces = await api.get(`/api/v1/users/${user.id}/spaces`);
        const activeIds = (resActiveSpaces.data || []).map((s: Space) => s.id);
        setInitialSpaceIds(activeIds);
        setSelectedSpaceIds(activeIds);
      } catch (error) {
        toast.error('Lấy dữ liệu phân quyền vị trí thất bại');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  // Build a map for resolving space paths (e.g. "Building A > Floor 1 > Room 101")
  const spacePathMap = useMemo(() => {
    const map: Record<string, string> = {};
    const dict = new Map<string, Space>();
    
    // Store all in a map for easy lookup
    allSpaces.forEach((s) => dict.set(s.id, s));

    const getPath = (id: string): string => {
      const s = dict.get(id);
      if (!s) return '';
      if (s.parentId && dict.has(s.parentId)) {
        return `${getPath(s.parentId)} > ${s.name}`;
      }
      return s.name;
    };

    allSpaces.forEach((s) => {
      map[s.id] = getPath(s.id);
    });

    return map;
  }, [allSpaces]);

  const filteredSpaces = useMemo(() => {
    if (!searchVal.trim()) return allSpaces;
    const query = searchVal.toLowerCase();
    return allSpaces.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.spaceId.toLowerCase().includes(query) ||
        (spacePathMap[s.id] && spacePathMap[s.id].toLowerCase().includes(query)),
    );
  }, [allSpaces, searchVal, spacePathMap]);

  const handleToggleSpace = (id: string) => {
    setSelectedSpaceIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const added = selectedSpaceIds.filter((id) => !initialSpaceIds.includes(id));
      const removed = initialSpaceIds.filter((id) => !selectedSpaceIds.includes(id));

      // 1. Gán thêm các vị trí mới
      if (added.length > 0) {
        await api.post(`/api/v1/users/${user.id}/spaces`, {
          space_ids: added,
        });
      }

      // 2. Thu hồi các vị trí đã bỏ chọn
      if (removed.length > 0) {
        await api.delete(`/api/v1/users/${user.id}/spaces`, {
          data: { space_ids: removed },
        });
      }

      toast.success('Cập nhật phân quyền truy cập vị trí thành công');
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Lưu phân quyền thất bại';
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
          <Heading>Phân quyền truy cập vị trí</Heading>
          <SubHeading>Cấp quyền xem camera và quản trị không gian phân cấp cho: <span className="font-semibold text-black">{user.username}</span></SubHeading>
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
                placeholder="Tìm kiếm vị trí/không gian..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            {filteredSpaces.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Không tìm thấy vị trí nào hợp lệ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSpaces.map((space) => {
                  const isChecked = selectedSpaceIds.includes(space.id);
                  const fullPathName = spacePathMap[space.id] || space.name;
                  return (
                    <div
                      key={space.id}
                      onClick={() => handleToggleSpace(space.id)}
                      className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/10 shadow-sm ring-1 ring-indigo-600/30'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handle on click div parent
                          className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 truncate" title={fullPathName}>
                            <Folder size={14} className="text-gray-400 flex-shrink-0" />
                            {space.name}
                          </span>
                          <span className="text-2xs font-mono text-gray-500 uppercase tracking-wider truncate">
                            Mã: {space.spaceId} | Cấp: {space.level}
                          </span>
                          {space.parentId && (
                            <span className="text-xs text-gray-400 truncate" title={fullPathName}>
                              Đường dẫn: {fullPathName}
                            </span>
                          )}
                        </div>
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
              Lưu phân quyền ({selectedSpaceIds.length} vị trí)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
