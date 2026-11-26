'use client';

import { useMutation } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateBrand } from '@/actions';
import { Button } from '@/components-remake';
import { isBrandFavorite, type Brand } from '@/types';
import { showErrorToast } from '@/utils';
import { favoritesOf, refreshBrands } from './format';

interface Props {
  brand: Brand;
  brands: Brand[];
}

// Đặt hoặc bỏ hãng mặc định; mỗi nhóm (nhôm, phụ kiện) chỉ có một hãng
export function useBrandFavorite(brand: Brand, brands: Brand[]) {
  const on = isBrandFavorite(brand);

  const toggle = useMutation({
    mutationFn: async () => {
      if (on) return updateBrand(brand.id, { sortOrder: 0 });
      await Promise.all(favoritesOf(brands, brand).map((b) => updateBrand(b.id, { sortOrder: 0 })));
      return updateBrand(brand.id, { sortOrder: 1 });
    },
    onSuccess: () => {
      refreshBrands();
      toast.success(on ? 'Đã bỏ hãng mặc định' : `Đã đặt "${brand.name}" làm hãng mặc định`);
    },
    onError: (e) => showErrorToast(e, 'Không thể cập nhật hãng mặc định'),
  });

  return { on, toggle: () => toggle.mutate(), pending: toggle.isPending };
}

// Nút trong drawer chi tiết
export function BrandFavorite({ brand, brands }: Props) {
  const { on, toggle, pending } = useBrandFavorite(brand, brands);

  return (
    <Button variant="outline" loading={pending} icon={<Star size={16} className={on ? 'fill-amber-400 text-amber-400' : ''} />} onClick={toggle}>
      {on ? 'Bỏ hãng mặc định' : 'Đặt làm hãng mặc định'}
    </Button>
  );
}
