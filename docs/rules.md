# Coding Rules — Vifence Web

---

## Rule 0: Nguyên tắc quản lý file rules.md

### Quy tắc

Khi bổ sung rule mới, **tuyệt đối không được sửa hoặc xóa các rule cũ đã có**.
Chỉ được phép chỉnh sửa rule cũ khi có lệnh tường minh từ người dùng (ví dụ: *"sửa Rule X"*, *"cập nhật Rule X"*).

### Áp dụng khi

- Người dùng yêu cầu thêm rule mới → **đọc toàn bộ file rules.md trước**, xác định số thứ tự rule tiếp theo, rồi **append xuống cuối file**.
- Người dùng yêu cầu sửa rule cũ → **chỉnh sửa đúng rule đó, không động vào các rule khác**.
- Không được tự ý refactor, gộp, hay đánh số lại các rule hiện có.
- **Rule 0 là bất khả xâm phạm** — tuyệt đối không được sửa, xóa, hay bổ sung bất kỳ nội dung nào vào Rule 0 nếu không có lệnh tường minh và bắt buộc từ người dùng (ví dụ: *"sửa Rule 0"*, *"bổ sung Rule 0"*).

---

## Rule 1: Dùng `index.ts` để barrel-export, gọn hoá câu import

### Quy tắc

Mỗi folder chứa nhiều file (types, components, hooks, utils…) **phải có một file `index.ts`** re-export toàn bộ thành viên public của folder đó.
Các file bên ngoài chỉ import từ folder-level, không import trực tiếp vào file con.

### Lý do

- Import ngắn gọn, dễ đọc.
- Khi đổi tên/di chuyển file con, chỉ cần sửa `index.ts`, không phải sửa toàn bộ nơi import.
- Tạo ra ranh giới rõ ràng giữa API public và internal của một module.

### Ví dụ ✅ Đúng

```ts
// src/types/index.ts
export type { ExportBatch } from './training';
export type { Label, LabelClass } from './label';
export type { User } from './shared';
```

```ts
// Import gọn từ folder
import type { ExportBatch, Label } from '@/types';
```

### Ví dụ ❌ Sai

```ts
// ❌ Import trực tiếp vào file con — phụ thuộc vào cấu trúc nội bộ
import type { ExportBatch } from '@/types/training';
import type { Label } from '@/types/label';
```

### Áp dụng cho các folder

| Folder | Mô tả |
|---|---|
| `src/types/` | barrel-export tất cả type public; subfolder `shared/` đã có `index.ts` mẫu |
| `src/types/shared/` | export từng domain type (auth, camera, label, training…) qua `index.ts` |
| `src/components/<tên-component>/` | export component chính + các sub-component liên quan |
| `src/hooks/` | export tất cả custom hooks (`useDebounce`, `useTable`, `useQueryParam`…) |
| `src/utils/` | export tất cả utility functions (`api`, `cn`, `grid`, `pagination`, `toast`…) |
| `src/stores/` | export tất cả Zustand stores (đã có `index.ts`) |
| `src/contexts/` | export tất cả React Context/Provider (`SidebarProvider`…) |
| `src/config/` | export config constants (`app`, `ui`…) |

---

## Rule 2: Tách Type ra folder `types/` để quản lý tập trung

### Quy tắc

Mọi TypeScript type/interface liên quan đến dữ liệu nghiệp vụ (entity, API response, DTO, enum…)
**phải được định nghĩa trong `src/types/`**, không được viết inline trong component hoặc trang.

### Lý do

- Tránh trùng lặp định nghĩa type ở nhiều nơi.
- Dễ tìm kiếm, chỉnh sửa khi API thay đổi.
- Import rõ ràng, không phụ thuộc vào re-export từ component.

### Cấu trúc thư mục

```
src/
└── types/
    ├── shared.ts        # Các type dùng chung toàn app
    ├── label.ts         # Type liên quan đến labeling
    ├── training.ts      # Type liên quan đến training/export
    └── ...
```

### Ví dụ ✅ Đúng

```ts
// src/types/training.ts
export interface ExportBatch {
  id: string;
  imageCount: number;
  format: string;
  exportedAt: string;
  downloadUrl?: string;
}
```

```ts
// Import từ nguồn gốc — không import type qua component
import type { ExportBatch } from '@/types/training';
```

### Ví dụ ❌ Sai

```ts
// ❌ Định nghĩa type trong component
interface ExportBatch {
  id: string;
  ...
}

// ❌ Re-export type qua component rồi import
import { type ExportBatch } from './_components/ExportBatchTable';
```

### Áp dụng khi

- Tạo component mới cần nhận prop là data từ API.
- Gọi API và cần type cho response.
- Dùng lại cùng một shape data ở nhiều file.

---

## Rule 3: Luôn kiểm tra component có sẵn trước khi tạo mới

### Quy tắc

Trước khi implement bất kỳ UI element nào, **bắt buộc phải kiểm tra `src/components/`** xem đã có component phù hợp chưa.
**Tuyệt đối không được tự ý tạo component mới** nếu một component tương tự đã tồn tại trong codebase.

### Lý do

- Tránh trùng lặp, giữ codebase nhất quán.
- Component có sẵn đã được kiểm thử và đồng bộ với design system.
- Tạo mới khi đã có sẵn gây ra nhiều phiên bản khác nhau của cùng một UI element.

### Quy trình bắt buộc

1. **Đọc `src/components/`** — liệt kê toàn bộ component có sẵn.
2. **Tìm component phù hợp** — nếu tìm thấy, dùng ngay, không tạo mới.
3. **Nếu chưa có** — mới được phép tạo component mới, đặt vào đúng folder trong `src/components/`.
4. **Nếu cần mở rộng** — extend component cũ (thêm prop, variant) thay vì fork ra bản mới.

### Ví dụ ✅ Đúng

```tsx
// Kiểm tra trước → đã có Button → dùng lại
import Button from '@/components/ui/Button';

<Button variant="primary" size="sm" icon={<Plus />}>Thêm mới</Button>
```

### Ví dụ ❌ Sai

```tsx
// ❌ Tự tạo button mới trong component page dù đã có Button sẵn
<button className="bg-blue-500 text-white px-4 py-2 rounded">Thêm mới</button>
```

### Áp dụng khi

- Cần thêm button, input, modal, table, badge, toast… bất kỳ UI element nào.
- Cần một wrapper layout hay container.
- Thấy mình sắp viết JSX inline cho một element có thể tái sử dụng.

---
