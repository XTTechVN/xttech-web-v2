# HƯỚNG DẪN & QUY ĐỊNH PHÁT TRIỂN (AGENTS & HUMANS)

> [!NOTE]
> Tài liệu AI AGENTS này dành cho tech stack **FE: Next.js**, **BE: FastAPI**, **DB: PostgreSQL**.

> [!IMPORTANT]
> - **RULE 0 (TỐI THƯỢNG): Nghiêm cấm tự ý sửa đổi các file quy tắc (rule files, cấu hình trong thư mục `.agents`) của hệ thống đối với cả Lập trình viên (Humans) và AI Agents, trừ khi có yêu cầu rõ ràng từ Leader hoặc Mentor.**
> - Đây là tài liệu quy chuẩn duy nhất và bắt buộc đối với cả Lập trình viên (Humans) và AI Agents khi tham gia phát triển, bảo trì dự án này. Hãy tuân thủ nghiêm ngặt mọi quy tắc bên dưới.

---

## MỤC LỤC

1. [Quy Định Chung & Tối Ưu Hóa (Dành cho AI Agents)](#1-quy-định-chung--tối-ưu-hóa-dành-cho-ai-agents)
2. [Quy Định Code Chung (Dành cho Lập Trình Viên)](#2-quy-định-code-chung-dành-cho-lập-trình-viên)
3. [Quy Định Phát Triển Frontend Chi Tiết](#3-quy-định-phát-triển-frontend-chi-tiết)
4. [Quy Định Phát Triển Backend Chi Tiết](#4-quy-định-phát-triển-backend-chi-tiết)
5. [Hướng Dẫn Cập Nhật Cấu Trúc Dự Án](#5-hướng-dẫn-cập-nhật-cấu-trúc-dự-án)

---

## 1. QUY ĐỊNH CHUNG & TỐI ƯU HÓA (Dành cho AI Agents)

### 1.1. Nguyên tắc quản lý Rule (Rule base)

- Không tự ý sửa/xóa rule cũ trừ khi được yêu cầu rõ ràng.
- Khi cần thêm rule mới, hãy đọc toàn bộ file và append vào cuối phần tương ứng.
- Viết rule mới ngắn gọn, súc tích và đi thẳng vào vấn đề.
- Không tự ý refactor hay đổi số thứ tự các rule cũ. Rule 0 là bất khả xâm phạm.

### 1.2. Cấu trúc Source & Tối ưu hóa Context (Token & Context Optimization)

- **Source Structure:** Khi cần hiểu cấu trúc dự án hoặc tìm vị trí file, HÃY ĐỌC file `STRUCTURE.md` ở thư mục gốc trước. KHÔNG tự động chạy lệnh quét/list toàn bộ file.
- **Terminal & Logs:** Khi chạy terminal gặp lỗi (ví dụ: `pytest` hoặc `npm run build`), CHỈ đọc và phân tích tối đa 10-15 dòng log lỗi cuối cùng.
- **File Exclusions:** Bỏ qua hoàn toàn các folder build, cache (`node_modules`, `.next`, `__pycache__`, `.venv`, `dist`, `.git`).
- **File Limits:** Không tự động chạy lệnh liệt kê tất cả các file (`ls -R` hoặc quét toàn bộ folder) trừ khi được yêu cầu đích danh.
- **No Absolute Paths in Codebase:** Nghiêm cấm sử dụng đường dẫn tuyệt đối (như `/home/trvv/...` hoặc `file:///home/trvv/...`) trong mã nguồn hoặc tài liệu (.md, .txt) của dự án. Chỉ sử dụng đường dẫn tương đối hoặc bắt đầu từ project root.

### 1.3. Phong cách phản hồi (Response Style & Tone)

- **Cực kỳ ngắn gọn & trực diện:** Đi thẳng vào câu trả lời hoặc giải pháp. KHÔNG chào hỏi, KHÔNG cảm ơn, KHÔNG tóm tắt lại câu hỏi của người dùng.
- **Không giải thích thừa:** Chỉ giải thích code khi thực sự cần thiết (tối đa 1-2 câu). Bỏ qua các câu dẫn dắt kiểu _"Dưới đây là..."_, _"Hy vọng giúp ích..."_, _"Chúc bạn thành công..."_.
- **Định dạng scannable:** Ưu tiên dùng Bullet points và Bold từ khóa chính. Không viết văn xuôi dài dòng.
- **Ngôn ngữ mặc định:** Trả lời bằng tiếng Việt ngắn gọn.
- **Hỏi rõ ràng:** Nếu thông tin chưa đủ để viết code, chỉ hỏi lại ĐÚNG 1 câu làm rõ điểm thắc mắc, không đoán mò.

### 1.4. Quy tắc tạo code (Code Generation)

- **Chỉ trả về Diff / Code sửa đổi:** Không in lại toàn bộ file code nếu chỉ sửa vài dòng. Chỉ đưa đoạn code cần thay đổi kèm context đủ để biết chèn vào đâu.
- **Strict Typing:**
  - Frontend (Next.js/TypeScript): Dùng TypeScript strict mode, tuyệt đối không dùng `any`.
  - Backend (Python/FastAPI): Dùng Pydantic v2, Type Hints bắt buộc cho mọi function.
- **Clean Architecture & Code:**
  - Frontend: Ưu tiên React Server Components (Next.js App Router). Chỉ thêm `'use client'` khi bắt buộc.
  - Backend: Dùng async/await cho FastAPI routes và DB operations.
  - Code comment phải viết bằng tiếng Việt, viết hoa chữ cái đầu tiên, ngắn gọn và chỉ viết khi thực sự cần thiết.
  - Tuân thủ nguyên tắc DRY (Don't Repeat Yourself), viết code sạch, tối ưu và dễ đọc.
- **Đề xuất Tối ưu & Refactoring:**
  - [MUST] Khi đọc code, nếu phát hiện ra phương pháp tối ưu hơn, ngắn gọn, dễ hiểu và nâng cao hiệu năng/bảo trì, bắt buộc phải hỏi lại để chủ động đề xuất giải pháp tốt hơn cho người dùng.
  - [IMPORTANT] Nếu codebase hiện tại quá bẩn (messy/dirty), tuyệt đối không cố gắng sửa thêm code mới theo yêu cầu một cách mù quáng để tránh làm code tệ hơn. Bắt buộc phải đề xuất refactor/clean code trước khi thực hiện tiếp.
- **Quy trình thay đổi code (MUST):** Yêu cầu thảo luận và trao đổi trước khi thực hiện bất kỳ thay đổi nào. Sau khi thảo luận và nhận được lệnh triển khai rõ ràng từ người dùng mới được phép sửa code.

---

## 2. QUY ĐỊNH CODE CHUNG (Dành cho Lập Trình Viên)

Bản tổng hợp ngắn gọn, dễ nhớ các quy tắc cốt lõi khi phát triển dành cho Developer.

### 2.1. Quy tắc Frontend (Next.js & React)

- **Cấu trúc thư mục (`src/`):**
  - `src/app/`: Next.js App Router (phân chia Route public/authenticated).
  - `src/app/actions/`: Chứa Server Actions gọi Backend API.
  - `src/components/`: Reusable components (Header, Sidebar, Table, Button...).
  - `src/config/`: Cấu hình ứng dụng (`app.ts`) và giao diện (`ui.ts`).
  - `src/types/`: TypeScript types/interfaces tập trung (không viết inline trong file khác).
- **Nguyên tắc viết code & import:**
  - **Barrel Export:** Bắt buộc viết file `index.ts` để re-export ở cấp thư mục. Chỉ import từ folder-level qua alias (ví dụ: `import { ... } from '@/types'`).
  - **Data Fetching:** Ưu tiên fetch data ở Server-side (Page/Server Component) và truyền props xuống các Client Components.
  - **Check Trùng lặp:** Trước khi tạo component mới, phải check `src/components/` và hỏi lại Mentor/USER xem đã có component tương tự chưa.
  - **Viết Docs:** Các Reusable Component trong `src/components/` phải có file `docs.md` đi kèm để hướng dẫn cách sử dụng và mô tả Props API.
- **Quy chuẩn đặt tên (CamelCase):**
  - Tên file: Dùng `kebab-case` (ví dụ: `header-wrapper.tsx`).
  - Tên Component: Dùng `PascalCase` (ví dụ: `HeaderWrapper`).
  - Hàm/Actions (CRUD Semantics):
    - Lấy danh sách / chi tiết: `getUsers` / `getUser`
    - Tạo / Cập nhật / Xóa: `createUser` / `updateUser` / `deleteUser`
    - Hành động trên Sub-resources: `getUserRoles`, `assignUserRoles`, `revokeUserRoles`

### 2.2. Quy tắc Backend (FastAPI / Python)

- **Kiến trúc phân tầng (Layered Architecture):**
  - **Luồng xử lý:** `HTTP Request → Endpoint → Service → Repository → Database`.
  - **Endpoint:** Nhận request, gọi Service và trả response. Bắt business exception từ Service để chuyển thành `HTTPException` (400, 404, 422...).
  - **Service:** Xử lý toàn bộ logic nghiệp vụ và quản lý Database Transaction (`db.commit()` / `db.rollback()`).
  - **Repository:** Chỉ làm nhiệm vụ tương tác DB trực tiếp (CRUD). Dùng `db.flush()`, **tuyệt đối KHÔNG** tự ý `commit()` hay raise exception tại đây.
- **Giao dịch & Type Annotation:**
  - **Transactions:** Mọi thao tác ghi (`create`, `update`, `delete`) trong Service phải bao quanh bởi khối `try-except` để `db.commit()` khi thành công hoặc `db.rollback()` khi lỗi.
  - **Type Annotation:** Khi khai báo Service kế thừa từ `BaseService`, bắt buộc chú thích rõ kiểu dữ liệu của repository thuộc tính (ví dụ: `self.repository: UserRepository = UserRepository()`).
  - **Pydantic Schema:** Kế thừa từ `BaseSchema` (tự động chuyển CamelCase). Khai báo strict type hints và sử dụng `Field` để validate dữ liệu đầu vào.
- **Quy chuẩn đặt tên (Snake_case):**
  - Hàm & API (CRUD Semantics):
    - Lấy danh sách / chi tiết: `get_users` / `get_user`
    - Tạo / Cập nhật / Xóa: `create_user` / `update_user` / `delete_user`
    - Hành động trên Sub-resources: `get_user_roles`, `assign_user_roles`, `revoke_user_roles`

---

## 3. QUY ĐỊNH PHÁT TRIỂN FRONTEND CHI TIẾT

### 3.1. Cấu trúc thư mục & Vai trò chi tiết (`src/`)

| Thư mục            | Vai trò & Quy định                                                                                                                                  |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`         | **Next.js App Router**: Chứa nhóm route bảo mật sau đăng nhập (`src/app/(authenticated)/` hoặc tương đương) và route công khai `src/app/(public)/`. |
| `src/app/actions/` | **Next.js Server Actions**: Chứa các action xử lý logic phía server và tương tác an toàn với Backend API.                                           |
| `src/components/`  | **Reusable Components**: Các UI component dùng chung toàn dự án (Header, Sidebar, Table, Button,...).                                               |
| `src/config/`      | **Configurations**: Cấu hình ứng dụng (API endpoints, routes) và cấu hình giao diện (UI dimensions, layouts).                                       |
| `src/contexts/`    | **React Contexts**: Quản lý và chia sẻ React state toàn cục cấp độ context (ví dụ: Sidebar context, Theme).                                         |
| `src/hooks/`       | **Custom React Hooks**: Chứa logic xử lý độc lập, reusable hooks (ví dụ: `useDebounce`, `useTable`).                                                |
| `src/stores/`      | **Client-side State**: Quản lý global state tập trung sử dụng Zustand.                                                                              |
| `src/styles/`      | **Styles**: Cấu hình CSS, Tailwind, scrollbar, fonts. Phải sử dụng đúng hệ màu và các CSS variables định nghĩa sẵn tại đây.                         |
| `src/types/`       | **TypeScript Types**: Định nghĩa toàn bộ types/interfaces nghiệp vụ và API schemas để đồng bộ với Backend.                                          |
| `src/utils/`       | **Utilities**: Hàm tiện ích dùng chung (API client, formatters, toast, helper functions).                                                           |

### 3.2. Quản lý Module & Import

- **Barrel Exports (Index Files):**
  - [MUST] Mỗi thư mục con trong `src/components/`, `src/types/`, `src/hooks/`, `src/utils/`, `src/stores/`, `src/contexts/`, `src/config/` phải có file `index.ts` để re-export.
  - [MUST] Chỉ import từ folder-level qua alias (ví dụ: `import type { ExportBatch, Label } from '@/types'`).
  - [NEVER] Không import trực tiếp từ file con bên trong thư mục (ví dụ: `import { ... } from '@/types/export-batch'`).
- **TypeScript Types tập trung:**
  - [MUST] Mọi định nghĩa TypeScript type/interface nghiệp vụ (API DTOs, API Responses, Entity types, Enums) bắt buộc phải nằm tại `src/types/`.
  - [NEVER] Không định nghĩa types inline trong component/page, và không export ngược type từ component ra ngoài.

### 3.3. Quy định về Component

- **Tái sử dụng & Tránh trùng lặp:**
  - [MUST] Trước khi tạo mới bất kỳ component nào, hãy kiểm tra kỹ thư mục `src/components/`. Hãy sử dụng lại hoặc kế thừa (extend) từ component sẵn có.
  - [REQUIRED] Phải hỏi lại người dùng (USER) xem component tương tự đã có hoặc đã được phát triển ở nhánh/thư mục khác chưa trước khi code component mới.
- **Chia nhỏ Component (Component Decomposition):**
  - [MUST] Phân tách các Page lớn hoặc component phức tạp thành các sub-components nhỏ, độc lập để đảm bảo tính dễ đọc và bảo trì.
  - [PREFER] Ưu tiên di chuyển các sub-component có tiềm năng tái sử dụng cao ra thư mục `src/components/` chung.
- **Tài liệu hướng dẫn bắt buộc (Documentation):**
  - [MUST] Khi tạo mới hoặc chỉnh sửa reusable component lớn trong `src/components/`, bắt buộc phải viết kèm file `docs.md` nằm cùng thư mục với component đó.
  - File `docs.md` phải tuân theo cấu trúc mẫu của `src/components/table/docs.md`:
    1.  **Quick Start**: Cách tích hợp nhanh kèm code mẫu (Server & Client component).
    2.  **Props API Table**: Bảng chi tiết mô tả (Prop, Type, Required?, Description).
    3.  **Advanced Configurations**: Chi tiết cấu hình các sub-objects hoặc types đi kèm.
    4.  **Examples**: Các case demo cụ thể.
- **Giới hạn sử dụng Client Component ('use client'):**
  - [MUST] Giữ các file `page.tsx` luôn là **Server Components**.
  - [MUST] Chỉ đặt chỉ thị `'use client'` ở các Component con nhỏ nhất (leaf components) thực sự cần tương tác UI hoặc sử dụng React hooks (`useState`, `useEffect`, event listeners). Không đặt ở Component cha/Page level để tránh làm mất lợi thế SEO và hiệu năng của RSC.

### 3.4. Quản lý State & Data Fetching

- **Data Fetching:**
  - [PREFER] Ưu tiên gọi API Backend trực tiếp ở Server-side (Next.js Server Components / Page level).
  - [MUST] Truyền dữ liệu (pass down) dưới dạng props từ Server Components xuống các Client Components hoặc UI components.
  - [NOTE - CẦN BỔ SUNG] Đối với Server Actions, nghiên cứu áp dụng cấu trúc dữ liệu trả về chuẩn thay vì `throw error` trực tiếp:
    ```typescript
    export interface ActionResponse<T = any> {
      success: boolean;
      data?: T;
      error?: string;
    }
    ```
- **Cấu hình UI & Màu sắc tập trung:**
  - [MUST] Mọi giá trị cấu hình giao diện mang tính chất hệ thống (Header height, Sidebar width, default backgrounds, section offsets) phải được khai báo tập trung tại `src/config/ui.ts`.
  - [MUST] Khi code giao diện, bắt buộc phải tuân thủ các màu chủ đạo được định nghĩa trong file [src/styles/color.css](src/styles/color.css).
  - [IMPORTANT] Khi thấy một màu sắc được lặp lại nhiều lần, phải hỏi lại người dùng để thêm vào hệ thống màu chung. Tuyệt đối không tự ý tạo mới, không tự đoán mò hay tự ý chế cháo mã màu.
  - [NEVER] Không hardcode các hằng số kích thước/màu sắc rải rác trong component.
- **Cấu hình Ứng dụng tập trung:**
  - [MUST] Tất cả hằng số cấu hình hệ thống (như `APP_NAME`, `APP_VERSION`, API endpoints, Media base URL,...) phải khai báo và quản lý tập trung tại `src/config/app.ts`.
  - [NEVER] Không gọi trực tiếp `process.env.NEXT_PUBLIC_...` bên trong các components hay pages riêng lẻ. Tất cả biến môi trường phải được export thông qua `src/config/app.ts`.

### 3.5. Quy chuẩn Viết Code & Đặt tên

- **Đặt tên (Naming Conventions):**
  - **File Name:** Sử dụng định dạng `kebab-case`. Đặt tên có tính ngữ nghĩa cao (ví dụ: `header-wrapper.tsx`, `header-avatar.tsx`).
  - **Component Name:** Sử dụng định dạng `PascalCase` trong code khi export và sử dụng (ví dụ: file `header-wrapper.tsx` export component `HeaderWrapper`).
  - **Functions / Server Actions (CRUD Semantics):**
    - [MUST] Đặt tên hàm/Server Actions theo đúng ngữ nghĩa CRUD bằng tiếng Anh ở dạng camelCase:
      - Lấy danh sách (nhiều phần tử): `get[Entities]` (ví dụ: `getUsers`).
      - Lấy chi tiết một phần tử: `get[Entity]` (ví dụ: `getUser`).
      - Tạo mới: `create[Entity]` (ví dụ: `createUser`).
      - Cập nhật: `update[Entity]` (ví dụ: `updateUser`).
      - Xóa: `delete[Entity]` (ví dụ: `deleteUser`).
    - [MUST] Đặt tên cho các hành động trên Sub-resources (tài nguyên con phụ thuộc) theo cấu trúc ngữ nghĩa rõ ràng:
      - Lấy danh sách sub-resource: `get[Parent][SubResources]` (ví dụ: `getUserRoles`).
      - Gán/Thiết lập sub-resource: `assign[Parent][SubResources]` (ví dụ: `assignUserRoles`).
      - Gỡ bỏ/Hủy bỏ sub-resource: `revoke[Parent][SubResources]` (ví dụ: `revokeUserRoles`).
- **Comment giải thích logic:**
  - [MUST] Đối với mọi hàm xử lý logic hoặc tính toán phức tạp, bắt buộc phải viết tối thiểu 1 dòng comment ngắn giải thích mục đích/logic xử lý.
- **Formatting Quy chuẩn (Prettier):**
  - Khi phát triển Front-end, định dạng mã nguồn theo tiêu chuẩn Prettier sau:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "all",
    "printWidth": 100
  }
  ```
- **3.6. Quy chuẩn Thiết kế Component (Design Patterns):**
  - [MUST] **Cấu trúc File & Export:** Mỗi component phải được đặt trong thư mục riêng kèm file `index.ts` để barrel export và `docs.md` để hướng dẫn sử dụng.
  - [MUST] **Interface Pattern:** Bắt buộc kế thừa từ các thuộc tính HTML gốc (ví dụ: `React.ButtonHTMLAttributes`) và phân tách rõ ràng các custom props.
  - [MUST] **Forward Ref Pattern:** Sử dụng `React.forwardRef` cho toàn bộ các interactive components (như Button, Input, Select, Dropdown...) để hỗ trợ truy cập DOM node trực tiếp.
  - [MUST] **Style Composition:** Sử dụng helper `cn` để gộp class CSS. Quản lý trạng thái (`hover`, `active`, `focus-visible`, `disabled`) và các biến thể giao diện (`variant`, `size`) thông qua cấu hình object/dictionary rõ ràng.

---


## 4. QUY ĐỊNH PHÁT TRIỂN BACKEND CHI TIẾT

### 4.1. Kiến trúc phân tầng & Luồng xử lý

- **Luồng xử lý Request chuẩn:** `HTTP Request → Endpoint → Service → Repository → Database`.
- **Endpoint Layer:**
  - [MUST] Chỉ nhận request, trả response, và chuyển đổi các exception nghiệp vụ thành HTTP status code thích hợp (ví dụ: 400, 404, 422...).
- **Service Layer:**
  - [MUST] Xử lý toàn bộ logic nghiệp vụ (business logic).
  - [MUST] Quản lý database transaction (`commit()` khi thành công hoặc `rollback()` khi thất bại).
  - [MUST] Raise các exception nghiệp vụ (như `AppError`, `NotFoundError`) khi gặp lỗi logic.
- **Repository Layer:**
  - [MUST] Chỉ thực hiện CRUD và tương tác trực tiếp với Database.
  - [MUST] Sử dụng `flush()` nếu cần lấy ID của record mới tạo.
  - [NEVER] Tuyệt đối không gọi `commit()` bên trong Repository.
  - [NEVER] Không raise exception tại layer này.

### 4.2. Xử lý Exception & Giao dịch (Transaction)

- **Mapping Exception:**
  - [MUST] Bắt (catch) các exception nghiệp vụ từ Service layer tại Endpoint layer để map sang `HTTPException` tương ứng trước khi trả về client.
- **Quản lý DB Transactions:**
  - [MUST] Mọi thao tác ghi dữ liệu vào DB (`create`, `update`, `delete`) trong Service layer phải được thực hiện trong khối `try-except`.
  - [MUST] Thực hiện `db.commit()` trong nhánh `try` khi thành công và `db.rollback()` trong nhánh `except` khi xảy ra lỗi.
- **Quản lý Database Session:**
  - [MUST] Truyền đối tượng Database Session (`db: Session`) từ Endpoint layer xuống Service layer và từ Service layer xuống Repository layer thông qua Dependency Injection (hoặc qua argument).
  - [NEVER] Tuyệt đối không tự khởi tạo hoặc tự mở session trực tiếp bên trong Repository để tránh xung đột transaction và rò rỉ kết nối (connection leak).

### 4.3. Type Annotation bắt buộc cho Service & Repository

- [MUST] Khi khởi tạo một lớp Service kế thừa từ `BaseService`, bắt buộc phải khai báo rõ ràng kiểu dữ liệu (type annotation) cho thuộc tính `repository`. Việc này giúp các công cụ kiểm tra tĩnh (static checkers) và IDE có thể phân tích chính xác.
- **Ví dụ minh họa:**
  ```python
  class UserService(BaseService):
      def __init__(self):
          self.repository: UserRepository = UserRepository()
          super().__init__(self.repository)
  ```

### 4.4. Pydantic Schema & BaseSchema

- [MUST] Tất cả các Pydantic schema (Pydantic models) dùng để validate dữ liệu đầu vào/đầu ra phải kế thừa từ lớp `BaseSchema` (để tự động xử lý chuyển đổi CamelCase).
- [MUST] Khai báo strict type hints rõ ràng cho tất cả thuộc tính.
- [MUST] Sử dụng `Field` để định nghĩa rõ ràng các điều kiện ràng buộc validation dữ liệu đầu vào.

### 4.5. Quy chuẩn đặt tên hàm & API (CRUD Semantics)

- [MUST] Đặt tên hàm (ở Service, Repository) hoặc API endpoints theo đúng ngữ nghĩa CRUD bằng tiếng Anh ở dạng `snake_case`:
  - Lấy danh sách (nhiều phần tử): `get_[entities]` (ví dụ: `get_users`).
  - Lấy chi tiết một phần tử: `get_[entity]` (ví dụ: `get_user`).
  - Tạo mới: `create_[entity]` (ví dụ: `create_user`).
  - Cập nhật: `update_[entity]` (ví dụ: `update_user`).
  - Xóa: `delete_[entity]` (ví dụ: `delete_user`).
- [MUST] Đặt tên cho các hành động trên Sub-resources (tài nguyên con phụ thuộc) theo cấu trúc ngữ nghĩa rõ ràng dưới dạng `snake_case`:
  - Lấy danh sách sub-resource: `get_[parent]_[sub_resources]` (ví dụ: `get_user_roles`).
  - Gán/Thiết lập sub-resource: `assign_[parent]_[sub_resources]` (ví dụ: `assign_user_roles`).
  - Gỡ bỏ/Hủy bỏ sub-resource: `revoke_[parent]_[sub_resources]` (ví dụ: `revoke_user_roles`).

---

## 5. HƯỚNG DẪN CẬP NHẬT CẤU TRÚC DỰ ÁN

Để xuất cấu trúc dự án ra file `tree.txt` (hoặc cập nhật file cấu trúc) phục vụ cho việc đọc hiểu source code của Agent, thực hiện các bước sau:

1. **Cài đặt công cụ `tree`:**

   ```bash
   sudo apt update && sudo apt install tree -y
   ```

2. **Xuất cây cấu trúc dự án (bỏ qua các thư mục build/cache):**
   Chạy lệnh sau tại thư mục gốc của dự án:
   ```bash
   tree -I "node_modules|.next|__pycache__|.venv|env|dist|build|.git|.pytest_cache" -L 4 > .agents/structure.md
   ```
