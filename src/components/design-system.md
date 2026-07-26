# XTTECH DESIGN SYSTEM (UI/UX)

Tài liệu này quy chuẩn hóa hệ thống thiết kế giao diện (Design System) của dự án **xttech-web-v2**, giúp đồng nhất trải nghiệm người dùng và chuẩn hóa code CSS/Tailwind cho lập trình viên.

---

## 1. DESIGN TOKENS (Giá trị cơ bản)

### 1.1. Hệ thống Màu sắc (Color Palette)
Dự án sử dụng hệ màu xanh lá chủ đạo (Emerald) làm màu nhận diện thương hiệu, kết hợp với tone xám lạnh (Slate/Gray) làm nền và màu chữ chính.

| Nhóm | Token | Giá trị CSS | Tailwind Class | Vai trò |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `color-primary-main` | `#059669` | `bg-emerald-600` | Màu chính, CTA chính |
| | `color-primary-hover` | `#047857` | `bg-emerald-700` | Trạng thái Hover của Primary |
| | `color-primary-active` | `#065f46` | `bg-emerald-800` | Trạng thái Active của Primary |
| **Neutral** | `color-bg-main` | `#ffffff` | `bg-white` | Màu nền chính của ứng dụng |
| | `color-bg-sub` | `#f9fafb` | `bg-gray-50` | Nền sidebar, bảng dữ liệu, card |
| | `color-text-main` | `#111827` | `text-gray-900` | Màu chữ tiêu đề, text chính |
| | `color-text-sub` | `#4b5563` | `text-gray-600` | Màu chữ mô tả, ghi chú, caption |
| | `color-border` | `#e5e7eb` | `border-gray-200` | Đường kẻ, phân cách viền |
| **States** | `color-success` | `#10b981` | `text-emerald-500` | Trạng thái hoàn thành, thành công |
| | `color-danger` | `#dc2626` | `bg-red-600` | Trạng thái lỗi, nguy hiểm, xóa |
| | `color-warning` | `#f59e0b` | `text-amber-500` | Cảnh báo, đang chờ xử lý |

---

### 1.2. Khoảng cách (Spacing & Gap)
Sử dụng hệ số nhân của **4px (0.25rem)** để định nghĩa khoảng cách và căn lề.

| Token | Giá trị px | Giá trị rem | Tailwind Class | Sử dụng thực tế |
| :--- | :--- | :--- | :--- | :--- |
| `spacing-xxs` | 4px | 0.25rem | `1` (ví dụ `p-1`, `gap-1`) | Khoảng cách cực nhỏ (icon sát chữ) |
| `spacing-xs` | 8px | 0.5rem | `2` (ví dụ `p-2`, `gap-2`) | Gap giữa các phần tử nhỏ trong component |
| `spacing-sm` | 12px | 0.75rem | `3` (ví dụ `p-3`, `gap-3`) | Padding dọc của button lớn, list item |
| `spacing-md` | 16px | 1rem | `4` (ví dụ `p-4`, `gap-4`) | Padding mặc định của Card, Form |
| `spacing-lg` | 24px | 1.5rem | `6` (ví dụ `p-6`, `gap-6`) | Khoảng cách giữa các Section trên trang |
| `spacing-xl` | 32px | 2rem | `8` (ví dụ `p-8`, `gap-8`) | Padding trang lớn, khoảng cách container |

---

### 1.3. Typography (Kiểu chữ & Cấp độ)
Hệ thống font chữ sử dụng mặc định là **Inter** (hoặc Sans-serif hệ thống), tối ưu hóa khả năng đọc (readability).

| Cấp độ | Cỡ chữ (Font Size) | Dòng (Line Height) | Độ đậm (Font Weight) | Sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| `Heading 1` | 30px (`text-3xl`) | 36px | Bold (`font-bold`) | Tiêu đề trang chính (chỉ xuất hiện 1 lần) |
| `Heading 2` | 24px (`text-2xl`) | 32px | Semibold (`font-semibold`) | Tiêu đề của Section lớn |
| `Heading 3` | 18px (`text-lg`) | 28px | Medium (`font-medium`) | Tiêu đề của Box, Card |
| `Body Large` | 16px (`text-base`) | 24px | Regular (`font-normal`) | Text chính (giao diện rộng) |
| `Body Regular`| 14px (`text-sm`) | 20px | Regular (`font-normal`) | Text mặc định toàn hệ thống |
| `Caption` | 12px (`text-xs`) | 16px | Medium/Regular | Mô tả phụ, nhãn bên dưới input |

---

### 1.4. Bo góc (Border Radius)
Quy định bo góc để các khối mềm mại và hiện đại hơn.
*   **`rounded-sm` (2px):** Cho checkbox, viền nét mảnh nhỏ.
*   **`rounded-md` (6px):** Cho Button, Input, Dropdown.
*   **`rounded-lg` (8px):** Cho Card, Box, Dialog/Modal nhỏ.
*   **`rounded-xl` (12px):** Cho Modal lớn, Banner quảng cáo.
*   **`rounded-full` (9999px):** Cho Avatar, Tag, Pill.

---

## 2. QUY CHUẨN LAYOUT & GAPS (Khoảng cách giữa các thành phần)

### 2.1. Cấu trúc Layout Trang chính
*   **Header Height:** Cố định ở `60px` (sử dụng token `HEADER_HEIGHT` trong [src/config/ui.ts](src/config/ui.ts)).
*   **Sidebar Width:** Cố định ở `220px` (sử dụng token `SIDEBAR_WIDTH`).
*   **Content Padding:** Khoảng cách lề nội dung trang chính mặc định là `p-6` (`24px`).

### 2.2. Khoảng cách mặc định giữa các Component
*   **Giữa các khối chính (Page level):** Khoảng cách dọc mặc định là `space-y-6` (`24px`).
*   **Trong các nhóm Form:**
    *   Khoảng cách giữa label và input: `gap-1.5` (`6px`).
    *   Khoảng cách giữa các hàng input (Form Row): `space-y-4` (`16px`).
    *   Khoảng cách giữa nút Action phụ và chính (ví dụ Cancel - Save): `gap-3` (`12px`).
*   **Trong thanh điều hướng (Navbar/Sidebar Menu):**
    *   Khoảng cách giữa các menu item: `space-y-1` (`4px`).
    *   Padding trong của menu item: `px-3 py-2`.

---

## 3. TIÊU CHUẨN PHÁT TRIỂN COMPONENT

Mọi component được viết trong thư mục `src/components/` phải đảm bảo các yêu cầu sau:

1.  **Nhất quán Trạng thái (Interactions):**
    *   `Hover`: Làm sáng/tối màu nền gốc thêm 1 cấp (ví dụ `bg-emerald-600` hover sẽ thành `bg-emerald-700`).
    *   `Focus`: Tạo viền ngoài rõ ràng để hỗ trợ phím Tab (ví dụ `focus-visible:ring-2 focus-visible:ring-emerald-500`).
    *   `Disabled`: Giảm opacity về `opacity-50`, chặn mọi click event (`pointer-events-none`).
2.  **Khả năng mở rộng (CSS Overrides):**
    *   Bắt buộc ghép class bằng `cn(defaultStyles, className)`.
    *   Tuyệt đối không hardcode cứng chiều rộng hoặc chiều cao trong component nếu không bắt buộc, cho phép co giãn theo Flexbox/Grid của component cha.
3.  **Tài liệu đi kèm:**
    *   Mỗi component bắt buộc phải có file `docs.md` ngay tại thư mục chứa component để coder mới dễ dàng tái sử dụng nhanh chóng.
