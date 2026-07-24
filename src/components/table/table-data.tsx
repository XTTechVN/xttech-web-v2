'use client';

import { useState } from 'react';
import { TableDataDesktop } from './table-data-desktop';
import { TableDataMobile } from './table-data-mobile';
import { TableSearch } from './table-search';
import { TableFilters } from './table-filters';
import { TableView } from './table-view';
import { TableDataProps } from './types';
import { getInitialVisibleKeys, getFilteredColumns, useIsMobile } from './table-func';

export type { ITableColumn, TableDataProps } from './types';

export function TableData<T>({
  fetcher,
  queryKey,
  renderCard,

  columns,
  select,
  search = {},
  initialData,
  syncToUrl = true,
  filters = [],

  hideRowPerPage = false,
  hidePagination = false,
}: TableDataProps<T>) {
  const isMobile = useIsMobile();

  // Quản lý trạng thái hiển thị của các cột
  const [visibleKeys, setVisibleKeys] = useState<string[]>(() =>
    getInitialVisibleKeys(columns)
  );

  // Hàm bật/tắt hiển thị của một cột
  const handleToggleColumn = (key: string) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Lọc danh sách cột dựa trên các cột đang được bật hiển thị
  const filteredColumns = getFilteredColumns(columns, visibleKeys);

  // Lọc danh sách các cột có gắn label để cho phép cấu hình ẩn/hiện
  const togglableColumns = columns.filter((col) => !!col.label);

  // Nếu không khai báo renderCard cho Mobile, mặc định sử dụng Table cuộn ngang ở cả 2 thiết bị
  if (!renderCard) {
    return (
      <TableDataDesktop
        fetcher={fetcher}
        queryKey={queryKey}
        columns={filteredColumns}
        select={select}
        initialData={initialData}
        syncToUrl={syncToUrl}
        hideRowPerPage={hideRowPerPage}
        hidePagination={hidePagination}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Viewport: Chỉ mount khi đã xác định chắc chắn là thiết bị di động */}
      <div className="block md:hidden space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {search.placeholder && <TableSearch {...search} />}
          {filters && filters.length > 0 && <TableFilters filters={filters} />}
        </div>

        {isMobile === true && (
          <TableDataMobile
            fetcher={fetcher}
            queryKey={queryKey}
            renderCard={renderCard}
            initialData={initialData}
            syncToUrl={syncToUrl}
          />
        )}
      </div>

      {/* PC Viewport: Mặc định render khi SSR (undefined) hoặc khi là máy tính (false) */}
      <div className="hidden md:block space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {search.placeholder && <TableSearch {...search} />}
            {filters && filters.length > 0 && <TableFilters filters={filters} />}
          </div>
          {togglableColumns.length > 0 && (
            <TableView views={togglableColumns} visibleKeys={visibleKeys} onToggle={handleToggleColumn} />
          )}
        </div>

        {(isMobile === false || isMobile === undefined) && (
          <TableDataDesktop
            fetcher={fetcher}
            queryKey={queryKey}
            columns={filteredColumns}
            select={select}
            initialData={initialData}
            syncToUrl={syncToUrl}
            hideRowPerPage={hideRowPerPage}
            hidePagination={hidePagination}
          />
        )}
      </div>
    </div>
  );
}
