# QUY CHUẨN PHÁT TRIỂN FRONTEND (`xttech-web-v2` — Next.js, React & TypeScript)

Tài liệu này tự động áp dụng khi làm việc trong thư mục `xttech-web-v2/`. Kế thừa các nguyên tắc cốt lõi từ [`.agents/rules/rule.md`](../.agents/rules/rule.md).

---

## 1. Kiến trúc Thư mục & Quy tắc Tái sử dụng (`Colocation` vs `Shared`)

### 1.1. Phân định Phạm vi File (`_components/` vs `src/components/`)
- **Nội bộ 1 Route (`_components/`, `_hooks/`, `_utils/`):**
  - Các thư mục có tiền tố `_` bên trong một route **CHỈ** chứa code phục vụ duy nhất cho route đó.
  - 🛑 **NGHIÊM CẤM:** Tuyệt đối không import chéo từ `_components`, `_hooks`, `_utils` của route này sang route khác (vd: cấm `inbox/` hay `trash/` import từ `documents/_components/...`).
- **Dùng chung từ 2 Route trở lên (Shared Promotion):**
  - Bắt buộc chuyển lên tầng dùng chung toàn cục và export qua `index.ts` (Barrel Export):
    - **Shared Components:** `src/components/<domain>/` (hoặc `src/components/`).
    - **Shared Hooks:** `src/hooks/` (export qua `src/hooks/index.ts`).
    - **Shared Utils & QueryKeys:** `src/utils/` (export qua `src/utils/index.ts`).
    - **Shared Types:** `src/types/` (export qua `src/types/index.ts`).
- **Dọn dẹp Code Thừa (Zero Dead Code):** Khi thay thế một component/modal/hook cũ bằng phiên bản mới, bắt buộc **xóa ngay file cũ** và kiểm tra toàn bộ tham chiếu (`0 refs`) trước khi bàn giao.

### 1.2. Quy tắc Tổ chức Thư mục `modals/`
- Không để các file Modal nằm phẳng lộn xộn chung với Table, Card, Toolbar trong `_components/`.
- **Bắt buộc gom vào thư mục con `modals/`:** Đặt tại `_components/modals/` (nếu dùng riêng 1 trang) hoặc `src/components/<domain>/modals/` (nếu dùng chung).
- **Tái sử dụng Modal Xác nhận:** Mọi hành động xác nhận (Xóa mềm, Xóa vĩnh viễn, Khôi phục, Duyệt...) phải tái sử dụng `ConfirmActionModal` chung, không tạo nhiều file modal xác nhận trùng lặp.
- **Lazy Load Modal Nặng:** Các modal lớn (như `DocumentPreviewModal`, `RichTextEditor`, CAD/3D Viewer) nên dùng `next/dynamic` (`ssr: false`) để tối ưu tốc độ tải trang.

### 1.3. Quy tắc Tách Biệt Dữ liệu Tĩnh / Mockup Data & Đóng Gói Theo Quy Mô (`Adaptive Colocation`)
- 🛑 **NGHIÊM CẤM:**
  1. Cấm nhồi các mảng/object dữ liệu tĩnh hoặc mockup data (`NAV_LINKS`, `STATS`, `CORE_PILLARS`, `PRICING_PLANS`...) trực tiếp vào bên trong file giao diện `.tsx`.
  2. Cấm vứt các file `*.constants.ts` nằm phẳng lộn xộn trực tiếp ngay dưới `_components/`.
  3. Cấm nhét thẻ `<svg>` / JSX thô vào trong file dữ liệu (`.constants.tsx`) — file dữ liệu phải là **`.constants.ts` thuần TypeScript** (chỉ lưu dữ liệu và tham chiếu Component Icon như `icon: Mail` từ `lucide-react` hoặc custom icon component).
- **2 Cấp độ Tổ chức Chuẩn (Adaptive Colocation):**
  - **Cấp độ 1 — Component Đơn Gọn Nhẹ (`< 250` dòng, không có sub-component, vd: `header.tsx`, `footer.tsx`):**
    - Giữ component `.tsx` gọn nhẹ chỉ chứa UI & logic hiển thị.
    - Tách toàn bộ dữ liệu tĩnh/mockup vào thư mục **`_constants/<domain>.constants.ts`** của route (hoặc đưa lên **`src/config/<domain>.ts`** nếu dữ liệu đó được dùng từ 2 route trở lên).
  - **Cấp độ 2 — Component Phức hợp / Đa Section (`> 250` dòng hoặc có $\ge 2$ sub-components, vd: `hero`, `pricing`):**
    - **Bắt buộc đóng gói thành 1 Folder riêng (`_components/<feature-name>/`)** để gom cả sub-components lẫn file hằng số:
      ```text
      _components/
        └── hero/                         # Folder riêng cho khối phức hợp
            ├── hero.tsx                  # File khung ghép các section (< 150 dòng)
            ├── hero-cad-preview.tsx      # Sub-component (< 250 dòng)
            ├── hero-floating-dock.tsx    # Sub-component (< 150 dòng)
            ├── hero.constants.ts         # Thuần .ts: Lưu STATS, ADVISE_ADVANTAGES, CORE_PILLARS...
            └── index.ts                  # Barrel export: export * from './hero'
      ```

