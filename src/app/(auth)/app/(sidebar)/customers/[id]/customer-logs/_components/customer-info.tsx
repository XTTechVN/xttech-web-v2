import type { Customer } from '@/types';

import { getCustomerTypeLabel, getCustomerTypeColor } from '@/app/(auth)/app/(sidebar)/customers/config';

import { BASE_MINIO_URL } from '@/config/app';

// Lấy đường dẫn ảnh
const getFullImageUrl = (path: string | undefined | null) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_MINIO_URL}${path}`;
};

interface CustomerInfoProps {
  customer: Customer | null;
}

// Hiển thị thông tin khách hàng
export const CustomerInfo = ({ customer }: CustomerInfoProps) => {
  if (!customer) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Chi tiết khách hàng</h3>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        {/* Hiển thị thông tin khách hàng */}
        <div className="flex-1 w-full mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Tên khách hàng</span>
              <span className="text-base font-semibold text-gray-900">{customer.name}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Mã định danh (ID)</span>
              <span className="text-base font-semibold text-gray-900">{customer.identifyCode || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Số điện thoại</span>
              <span className="text-base font-semibold text-gray-900">{customer.phone || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Email</span>
              <span className="text-base font-semibold text-gray-900">{customer.email || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Địa chỉ</span>
              <span className="text-base font-semibold text-gray-900">{customer.address || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Loại khách hàng</span>
              <span className={`text-base font-medium w-fit px-3.5 py-1 rounded-lg border ${customer.type ? getCustomerTypeColor(customer.type) : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                {customer.type ? getCustomerTypeLabel(customer.type) : '—'}
              </span>
            </div>
          </div>

          {/* Hiển thị ảnh đã đính kèm */}
          {customer.images && customer.images.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <span className="text-xs font-semibold text-gray-400 uppercase block mb-3">Hình ảnh đính kèm ({customer.images.length})</span>
              <div className="flex flex-wrap items-center gap-3">
                {customer.images.map((img: any, idx: number) => {
                  const imgPath = typeof img === 'string' ? img : img.imagePath;
                  const src = getFullImageUrl(imgPath);
                  if (!src) return null;
                  return (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                    >
                      <img src={src} alt="img" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
