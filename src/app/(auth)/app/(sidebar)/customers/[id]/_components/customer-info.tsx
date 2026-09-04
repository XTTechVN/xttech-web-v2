'use client';

import { useState, useEffect } from 'react';

import type { Customer } from '@/types';

import { Image } from 'antd';

import { MapPin, ExternalLink } from 'lucide-react';

import toast from 'react-hot-toast';

import { getCustomerTypeLabel, getCustomerTypeColor } from '@/app/(auth)/app/(sidebar)/customers/config';

import { Heading } from '@/components';

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
  const [maxImages, setMaxImages] = useState(18);
  const [showAllImages, setShowAllImages] = useState(false);

  // Xử lý hiển thị số lượng ảnh upload theo kích thước màn hình 
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMaxImages(5);
      } else if (window.innerWidth < 1024) {
        setMaxImages(10);
      } else {
        setMaxImages(18);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!customer) return null;

  const hasCoordinates =
    customer.latitude !== null &&
    customer.latitude !== undefined &&
    customer.longitude !== null &&
    customer.longitude !== undefined;

  return (
    <div className="mb-2">
      <Heading as="h3" className="text-xs md:text-sm font-bold text-gray-500  tracking-wider mb-3">
        Chi tiết khách hàng
      </Heading>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap- items-start">
        {/* Hiển thị thông tin khách hàng */}
        <div className="flex-1 w-full mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 ">Tên khách hàng</span>
              <span className="text-base font-semibold text-gray-900">{customer.name}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 ">Số điện thoại</span>
              <span className="text-base font-semibold text-gray-900">{customer.phone || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 ">Email</span>
              <span className="text-base font-semibold text-gray-900 truncate" title={customer.email || ''}>
                {customer.email || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 ">Mã định danh (ID)</span>
              <span className="text-base font-semibold text-gray-900">{customer.identifyCode || '—'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 ">Địa chỉ</span>
              <span className="text-base font-semibold text-gray-900 truncate" title={customer.address || ''}>
                {customer.address || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 ">Vị trí (Google Maps)</span>
              <div className="flex items-center">
                {hasCoordinates ? (
                  <a
                    href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary border border-primary/20 rounded-lg transition-all shadow-2xs group whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Mở Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-primary shrink-0" />
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
              <span className="text-xs font-semibold text-gray-400 ">Nhân viên phụ trách</span>
              <span className="text-base font-semibold text-gray-900">
                {customer.staff?.fullName || customer.staff?.username || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 ">Loại khách hàng</span>
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
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400  block">
                  Hình ảnh đính kèm ({customer.images.length})
                </span>
                {showAllImages && customer.images.length > maxImages && (
                  <button
                    type="button"
                    onClick={() => setShowAllImages(false)}
                    className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
                  >
                    Thu gọn
                  </button>
                )}
              </div>
              <Image.PreviewGroup>
                <div className="flex flex-wrap items-center gap-3">
                  {customer.images.map((img: any, idx: number) => {
                    const imgPath = typeof img === 'string' ? img : img.imagePath;
                    const src = getFullImageUrl(imgPath);
                    if (!src) return null;
                    
                    const isHidden = !showAllImages && idx >= maxImages;
                    const isLastVisibleItemAndHasMore = !showAllImages && idx === maxImages - 1 && customer.images.length > maxImages;
                    const remainingCount = customer.images.length - maxImages + 1;
                    
                    if (isHidden) {
                      return (
                        <div key={idx} className="hidden">
                          <Image src={src} />
                        </div>
                      );
                    }

                    if (isLastVisibleItemAndHasMore) {
                      return (
                        <div key={idx} className="relative">
                          <div className="hidden">
                            <Image src={src} />
                          </div>
                          <div
                            onClick={() => setShowAllImages(true)}
                            className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer relative group flex items-center justify-center bg-gray-50"
                          >
                            <img
                              src={src}
                              alt={`customer-img-${idx}`}
                              className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-300 rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-sm pointer-events-none">
                              +{remainingCount}
                            </div>
                          </div>
                        </div>
                      );
                    }

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
