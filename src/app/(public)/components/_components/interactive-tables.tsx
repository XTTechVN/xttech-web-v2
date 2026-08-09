'use client';

import React from 'react';
import { TableData, ITableColumn, Badge } from '@/components';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  status: 'instock' | 'outofstock';
}

const mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: '29.990.000đ', status: 'instock' },
  { id: '2', name: 'MacBook Pro M3 14"', category: 'Máy tính xách tay', price: '39.990.000đ', status: 'instock' },
  { id: '3', name: 'Sony WH-1000XM5', category: 'Tai nghe', price: '6.490.000đ', status: 'outofstock' },
  { id: '4', name: 'iPad Pro M2 11"', category: 'Máy tính bảng', price: '20.990.000đ', status: 'instock' },
  { id: '5', name: 'Apple Watch Ultra 2', category: 'Đồng hồ thông minh', price: '21.990.000đ', status: 'outofstock' },
];

export function InteractiveTables() {
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const items = mockProducts.slice(offset, offset + limit);
    return {
      items,
      meta: {
        total: mockProducts.length,
        offset,
        limit,
        next: offset + limit < mockProducts.length,
      },
    };
  };

  const columns: ITableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Tên sản phẩm',
      minWidth: '200px',
      cell: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
    },
    {
      key: 'category',
      label: 'Danh mục',
      minWidth: '150px',
      cell: (row) => <span className="text-slate-600">{row.category}</span>,
    },
    {
      key: 'price',
      label: 'Giá bán',
      minWidth: '120px',
      cell: (row) => <span className="font-mono text-slate-700">{row.price}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => {
        return row.status === 'instock' ? (
          <Badge variant="success">Còn hàng</Badge>
        ) : (
          <Badge variant="danger">Hết hàng</Badge>
        );
      },
    },
  ];

  const renderCard = (row: Product, index: number) => {
    return (
      <div key={row.id || index} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-800">{row.name}</span>
          {row.status === 'instock' ? (
            <Badge variant="success" size="sm">Còn hàng</Badge>
          ) : (
            <Badge variant="danger" size="sm">Hết hàng</Badge>
          )}
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Danh mục: {row.category}</span>
          <span className="font-mono">{row.price}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 border border-gray-100 p-6 rounded-lg bg-gray-50/50">
      <TableData<Product>
        queryKey={['demo-products']}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        syncToUrl={false}
      />
    </div>
  );
}
