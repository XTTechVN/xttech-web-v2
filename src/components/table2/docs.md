# Hướng Dẫn Sử Dụng TableData (Responsive List Component - Table2)

Component `TableData` là một bộ khung dùng chung giúp xây dựng trang danh sách đạt chuẩn Premium UX/UI: **hiển thị bảng phân trang sử dụng offset/limit trên Desktop (PC)** và **tự động chuyển đổi sang cuộn vô hạn (Infinite Scroll) dạng Card trên Mobile**.

Toàn bộ logic phức tạp về phân tích kích thước màn hình, unmount chống gọi trùng lặp API, đồng bộ URL qua các tham số phân trang (`offset`, `limit`), bộ lọc phân trang động và tích hợp React Query đều được gói gọn bên trong component này.

---

## 1. Các Bước Triển Khai Nhanh

### Bước 1: Tạo Server Component `page.tsx`
Để tránh bị giật nháy khi vừa vào trang và hỗ trợ tốt cho SEO, hãy lấy dữ liệu trước từ phía Server sử dụng helper `prefetchData` ở `@/utils/server`:

```tsx
import { prefetchData } from '@/utils/server';
import { Space } from '@/types/shared/space';
import { BaseResponseWithPagination } from '@/components/table2/types';
import SpacesContent from './_components/spaces-content';

export default async function SpacesPage({ searchParams }: { searchParams: Promise<any> }) {
  // Thực hiện prefetch dữ liệu từ API Server (tự động phân tích các tham số phân trang, bộ lọc)
  const initialData = await prefetchData<BaseResponseWithPagination<Space>>('/api/v1/spaces/flat', searchParams);

  return <SpacesContent initialData={initialData} />;
}
```

### Bước 2: Tạo Client Component `spaces-content.tsx`
Khai báo và sử dụng component `TableData`:

```tsx
'use client';

import { TableData } from '@/components/table2/table-data';
import api from '@/utils/api';
import { Space } from '@/types/shared/space';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useQuery } from '@tanstack/react-query';

export default function SpacesContent({
  initialData,
}: {
  initialData?: BaseResponseWithPagination<Space>;
}) {
  const [search, setSearch] = useQueryParam('search');
  const [status, setStatus] = useQueryParam('status');

  // 1. Định nghĩa hàm fetcher nhận tham số offset & limit thay vì page
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) =>
    api
      .get(`/api/v1/spaces/flat`, {
        params: { 
          search: search || undefined, 
          status: status || undefined, 
          offset, 
          limit 
        },
      })
      .then((res) => res.data);

  // 2. Định nghĩa giao diện Card cho Mobile
  const renderCard = (row: Space, index: number) => (
    <div key={row.id || index} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-gray-900">{row.name}</span>
        <span className="font-mono text-xs text-gray-800 bg-gray-50 px-2 py-0.5 rounded">
          {row.spaceId}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Cấp độ: Cấp {row.level}
      </div>
    </div>
  );

  // 3. Cấu hình danh sách các cột (Desktop View)
  const columns = [
    {
      key: 'spaceId',
      label: 'Mã khu vực',
      minWidth: '150px',
      cell: (row: Space) => <span>{row.spaceId}</span>,
    },
    {
      key: 'name',
      label: 'Tên khu vực',
      minWidth: '200px',
      cell: (row: Space) => <span>{row.name}</span>,
    },
  ];

  // 4. Render component TableData
  return (
    <TableData<Space>
      queryKey={['spaces-flat', search, status]}
      fetcher={fetcher}
      initialData={initialData}
      columns={columns}
      renderCard={renderCard} // Hỗ trợ hiển thị dạng Card trên Mobile
      select={false}
      search={{
        placeholder: 'Tìm kiếm theo tên hoặc mã khu vực...',
        value: search,
        onChange: setSearch,
        className: 'w-fit',
      }}
      filters={[
        {
          label: 'Trạng thái',
          value: status,
          onChange: setStatus,
          options: [
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Không hoạt động' },
            { value: undefined, label: 'Tất cả' },
          ],
          className: 'w-fit',
        },
      ]}
    />
  );
}
```

---

## 2. Các Tham Số Cấu Hình (Props API)

