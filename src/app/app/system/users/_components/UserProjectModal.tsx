'use client';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import { SaveIcon, X, Search, Folder, Layers } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { User } from '@/types/shared/user';
import { Project } from '@/types/shared/project';
import { Zone } from '@/types/shared/zone';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function UserProjectModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allZones, setAllZones] = useState<Zone[]>([]);
  const [initialProjectIds, setInitialProjectIds] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch all projects in system
        const resAllProjects = await api.get('/api/v1/projects?limit=100');
        setAllProjects(resAllProjects.data.items || []);

        // 2. Fetch all zones in system (to map which zone belongs to which project)
        const resAllZones = await api.get('/api/v1/zones?limit=1000');
        setAllZones(resAllZones.data.items || []);

        // 3. Fetch current active projects for this user
        const resActiveProjects = await api.get(`/api/v1/users/${user.id}/projects`);
        const activeIds = (resActiveProjects.data || []).map((p: Project) => p.id);
        setInitialProjectIds(activeIds);
        setSelectedProjectIds(activeIds);
      } catch (error) {
        toast.error('Lấy dữ liệu phân quyền dự án thất bại');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  // Gom nhóm các zones theo project_id
  const zonesByProjectId = useMemo(() => {
    const groups: Record<string, Zone[]> = {};
    allZones.forEach((zone) => {
      const pId = zone.projectId;
      if (!groups[pId]) {
        groups[pId] = [];
      }
      groups[pId].push(zone);
    });
    return groups;
  }, [allZones]);

  const filteredProjects = useMemo(() => {
    if (!searchVal.trim()) return allProjects;
    const query = searchVal.toLowerCase();
    return allProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.address && p.address.toLowerCase().includes(query)),
    );
  }, [allProjects, searchVal]);

  const handleToggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const added = selectedProjectIds.filter((id) => !initialProjectIds.includes(id));
      const removed = initialProjectIds.filter((id) => !selectedProjectIds.includes(id));

      // 1. Gán thêm các dự án mới
      if (added.length > 0) {
        await api.post(`/api/v1/users/${user.id}/projects`, {
          project_ids: added,
        });
      }

      // 2. Thu hồi các dự án đã bỏ chọn
      if (removed.length > 0) {
        await api.delete(`/api/v1/users/${user.id}/projects`, {
          data: { project_ids: removed },
        });
      }

      toast.success('Cập nhật phân quyền truy cập dự án thành công');
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
          <Heading>Phân quyền truy cập dự án</Heading>
          <SubHeading>Cấp quyền quản lý công trường cho người dùng</SubHeading>
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
                placeholder="Tìm kiếm dự án..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Không tìm thấy dự án nào hợp lệ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProjects.map((project) => {
                  const isChecked = selectedProjectIds.includes(project.id);
                  const projectZones = zonesByProjectId[project.id] || [];
                  return (
                    <div
                      key={project.id}
                      onClick={() => handleToggleProject(project.id)}
                      className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-green-600 bg-green-50/10 shadow-sm ring-1 ring-green-600/30'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Ngăn cảnh báo React, click được handle ở div cha
                          className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 w-4.5 h-4.5 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5 flex-1">
                          <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                            <Folder size={14} className="text-gray-400" />
                            {project.name}
                          </span>
                          <span className="text-2xs font-mono text-gray-500 uppercase tracking-wider">
                            {project.code || 'DA-UNKNOWN'}
                          </span>
                          {project.address && (
                            <span className="text-xs text-gray-600 line-clamp-1">
                              {project.address}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display zones belonging to this project */}
                      {projectZones.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-150">
                          <p className="text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Layers size={10} />
                            Khu vực được cấp quyền:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {projectZones.map((zone) => (
                              <span
                                key={zone.id}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium transition-colors ${
                                  isChecked
                                    ? 'bg-green-100/60 text-green-800 border border-green-200/50'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {zone.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
              Lưu phân quyền ({selectedProjectIds.length} dự án)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
