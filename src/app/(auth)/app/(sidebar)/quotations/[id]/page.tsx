'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getQuotation,
  getDoors,
  getMaterials,
  getAccessories,
  getExtraOptions,
  getQuotationPreview,
} from '@/actions';
import { useQuotationStore } from '@/stores';
import { useDebounce } from '@/hooks';
import { QuotationEditor, QuotationPreview } from './components';

interface QuotationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const { id } = use(params);
  const quotationId = parseInt(id, 10);
  const store = useQuotationStore();

  // 1. Chi tiết báo giá
  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: () => getQuotation(quotationId),
    enabled: !!quotationId,
  });

  // 2. Danh sách biên dạng cửa
  const { data: doors } = useQuery({
    queryKey: ['doors-all'],
    queryFn: async () => {
      const data = await getDoors({ limit: 1000 });
      return data.items;
    },
  });

  // 3. Hệ nhôm
  const { data: materials } = useQuery({
    queryKey: ['materials-all'],
    queryFn: async () => {
      const data = await getMaterials({ limit: 1000 });
      return data.items;
    },
  });

  // 4. Phụ kiện
  const { data: accessories } = useQuery({
    queryKey: ['accessories-all'],
    queryFn: async () => {
      const data = await getAccessories({ limit: 1000 });
      return data.items;
    },
  });

  // 5. Danh sách tùy chọn phát sinh
  const { data: extraOptions } = useQuery({
    queryKey: ['extra-options-all'],
    queryFn: async () => {
      const data = await getExtraOptions({ limit: 1000 });
      return data.items;
    },
  });

  const accessoriesList = accessories || [];
  const extraOptionsList = extraOptions || [];

  // Khởi tạo Zustand Store khi nhận được dữ liệu báo giá ban đầu từ API
  useEffect(() => {
    if (quotation) {
      store.initialize(quotation);
    }
  }, [quotation]);

  // Log dữ liệu hiện tại của store ra console khi có thay đổi
  useEffect(() => {
    console.log('--- ZUSTAND STORE CURRENT STATE ---');
    console.log('Floors:', store.floors);
  }, [store.title, store.code, store.discountPercentage, store.floors]);

  // Debounce dữ liệu từ store để giảm số lần gọi API preview khi người dùng nhập liệu nhanh
  const debouncedFloors = useDebounce(store.floors, 400);
  const debouncedTitle = useDebounce(store.title, 400);
  const debouncedDiscount = useDebounce(store.discountPercentage, 400);

  // Gọi API preview để lấy báo giá chi tiết đã tính toán đầy đủ từ backend
  const { data: previewData, isFetching: isPreviewFetching } = useQuery({
    queryKey: ['quotation-preview', quotationId, debouncedFloors, debouncedTitle, debouncedDiscount],
    queryFn: () =>
      getQuotationPreview({
        title: debouncedTitle,
        code: store.code,
        discountPercentage: debouncedDiscount,
        projectId: store.projectId,
        floors: debouncedFloors as any,
      }),
    enabled: !!store.title && debouncedFloors.length > 0,
  });

  if (isLoading || !store.title) {
    return <div className="p-6 text-black flex justify-center items-center h-64 font-medium">Đang tải thông tin báo giá...</div>;
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto p-4 lg:p-6 flex flex-col xl:flex-row gap-6 items-start text-black">
      {/* Cột trái: Editor */}
      <div className="w-full xl:w-[42%] bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Trình biên tập báo giá: {store.title}</h1>
          <p className="text-sm text-gray-500">
            Mã báo giá: {store.code} | Dự án ID: #{store.projectId}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <QuotationEditor
            quotationId={quotationId}
            materialsList={materials || []}
            doorsList={doors || []}
            accessoriesList={accessoriesList}
            extraOptionsList={extraOptionsList}
          />
        </div>
      </div>

      {/* Cột phải: Live Preview */}
      <div className="w-full xl:w-[58%] flex flex-col gap-4 self-stretch xl:sticky xl:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span>XEM TRƯỚC BÁO GIÁ THỜI GIAN THỰC</span>
            {isPreviewFetching && (
              <span className="text-xs font-normal text-amber-600 animate-pulse">(Đang tính toán...)</span>
            )}
          </h2>
        </div>

        {previewData ? (
          <QuotationPreview quotation={previewData} floors={previewData.floors} />
        ) : (
          <div className="flex-1 bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 italic p-12 min-h-[600px]">
            Chưa có dữ liệu preview hoặc đang tải...
          </div>
        )}
      </div>
    </div>
  );
}
