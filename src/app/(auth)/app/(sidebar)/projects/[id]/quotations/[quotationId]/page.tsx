/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { use, useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getQuotation, getDoors, getMaterials, getAccessories, getExtraOptions, getQuotationPreview, getFormulas } from '@/actions';
import { useQuotationStore } from '@/stores';
import { useDebounce } from '@/hooks';
import { QuotationEditor, QuotationPreview, QuotationTermsEditor } from './components';

interface QuotationDetailPageProps {
  params: Promise<{ id: string; quotationId: string }>;
}

export default function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const { id, quotationId: quotationIdParam } = use(params);
  const quotationId = parseInt(quotationIdParam, 10);
  const store = useQuotationStore();
  const [initialized, setInitialized] = useState(false);

  // 1. Chi tiết báo giá
  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: async () => {
      const data = await getQuotation(quotationId);
      return data;
    },
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

  // 6. Danh sách công thức
  const { data: formulas } = useQuery({
    queryKey: ['formulas-all'],
    queryFn: async () => {
      const data = await getFormulas({ limit: 1000 });
      return data.items;
    },
  });

  const accessoriesList = accessories || [];
  const extraOptionsList = extraOptions || [];
  const formulasList = formulas || [];

  // Khởi tạo Zustand Store khi nhận được dữ liệu báo giá ban đầu từ API
  useEffect(() => {
    if (quotation) {
      store.initialize(quotation);
      setInitialized(true);
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
    queryKey: ['quotation-preview', quotationId, debouncedFloors, debouncedTitle, debouncedDiscount, accessoriesList, extraOptionsList],
    queryFn: () => {
      const payload = store.getPayload(accessoriesList, extraOptionsList);
      return getQuotationPreview({
        title: debouncedTitle,
        code: store.code,
        discountPercentage: debouncedDiscount,
        projectId: store.projectId,
        floors: payload.floors,
        priceType: payload.priceType,
      });
    },
    enabled: initialized && debouncedFloors.length > 0 && !!accessories && !!extraOptions,
    placeholderData: keepPreviousData,
  });

  if (isLoading || !initialized) {
    return <div className="p-6 text-black flex justify-center items-center h-64 font-medium">Đang tải thông tin báo giá...</div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[35%_65%] gap-4 text-black pb-80">
      {/* Cột trái: Editor */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <QuotationEditor
            quotationId={quotationId}
            materialsList={materials || []}
            doorsList={doors || []}
            accessoriesList={accessoriesList}
            extraOptionsList={extraOptionsList}
            formulasList={formulasList}
          />
      </div>

      {/* Cột phải: Live Preview */}
      <div className="min-w-0 flex flex-col gap-4">
        {previewData ? (
          <>
            <div className="relative bg-white rounded border border-gray-200">
              <QuotationPreview quotation={previewData} materialsList={materials || []} doorsList={doors || []} extraOptionsList={extraOptionsList} />
              {isPreviewFetching && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex justify-center items-center z-10 rounded">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#045863] border-t-transparent"></div>
                    <span className="text-xs text-gray-500 font-medium">Đang cập nhật...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trình biên soạn ghi chú & điều khoản nằm dưới preview */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <QuotationTermsEditor />
            </div>
          </>
        ) : (
          <div className="bg-gray-100 border border-dashed border-gray-300 rounded p-12 text-center text-gray-400 italic">
            Chưa có dữ liệu preview hoặc đang tải...
          </div>
        )}
      </div>
    </div>
  );
}
