'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getGlasses,
  getGlassCategories,
  getGaskets,
  deleteGlass,
  setDefaultGlass,
  deleteGlassCategory,
  updateGlassCategory,
  deleteGasket,
} from '@/actions';
import type { Glass, GlassCategory, Gasket } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import {
  GlassCategorySidebar,
  GlassToolbar,
  GlassTable,
  GasketTable,
  GlassCategoryManagerModal,
  GlassSkeleton,
  GlassEmptyState,
  GlassModal,
  GasketModal,
  GlassCategoryModal,
  type GlassGasketCategoryFilter,
  type MaterialTypeFilter,
  getCategoryMaterialType,
} from './_components';

export default function GlassGasketsPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<MaterialTypeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<GlassGasketCategoryFilter>('all');

  // Modals state
  const [isGlassModalOpen, setIsGlassModalOpen] = useState(false);
  const [selectedGlass, setSelectedGlass] = useState<Glass | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<GlassCategory | null>(null);

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const [isGasketModalOpen, setIsGasketModalOpen] = useState(false);
  const [selectedGasket, setSelectedGasket] = useState<Gasket | null>(null);

  // Queries
  const { data: catData, isLoading: isCatLoading } = useQuery({
    queryKey: ['glass-categories'],
    queryFn: async () => (await getGlassCategories({ limit: 999 })).items,
  });

  const { data: glassesData, isLoading: isGlassesLoading } = useQuery({
    queryKey: ['glasses'],
    queryFn: async () => (await getGlasses({ limit: 999 })).items,
  });

  const { data: gasketData, isLoading: isGasketLoading } = useQuery({
    queryKey: ['gaskets'],
    queryFn: async () => (await getGaskets({ limit: 999 })).items,
  });

  const categoriesList = useMemo(() => catData || [], [catData]);
  const glassesList = useMemo(() => glassesData || [], [glassesData]);
  const gasketsList = useMemo(() => gasketData || [], [gasketData]);

  // Map categoryId -> materialType
  const categoryTypeMap = useMemo(() => {
    const map = new Map<number, 'glass' | 'panel' | 'screen_mesh'>();
    categoriesList.forEach((c) => {
      map.set(c.id, getCategoryMaterialType(c));
    });
    return map;
  }, [categoriesList]);

  // Thống kê số lượng từng loại chính
  const glassTypeCounts = useMemo(() => {
    let glass = 0;
    let panel = 0;
    let screen_mesh = 0;
    glassesList.forEach((g) => {
      const type = categoryTypeMap.get(g.categoryId) || 'glass';
      if (type === 'panel') panel++;
      else if (type === 'screen_mesh') screen_mesh++;
      else glass++;
    });
    return { glass, panel, screen_mesh };
  }, [glassesList, categoryTypeMap]);

  // Mutations
  const { mutate: deleteGlassMutate } = useMutation({
    mutationFn: (id: number) => deleteGlass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      toast.success('Xóa quy cách kính thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa kính'),
  });

  const [settingDefaultGlassId, setSettingDefaultGlassId] = useState<number | null>(null);

  const { mutate: setDefaultGlassMutate } = useMutation({
    mutationFn: (id: number) => {
      setSettingDefaultGlassId(id);
      return setDefaultGlass(id);
    },
    onSuccess: (updatedGlass) => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      toast.success(`Đã đặt "${updatedGlass.name}" làm kính mặc định`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi đặt kính mặc định'),
    onSettled: () => {
      setSettingDefaultGlassId(null);
    },
  });

  const { mutate: deleteGasketMutate } = useMutation({
    mutationFn: (id: number) => deleteGasket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaskets'] });
      toast.success('Xóa gioăng ron / keo thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa gioăng ron'),
  });

  const { mutate: deleteCategoryMutate } = useMutation({
    mutationFn: (id: number) => deleteGlassCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glass-categories'] });
      toast.success('Xóa nhóm chủng loại thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa nhóm chủng loại'),
  });

  // Filtered glasses
  const filteredGlasses = useMemo(() => {
    return glassesList.filter((g) => {
      // 1. Lọc theo Loại chính (Kính, Tấm, Lưới)
      if (selectedType !== 'all') {
        const matType = categoryTypeMap.get(g.categoryId) || 'glass';
        if (matType !== selectedType) return false;
      }

      // 2. Lọc theo Category cụ thể
      if (selectedCategory !== 'all' && selectedCategory !== 'gaskets') {
        if (g.categoryId !== selectedCategory) return false;
      }

      // 3. Lọc theo từ khóa tìm kiếm
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(query) ||
        g.code.toLowerCase().includes(query) ||
        (g.glassType && g.glassType.toLowerCase().includes(query))
      );
    });
  }, [glassesList, selectedType, selectedCategory, search, categoryTypeMap]);

  // Filtered gaskets
  const filteredGaskets = useMemo(() => {
    return gasketsList.filter((g) => {
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(query) ||
        g.code.toLowerCase().includes(query)
      );
    });
  }, [gasketsList, search]);

  const selectedCategoryObj = useMemo(() => {
    if (typeof selectedCategory === 'number') {
      return categoriesList.find((c) => c.id === selectedCategory);
    }
    return null;
  }, [categoriesList, selectedCategory]);

  const handleOpenCreateGlass = () => {
    setSelectedGlass(null);
    setIsGlassModalOpen(true);
  };

  const handleOpenEditGlass = (glass: Glass) => {
    setSelectedGlass(glass);
    setIsGlassModalOpen(true);
  };

  const handleDeleteGlass = (glass: Glass) => {
    if (confirm(`Xác nhận xóa quy cách kính "${glass.name}" (${glass.code})?`)) {
      deleteGlassMutate(glass.id);
    }
  };

  const handleOpenCreateGasket = () => {
    setSelectedGasket(null);
    setIsGasketModalOpen(true);
  };

  const handleOpenEditGasket = (gasket: Gasket) => {
    setSelectedGasket(gasket);
    setIsGasketModalOpen(true);
  };

  const handleDeleteGasket = (gasket: Gasket) => {
    if (confirm(`Xác nhận xóa vật tư "${gasket.name}" (${gasket.code})?`)) {
      deleteGasketMutate(gasket.id);
    }
  };

  const handleOpenCreateCategory = () => {
    setSelectedCategoryItem(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: GlassCategory) => {
    setSelectedCategoryItem(cat);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (cat: GlassCategory) => {
    if (confirm(`Xác nhận xóa nhóm chủng loại "${cat.name}"?`)) {
      deleteCategoryMutate(cat.id);
    }
  };

  const isGasketView = selectedCategory === 'gaskets';
  const isLoading = isCatLoading || (isGasketView ? isGasketLoading : isGlassesLoading);

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Cột lọc phân loại bên trái */}
      <GlassCategorySidebar
        categories={categoriesList}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        glassCount={glassesList.length}
        gasketCount={gasketsList.length}
        glassTypeCounts={glassTypeCounts}
      />

      {/* Khu vực nội dung bên phải */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        {/* Toolbar: Tìm kiếm & Thao tác */}
        <GlassToolbar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          onAddGlass={handleOpenCreateGlass}
          onAddGasket={handleOpenCreateGasket}
          onManageCategories={() => setIsCategoryManagerOpen(true)}
        />

        {/* Bảng dữ liệu hoặc Loading / Empty state */}
        {isLoading ? (
          <GlassSkeleton count={6} />
        ) : isGasketView ? (
          filteredGaskets.length === 0 ? (
            <GlassEmptyState isGasket />
          ) : (
            <GasketTable
              gaskets={filteredGaskets}
              onEdit={handleOpenEditGasket}
              onDelete={handleDeleteGasket}
            />
          )
        ) : filteredGlasses.length === 0 ? (
          <GlassEmptyState
            categoryName={
              selectedCategoryObj?.name ||
              (selectedType === 'glass'
                ? 'Kính'
                : selectedType === 'panel'
                ? 'Tấm'
                : selectedType === 'screen_mesh'
                ? 'Lưới'
                : null)
            }
          />
        ) : (
          <GlassTable
            glasses={filteredGlasses}
            categories={categoriesList}
            onEdit={handleOpenEditGlass}
            onDelete={handleDeleteGlass}
            onSetDefault={(glass) => setDefaultGlassMutate(glass.id)}
            settingDefaultId={settingDefaultGlassId}
          />
        )}
      </div>

      {/* Modal Thêm/Sửa Quy cách Kính */}
      <GlassModal
        isOpen={isGlassModalOpen}
        onClose={() => {
          setIsGlassModalOpen(false);
          setSelectedGlass(null);
        }}
        glass={selectedGlass}
        categories={categoriesList}
        defaultMaterialType={selectedType !== 'all' ? selectedType : 'glass'}
        defaultCategoryId={typeof selectedCategory === 'number' ? selectedCategory : undefined}
      />

      {/* Modal Thêm/Sửa Gioăng Ron & Keo */}
      <GasketModal
        isOpen={isGasketModalOpen}
        onClose={() => {
          setIsGasketModalOpen(false);
          setSelectedGasket(null);
        }}
        gasket={selectedGasket}
      />

      {/* Modal Thêm/Sửa Nhóm Chủng Loại */}
      <GlassCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategoryItem(null);
        }}
        category={selectedCategoryItem}
      />

      {/* Modal Quản lý danh sách Nhóm Chủng Loại */}
      <GlassCategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categoriesList}
        onAddCategory={handleOpenCreateCategory}
        onEditCategory={handleOpenEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
