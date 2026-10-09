'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import {
  getProfileSections,
  createProfileSection,
  deleteProfileSection,
  getProfileBars,
} from '@/actions';
import type { ProfileSection, ProfileSectionCreate } from '@/types';
import { Modal, Button, Input } from '@/components';
import {
  Search,
  Upload,
  X,
  Trash2,
  FolderOpen,
  Loader2,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface ProfileSectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (section: ProfileSection) => void;
  selectedSectionId?: number | null;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'frame', label: 'Khung bao' },
  { value: 'sash', label: 'Cánh cửa' },
  { value: 'mullion', label: 'Đố chia' },
  { value: 'bead', label: 'Nẹp kính' },
  { value: 'track', label: 'Ray trượt' },
  { value: 'other', label: 'Khác' },
];

const CATEGORY_LABELS: Record<string, string> = {
  frame: 'Khung bao',
  sash: 'Cánh cửa',
  mullion: 'Đố chia',
  bead: 'Nẹp kính',
  track: 'Ray trượt',
  other: 'Khác',
};

export function ProfileSectionLibraryModal({
  isOpen,
  onClose,
  onSelect,
  selectedSectionId,
}: ProfileSectionLibraryModalProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch sections
  const { data: sectionsData, isLoading: isLoadingSections } = useQuery({
    queryKey: ['profile-sections', activeSearch, selectedCategory],
    queryFn: async () => {
      const res = await getProfileSections({
        search: activeSearch || undefined,
        category: selectedCategory || undefined,
        limit: 500,
      });
      return res || [];
    },
    enabled: isOpen,
  });

  // Fetch profile bars to count how many profiles use each section
  const { data: profileBarsData } = useQuery({
    queryKey: ['profile-bars-for-sections'],
    queryFn: async () => {
      const res = await getProfileBars({ limit: 1000 });
      return res.items || [];
    },
    enabled: isOpen,
  });

  const sectionUsageMap = useMemo(() => {
    const map = new Map<number, number>();
    const bars = profileBarsData || [];
    for (const b of bars) {
      if (b.sectionLibraryId) {
        map.set(b.sectionLibraryId, (map.get(b.sectionLibraryId) || 0) + 1);
      }
    }
    return map;
  }, [profileBarsData]);

  const sections = sectionsData || [];

  // Mutation Create
  const { mutate: createSectionMutate, isPending: isUploading } = useMutation({
    mutationFn: (data: ProfileSectionCreate) => createProfileSection(data),
    onSuccess: (newSec) => {
      queryClient.invalidateQueries({ queryKey: ['profile-sections'] });
      toast.success(`Đã tải lên mặt cắt "${newSec.name}" thành công`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi tải lên file mặt cắt SVG'),
  });

  // Mutation Delete
  const { mutate: deleteSectionMutate, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteProfileSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-sections'] });
      toast.success('Đã xóa mặt cắt khỏi thư viện');
      setDeleteConfirmId(null);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa mặt cắt'),
  });

  // Handle SVG File Upload & Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg')) {
      toast.error('Vui lòng chọn file định dạng vector SVG (.svg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const svgText = event.target?.result as string;
        if (!svgText) {
          toast.error('Nội dung file SVG trống');
          return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) {
          toast.error('Không tìm thấy thẻ <svg> hợp lệ trong file');
          return;
        }

        const viewBox = svgEl.getAttribute('viewBox') || '0 0 100 100';

        // Extract path 'd' attributes
        const pathElements = doc.querySelectorAll('path');
        const pathDataArr: string[] = [];
        pathElements.forEach((p) => {
          const d = p.getAttribute('d');
          if (d) pathDataArr.push(d.trim());
        });

        if (pathDataArr.length === 0) {
          toast.error('Không tìm thấy đường vẽ vector <path d="..."> trong file SVG');
          return;
        }

        const combinedPathData = pathDataArr.join(' ');
        const fileNameNoExt = file.name.replace(/\.[^/.]+$/, '');
        const code = `SEC_${fileNameNoExt.toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 30)}`;

        const category = selectedCategory || 'frame';

        createSectionMutate({
          code,
          name: fileNameNoExt,
          category,
          svgPathData: combinedPathData,
          viewBox,
        });
      } catch (err) {
        toast.error('Không thể đọc hoặc phân tích cú pháp file SVG');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Thư viện mặt cắt SVG"
    >
      <div className="flex flex-col gap-4 text-slate-800">
        {/* Toolbar Header (Windova Style) */}
        <div className="flex flex-col gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm mặt cắt theo tên..."
                className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
            </div>
          </form>

          {/* Controls: Category, Edit Checkbox, Upload & Search Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary text-slate-700 cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Edit Mode Checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isEditMode}
                  onChange={(e) => setIsEditMode(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary/30 w-4 h-4 cursor-pointer"
                />
                <span>Sửa mặt cắt</span>
              </label>

              {/* Upload SVG Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Tải lên file mới</span>
              </button>
            </div>

            {/* Submit Search Button */}
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="inline-flex items-center justify-center h-9 px-6 bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              Tìm
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Đã tải {sections.length} mặt cắt</span>
          {selectedCategory && (
            <span className="text-primary font-semibold">
              Đang lọc: {CATEGORY_LABELS[selectedCategory] || selectedCategory}
            </span>
          )}
        </div>

        {/* Sections Grid View */}
        <div className="min-h-[300px] max-h-[55vh] overflow-y-auto pr-1">
          {isLoadingSections ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs">Đang tải thư viện mặt cắt...</span>
            </div>
          ) : sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <FolderOpen className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-medium">Chưa có mặt cắt nào trong thư viện</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs text-primary font-bold hover:underline"
              >
                + Bấm vào đây để tải lên file SVG đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {sections.map((sec) => {
                const isSelected = selectedSectionId === sec.id;
                const usageCount = sectionUsageMap.get(sec.id) || 0;
                const catLabel = CATEGORY_LABELS[sec.category] || sec.category;

                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      if (!isEditMode) {
                        onSelect(sec);
                      }
                    }}
                    className={`group relative flex flex-col items-center justify-between p-3 rounded-xl border transition-all select-none cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                        : 'border-slate-200/90 bg-white hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    {/* Delete button when in edit mode */}
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(sec.id);
                        }}
                        title="Xóa mặt cắt"
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md z-10 cursor-pointer transition transform hover:scale-110"
                      >
                        ✕
                      </button>
                    )}

                    {/* Selected badge */}
                    {isSelected && !isEditMode && (
                      <div className="absolute top-2 right-2 text-primary">
                        <CheckCircle className="w-4 h-4 fill-primary text-white" />
                      </div>
                    )}

                    {/* SVG Vector Preview Box */}
                    <div className="w-full h-28 flex items-center justify-center bg-slate-50/70 rounded-lg p-2 border border-slate-100 group-hover:bg-slate-50 transition">
                      <svg
                        viewBox={sec.viewBox || '0 0 100 100'}
                        className="w-full h-full stroke-slate-700 fill-none transition-transform group-hover:scale-105"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={sec.svgPathData} />
                      </svg>
                    </div>

                    {/* Name & Code */}
                    <div className="w-full text-center mt-2.5">
                      <div
                        className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight"
                        title={sec.name}
                      >
                        {sec.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {sec.code}
                      </div>
                    </div>

                    {/* Badges footer */}
                    <div className="w-full flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {usageCount} profile
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {catLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 text-center flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-800">Xóa mặt cắt khỏi thư viện?</h4>
              <p className="text-xs text-slate-500">
                Thao tác này sẽ xóa vĩnh viễn mẫu vector SVG này khỏi hệ thống.
              </p>
              <div className="flex gap-2 justify-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteSectionMutate(deleteConfirmId)}
                  loading={isDeleting}
                >
                  Xác nhận xóa
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose} className="px-6">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
