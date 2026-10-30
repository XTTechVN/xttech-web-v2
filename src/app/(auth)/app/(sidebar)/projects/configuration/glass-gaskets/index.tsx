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

const MATERIAL_TYPE_LABEL: Record<string, string> = {
  glass: 'Kính',
  panel: 'Tấm',
  screen_mesh: 'Lưới',
};

export default function GlassGasketsPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<MaterialTypeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<GlassGasketCategoryFilter>('all');

  const [isGlassModalOpen, setIsGlassModalOpen] = useState(false);
  const [selectedGlass, setSelectedGlass] = useState<Glass | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<GlassCategory | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isGasketModalOpen, setIsGasketModalOpen] = useState(false);
  const [selectedGasket, setSelectedGasket] = useState<Gasket | null>(null);
  const [settingDefaultGlassId, setSettingDefaultGlassId] = useState<number | null>(null);

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

  const categoryTypeMap = useMemo(() => {
    const map = new Map<number, 'glass' | 'panel' | 'screen_mesh'>();
    categoriesList.forEach((c) => map.set(c.id, getCategoryMaterialType(c)));
    return map;
  }, [categoriesList]);

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

  const { mutate: deleteGlassMutate } = useMutation({
    mutationFn: (id: number) => deleteGlass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      toast.success('Xóa quy cách kính thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa kính'),
  });

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
    onSettled: () => setSettingDefaultGlassId(null),
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

  const filteredGlasses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return glassesList.filter((g) => {
      if (selectedType !== 'all' && (categoryTypeMap.get(g.categoryId) || 'glass') !== selectedType) return false;
      if (selectedCategory !== 'all' && selectedCategory !== 'gaskets' && g.categoryId !== selectedCategory) return false;
      if (!query) return true;
      return (
        g.name.toLowerCase().includes(query) ||
        g.code.toLowerCase().includes(query) ||
        Boolean(g.glassType && g.glassType.toLowerCase().includes(query))
      );
    });
  }, [glassesList, selectedType, selectedCategory, search, categoryTypeMap]);

  const filteredGaskets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return gasketsList;
    return gasketsList.filter((g) => g.name.toLowerCase().includes(query) || g.code.toLowerCase().includes(query));
  }, [gasketsList, search]);

  const selectedCategoryObj = useMemo(
    () => (typeof selectedCategory === 'number' ? categoriesList.find((c) => c.id === selectedCategory) : null),
    [categoriesList, selectedCategory],
  );

  const isGasketView = selectedCategory === 'gaskets';
  const isLoading = isCatLoading || (isGasketView ? isGasketLoading : isGlassesLoading);

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
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

      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        <GlassToolbar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          onAddGlass={() => {
            setSelectedGlass(null);
            setIsGlassModalOpen(true);
          }}
          onAddGasket={() => {
            setSelectedGasket(null);
            setIsGasketModalOpen(true);
          }}
          onManageCategories={() => setIsCategoryManagerOpen(true)}
        />

        {isLoading ? (
          <GlassSkeleton count={6} />
        ) : isGasketView ? (
          filteredGaskets.length === 0 ? (
            <GlassEmptyState isGasket />
          ) : (
            <GasketTable
              gaskets={filteredGaskets}
              onEdit={(gasket) => {
                setSelectedGasket(gasket);
                setIsGasketModalOpen(true);
              }}
              onDelete={(gasket) => {
                if (confirm(`Xác nhận xóa vật tư "${gasket.name}" (${gasket.code})?`)) {
                  deleteGasketMutate(gasket.id);
                }
              }}
            />
          )
        ) : filteredGlasses.length === 0 ? (
          <GlassEmptyState categoryName={selectedCategoryObj?.name || MATERIAL_TYPE_LABEL[selectedType] || null} />
        ) : (
          <GlassTable
            glasses={filteredGlasses}
            categories={categoriesList}
            onEdit={(glass) => {
              setSelectedGlass(glass);
              setIsGlassModalOpen(true);
            }}
            onDelete={(glass) => {
              if (confirm(`Xác nhận xóa quy cách kính "${glass.name}" (${glass.code})?`)) {
                deleteGlassMutate(glass.id);
              }
            }}
            onSetDefault={(glass) => setDefaultGlassMutate(glass.id)}
            settingDefaultId={settingDefaultGlassId}
          />
        )}
      </div>

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

      <GasketModal
        isOpen={isGasketModalOpen}
        onClose={() => {
          setIsGasketModalOpen(false);
          setSelectedGasket(null);
        }}
        gasket={selectedGasket}
      />

      <GlassCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategoryItem(null);
        }}
        category={selectedCategoryItem}
      />

      <GlassCategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categoriesList}
        onAddCategory={() => {
          setSelectedCategoryItem(null);
          setIsCategoryModalOpen(true);
        }}
        onEditCategory={(cat) => {
          setSelectedCategoryItem(cat);
          setIsCategoryModalOpen(true);
        }}
        onDeleteCategory={(cat) => {
          if (confirm(`Xác nhận xóa nhóm chủng loại "${cat.name}"?`)) {
            deleteCategoryMutate(cat.id);
          }
        }}
      />
    </div>
  );
}
