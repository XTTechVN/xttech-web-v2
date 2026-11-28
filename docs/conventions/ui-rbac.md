# Quy ước giao diện & phân quyền (Frontend)

> **Điều kiện áp dụng:** repo có `src/components-remake/index.ts` **và** `src/hooks/use-can.ts`. Thiếu một trong hai thì bỏ qua tài liệu này.
>
> Quy ước được rút ra từ code của nhánh `rbac` (2026-11-28). Đây là chuẩn giao diện sẽ giữ khi merge vào `dev`.

## 0. Màn hình cũ và mới

- **Phần tạo mới** (trang, bảng, form, hộp thoại) theo tài liệu này.
- **Màn hình cũ** (chi tiết dự án, Door Studio, cấu hình cửa, `customers/[id]`...) **giữ nguyên** khi sửa nhỏ. Chỉ chuyển sang chuẩn mới khi User yêu cầu.
- **Không sao chép** sang chỗ mới: modal cũ, `access/roles/_components` (token `rm-*`), sheet riêng của `documents`, `components/design-system.md`, `TableFilters` / `TableSearch`.

## 1. Mẫu chuẩn (đọc trước khi viết trang danh sách)

- `src/app/(auth)/app/(sidebar)/customers/_components/list/`
- `src/app/(auth)/app/(sidebar)/customers/providers/_components/list/`

```text
customers/
├── page.tsx                     # cổng quyền + PageHeading
└── _components/list/
    ├── table.tsx                # state, query, thanh công cụ, các drawer
    ├── list.tsx                 # bảng desktop + thẻ mobile
    ├── detail-drawer.tsx        # xem, sửa ngay trong drawer
    ├── form-drawer.tsx          # thêm mới
    ├── customer-form.tsx        # form dùng chung cho thêm và sửa
    └── format.ts                # hàm định dạng, map nhãn
```
Component mới giữ dưới 300 dòng (vài file mẫu đang nhỉnh hơn, không lấy làm cớ).

🛑 **Không import `_components` / `_hooks` / `_utils` của route khác, kể cả route cha hoặc con** (hook `R005-CROSS-ROUTE` chặn). Phần dùng chung đưa lên `src/components/`. Code hiện có khoảng 20 chỗ làm khác (vd `shared-catalog`, và chính `customer-form.tsx` ở mẫu chuẩn import từ `providers`): đó là nợ kỹ thuật, **không sao chép**.

## 2. Thành phần dùng chung

Ưu tiên `@/components-remake`; thiếu mới dùng `@/components` (ví dụ `Input`, `Skeleton`).

| Nhu cầu | Dùng |
|---|---|
| Tiêu đề trang | `PageHeading` |
| Thẻ thống kê | `StatGrid` |
| Tìm kiếm, lọc | `SearchField`, `FilterDrawer` |
| Bảng | `DataTable` hoặc `list.tsx` theo mẫu |
| Xem / sửa / thêm | `Drawer` + `DrawerHeader` / `DrawerBody` / `DrawerFooter` / `DrawerSection` / `InfoRow` / `IconAction` |
| Chọn phụ bên trong drawer | `SideDrawer`, `Select side` |
| Xác nhận xóa / hủy | `ConfirmDelete` |
| Đang tải / lỗi / trống / có dữ liệu | `TabState` (bắt buộc cho code mới; màn mẫu cũ hơn đang tự dựng) |
| Nút, nhãn, tab, ngày giờ | `Button`, `Tag`, `Tabs`, `DateTimeField` |
| Tab của trang đơn (cần duyệt / tất cả / của tôi) | `requestTabs()` |

Hộp thoại mới dùng `Drawer`; không tạo file `*-modal.tsx` mới. (`ConfirmDelete` bọc `Modal` bên trong là hợp lệ.)

## 3. Giao diện

- Khối: `rounded-block border border-slate-200/80 bg-white`; điều khiển: `rounded-control`. Không lồng thẻ viền, không gradient trang trí.
- Màu chủ đạo qua `primary`; nền xám dùng thang `slate`. Chữ tối thiểu 12px; số dùng `tabular-nums`.
- Font nội dung `font-body`, tiêu đề `font-heading`.
- Từ 1024px hiện bảng, nhỏ hơn hiện thẻ; cột phụ từ 1280px.
- Điện thoại: nút cao 44px (`h-11`), từ 768px 40px; nút trên thanh công cụ dùng `iconOnly="mobile"`.
- Có `aria-label` cho nút chỉ có icon, `caption` cho bảng.

## 4. Phân quyền

### 4.1. Cổng trang
Mỗi `page.tsx` dưới `(sidebar)` phải kiểm quyền (được phép là client component):

```tsx
'use client';
const Page = () => {
  const { can, isReady } = useCan();
  if (!isReady) return null;
  if (!can('customer:read')) return <AccessDenied />;
  return <CustomerTable />;
};
```
- `isRouteAllowed` ở layout **chỉ khớp đúng đường dẫn có trong menu**, nên trang con (`[id]`, `new`, `edit`) tự kiểm quyền, trực tiếp hoặc qua component nó render.
- Ngoại lệ hợp lệ: trang chỉ cần đăng nhập (vd `change-password`). Phải được User đồng ý.

### 4.2. Nút và dữ liệu
| Việc | Dùng |
|---|---|
| Nút ở cấp trang (thêm, xuất) | `can('resource:action')` |
| Nút trên một bản ghi (sửa, xóa, duyệt) | `record._can?.update` (backend quyết định, UI không suy luận) |
| Chế độ quản lý (thấy dữ liệu người khác) | `isWide('resource:read')` |
| Gọi API phụ | `useQuery({ enabled: can('resource:read'), ... })` |

- 🛑 Không so mã role (`role.code === 'admin'`). Chỉ hỏi quyền.
- Interface nhận `_can` khai kiểu tường minh: `_can?: { update?: boolean; delete?: boolean }`. Đây là ngoại lệ được phép của camelCase.

### 4.3. Menu
Mục mới trong `src/config/sidebar.ts`: có `permissions` (thêm `wide: true` nếu chỉ dành cho phạm vi phòng ban / doanh nghiệp) và `id` nằm trong `acceptedSections`.

### 4.4. File sinh tự động
`src/generated/permissions.ts` và `personas.ts` **không sửa tay**. Chạy từ thư mục gốc workspace:

```powershell
.\xttech_v2\.venv\Scripts\python.exe .agents\scripts\gen_ui_contract_local.py
```

### 4.5. Quản trị nền tảng
`/platform/*` có layout riêng, chỉ cho `isPlatformAdmin`; không đặt chung menu `/app`.

### 4.6. Lỗi API
Dạng `{ details: { code, message } }`. `utils/api.ts` đã xử lý 401 (refresh) và `MUST_CHANGE_PASSWORD`.

## 5. Thử giao diện theo vai trò
Đặt `NEXT_PUBLIC_DEV_TOOLS=true` (chỉ môi trường dev) để bật bảng chọn tài khoản demo và bật/tắt quyền.