---

## 2. Quy chuẩn React Hooks & Chống Cascading Renders

### 2.1. Tuyệt đối Không Gọi `setState` Đồng bộ Trong `useEffect`
`useEffect` chỉ dùng để đồng bộ với hệ thống bên ngoài (DOM, Subscriptions, WebSockets).
🛑 **NGHIÊM CẤM** gọi `setState` đồng bộ ngay đầu thân `useEffect` để:
1. Reset state khi props/tab thay đổi (`setCurrentFolderId(defaultFolderId)`).
2. Đồng bộ props vào state (*Adjusting state from props*).
3. Bật cờ loading đồng bộ (`setIsLoading(true)`) trước khi gọi hàm async.

**Mẫu thiết kế thay thế bắt buộc:**
- **Reset State khi Props/Tab đổi:** Gán `key={tab}` ở Component cha (`<MyComponent key={tab} tab={tab} />`) để React tự mount lại state sạch, hoặc cập nhật trực tiếp trong pha render theo chuẩn React Docs.
- **Loading khi Parse/Xử lý bất đồng bộ:** Khởi tạo trực tiếp `const [isLoading, setIsLoading] = useState(Boolean(buffer))` kèm `key={fileId || fileUrl}` từ cha; trong `useEffect` chỉ gọi `setIsLoading(false)` ở khối `finally`.
- **Dữ liệu phái sinh (Derived State):** Tính toán trực tiếp khi render hoặc bọc trong `useMemo`, tuyệt đối không dùng `useState` + `useEffect`.

### 2.2. Chống Phân mảnh Hook & Chống Prop Drilling
- **Pure Transformations → `utils/`:** Các phép biến đổi dữ liệu thuần túy (duyệt cây, lọc/gom nhóm mảng, tính tổng) phải viết thành **pure functions** trong `utils/` và gọi qua `useMemo`, không tách thành custom hook giả tạo.
- **Không băm nhỏ Hook màn hình:** Không chia nhỏ logic 1 màn hình thành 7–8 file hook rời rạc gây prop drilling 30–50 props. Chỉ tách hook khi đóng gói một vòng đời độc lập (Stateful behavior / Event listener / Mutation group) hoặc tái sử dụng nhiều nơi.
- **Gom nhóm Props:** Khi truyền từ Hook tổng xuống View Component, ưu tiên gom nhóm theo domain object hoặc dùng chung Layout Container.

---

## 3. Đồng bộ Dữ liệu API & Bản địa hóa (Localization)
- **Strict TypeScript & 100% `camelCase`:**
  - Tuyệt đối không dùng `any`.
  - Mọi Interface nhận từ API Backend phải khai báo 100% `camelCase` (`brandId`, `aluminumThickness`, `isActive`).
  - 🛑 **CẤM** viết fallback kép `row.aluminumThickness ?? row.aluminum_thickness` hoặc khai báo cả 2 kiểu trong cùng interface.
- **Mapping Nhãn Tiếng Việt:**
  - Sử dụng Dictionary/Helper (`UNIT_MAP[row.unit] || row.unit`, `STATUS_MAP[row.status]`) để dịch mã tiếng Anh từ Backend sang tiếng Việt hiển thị trên UI.
  - 🛑 **CẤM** so sánh điều kiện trực tiếp với chuỗi tiếng Việt có dấu (`row.unit === 'Bộ'`).

---

## 4. Quy chuẩn UI/UX, Styling & Next.js Conventions
- **Server vs Client Components:** Giữ `page.tsx` gọn sạch; chỉ đặt `'use client'` ở các component thực sự cần state/hooks/event listeners.
- **Cấu hình Tập trung:**
  - Không gọi trực tiếp `process.env.NEXT_PUBLIC_...` rải rác trong component (phải lấy qua `src/config/app.ts`).
  - Sử dụng hệ thống biến màu tại `src/styles/color.css` và helper `cn()` để gộp class Tailwind.
  - Đảm bảo UI không bị cắt chữ (dropdown đủ `min-w`, `whitespace-normal`), bảng có đầy đủ empty state & loading skeleton.
- **Đặt tên (Naming):**
  - Tên file: `kebab-case` (vd: `product-table.tsx`).
  - Tên Component / Interface: `PascalCase` (vd: `ProductTable`).
  - Tên hàm / biến / actions: `camelCase` chuẩn ngữ nghĩa CRUD (`getUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser`).

