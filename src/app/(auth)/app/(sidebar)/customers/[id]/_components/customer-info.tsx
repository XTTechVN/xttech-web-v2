import type { Customer } from '@/types';
import { Image } from 'antd';
import { MapPin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

import { getCustomerTypeLabel, getCustomerTypeColor } from '@/app/(auth)/app/(sidebar)/customers/config';

import { Heading, Button } from '@/components';

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

  const hasCoordinates =
    customer.latitude !== null &&
    customer.latitude !== undefined &&
    customer.longitude !== null &&
    customer.longitude !== undefined;

  return (
    <div className="mb-2">
      <Heading as="h3" className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
        Chi tiết khách hàng
      </Heading>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap- items-start">
        {/* Hiển thị thông tin khách hàng */}
        <div className="flex-1 w-full mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Tên khách hàng</span>
              <span className="text-base font-semibold text-gray-900">{customer.name}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Số điện thoại</span>
              <span className="text-base font-semibold text-gray-900">{customer.phone || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Email</span>
              <span className="text-base font-semibold text-gray-900 truncate" title={customer.email || ''}>
                {customer.email || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Mã định danh (ID)</span>
              <span className="text-base font-semibold text-gray-900">{customer.identifyCode || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Địa chỉ</span>
              <span className="text-base font-semibold text-gray-900 truncate" title={customer.address || ''}>
                {customer.address || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Vị trí (Google Maps)</span>
              <div className="flex items-center">
                {hasCoordinates ? (
                  <a
                    href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-700 border border-blue-200/80 rounded-lg transition-all shadow-2xs group whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Mở Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => toast.error('Chưa cập nhật tọa độ khách hàng')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Chưa có tọa độ</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Nhân viên phụ trách</span>
              <span className="text-base font-semibold text-gray-900">
                {customer.staff?.fullName || customer.staff?.username || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Loại khách hàng</span>
              <span
                className={`text-sm font-medium w-fit px-3 py-1 rounded-lg border ${customer.type ? getCustomerTypeColor(customer.type) : 'text-gray-700 bg-gray-50 border-gray-200'}`}
              >
                {customer.type ? getCustomerTypeLabel(customer.type) : '—'}
              </span>
            </div>
          </div>

          {/* Hiển thị ảnh đã đính kèm */}
          {customer.images && customer.images.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <span className="text-xs font-semibold text-gray-400 uppercase block mb-3">
                Hình ảnh đính kèm ({customer.images.length})
              </span>
              <Image.PreviewGroup>
                <div className="flex flex-wrap items-center gap-3">
                  {customer.images.map((img: any, idx: number) => {
                    const imgPath = typeof img === 'string' ? img : img.imagePath;
                    const src = getFullImageUrl(imgPath);
                    if (!src) return null;
                    return (
                      <div
                        key={idx}
                        className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer relative group flex items-center justify-center bg-gray-50"
                      >
                        <Image
                          src={src}
                          alt={`customer-img-${idx}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                        />
                      </div>
                    );
                  })}
                </div>
              </Image.PreviewGroup>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