| Tên Prop | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `queryKey` | `any[]` | **Có** | Key dùng cho React Query để quản lý cache và tự động reset offset về 0 khi filter thay đổi (vd: `['spaces-flat', search, status]`). |
| `fetcher` | `(params) => Promise` | **Có** | Hàm thực thi gọi API nhận vào `{ offset, limit }`. Đối tượng trả về phải chứa cấu trúc `{ items: T[], meta: { total: number, offset: number, limit: number, next: boolean } }`. |
| `columns` | `ITableColumn[]` | **Có** | Cấu hình các cột hiển thị trên Desktop (Xem chi tiết bên dưới). |
| `search` | `ITableSearchProps` | Không | Cấu hình thanh tìm kiếm tích hợp chống giật (debounce) và tương thích di động. |
| `filters` | `ITableFilterProps[]` | Không | Danh sách các bộ lọc Faceted Pill Dropdowns. |
| `renderCard` | `(row, index) => ReactNode` | Không | Giao diện Card cho Mobile. Nếu không truyền, hệ thống hiển thị bảng cuộn ngang. |
| `initialData` | `BaseResponseWithPagination` | Không | Dữ liệu tải trước từ Server (prefetch) giúp tăng tốc độ tải trang ban đầu. |
| `select` | `boolean` | Không | Hiển thị cột checkbox chọn dòng đầu bảng (`default: false`). |
| `syncToUrl` | `boolean` | Không | Đồng bộ tự động tham số `offset` và `limit` lên URL thanh địa chỉ (`default: true`). |

---

## 3. Chi Tiết Cấu Hinh Tìm Kiếm & Bộ Lọc

### Cấu hình Tìm kiếm `search`
```typescript
export interface ITableSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string; // Tự động nhận diện class cố định (vd: w-80) để chuyển đổi sang w-full trên Mobile chống tràn viền.
}
```

### Cấu hình Bộ lọc `filters`
Mỗi bộ lọc hiển thị dưới dạng một nút Pill tinh tế:
```typescript
export interface ITableFilterProps {
  label?: string;            // Nhãn hiển thị của bộ lọc (vd: 'Trạng thái')
  value?: string | undefined;// Giá trị đang được chọn
  onChange?: (value: string | undefined) => void; // Hàm callback khi thay đổi lựa chọn
  options: { 
    value: string | undefined; 
    label: string; 
    icon?: ReactNode;        // Icon nhỏ trước nhãn của tùy chọn
  }[];
  icon?: ReactNode;          // Icon đầu của nút lọc (mặc định hiển thị PlusCircle)
}
```

- **Hành vi trên Mobile**: Để tối ưu không gian hiển thị, khi có bộ lọc hoạt động, nhãn đầy đủ của tùy chọn sẽ được ẩn đi và thay thế bằng số `"1"` trên thiết bị di động.
- **Tránh tràn viền động (Dynamic Viewport Alignment)**: Dropdown của bộ lọc tự động tính toán không gian trống bên phải nút. Nếu nút nằm sát lề phải màn hình, danh sách sẽ tự căn lề phải (`right-0`), ngược lại sẽ tự căn lề trái (`left-0`).

---

## 4. Cấu Hình Cột `columns` (Desktop View)

Mỗi phần tử trong mảng `columns` là một cột của bảng có cấu trúc sau:

```typescript
export interface ITableColumn<T> {
  key: string;          // Key định danh duy nhất của cột
  label: string;        // Tiêu đề cột hiển thị trên Table header
  minWidth?: string;    // Chiều rộng tối thiểu của cột (vd: '150px')
  maxWidth?: string;    // Chiều rộng tối đa của cột (vd: '300px'). Nếu vượt quá, text sẽ tự động ẩn ba chấm (...)
  sticky?: boolean;     // Ghim cố định cột ở bên trái khi cuộn ngang
  visible?: boolean;    // Cấu hình ẩn/hiện mặc định của cột (mặc định là true). Cột có cấu hình này sẽ xuất hiện trong menu "Cài đặt" để người dùng cấu hình ẩn/hiện thủ công trên PC.
  cell: (row: T) => ReactNode; // Hàm render nội dung trong ô dữ liệu
}
```
