'use client';

import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@/components';
import { usePathname } from 'next/navigation';
import { rawSidebarSections, SidebarItemWithRoles } from '@/config';

export function AppBreadcrumb() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // 1. Luôn có "Trang chủ"
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', href: '/app/dashboard' },
    ];

    if (pathname === '/app' || pathname === '/app/dashboard') {
      items[0].href = undefined;
      return items;
    }

    // 2. Tìm item phù hợp nhất trong rawSidebarSections
    let matchedItem: SidebarItemWithRoles | null = null;
    let matchedSubItem: SidebarItemWithRoles | null = null;
    let maxMatchLen = 0;

    rawSidebarSections.forEach((section) => {
      section.items.forEach((item) => {
        // Kiểm tra item gốc
        if (item.href && pathname.startsWith(item.href)) {
          if (item.href.length > maxMatchLen) {
            maxMatchLen = item.href.length;
            matchedItem = item;
            matchedSubItem = null;
          }
        }

        // Kiểm tra subItem
        if (item.subItems) {
          item.subItems.forEach((sub) => {
            if (sub.href && pathname.startsWith(sub.href)) {
              if (sub.href.length > maxMatchLen) {
                maxMatchLen = sub.href.length;
                matchedItem = item;
                matchedSubItem = sub;
              }
            }
          });
        }
      });
    });

    if (matchedItem) {
      const parentItem = matchedItem as SidebarItemWithRoles;
      if (parentItem.label !== 'Tổng quan' && parentItem.label !== 'Trang chủ') {
        items.push({
          label: parentItem.label,
          href: matchedSubItem ? undefined : parentItem.href || '#',
        });
      }

      if (matchedSubItem) {
        const subItem = matchedSubItem as SidebarItemWithRoles;
        items.push({
          label: subItem.label,
          href: subItem.href,
        });
      }
    }

    // 3. Xử lý các đường dẫn con (ví dụ: ID, hành động)
    if (maxMatchLen > 0 && pathname.length > maxMatchLen) {
      const remainingPath = pathname.slice(maxMatchLen).replace(/^\//, '');
      if (remainingPath) {
        const segments = remainingPath.split('/');
        let currentDynamicPath = pathname.slice(0, maxMatchLen);

        segments.forEach((segment, index) => {
          currentDynamicPath += `/${segment}`;

          let label = segment;
          if (segment === 'positions') label = 'Vị trí';
          else if (segment === 'create') label = 'Thêm mới';
          else if (segment === 'edit') label = 'Chỉnh sửa';
          else if (!isNaN(Number(segment))) label = `Chi tiết #${segment}`;
          else label = segment.charAt(0).toUpperCase() + segment.slice(1);

          items.push({
            label,
            href: index === segments.length - 1 ? undefined : currentDynamicPath,
          });
        });
      }
    } else if (!matchedItem) {
      // Fallback nếu không khớp sidebar (ẩn đường dẫn app)
      const paths = pathname.split('/').filter(Boolean);
      let currentPath = '';
      paths.forEach((path) => {
        currentPath += `/${path}`;
        if (path === 'app') return; // Bỏ qua chữ 'app' đầu tiên vì đã có Trang chủ

        items.push({
          label: path.charAt(0).toUpperCase() + path.slice(1),
          href: currentPath,
        });
      });
    }

    // Đảm bảo item cuối cùng luôn không có link (đang ở hiện tại)
    if (items.length > 0) {
      items[items.length - 1].href = undefined;
    }

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex items-center px-4 md:px-6 py-2.5 bg-slate-50/50">
      <Breadcrumb items={breadcrumbs} />
    </div>
  );
}
