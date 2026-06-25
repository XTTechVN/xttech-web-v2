# Hướng Dẫn Sử Dụng TableDataRework (Responsive List Component)

Component `TableDataRework` là một bộ khung dùng chung giúp xây dựng trang danh sách đạt chuẩn Premium UX/UI: **hiển thị bảng phân trang trên Desktop (PC)** và **tự động chuyển đổi sang cuộn vô hạn (Infinite Scroll) dạng Card trên Mobile**.

Toàn bộ logic phức tạp về phân tích kích thước màn hình, unmount chống gọi trùng lặp API, đồng bộ URL, bộ lọc phân trang động và tích hợp React Query đều được gói gọn bên trong component này.

---

## 1. Các Bước Triển Khai Nhanh

### Bước 1: Tạo Server Component `page.tsx`
Để tránh bị giật nháy khi vừa vào trang và hỗ trợ tốt cho SEO, hãy lấy dữ liệu trước từ phía Server:

```tsx
import { prefetchData } from '@/utils';
import { Store, BaseResponseWithPagination } from '@/types';
import { TestContent } from './_components/test-content';

export default async function StoresPage({ searchParams }: { searchParams: Promise<any> }) {
  // Thực hiện prefetch dữ liệu từ API Server (tự động phân tích các tham số phân trang, bộ lọc)
  const initialData = await prefetchData<BaseResponseWithPagination<Store>>('/api/v2/stores', searchParams);

  return <TestContent initialData={initialData} />;
}
```

### Bước 2: Tạo Client Component `test-content.tsx`
Khai báo và sử dụng duy nhất component `TableDataRework`:

```tsx
'use client';

import { TableDataRework } from '@/components';
import { api } from '@/utils';
import { Store, BaseResponseWithPagination } from '@/types';
import { useQueryParam } from '@/hooks';

interface TestContentProps {
  initialData?: BaseResponseWithPagination<Store>;
}

export function TestContent({ initialData }: TestContentProps) {
  const [status, setStatus] = useQueryParam('status');
  const [isExpired, setIsExpired] = useQueryParam('isExpired');
  const [search, setSearch] = useQueryParam('search');

  // 1. Định nghĩa hàm fetcher chung
  const fetcher = async ({ page, limit }: { page: number; limit: number }) =>
    api
      .get(`/api/v2/stores`, {
        params: { search, status, isExpired, page, limit },
      })
      .then((res) => res.data);

  // 2. Định nghĩa giao diện Card cho Mobile
  const renderCard = (row: Store, index: number) => (
    <div key={row.storeId || index} className="flex flex-col gap-2 p-4 border border-bk-secondary/20 rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <span className="font-bold text-bk-primary">{row.name}</span>
        <span className="text-xs text-bk-secondary/80 bg-bk-secondary/10 px-2 py-0.5 rounded">{row.status}</span>
      </div>
      <div className="text-xs text-bk-primary/80">
        <strong>Địa chỉ:</strong> {row.address}
      </div>
    </div>
  );

  // 3. Render duy nhất component TableDataRework
  return (
    <TableDataRework<Store>
      queryKey={['Stores', search, status, isExpired]}
      fetcher={fetcher}
      initialData={initialData}
      renderCard={renderCard} // Có thuộc tính này để hỗ trợ giao diện Mobile dạng Card
      select={true}
      search={{
        placeholder: 'Tìm kiếm tên cửa hàng',
        value: search,
        onChange: setSearch,
        className: 'w-80', // Chiều rộng trên Desktop (tự động chuyển thành w-full trên Mobile để tránh tràn viền)
      }}
      filters={[
        {
          label: 'Hạn sử dụng',
          value: isExpired,
          onChange: setIsExpired,
          options: [
            { value: 'true', label: 'Hết hạn' },
            { value: 'false', label: 'Chưa hết hạn' },
            { value: undefined, label: 'Tất cả' },
          ],
        },
        {
          label: 'Trạng thái',
          value: status,
          onChange: setStatus,
          options: [
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Dừng hoạt động' },
            { value: undefined, label: 'Tất cả' },
          ],
        },
      ]}
      columns={[
        {
          key: 'fullName',
          label: 'Tên cửa hàng',
          minWidth: '150px',
          maxWidth: '250px',
          sticky: true, // Ghim cố định cột bên trái
          cell: (row) => <span title={row.name}>{row.name}</span>,
        },
        {
          key: 'address',
          label: 'Địa chỉ',
          minWidth: '200px',
          maxWidth: '500px',
          cell: (row) => <span title={row.address}>{row.address}</span>,
        },
        {
          key: 'status',
          label: 'Trạng thái',
          visible: true, // Hiển thị mặc định
          cell: (row) => row.status,
        },
        {
          key: 'customerName',
          label: 'Khách hàng',
          visible: false, // Ẩn mặc định (có thể toggle hiển thị thông qua nút Cài đặt)
          cell: (row) => row.customerName,
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
| `queryKey` | `any[]` | **Có** | Key dùng cho React Query để quản lý cache (vd: `['Stores', search, status]`). |
| `fetcher` | `(params) => Promise` | **Có** | Hàm thực thi gọi API nhận vào `{ page, limit }`. |
| `columns` | `ITableColumn[]` | **Có** | Cấu hình các cột hiển thị trên Desktop (Xem chi tiết bên dưới). |
| `search` | `ITableSearchProps` | Không | Cấu hình thanh tìm kiếm tích hợp chống giật (debounce) và tương thích di động. |
| `filters` | `ITableFilterProps[]` | Không | Danh sách các bộ lọc Faceted Pill Dropdowns. |
| `renderCard` | `(row, index) => ReactNode` | Không | Giao diện Card cho Mobile. Nếu không truyền, hệ thống hiển thị bảng cuộn ngang. |
| `initialData` | `BaseResponseWithPagination` | Không | Dữ liệu tải trước từ Server (prefetch) giúp tăng tốc độ tải trang ban đầu. |
| `select` | `boolean` | Không | Hiển thị cột checkbox chọn dòng đầu bảng (`default: false`). |
| `syncToUrl` | `boolean` | Không | Đồng bộ tự động tham số `page` và `limit` lên URL thanh địa chỉ (`default: true`). |

---

## 3. Chi Tiết Cấu Hình Tìm Kiếm & Bộ Lọc

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
