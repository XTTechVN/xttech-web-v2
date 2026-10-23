# Changelog

All notable changes to the frontend project will be documented in this file.

## [Unreleased] - 2026-10-23

### Fixed (End-to-End Audit: Đồng bộ Cache React Query & Chuẩn hóa Component $\le 300$ dòng)
- **Đồng bộ Dữ liệu Liên thông (`Bug D2`):**
  - [`use-cutting-plan.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/hooks/use-cutting-plan.ts): Mở rộng `refreshAll` tự động invalidate thêm `['order_shortage', projectId, orderId]`, `['warehouse_items']`, `['warehouse_receipts']` và `['warehouse_offcuts']` sau khi phát hành phiếu xuất kho hoặc hoàn trả đề-xê.
  - [`use-project-positions.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/hooks/use-project-positions.ts): Trong `measurePositionMutation.onSuccess`, gọi `invalidatePositionsAndProject()` và invalidate thêm `['progress_matrix', projectId]` để đồng bộ tức thì thông số tổng quan dự án và lưới tiến độ sản xuất sau khi lưu số đo thực tế ô chờ.
- **Chuẩn hóa Kích thước Component $\le 300$ dòng theo Rule 3 (`Bug D3`):**
  - [`glass-order-generate-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/glass-order-generate-modal.tsx): Tinh gọn từ 353 dòng xuống 298 dòng ($\le 300$ dòng).
  - [`progress-update-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/modals/progress-update-modal.tsx): Tinh gọn từ 312 dòng xuống 278 dòng ($\le 300$ dòng).

### Changed (Tối ưu Hiệu năng & Nâng cấp UX / Luồng Nghiệp vụ Module `projects`)
- **Tối ưu Hiệu năng (`projects/`):**
  - [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/page.tsx), [`project/index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/project/index.ts), [`project.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/project.ts): Thay thế lời gọi `getProjects({ limit: 500 })` trên trang danh sách dự án bằng `getProjectStats({ userId: scopedUserId })` (`GET /api/v1/projects/stats`).
  - [`use-overview-materials.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/overview/hooks/use-overview-materials.ts), [`material-standard-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/overview/components/material-standard-card.tsx), [`compact-select.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/overview/compact-select.tsx), [`tab-overview.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/overview/tab-overview.tsx): Lazy-fetch 3 danh mục vật tư (`brands`, `door-series`, `brand-colors`) chỉ khi người dùng mở dropdown `CompactSelect` (`onOpen={onEnableCatalogs}`), giảm 3 API calls khi mới mở trang chi tiết dự án.
  - [`project-production-progress.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/project-production-progress.tsx): Gỡ giới hạn `limit: 100` thành `limit: 9999` khi tải danh sách vị trí cửa ở tab Sản xuất.
- **Nâng cấp UX & Luồng Nghiệp vụ (`projects/[id]/`):**
  - [`projects/[id]/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/page.tsx): Đồng bộ tab đang chọn với URL query `?tab=overview|positions|quotations|contracts|production` thông qua `useSearchParams` và `router.replace` bọc trong `<Suspense>`, giữ nguyên tab khi F5 hoặc chia sẻ đường dẫn.
  - [`template-door-picker-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/template-door-picker-modal.tsx), [`use-template-door-picker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/hooks/use-template-door-picker.ts), [`template-door-filter-bar.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/components/template-door-filter-bar.tsx), [`template-door-catalog-grid.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/components/template-door-catalog-grid.tsx): Thiết kế lại Bước 1 của Modal Chọn Mẫu Cửa với thanh Pills chọn nhanh Hãng nhôm (ưu tiên đưa hãng mặc định của dự án lên đầu kèm ngôi sao `★` và menu `Xem thêm`), gỡ bỏ khóa cứng 1 hệ nhôm đơn lẻ khi mở modal để hiển thị đồng thời tất cả các Series của hãng được phân nhóm trực quan theo từng Section `🏷️ {Series}`, bổ sung thanh Pills loại cửa có đếm số lượng `(count)` thời gian thực, nút bật/tắt gom nhóm `Serie`, hiển thị đường kích thước trực tiếp trên bản vẽ `DoorThumbnail` và hiệu ứng hover `"Chọn mẫu này"`.
  - [`template-door-picker-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/template-door-picker-modal.tsx), [`template-door-info-step.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/components/template-door-info-step.tsx): Cho phép nhập trực tiếp `Rộng (mm)`, `Cao (mm)` và `Số lượng bộ` (`1..100`) ngay tại Bước 2 khi chọn mẫu cửa từ thư viện; tự động đồng bộ `w`, `h` vào bản sao `systemConfig` và gọi `createProjectPosition` (nếu `quantity === 1`) hoặc `bulkCreateProjectPositions` (nếu `quantity > 1`).
  - [`confirm-delete-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/modals/confirm-delete-modal.tsx), [`project-floors-positions.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/positions/project-floors-positions.tsx), [`cancel-production-order-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/modals/cancel-production-order-modal.tsx), [`project-production-progress.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/project-production-progress.tsx): Thay thế toàn bộ `window.confirm()` bằng Modal chuẩn UI khi xóa tầng, xóa vị trí cửa và hủy lệnh sản xuất (kèm ô nhập lý do hủy `note` truyền xuống API).
  - [`create-production-order-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/modals/create-production-order-modal.tsx), [`project-production-progress.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/project-production-progress.tsx), [`use-advance-progress.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/production/hooks/use-advance-progress.ts): Bổ sung `invalidateQueries` cho `['project', projectId]` và `['projects']` để badge trạng thái dự án trên Header tự động cập nhật ngay lập tức.

### Fixed
- **Hiển thị hình ảnh bản vẽ CAD 2D của cửa trên Xem trước báo giá & In/PDF (`projects/[id]/_components/quotations/`):**
  - [`quotation.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/quotation.ts): Bổ sung trường `systemConfig?: Record<string, unknown> | null` vào `QuotationSheetRow`.
  - [`quotation-sheet-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/quotations/components/quotation-sheet-table.tsx): Ưu tiên hiển thị [`DoorThumbnail`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/door-templates/_components/door-thumbnail.tsx) (`hideDimensions`) ở các dòng cửa (`row.rowType === 'door'`) có `row.systemConfig?.rootCell`, và fallback sang `<img src={getFileUrl(row.imagePath)} />` nếu không có bản vẽ CAD.
  - [`quotation-document-style.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/%5Bid%5D/_components/quotations/utils/quotation-document-style.ts): Định nghĩa CSS thuần tường minh cho `.qt-thumb` và `.qt-thumb svg` (`width: 100%; height: 22mm; max-height: 22mm`) đảm bảo khi in qua iframe độc lập (không nạp Tailwind CSS) hình vẽ SVG không bị tràn kích thước.
  - [`door-thumbnail.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/door-templates/_components/door-thumbnail.tsx): Truyền `id={useId().replace(/[^a-zA-Z0-9_-]/g, '')}` duy nhất và sạch ký tự đặc biệt xuống `DoorCadRenderer` để tránh xung đột `clipPath` (`#door-inner-clip-...`) khi render hoặc in nhiều cửa trên cùng một trang báo giá.

### Changed
- **Thiết kế lại Giao diện "Cơ chế hiện hành" & Bộ lọc Quản lý theo Google Stitch (`rules/`):**
  - [`rules-header.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-header.tsx): Bổ sung nút chuyển đổi chế độ xem `Lưới` (`grid`) / `Danh sách` (`list`) cạnh thanh tìm kiếm và nút `+ Soạn cơ chế`.
  - [`rules-tabs.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-tabs.tsx): Bổ sung dải 4 KPI Summary Pills bên phải thanh tab (`Đang hiệu lực`, `Chưa đọc`, `Sắp hết hiệu lực`, `Tỷ lệ đã đọc %`).
  - [`rules-filter-bar.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-filter-bar.tsx), [`use-rules-filters.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_hooks/use-rules-filters.ts): Thiết kế thanh lọc 2 hàng trực quan; đối với Manager (`isManager`) bổ sung 5 nút phạm vi (`Tất cả`, `Toàn công ty`, `Theo phòng ban`, `Theo cá nhân`, `Gửi cho tôi`) kèm 2 ô `MultiSelect` cho phép chọn lọc nhiều phòng ban và nhiều cá nhân cụ thể (hiển thị tag chip xóa nhanh); hàng 2 hiển thị dải pill chọn nhanh Loại văn bản, trạng thái hiệu lực và nút `Xóa bộ lọc`.
  - [`rule-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rule-card.tsx), [`rules-card-grid.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-card-grid.tsx): Tách `RuleCard` ra file riêng ($\le 300$ dòng); bổ sung badge định dạng file (`PDF`/`DOCX`/`XLSX`), trạng thái hiệu lực ngay trên chân trang A4 preview, trích yếu nội dung 2 dòng, hộp nhận diện Đối tượng áp dụng (`TargetScopeBox`: Toàn công ty / Phòng ban / Cá nhân cụ thể) và thanh tiến độ tuân thủ đọc (`CardReadCompliance`: `Đã đọc X/Y • Z%`).
- **Phân quyền Soạn thảo & Phê duyệt Cơ chế (`rules/`):**
  - [`rules-header.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-header.tsx), [`rules-page-content.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-page-content.tsx): Chỉ hiển thị nút `+ Soạn cơ chế` cho nhóm quyền `hr`, `admin`, `super` (`isManager`).
  - [`rules-tabs.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-tabs.tsx), [`use-rules-filters.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_hooks/use-rules-filters.ts): Ẩn hoàn toàn tab `Soạn thảo` và `Chờ tôi xử lý` đối với nhân viên thường (`!isManager`) và khóa điều hướng URL về tab `current`.
  - [`rule-permissions.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_utils/rule-permissions.ts), [`rules-card-grid.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-card-grid.tsx), [`rule-detail-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rule-detail-modal.tsx): Bổ sung cờ `canReplace` (chỉ hiển thị nút `Soạn cơ chế thay thế` cho `hr`/`admin`/`super`); giới hạn `canReview` chỉ hiển thị khung Thẩm định & Phê duyệt cho đúng người được gửi yêu cầu duyệt (`isApprover && ctx.isManager`).
  - [`use-rules-share-options.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_hooks/use-rules-share-options.ts): Loại bỏ fallback lấy nhân viên thường trong danh sách chọn người phê duyệt cơ chế, chỉ giữ các nhân sự có thẩm quyền (`isApproverEligible`).

## [Unreleased] - 2026-10-22

### Added
- **Hooks & Sub-components cho Module Dự Án (`projects/`):**
  - Tách [`project-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/project-form-modal.tsx) và [`project-delete-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/project-delete-modal.tsx) từ `modals.tsx`.
  - Bổ sung [`use-overview-materials.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/overview/hooks/use-overview-materials.ts), [`use-overview-summary.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/overview/hooks/use-overview-summary.ts), [`material-standard-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/overview/components/material-standard-card.tsx), [`project-progress-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/overview/components/project-progress-card.tsx), [`project-pipeline-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/overview/components/project-pipeline-card.tsx), [`project-kpi-summary-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/overview/components/project-kpi-summary-card.tsx), và [`project-activities-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/overview/components/project-activities-card.tsx) cho tab Tổng quan dự án (bổ sung đầy đủ cột phải).
  - Bổ sung [`use-project-positions.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/positions/hooks/use-project-positions.ts), [`use-template-door-picker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/positions/hooks/use-template-door-picker.ts), [`floor-sidebar.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/positions/components/floor-sidebar.tsx), [`position-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/positions/components/position-card.tsx) và bộ 4 modals (`floor-create-modal.tsx`, `position-edit-modal.tsx`, `position-measure-modal.tsx`, `position-qr-modal.tsx`) cho tab Hạng mục cửa.
  - Chuẩn hóa cấu trúc thư mục cho tab Sản xuất (`projects/[id]/_components/production/`): phân tách rõ ràng thành `components/` ([`production-sheet-tables.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/components/production-sheet-tables.tsx), [`production-sheet-card.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/components/production-sheet-card.tsx), [`daily-progress-panel.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/components/daily-progress-panel.tsx), [`production-orders-panel.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/components/production-orders-panel.tsx), v.v.), `modals/`, `hooks/`, `utils/` ([`production-sheet-utils.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/utils/production-sheet-utils.ts), [`cutting-plan-utils.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/utils/cutting-plan-utils.ts), [`production-labels.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/utils/production-labels.ts)) và [`types.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/types.ts); đồng thời xóa bỏ dead code `kcs-modal.tsx`.
  - Tách các modal và bảng con trong `projects/configuration/`: [`glass-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/glass-gaskets/_components/glass-modal.tsx), [`gasket-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/glass-gaskets/_components/gasket-modal.tsx), [`glass-category-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/glass-gaskets/_components/glass-category-modal.tsx), [`accessory-category-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/accessories/_components/accessory-category-table.tsx).

### Changed
- **Tối ưu hiệu năng & Kiến trúc toàn bộ Module `projects`:**
  - **Code Splitting (`next/dynamic`):** Lazy-load các tab nặng trong [`projects/[id]/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/page.tsx) và toàn bộ 8 tab cấu hình trong [`projects/configuration/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/page.tsx).
  - **Tối ưu độ phức tạp thuật toán $O(n)$:** Sử dụng `Map` tra cứu (`floorCountsMap`, `accessoryPriceMap`, `brandMap`, `systemMap`) thay cho vòng lặp `.filter()` / `.find()` lồng nhau $O(n^2)$.
  - **Tối ưu Network & Render:** Chỉ fetch danh sách khách hàng khi mở modal tạo/sửa dự án (`enabled: isOpen`); memoize `columns` và `renderCard` trong [`projects/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/table.tsx).
  - **Chuẩn hóa kích thước Component ($\le 300$ dòng):** Tái cấu trúc toàn bộ các file vượt ngưỡng 300 dòng trong `projects/`, `projects/[id]/`, và `projects/configuration/` (100% file trong module đạt $\le 300$ dòng).
  - **Di chuyển đúng kiến trúc thư mục:** Chuyển `combo-modal.tsx` và `searchable-select.tsx` về đúng `projects/configuration/accessory-combos/_components/`.
  - **Nâng cấp UX Modal Cập Nhật Tiến Độ & Nghiệm Thu ([`progress-update-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/modals/progress-update-modal.tsx)):** Đưa khối "Ảnh / Video nghiệm thu" lên đầu modal và hỗ trợ kéo thả (Drag & Drop) trực tiếp nhiều tệp hình ảnh/video từ bên ngoài vào.

### Removed
- **Dọn dẹp ~4,500 dòng Dead Code:**
  - Xóa 7 component/modal không còn sử dụng trong `projects/[id]/_components/overview/`.
  - Xóa module trùng lặp `projects/configuration/aluminum/`, `projects/configuration/_components/import-modal.tsx`, và các file rác trong `projects/configuration/accessories/_components/`.

### Fixed
- **Đồng bộ Cache & State:** Thêm `scopedUserId` vào `queryKey` danh sách dự án và đồng bộ `totalProjects` thực tế từ bảng lên [`projects/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/page.tsx).
- **Sửa hành vi nút In trên bảng Lệnh sản xuất ([`production-orders-panel.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/components/production-orders-panel.tsx)):** Bấm icon `<Printer />` sẽ gọi trực tiếp `getCuttingPlan` và `printCuttingPlan` để in ngay Sơ đồ cắt thanh nhôm (thay vì mở nhầm modal Chi tiết).
- **Sửa lỗi In Thẻ Sản Xuất A4 ([`production-sheet-print.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/utils/production-sheet-print.ts), [`production-sheets-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/_components/production/modals/production-sheets-modal.tsx)):** Thay cơ chế `window.print()` trực tiếp trên DOM chính bằng in qua `iframe` ẩn độc lập kế thừa stylesheet ứng dụng, khắc phục triệt để lỗi khoảng trắng đầu trang và lỗi mất phân trang khi in nhiều bộ cửa.
- **Tuân thủ Rule 13 & Rule 5:** Loại bỏ hoàn toàn fallback `snake_case` (`surface_color`, `accessory_color`, v.v.) và các câu lệnh `console.log`/`console.warn`/`console.error` trong toàn bộ module `projects`.

## [Unreleased] - 2026-10-19

- **Giao Diện Card Lưới Hiện Đại Cho Tab "Cơ Chế Hiện Hành" & Menu Thao Tác 3 Chấm ([`rules-card-grid.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-card-grid.tsx), [`rules-page-content.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/rules/_components/rules-page-content.tsx)):**
  - **Chuyển đổi giao diện tab "Cơ chế hiện hành":** Chuyển từ table sang giao diện lưới Card trực quan theo phong cách Google Drive / Workspace hiện đại.
  - **Chuẩn hóa Icon theo đúng định dạng tệp (`DriveFileIcon`):** Hiển thị đúng biểu tượng Google Drive đặc trưng cho từng loại tệp (Word màu xanh dương `.docx`, PDF màu đỏ `.pdf`, Excel màu xanh lá `.xlsx`, Image màu tím, Text màu xám) dựa trên tên tệp và `mimeType` thực tế của phiên bản tài liệu.
  - **Khung Preview Mô Phỏng Trang Giấy Văn Bản A4:** Thay thế ô xám placeholder cũ bằng mô phỏng trang văn bản A4 màu trắng sắc nét, có Quốc hiệu, Tiêu đề in hoa trang trọng, trích yếu hoặc dòng văn bản căn chỉnh đều, watermark chìm `XT-TECH`, và số trang.
  - **Tối Giản Hiệu Ứng Hover:** Loại bỏ hoàn toàn nút đè và lớp phủ tối khi hover vào preview; khi rê chuột thì toàn bộ Card chỉ xuất hiện một lớp shadow nhẹ nhàng, tinh tế và chuyển màu tiêu đề sang màu chính (`hover:shadow-md hover:border-slate-300`).
  - **Hành vi tương tác:**
    - Click vào thân Card: Mở trực tiếp trình xem văn bản (`DocumentPreviewModal`) và tự động gọi API đánh dấu đã đọc (`markDocumentAsRead`).
    - Click menu 3 chấm: Mở dropdown gồm: *Xem văn bản*, *Chi tiết & Lịch sử*, *Soạn cơ chế thay thế*, *Chỉnh sửa*, *Xóa văn bản*.
  - **Chuẩn hóa tab "Soạn thảo":** Tiếp tục dùng Table chuẩn hóa từ component chung (`TableHeader`, `TableBody`, `TablePagination`) từ `@/components/table`.
  - **Sửa lỗi quyền nút "Đã đọc và hiểu":** Chỉ hiển thị cho người nhận đích thực (`doc.canAcknowledge`), không hiển thị cho Super Admin/người soạn nếu không phải người nhận.
  - **Xóa cascade an toàn:** Super Admin có thể xóa văn bản ở mọi trạng thái; hệ thống tự động dọn dẹp các bản ghi liên quan tránh lỗi phụ thuộc.
  - **Bắt lỗi PDF 403:** Xử lý ngoại lệ trong `PdfViewer` bằng `onSourceError` giúp tránh lỗi runtime crash.


- **Nâng Cấp Form Thu Hồi Nhôm Thừa Tái Sử Dụng ([`offcut-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/offcut-form-modal.tsx)):**
  - **Tự động điền Profile Bar:** Loại bỏ ô nhập số nguyên `profileBarId` thủ công; tự động liên kết và hiển thị mã profile bar khi thủ kho chọn mặt hàng profile gốc trong kho.
  - **Selectbox Màu Sắc trực quan:** Chuyển ô nhập số `colorId` thành Selectbox tải dữ liệu từ danh mục bảng màu `brandColors`; tự động map với màu của mặt hàng được chọn đồng thời hiển thị chấm màu HEX trực quan (`currentColor.colorHex`).
  - **Kiểm thử chất lượng:** TypeScript biên dịch 0 lỗi (`npx tsc --noEmit` exit 0).

- **Hiển Thị Trực Quan Màu Sắc Thực Tế (HEX) & Mã Thanh Profile Cho Kho Nhôm Thừa Tái Sử Dụng ([`offcuts-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/offcuts-tab.tsx), [`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/warehouse.ts)):**
  - **Màu sắc thực tế:** Thay thế text thô `Màu #id` bằng chấm tròn màu trực quan hiển thị chuẩn mã màu HEX thực tế (`style={{ backgroundColor: item.colorHex }}`) kèm tên màu tiếng Việt thân thiện (`colorName` / `colorCode`).
  - **Thanh profile chuẩn hóa:** Thay thế `Thanh Profile #id` bằng mã thanh nhôm in đậm (`profileBarCode`) kèm tên thanh nhôm (`profileBarName`), giúp thủ kho dễ dàng nhận diện loại phôi nhôm thừa tái sử dụng.
  - **Kiểm thử chất lượng:** TypeScript biên dịch 0 lỗi (`npx tsc --noEmit` exit 0).

- **Tích Hợp Cấu Hình Roan Gắn Kính & Phụ Kiện Tùy Biến Cho Khung Và Cánh (Door Studio BOM Engine) ([`gasket-config-section.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/panels/config/gasket-config-section.tsx), [`custom-extra-config-section.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/panels/config/custom-extra-config-section.tsx), [`config-frame-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/panels/config/config-frame-tab.tsx), [`config-sash-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/panels/config/config-sash-tab.tsx), [`results-tab-view.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/panels/results-tab-view.tsx), [`studio-types.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/studio-types.ts), [`door.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/door.ts)):**
  - **Mục Roan Gắn Kính (Gaskets Config):**
    - Cho phép cấu hình danh sách roan đệm chèn nẹp hoặc chu vi cho cả Khung (`FrameConfig.gaskets`) và Cánh (`SashConfig.gaskets`).
    - Lựa chọn linh hoạt loại roan từ danh mục vật tư (`gasket_id`, tên roan hiển thị).
    - Hỗ trợ 7 phương thức tính toán chiều dài tự động theo kích thước ô: *Theo nẹp kính (`bead`)*, *Theo chu vi kính (`glass_perimeter`)*, *Theo chiều rộng kính (`glass_width`)*, *Theo chiều cao kính (`glass_height`)*, *Theo chu vi khung (`frame_perimeter`)*, *Theo chiều rộng khung (`frame_width`)*, *Theo chiều cao khung (`frame_height`)*.
    - Cấu hình số đường roan chèn (`countPerCell`, mặc định 1).
  - **Mục Phụ Kiện Tùy Biến (Custom Extras Config):**
    - Cho phép bổ sung thanh phụ trợ (như Ốp ray trên, Ray U inox, nẹp che rãnh) gắn liền với Khung hoặc Cánh.
    - Thiết lập công thức chiều dài tự do theo biến hình học: `W`, `H` (kích thước ô), `W0`, `H0` (kích thước tổng bộ cửa), ví dụ: `W-47.6`.
    - Cấu hình góc cắt 2 đầu Trái/Phải (`angle1`, `angle2`, mặc định 90°/90°).
  - **Bổ Sung Tab Kết Quả BOM "5. Roan Gắn Kính":**
    - Bảng chi tiết bóc tách vật tư roan: Tên roan, Vị trí áp dụng, Cách tính, Chiều dài (mét), Đơn giá, Thành tiền.
    - Hiển thị tổng hợp chiều dài roan (mét) và tổng chi phí roan trên thanh tổng quan kết quả.
  - **Kiểm thử chất lượng:** TypeScript biên dịch 0 lỗi (`npx tsc --noEmit` exit 0).

- **Nâng Cấp Toàn Diện Thư Viện Kiểu Cánh Đầy Đủ (Sash Layout Catalog 77+ Mẫu) & Bộ Sinh Parametric Cho Door Studio ([`sash-layout-catalog.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/core/sash-layout-catalog.ts), [`sash-type-picker.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/panels/sash-type-picker.tsx), [`door-tree-utils.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/utils/door-tree-utils.ts), [`cad-opening-symbol.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/cad-engine/components/cad-opening-symbol.tsx), [`cad-rectangular-leaf.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/cad-engine/components/cad-rectangular-leaf.tsx)):**
  - **Thư viện cấu hình 77+ kiểu cánh chuẩn hóa:** Bổ sung đầy đủ 6 họ cửa theo chuẩn Windova và ngành nhôm kính Việt Nam (Cửa đi mở quay, Cửa sổ mở quay/hất/lật, Cửa lùa đa ray, Cửa gấp xếp N-R, Cửa trượt quay).
  - **Giao diện SashTypePicker Lưới 3 Cột Chuẩn Windova (Ảnh 1 & 3):**
    - Ô trên cùng tách biệt: *Vách kính cố định (ô fix)* viền kim loại xám mòi góc 45°.
    - Lưới 3 cột (`grid-cols-3`) các thẻ hình vuông (`aspect-square`) viền vàng nâu, kính xanh ngọc, không chứa chữ rườm rà.
    - Phân loại rõ ràng theo nhóm: *Cửa sổ, Cửa đi, Sổ lùa, Đi lùa, Gấp xếp, Trượt quay*.
    - Thẻ được chọn hiển thị viền kép xanh dương nổi bật (`ring-2 ring-blue-500 border-blue-500`).
  - **Khóa & Tay Nắm Chuyên Biệt Cho Cửa Lùa (Ảnh 2):**
    - Thay thế icon tay gạt thông thường bằng **Khóa sập âm dài (Flush Lock)** màu đen cho các cánh mép ngoài giáp khung bao.
    - Cặp cánh giữa đối đầu hiển thị **Tay nắm chữ D (D-Pull handle)** màu đen đối xứng hướng vào nhau.
    - Hiển thị mũi tên trượt và biểu tượng quả trám (`2-chieu`) màu xanh lam (`#0284c7`) trên mặt kính cửa lùa.
  - **Bộ chuyển đổi cây SceneCellNode linh hoạt (`applySashTypeToCluster`):** Tự động phân chia ô thành $N$ cánh con theo phương ngang/dọc, gán đúng chiều mở, tay nắm, `zIndex`, và cho phép hợp nhất ngược về ô đơn duy nhất hoặc vách cố định mượt mà.
  - **Kiểm thử chất lượng:** TypeScript `npx tsc --noEmit` đạt 0 lỗi biên dịch; vượt qua 100% các bài test tự động cho catalog và cây layout.

## [Unreleased] - 2026-10-13

### Added & Enhanced

- **Tách Biệt Hoàn Toàn & Lọc Động Lý Do Theo Loại Phiếu Nhập / Xuất Kho ([`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/config/warehouse.ts), [`receipt-form-header.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-header.tsx), [`receipt-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-modal.tsx), [`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/warehouse.ts)):**
  - **Khắc phục triệt để lỗi trộn lẫn lý do:** Không còn hiển thị các lý do Xuất kho khi đang lập phiếu Nhập kho và ngược lại.
  - **Phân nhóm chuyên biệt:**
    - **Phiếu Nhập kho (`import`):** Chỉ hiển thị 3 lý do: *Mua hàng mới từ NCC* (`purchase` - mặc định), *Thu hồi nhôm thừa sau sản xuất* (`offcut_return`), *Điều chỉnh kiểm kê (Nhập thừa / Cân đối)* (`adjustment`).
    - **Phiếu Xuất kho (`export`):** Chỉ hiển thị 4 lý do: *Xuất sản xuất theo Lệnh* (`production_issue` - mặc định), *Xuất bù sự cố / cắt hỏng* (`rework_issue`), *Điều chỉnh kiểm kê (Xuất thiếu / Hao hụt)* (`adjustment`), *Thanh lý phế liệu* (`scrap`).
  - **Cơ chế tự động đồng bộ khi chuyển đổi (Auto State Sync):** Khi người dùng click chuyển đổi giữa tab Nhập Kho $\leftrightarrow$ Xuất Kho, form tự động kiểm tra và chuyển `receiptReason` về lý do hợp lệ đầu tiên tương ứng, ngăn ngừa lỗi gửi nhầm lý do không hợp lệ lên máy chủ.
  - **Kiểm thử chất lượng:** TypeScript biên dịch 0 lỗi (`npx tsc --noEmit` exit 0).


- **Chuẩn Hóa Thuật Ngữ Giao Diện: Thay Từ Lóng "Đề-xê" Sang Tiếng Việt Thuần Nghĩa "Nhôm Thừa Tái Sử Dụng" ([`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/page.tsx), [`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/config/warehouse.ts), [`offcuts-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/offcuts-tab.tsx), [`warehouse-kpi-cards.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/warehouse-kpi-cards.tsx), [`offcut-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/offcut-form-modal.tsx), [`receipt-detail-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-detail-modal.tsx)):**
  - **Bản địa hóa ngôn ngữ chuẩn doanh nghiệp (Rule 14):** Loại bỏ hoàn toàn các từ ngữ mượn tiếng Pháp khó hiểu (*"đề-xê"*), đồng bộ sang ngôn ngữ quản trị kho thuần Việt:
    - Tab 3: **`3. Kho Nhôm Thừa Tái Sử Dụng (≥ 1.0m)`**.
    - Thẻ thống kê KPI: **`Nhôm thừa tái sử dụng (≥ 1.0m)`**.
    - Nút thao tác: **`Thu Hồi Nhôm Thừa Mới`**.
    - Tiêu đề cột & Nhãn: **`Mã Nhôm Thừa`**, **`Vị Trí Kệ / Giá Nhôm Thừa`**.
    - Lý do phiếu kho: **`Thu hồi nhôm thừa sau sản xuất`**.
  - **Giữ nguyên mã kỹ thuật Backend:** Cơ sở dữ liệu và API Backend tiếp tục giữ nguyên mã enum quốc tế (`offcut`, `offcut_return`), toàn bộ việc chuyển đổi hiển thị do Frontend đảm nhiệm qua Mapping Dictionary.
  - **Kiểm thử chất lượng:** TypeScript `npx tsc --noEmit` đạt 0 lỗi biên dịch.


- **Chuẩn Hóa Bộ Lọc Mặt Hàng Cung Ứng Thực Tế & Đơn Kính Theo Nhà Cung Cấp ([`supplier-detail-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-detail-modal.tsx), [`supplier-glass-orders-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-glass-orders-table.tsx), [`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/warehouse.ts), [`index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/warehouse/index.ts)):**
  - **Khắc phục lỗi lọc mặt hàng tràn lan/trùng lặp:** Thay thế cơ chế lọc sơ sài theo loại kho chung bằng API chuyên sâu `getWarehouseSupplierAnalytics(supplierId)` từ Backend. Chỉ hiển thị chính xác những mặt hàng mà xưởng đã từng nhập mua thực tế từ nhà cung cấp đó kèm tổng lượng nhập, đơn giá gần nhất, ngày nhập gần nhất và tồn kho hiện tại.
  - **Tách riêng phân hệ Nhà máy tôi kính (`supplierType === 'glass'`):** Hoàn toàn không hiển thị nhôm hay ke góc phụ kiện cho nhà máy kính. Chuyển sang hiển thị chuyên biệt tab **"Đơn Đặt Kính Gửi Nhà Máy"** ([`SupplierGlassOrdersTable`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-glass-orders-table.tsx)) gồm: Mã đơn, Công trình, Số tấm kính, Tổng tiền, Hạn giao kính và Trạng thái đơn.
  - **Thông báo rỗng trực quan & Thân thiện UX:** Với các nhà cung cấp mới tạo chưa phát sinh nhập mua hoặc đặt kính, hiển thị thông báo rõ ràng *"Chưa phát sinh mặt hàng nào được nhập mua từ nhà cung cấp này"* hoặc *"Chưa phát sinh đơn đặt kính nào gửi tới nhà máy này"*.
  - **Tuân thủ Clean Code & Quy chuẩn dự án:** Tách component con `SupplierGlassOrdersTable` (68 dòng) giúp `SupplierDetailModal` duy trì ở mức 258 dòng (< 300 dòng theo Rule 3), TypeScript biên dịch 0 lỗi.


- **Bổ Sung Quản Lý Trạng Thái Hợp Tác & Nút "Ngừng Hợp Tác" Trong Modal Sửa Nhà Cung Cấp ([`supplier-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-form-modal.tsx)):**
  - **Khối Card trạng thái hợp tác trực quan:** Khi mở modal sửa nhà cung cấp, hiển thị khối quản lý trạng thái chuyên nghiệp với badge nổi bật (`Đang Hợp Tác` màu xanh lá hoặc `Ngừng Hợp Tác` màu đỏ), dòng giải thích chính sách nghiệp vụ và công tắc `Switch` chuyển đổi nhanh.
  - **Nút thao tác trực diện ở Footer:** Cung cấp nút thao tác nhanh ở góc trái footer: hiển thị **"Ngừng Hợp Tác"** (viền đỏ) khi đang hoạt động và **"Kích Hoạt Lại Hợp Tác"** (viền xanh lá) khi đang tạm dừng, giúp người dùng thao tác 1-click rõ ràng mà không cần tìm kiếm.
  - **Đồng bộ dữ liệu thời gian thực:** Gửi cờ `isActive` chuẩn camelCase tới backend qua API `updateWarehouseSupplier`, cập nhật trực tiếp DB và làm mới trạng thái trên bảng danh sách NCC.
  - **Tuân thủ Clean Code & Quy chuẩn dự án:** Sử dụng `showErrorToast` tập trung (Rule 5), camelCase chuẩn (Rule 13), dung lượng component 284 dòng (< 300 dòng theo Rule 3), TypeScript biên dịch 0 lỗi.


- **Pha 0: Hotfix & Khắc Phục Lỗi Giao Diện Đặt Kính (Mục 0.1 - 0.6) ([`glass-order-generate-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/glass-order-generate-modal.tsx), [`glass-order-panes-editor.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/glass-order-panes-editor.tsx), [`glass-orders-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/glass-orders-tab.tsx), [`glass-mapping.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_utils/glass-mapping.ts), [`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/warehouse.ts)):**
  - **Hỗ trợ chọn Cửa / Kính lẻ phát sinh (Mục 0.2 & 10.1):** Thêm cột "Thuộc Cửa" với dropdown danh sách cửa công trình + lựa chọn "— Kính lẻ (không thuộc cửa) —". Khi chọn kính lẻ, tự động hiển thị dropdown "Lý do đặt kính" (`spare`, `replacement`, `extra`, `other`), dòng được tô màu hổ phách trực quan.
  - **Khắc phục lỗi gõ đơn giá bị xóa sạch bảng (Mục 0.3 & 4.3):** Cô lập `defaultUnitPrice` khỏi dependencies của `fetchPreviewPanes` qua ref, tải preview một lần khi mở modal; người dùng gõ đơn giá tự do mà không bao giờ bị re-fetch ghi đè bảng.
  - **Hàng rào chặn submit cửa chưa đo ô chờ (Mục 0.1):** Hiển thị cảnh báo trực tiếp trên từng dòng cửa chưa đo thực tế ô chờ (`⚠️ Chưa đo thực tế ô chờ!`), chặn submit và hiển thị toast chi tiết liệt kê mã cửa.
  - **Chuẩn hóa ngày nhận hàng YYYY-MM-DD (Mục 0.4):** Sửa `handleReceiveDelivery` gửi `actualDeliveryDate` chuẩn `YYYY-MM-DD` thay vì chuỗi ISO kèm giờ.
  - **Loại bỏ `console.error` và dùng `showErrorToast` tập trung (Mục 0.6 & Rule 5):** Toàn bộ các catch block trong `glass-orders-tab.tsx` chuyển sang dùng `showErrorToast(err, fallback)` chuẩn của dự án.
  - **Từ điển dùng chung `glass-mapping.ts` (Rule 14):** Tách `MANUAL_REASON_MAP`, `MANUAL_REASON_OPTIONS`, `GRIND_OPTIONS`, `GLASS_ORDER_STATUS_MAP` ra file mapping dùng chung cho cả bảng danh sách và modal.
  - **Tuân thủ Clean Code & Rule 3:** Cả 2 component `glass-order-panes-editor.tsx` (250 dòng) và `glass-order-generate-modal.tsx` (298 dòng) đều < 300 dòng; `npx tsc --noEmit` đạt 0 lỗi biên dịch.

- **Nâng Cấp Giao Diện Đặt Kính Tôi Nhà Máy Đa Ô Kính & Bóc Tách Tự Động ([`glass-order-generate-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/glass-order-generate-modal.tsx), [`glass-order-panes-editor.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/glass-order-panes-editor.tsx), [`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/warehouse.ts), [`index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/warehouse/index.ts)):**
  - **Tự động bóc tách ô kính từ thiết kế cửa:** Khi mở Modal đặt kính, hệ thống tự động gọi API `previewProjectGlassPanes` để lấy toàn bộ danh sách các ô kính từ BOM thiết kế cửa công trình hoặc Lệnh sản xuất.
  - **Bảng biên tập danh sách ô kính chuyên nghiệp (`GlassOrderPanesEditor`):**
    - Cho phép tinh chỉnh trực tiếp: Ký hiệu ô, Chủng loại/Quy cách kính, Chiều rộng (mm), Chiều cao (mm), Kiểu mài cạnh (Mài xiết cạnh, Mài bóng, Mài vát mòi, Không mài), Đơn giá kính (đ/m²).
    - Tự động tính toán diện tích từng tấm $S = \frac{W \times H}{1.000.000}$ ($m^2$) và Thành tiền tương ứng.
    - Hỗ trợ thêm ô kính tùy biến thủ công và xóa ô kính nhanh chóng.
    - Nút tiện ích "Áp dụng": 1-click cập nhật đơn giá chung cho toàn bộ danh sách các ô kính.
  - **Cố định kích thước Modal chuẩn UX (`size="xl"`, `md:h-[84vh]`):** Giữ khung modal cố định, không bị co kéo hay giật kích thước khi thêm/bớt dòng kính.
  - **Thống kê tổng hợp thời gian thực:** Thanh tóm tắt ở footer hiển thị tức thì: Tổng số tấm, Tổng diện tích $m^2$, và Tổng tiền ước tính (đ) có format VNĐ.
  - **Tuân thủ Clean Code & Rule 3:** Tách `GlassOrderPanesEditor` (~180 dòng) giúp `GlassOrderGenerateModal` giữ ở mức ~220 dòng (hoàn toàn < 300 dòng).

### Fixed & Enhanced

- **Khắc Phục Lỗi Không Hiển Thị Mặt Hàng Khi Xem Chi Tiết Phiếu Kho ([`receipt-detail-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-detail-modal.tsx)):**
  - **Tự động tải dữ liệu chi tiết phiếu kho (`getWarehouseReceiptDetail`):** Khi mở modal xem chi tiết từ danh sách phiếu (vốn chỉ chứa thông tin tổng hợp), modal tự động gọi API `GET /api/v1/warehouse/receipts/{receipt_id}` để tải toàn bộ danh mục mặt hàng (`items`) thực tế đã lưu trong phiếu.
  - **Trạng thái tải dữ liệu mượt mà (`loading spinner`):** Hiển thị spinner và thông báo "Đang tải danh sách mặt hàng..." ngay trong bảng trong thời gian tải dữ liệu, ngăn việc báo rỗng sai lệch *"Không có chi tiết mặt hàng"*.
  - **Chuẩn hóa Đơn vị tính hiển thị:** Dùng hàm `toDisplayUnit(it.unit)` theo **Rule 14** để hiển thị đúng nhãn tiếng Việt (`Cây`, `Cái`, `Bộ`...).
  - **Giữ component ở mức 264 dòng:** Tuân thủ nghiêm ngặt **Rule 3** (< 300 dòng).

- **Tối Ưu Giao Diện & Quy Trình Lập Phiếu Kho ([`receipt-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-modal.tsx), [`receipt-items-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-items-table.tsx), [`receipt-form-header.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-header.tsx)):**
  - **Cố định kích thước Modal ngay từ đầu (`md:h-[88vh] md:max-h-[88vh]`):**
    - Modal lập phiếu mở ra ngay với kích thước đầy đủ và rộng rãi, không bị co nhỏ khi có 1 dòng hay nhảy kích thước phình to dần mỗi khi bấm "+ Thêm Dòng".
    - Khung bảng vật tư tự động chiếm trọn không gian còn lại (`flex-1 min-h-[300px] overflow-y-auto`), tiêu đề bảng được ghim cố định phía trên (`sticky top-0 z-10`), tổng tiền phiếu và các nút footer luôn ghim cố định ở đáy modal.
  - **Mặc định Tạo Phiếu ở Trạng Thái Chưa Duyệt (Nháp):**
    - Đặt nút **"Lưu Phiếu (Chưa duyệt)"** làm nút hành động chính (Primary button màu indigo nổi bật), tạo phiếu ở trạng thái nháp để thủ kho kiểm tra trước khi duyệt.
    - Chuyển nút *"Tạo & Duyệt Ngay"* thành nút phụ viền mảnh (outline) cho trường hợp muốn duyệt tức thì.
  - **Bắt Buộc Chọn Nhà Cung Cấp Đối Với Phiếu Nhập:**
    - Đánh dấu sao đỏ bắt buộc (`Nhà Cung Cấp *`) trên form.
    - Thêm cơ chế kiểm tra tính hợp lệ: chặn submit và hiển thị toast cảnh báo nếu người dùng chưa chọn nhà cung cấp khi lập phiếu nhập kho.
  - **Tách Component Con `ReceiptFormHeader`:** Đưa cụm trường thông tin đầu phiếu (Loại phiếu, Lý do, NCC/Lệnh SX) ra component riêng, giữ [`receipt-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-modal.tsx) ở mức **285 dòng** (tuân thủ nghiêm ngặt **Rule 3** < 300 dòng).

- **Nâng Cấp Thao Tác Sửa & Xóa Mặt Hàng Danh Mục Tồn Kho ([`stock-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/stock-tab.tsx), [`item-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-form-modal.tsx), [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/page.tsx)):**
  - **Cột Thao Tác trên Bảng Tồn Kho:** Bổ sung cột "Thao Tác" với 2 nút thao tác đồng bộ giao diện (`Edit2` màu vàng amber, `Trash2` màu đỏ red).
  - **Chế độ Chỉnh Sửa Thông Tin Cơ Bản:**
    - Khóa các trường định danh kỹ thuật không cho sửa: Mã vật tư (`itemCode`), Hãng nhôm (`brandName`), Màu sắc (`colorName`) và Số lượng tồn kho (`currentStock`).
    - Hiển thị thẻ thông tin định danh cố định ở đầu form; chỉ cho phép người dùng điều chỉnh thông tin vận hành: Tên quy cách (`itemName`), Đơn vị tính (`unit`), Chiều dài tiêu chuẩn (`standardLengthMm`), Vị trí kho (`location`), Đơn giá vốn bình quân (`costPrice`) và Định mức tồn an toàn (`minStockLevel`).
  - **Tách Hook Dùng Chung `useItemLibrary` ([`use-item-library.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/use-item-library.ts)):** Tách toàn bộ logic tải và tự động điền dữ liệu từ thư viện vật tư sang custom hook riêng, giúp modal [`ItemFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-form-modal.tsx) giảm xuống còn 266 dòng (tuân thủ nghiêm ngặt **Rule 3** < 300 dòng).
  - **Xóa Mặt Hàng An Toàn Bằng Modal & Bắt Lỗi Chuẩn Doanh Nghiệp ([`delete-item-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/delete-item-modal.tsx), [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/page.tsx)):**
    - **Modal Xác Nhận Xóa Chuyên Dụng (`DeleteItemModal`):** Thay thế hoàn toàn hộp thoại mặc định của trình duyệt (`window.confirm`) bằng Modal xác nhận tiêu chuẩn, hiển thị chi tiết mã vật tư, tên quy cách, số lượng tồn thực tế và số lượng đang giữ chỗ trước khi người dùng ra quyết định.
    - **Tận dụng `showErrorToast` từ `@/utils`:** Thay thế các chuỗi lỗi Axios thô (như *"Request failed with status code 400"*) bằng helper chuẩn của dự án `showErrorToast`, trích xuất thông điệp nghiệp vụ chính xác do Backend trả về (`data.error.message` / `data.detail` - ví dụ: *"Không thể xóa mặt hàng đang còn tồn kho (1.0 pcs)..."*).
    - **Giữ `page.tsx` ở mức 286 dòng:** Tuân thủ nghiêm ngặt **Rule 3** (< 300 dòng).

- **Tích Hợp Tra Cứu Thư Viện Vật Tư Khi Khai Báo Mặt Hàng Kho Mới ([`item-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-form-modal.tsx), [`item-library-selector.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-library-selector.tsx)):**
  - **2 Chế độ nhập liệu linh hoạt:** Hỗ trợ nút gạt chuyển đổi tức thì giữa *"Chọn từ Thư Viện"* (Quick Select) và *"Nhập Thủ Công"* (Manual Mode).
  - **Tra cứu Profile & Bảng màu theo Hãng:** Khi chọn phân loại "Nhôm thanh Profile", hệ thống tải danh sách Hãng (`getBrands`), cho phép chọn Thanh Profile (`ProfileBar`: mã thanh, tên thanh, tỷ trọng kg/m) và Bảng màu thực tế của hãng (`BrandColor`: Trắng sứ, Xám ghi, Nâu cafe...).
  - **Tự động sinh thông số vật tư (Auto-fill):** Tự động sinh mã vật tư chuẩn (`C3209_TRANG`), tên quy cách, chiều dài cây (6000mm), ĐVT (`Cây`), và tự động tính giá vốn ước tính theo công thức ngành nhôm: $\text{weightPerM} \times 6.0\text{m} \times \text{đơn giá nhôm/kg}$ của màu đó.
  - **Tra cứu Phụ kiện kim khí:** Khi chọn phân loại "Phụ kiện", hệ thống tải toàn bộ danh mục phụ kiện (`Accessory`), tự động điền mã, tên, đơn vị tính và giá niêm yết.
  - **Khóa các trường tự sinh khi chọn Thư Viện (`disabled`):** Khi ở chế độ *"Chọn từ Thư Viện"*, các trường Mã vật tư kho (`itemCode`), Tên mặt hàng (`itemName`), Đơn vị tính (`unit`) và Chiều dài tiêu chuẩn (`standardLengthMm`) được tự động khóa (`disabled`) với nền xám nhạt và badge *"Tự động từ thư viện"*, ngăn ngừa rủi ro sửa sai lệch định danh kỹ thuật. Người dùng chỉ cần nhập/điều chỉnh giá vốn, tồn ban đầu, vị trí kệ và định mức tối thiểu.
  - **Chuẩn hóa Đơn vị tính bằng Selectbox khi Nhập Thủ Công:** Khi chuyển sang chế độ *"Nhập Thủ Công"*, ô nhập đơn vị tính chuyển sang `<Select>` với danh mục đơn vị chuẩn hóa theo **Rule 14** (`STANDARD_UNIT_OPTIONS`: Cây, Cái, Bộ, Mét, Chiếc, Đôi, Cuộn, Hộp, Chai/Lọ, Tấm, Kg), ngăn lỗi chính tả phân mảnh dữ liệu.
  - **Hiển Thị Cột Hãng & Màu Sắc Độc Lập Trên Bảng Danh Mục Tồn Kho ([`stock-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/stock-tab.tsx)):**
    - Bổ sung 2 cột riêng biệt *"Hãng"* và *"Màu sắc"* bên cạnh cột Phân loại, hiển thị trực quan bằng các badge định danh (`brandName`, `colorName`) được trích xuất từ quan hệ thực thể DB (`ProfileBar.brand` và `BrandColor`).
    - Giữ nguyên cấu trúc tên mặt hàng đầy đủ (`itemName`) phục vụ in ấn phiếu kho giấy và tra cứu nhanh.
    - Chuẩn hóa hiển thị ĐVT bằng hàm `toDisplayUnit(item.unit)` theo **Rule 14**.
  - **Khắc Phục Lỗi Chặn Nhập Đơn Giá/Số Lượng Lẻ Trên Bảng Phiếu Kho ([`receipt-items-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-items-table.tsx), [`receipt-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-modal.tsx)):**
    - Sửa thuộc tính `step="1000"` thành `step="any"` trên ô Đơn giá (`unitPrice`), cho phép lưu các mức giá lẻ tính toán tự động từ BOM (ví dụ: `721.800đ`) mà không bị trình duyệt bật tooltip cảnh báo chặn submit *"Hai giá trị hợp lệ gần nhất là 721000 và 722000"*.
    - Bỏ ràng buộc `required` cứng trên input số lượng và thêm `noValidate` vào thẻ `<form>`, chuyển toàn bộ cơ chế kiểm tra dữ liệu sang JavaScript/toast notification thân thiện.
  - **Cảnh Báo & Chặn Nhập Kho Thanh Nhôm Chưa Gán Profile Trong Kiểm Tra Thiếu Hụt (JIT Check) ([`shortage-checker-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/shortage-checker-modal.tsx), [`warehouse.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/warehouse.ts)):**
    - **Tên hiển thị chuẩn xác và trực quan:** Thanh nhôm chưa được cấu hình profile trong thiết kế cửa được gắn tên rõ ràng: `Thanh nhôm chưa gán profile (Cần cấu hình trong thiết kế cửa)` thay vì chuỗi trần "Chưa cấu hình".
    - **Banner cảnh báo cho người thiết kế:** Hiển thị khung cảnh báo màu vàng nổi bật trên bảng kết quả kiểm tra thiếu hụt, nhắc nhở mở Door Studio để hoàn thiện cấu hình profile thanh trước khi tiến hành sản xuất.
    - **Đánh dấu trực quan dòng chưa gán:** Dòng thanh chưa cấu hình được tô sáng màu vàng nhạt, gắn badge `Chưa gán` tại cột mã vật tư và gợi ý hành động cụ thể.
    - **Chặn đưa vào phiếu mua / nhập kho:** Khi bấm *"Lập Phiếu Mua Bù JIT"*, hệ thống tự động lọc bỏ các thanh chưa gán profile, chỉ đưa các vật tư đã có profile hợp lệ sang phiếu mua và phát thông báo cảnh báo người dùng. Nếu toàn bộ vật tư thiếu đều chưa gán profile, hệ thống chặn tạo phiếu hoàn toàn.
    - **Hiển thị '-' cho Đơn giá dự kiến của thanh chưa cấu hình:** Triệt tiêu số tiền ước tính ảo, hiển thị dấu `-` tại cột Đơn giá dự kiến khi vật tư chưa được gán profile cụ thể.
  - **Hỗ Trợ Tính Năng "Tạo & Duyệt Ngay" Cập Nhật Tồn Kho Tức Thì ([`receipt-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-modal.tsx), [`warehouse_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/warehouse/warehouse_service.py)):**
    - Modal lập phiếu kho cung cấp 2 hành động rõ ràng:
      - *"Lưu Nháp"*: Tạo phiếu ở trạng thái `draft` để thủ kho kiểm đếm sau.
      - *"Tạo & Duyệt Ngay"*: Tự động kích hoạt cơ chế duyệt nguyên tử (`approve_immediately = true`) ngay trong 1 giao dịch API duy nhất, lập tức cộng tồn thực tế (`current_stock`) và tăng khả dụng (`available_stock`) mà không cần sang tab khác duyệt thủ công.
  - **Tự Động Nhận Diện Hãng Nhôm & Phân Loại Chính Xác Từ JIT ([`warehouse_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/warehouse/warehouse_service.py), [`shortage-checker-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/shortage-checker-modal.tsx)):**
    - Truyền đầy đủ `itemType` (`profile` / `accessory`) và `profileBarId` từ bảng kiểm tra thiếu hụt JIT sang phiếu nhập kho.
    - Cơ chế Backend tự động dò tìm `ProfileBar` theo tiền tố mã thanh (ví dụ: `C3209_1` $\rightarrow$ khớp thanh `C3209`), tự động liên kết `profile_bar_id` giúp cột Hãng nhôm (`brandName`) hiển thị chuẩn xác thay vì để trống `-`.
    - Tự động gán vị trí lưu kho mặc định (`Kệ nhôm A1` cho profile, `Kệ phụ kiện B1` cho phụ kiện) và đồng bộ hóa toàn bộ các bản ghi vật tư cũ trong DB.
  - **Tuân thủ Clean Code & Rule 3:** Tách khối điều khiển chọn thư viện sang component con [`ItemLibrarySelector`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-library-selector.tsx) (105 dòng) và khối trường nhập liệu sang [`ItemFormFields`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-form-fields.tsx) (184 dòng), đảm bảo modal chính [`ItemFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-form-modal.tsx) chỉ còn 283 dòng (< 300 dòng). Bảng tồn kho [`StockTab`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/stock-tab.tsx) đạt 244 dòng (< 300 dòng), [`ReceiptFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-modal.tsx) đạt 290 dòng (< 300 dòng).

- **Nâng Cấp Bảng Nhập/Xuất Kho Thông Minh (Autocomplete, JIT Zero-Typing & Import File) ([`receipt-items-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-items-table.tsx), [`receipt-item-combobox.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-item-combobox.tsx), [`excel-template.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_utils/excel-template.ts)):**
  - **Đồng Bộ Dữ Liệu JIT Sang Bảng Lập Phiếu Nhập Kho (Zero-Typing Toàn Diện):**
    - **Mapping Đơn Vị Tính 2 Chiều Chuẩn Rule 14 ([`unit-mapping.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_utils/unit-mapping.ts)):** Tự động chuyển đổi mã Backend tiếng Anh (`bar`, `pcs`, `meter`, `set`, `pair`...) sang nhãn tiếng Việt thân thiện (`Cây`, `Cái`, `Mét`, `Bộ`, `Đôi`...) trên giao diện người dùng; đồng thời chuẩn hóa ngược lại sang mã tiếng Anh khi submit dữ liệu lên API.
    - **Khớp Dữ Liệu Ô Tìm Kiếm (`ReceiptItemCombobox`):** Bổ sung props `selectedItemCode` và `selectedItemName`, hiển thị nhãn định danh `[MÃ] Tên vật tư` ngay cả khi mặt hàng vừa bóc tách từ dự án chưa tồn tại sẵn trong danh mục tồn kho xưởng.
    - **Tính Đơn Giá Dự Toán & Map Giá Tự Động ([`warehouse_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/warehouse/warehouse_service.py)):** Trích xuất đơn giá từ `AccessoryBOMItem.unit_price` cho phụ kiện; tự động tính đơn giá cây nhôm theo tỷ trọng danh định $\times 6.0\text{m} \times \text{giá nhôm/kg}$ theo màu sơn; ưu tiên giá vốn kho `cost_price` nếu đã có hàng.
    - **Bổ Sung Cột Màu Sắc & Tự Động Fill Màu Theo Hãng Nhôm ([`warehouse_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/warehouse/warehouse_service.py)):** Thêm cột "Màu sắc" trên bảng lập phiếu và bảng đối soát thiếu hụt; cơ chế tự động quét sang danh mục màu của Hãng nhôm (`brand_colors`) để tự động gán màu mặc định (`is_default == True`, ví dụ: *Trắng sữa*, *Xám ghi*...) khi vị trí cửa chưa chọn màu cụ thể; đồng thời hỗ trợ danh sách gợi ý màu sắc thông dụng qua `<datalist>`.
  - **Khắc Phục Triệt Để Lỗi Popup Bay Từ Góc Trái Trên (`ReceiptItemCombobox`):**
    - Đồng bộ hóa tính toán tọa độ `getBoundingClientRect()` thông qua hàm `openDropdown()` ngay trước khi `setIsOpen(true)`, triệt tiêu hoàn toàn độ trễ render giữa frame đầu tiên (tọa độ mặc định 0,0) và hook `useEffect`.
    - Bổ sung điều kiện chặn render `dropdownPos.width > 0` ngăn menu nổi xuất hiện khi chưa đo đạc được kích thước thực tế của ô input.
    - Tinh chỉnh hiệu ứng hiển thị sang `animate-in fade-in duration-75` giúp menu xuất hiện tức thì, mượt mà và bám sát phía dưới ô nhập liệu.
  - **Định Vị Menu Tìm Kiếm Nổi Bằng Portal (`createPortal`):** Chuyển đổi dropdown gợi ý của [`ReceiptItemCombobox`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-item-combobox.tsx) ra ngoài `document.body` với tọa độ `fixed` (`getBoundingClientRect()`), giải quyết triệt để lỗi menu bị khung viền bảng `overflow-x-auto` cắt ngang và che mất nội dung.
  - **Bóc Tách Toàn Diện Danh Mục Nhu Cầu Kiểm Tra Thiếu Hụt JIT ([`warehouse_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/warehouse/warehouse_service.py)):**
    - Mở rộng hàm `check_shortage` để gom toàn diện: Thanh nhôm chính (`bars`), Thanh nẹp nhôm (`beads`), Con ke góc liên kết (`corner_joints`) và Phụ kiện vận hành (`accessories`).
    - Báo cáo thiếu hụt JIT nay phản ánh chính xác 100% tất cả các loại thanh nhôm và phụ kiện cấu thành nên bộ cửa dự án.
  - **Nhập hàng loạt qua File (.CSV/Excel):**
    - Cung cấp nút **"Tải Mẫu (.CSV)"** chuẩn UTF-8 có BOM chống lỗi font tiếng Việt trên Microsoft Excel với các cột: Mã vật tư, Tên vật tư, ĐVT, Số lượng, Đơn giá, Ghi chú.
    - Cung cấp nút **"Nhập File (.CSV)"** tự động phân tích file, đối soát mã vật tư đã có trong kho và nạp hàng loạt vào bảng lập phiếu chỉ với 1 click.
  - **Tối ưu Luồng JIT Zero-Typing:** Kết nối từ kết quả kiểm soát thiếu hụt dự án (`ShortageCheckerModal`) sang thẳng form lập phiếu nhập kho `ReceiptFormModal`. Tự động gán ghi chú dự án, tự khớp mã vật tư trong danh mục kho để điền trước đơn giá vốn và tự động gợi ý nhà cung cấp tương ứng (nhôm hoặc phụ kiện).

- **Đồng Bộ Hóa Toàn Diện 100% Modals Sang Component Dùng Chung ([`_components/modals/`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals)):**
  - Loại bỏ hoàn toàn các cấu trúc thẻ `div` bọc overlay tự dựng (`fixed inset-0 z-50...`); chuyển đổi toàn bộ 8 modal sang sử dụng component dùng chung chuẩn kiến trúc [`Modal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/modal/modal.tsx) (`@/components`).
  - Tận dụng cơ chế `createPortal` đưa modal ra ngoài gốc `document.body`, triệt tiêu lỗi đè `z-index` và giật layout do `overflow` từ các thành phần cha.
  - Tích hợp hiệu ứng chuyển động mượt mà của `framer-motion`, tự động khóa cuộn trang (`body scroll lock`), hỗ trợ phím tắt `Escape`, đóng khi nhấp backdrop và tự động tối ưu giao diện toàn màn hình trên thiết bị di động (`fullScreenMobile`).
  - Các modal được đồng bộ: [`SupplierFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-form-modal.tsx), [`SupplierDetailModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-detail-modal.tsx), [`ReceiptFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-form-modal.tsx), [`ReceiptDetailModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/receipt-detail-modal.tsx), [`ItemFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/item-form-modal.tsx), [`OffcutFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/offcut-form-modal.tsx), [`GlassOrderGenerateModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/glass-order-generate-modal.tsx), [`ShortageCheckerModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/shortage-checker-modal.tsx).

- **Nâng Cấp Quản Lý Nhà Cung Cấp & Sửa Lỗi Dropdown ([`suppliers-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/suppliers-tab.tsx), [`supplier-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-form-modal.tsx), [`supplier-detail-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-detail-modal.tsx)):**
  - **Sửa triệt để lỗi Dropdown "Không tìm thấy kết quả":** Chuyển đổi toàn bộ việc truyền thẻ con `<option>` sang truyền mảng prop `options={[...]}` tương thích 100% với component dùng chung [`Select`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/select/select.tsx) trên tất cả các tab và form modal của module kho.
  - **Chức năng Sửa & Xóa Nhà Cung Cấp:** 
    - Bổ sung API Backend `DELETE /api/v1/warehouse/suppliers/{id}` trong [`warehouse.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/api/v1/project/warehouse/warehouse.py) và `delete_supplier` trong [`warehouse_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/warehouse/warehouse_service.py) có cơ chế rollback và bảo vệ khóa ngoại an toàn.
    - Cập nhật actions frontend [`updateWarehouseSupplier`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/warehouse/index.ts) và [`deleteWarehouseSupplier`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/warehouse/index.ts).
    - Mở rộng [`SupplierFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-form-modal.tsx) hỗ trợ cả chế độ Tạo mới và Cập nhật (`initialData`).
  - **Modal Chi Tiết Đối Tác & Danh Mục Hàng Cung Cấp ([`SupplierDetailModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/modals/supplier-detail-modal.tsx)):**
    - Hiển thị đầy đủ thông tin pháp lý, mã số thuế, số điện thoại, ngân hàng và địa chỉ.
    - Tab 1: Tra cứu danh mục các mặt hàng vật tư trong kho do đối tác cung cấp theo phân loại nghiệp vụ (`profile`, `accessory`, `consumable`, `glass`).
    - Tab 2: Lịch sử các phiếu nhập kho đã nhập từ đối tác này kèm trạng thái và ngày tạo.
  - **Bổ sung cột Thao tác trên bảng Nhà cung cấp:** Thêm các nút chức năng Xem chi tiết mặt hàng, Sửa và Xóa trực quan.

- **Tái Cấu Trúc Toàn Diện Module Quản Lý Kho Vật Tư & Chuỗi Cung Ứng ([`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/page.tsx), [`_components/`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/warehouse/_components/)):**
  - **Kiến trúc module hóa chuẩn Clean Code:** Chuyển đổi mã nguồn nguyên khối 909 dòng thành kiến trúc phân tách rạch ròi gồm 14 files chuyên biệt (< 300 dòng/component, < 30 dòng/hàm) kết nối qua bộ điều phối trung tâm `WarehouseManagementPage` (268 dòng).
  - **Triệt tiêu toàn bộ Browser Dialogs:** Loại bỏ 100% `alert()` và `confirm()` nguyên thủy của trình duyệt; chuyển đổi sang hệ thống thông báo trạng thái `react-hot-toast` và dialog xác nhận nguyên tử.
  - **5 Phân Hệ Quản Trị Nghiệp Vụ Kho:**
    1. *Tồn kho & Định mức (`StockTab`):* Hiển thị bảng tồn kho chi tiết (Tồn thực tế `currentStock`, Đang giữ chỗ `reservedQty`, Khả dụng `availableStock`, Định mức an toàn `minStockLevel`), bộ lọc phân loại (`WAREHOUSE_ITEM_TYPE_MAP`), tìm kiếm đa năng và toggle lọc nhanh cảnh báo sắp hết hàng `isLowStock`.
    2. *Phiếu Nhập / Xuất kho (`ReceiptsTab`, `ReceiptFormModal`, `ReceiptDetailModal`, `ReceiptItemsTable`):* Hỗ trợ lập phiếu kho nhiều dòng (multi-item) tự động tính toán tổng tiền, chọn nhanh vật tư có sẵn, quản lý trạng thái phiếu theo vòng đời (`RECEIPT_STATUS_MAP`), duyệt phiếu nguyên tử (`approveWarehouseReceipt`) và hủy phiếu giải phóng giữ chỗ (`cancelWarehouseReceipt`).
    3. *Kho nhôm Đề-xê tái sử dụng (`OffcutsTab`, `OffcutFormModal`):* Quản lý thanh nhôm đề-xê $\ge 1.0\text{m}$ (1000mm) phục vụ bài toán tối ưu cắt 1D (Cutting Stock Problem), lưu trữ vị trí kệ giá và liên kết giữ chỗ theo kế hoạch cắt.
    4. *Danh bạ Nhà cung cấp (`SuppliersTab`, `SupplierFormModal`):* Quản lý đối tác nhôm, phụ kiện, nhà máy tôi kính và vật tư tiêu hao (`SUPPLIER_TYPE_MAP`) kèm đầy đủ thông tin liên hệ, mã số thuế và tài khoản ngân hàng.
    5. *Đặt kính nhà máy tôi (`GlassOrdersTab`, `GlassOrderGenerateModal`, `GlassPanesDetailTable`):* Bóc tách quy cách kính theo dự án/lệnh sản xuất, giám sát danh sách tấm kính (kích thước, mài cạnh, diện tích $m^2$, cảnh báo bản vẽ bị sửa sau bóc tách `isRevisionStale`), gửi đơn cho nhà máy tôi và xác nhận nhận kính về xưởng.
  - **Kiểm soát thiếu hụt vật tư JIT (`ShortageCheckerModal`):* Rà soát tồn kho dự án theo thời gian thực (`checkProjectMaterialShortage`), phát hiện thiếu hụt và chuyển thẳng danh mục cần mua sang form lập phiếu nhập JIT chỉ với 1 click.
  - **Chuẩn hóa dữ liệu API:** Tuân thủ 100% camelCase cho dữ liệu nhận từ backend và hiển thị tiếng Việt thân thiện qua từ điển ánh xạ (zero snake_case fallback).
  - **Tối ưu Layout tràn viền & Nâng cấp Thẻ thống kê (`StatsCard`):**
    - Loại bỏ lớp giới hạn `max-w-7xl mx-auto`, đồng bộ khung bao `p-4 flex flex-col gap-4 text-slate-800 w-full` mở rộng 100% toàn màn hình tương thích với các trang danh mục khác trong hệ thống.
    - Tái sử dụng triệt để component dùng chung [`StatsCard`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/stats-card.tsx) cho 4 chỉ số kho thay vì tự viết thẻ riêng, tuân thủ nguyên tắc ưu tiên tái sử dụng (Priority Rule).
    - Khắc phục lỗi rớt dòng icon & text trên nút bấm: Nâng cấp container nội dung trong [`Button`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/button/button.tsx) thành `inline-flex items-center gap-1.5`, đồng thời chuyển các icon sang thuộc tính chuẩn `leftIcon` trên tất cả các nút của module kho.

- **Mở Khóa Chia Đố Cánh Đa Cấp & Phân Định Ô Kính Con Trong Cánh Cửa ([`door-tree-utils.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/utils/door-tree-utils.ts), [`sash-type-picker.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/panels/sash-type-picker.tsx), [`useDoorStudioState.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/hooks/useDoorStudioState.ts), [`cad-rectangular-leaf.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/door-studio/cad-engine/components/cad-rectangular-leaf.tsx)):**
  - **Khắc phục lỗi không chia đố cánh được nhiều lần:** Bổ sung helper `isInsideSash(rootCell, cellId)` kiểm tra chuỗi tổ tiên của ô; phân biệt rạch ròi giữa *Vách kính cố định của khung bao ngoài* (`isFixed && !isInsideSash`) và *Ô kính con nằm bên trong cánh cửa* (`isInsideSash`).
  - **Mở khóa giao diện chia đố cánh:** Panel `SashTypePicker` không còn chặn nhầm ô kính con là ô fix khung bao; hiển thị badge trực quan `Ô trong cánh cửa` kèm bộ công cụ chia đố cánh Dọc / Ngang để người dùng chia đố lồng nhau đệ quy nhiều lần (lưới đố chữ T, lưới đố nhiều ô).
  - **Chuẩn hóa Guard Clause:** Cập nhật hàm `handleSplitSashMullion` trong `useDoorStudioState` chỉ chặn khi ô đang chọn là vách kính cố định của khung bao ngoài, cho phép chia đố cánh liên tục trên các ô kính con.
  - **Tương tác trực tiếp trên viền khung cánh:** Bổ sung `onClick` chọn `node.id` khi nhấp vào viền khung nhôm `CadSashBox`, giúp người dùng dễ dàng chuyển đổi qua lại giữa thao tác toàn cánh và thao tác trên từng ô kính con.

## [Unreleased] - 2026-10-10

### Fixed & Enhanced

- **Kiến Trúc Snapshot Cấu Hình Vật Tư & Quan Hệ Độc Lập Cho Vị Trí Cửa Dự Án ([`project_door_positions`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/models/project/core/project_door_position.py), [`project_door_position_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/core/project_door_position_service.py)):**
  - **Khắc phục lỗi trả về null khi gán mẫu cửa vào dự án:** Thêm các cột snapshot độc lập vào bảng `project_door_positions` (`brand_id`, `door_series_id`, `color_id`, `glass_id`, `gasket_id`) kèm khóa ngoại và index, bảo đảm vị trí cửa trong dự án là một instance độc lập (Snapshot & Instance Pattern) thay vì phụ thuộc động vào mẫu cửa catalogue `template_door_id`.
  - **Tự động trích xuất thông số khi tạo cửa (Auto-Resolution & Fallback):** Hàm `_resolve_specs` ưu tiên giá trị người dùng truyền lên; nếu thiếu sẽ tự động trích xuất từ mẫu cửa thư viện `Door`, hệ nhôm `DoorSeries`, và `system_config` (các trường `seriesId`, `colorId`, `glassId`, `gasketId`, `brandId`), đồng thời tự động suy ra `brand_id` từ `door_series.brand_id`.
  - **Bảo lưu `door_type` và `template_door`:** Cho phép `door_type` kế thừa chính xác từ mẫu cửa thư viện (`ck`, `cs`, `cd`...) thay vì bị hardcode ghi đè thành `"door"`. Schema `ProjectDoorPositionResponse` bổ sung `template_door` để frontend hiển thị đầy đủ thông tin mẫu cửa gốc.
  - **Eager Loading quan hệ toàn diện:** Bổ sung `selectinload` cho `brand`, `door_series`, `color`, `glass`, `gasket`, `template_door` trong các hàm truy vấn danh sách, chi tiết, nhân bản (duplicate) và tạo hàng loạt (bulk create), giúp client truy xuất ngay lập tức các đối tượng vật tư mà không bị `null`.
  - **Alembic Migration & Backfill:** Tạo migration [`l7g8h9i0j1k2`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/alembic/versions/l7g8h9i0j1k2_add_spec_columns_to_project_door_positions.py) thêm các cột và tự động backfill dữ liệu `door_series_id`, `brand_id` cho tất cả các vị trí cửa hiện có trong CSDL.
- **Chuyển Đổi Sang Xóa Cứng Vị Trí Cửa Dự Án ([`project_door_position_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/core/project_door_position_service.py)):**
  - **Thực thi Xóa cứng vật lý (Hard Delete):** Thay thế logic gán cờ `deleted_at = datetime.utcnow()` bằng `await db.delete(position)` kèm `await db.commit()`, xóa hoàn toàn bản ghi khỏi Database để tránh xung đột mã `position_code` (Unique Constraint) khi tạo lại vị trí cửa mới cùng mã.
  - **Bảo vệ toàn vẹn khóa ngoại:** Bọc xử lý ngoại lệ `IntegrityError` để rollback và trả về thông báo lỗi rõ ràng nếu vị trí cửa đang có dữ liệu liên kết từ xưởng sản xuất hoặc đơn đặt kính.
  - **Ghi nhận Audit Log:** Lưu trữ nhật ký hoạt động `action_type="delete"` trước khi giải phóng bản ghi khỏi CSDL.
- **Sửa Triệt Để Lỗi AttributeError: 'NoneType' object has no attribute 'get' & Chuẩn Hóa Bóc Tách Đố Cánh BOM ([`door_calculation_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/door/door_calculation_service.py)):**
  - **Triệt tiêu lỗi NoneType:** Bọc phòng thủ toàn diện (Zero-Defect Defensive Programming) cho toàn bộ các hàm giải toán BOM; thay thế triệt để các lệnh `dict.get(key, {})` nguy hiểm (vốn trả về `None` khi dữ liệu JSON chứa giá trị `"key": null`) thành `dict.get(key) or {}` kèm kiểm tra `isinstance(..., dict)`.
  - **Khắc phục lỗi tính ke góc & khung bảo vệ:** Sửa dứt điểm dòng tính góc cắt mở đáy `frame_cfg = system_config.get("frameConfig") or {}` và `sb_cfg = frame_cfg.get("safetyBarsConfig") or {}`, bảo đảm luôn là dictionary hợp lệ.
  - **Phòng vệ mảng danh sách:** Lọc an toàn các phần tử `None` hoặc phần tử không phải dictionary trong mảng `leavesLayout`, `selectedAccessories`, danh sách liên kết `coupling` và danh sách phụ kiện `combo_items`.
  - **Chuẩn hóa duyệt khung và bóc tách đố cánh:** Loại trừ `splitType != 'sash_mullion'` trong hàm duyệt khung `traverse_layout` để tránh nhầm lẫn đố cánh thành đố khung bao ngoài, bảo đảm bóc tách chính xác các thanh nhôm cánh, thanh đố cánh (`category="sash_mullion"`) và các ô kính con.
- **Bảo Vệ Tính Toàn Vẹn Cấu Trúc Khung & Chặn Chia Đố Cánh Trên Ô Fix ([`sash-type-picker.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/sash-type-picker.tsx), [`useDoorStudioState.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/hooks/useDoorStudioState.ts)):**
  - **Khóa bảo vệ logic (Guard Clause):** Hàm `handleSplitSashMullion` kiểm tra nghiêm ngặt loại ô đang chọn; nếu là Vách cố định / ô fix (`sashType === 'fixed'`), hệ thống lập tức từ chối và hiển thị toast nhắc nhở chuyển sang dùng "Chia đố khung" ở tab *Kiểu khung*.
  - **Trạng thái giao diện trực quan:** Khi người dùng chọn ô fix, box "Chia đố cánh" hiển thị badge cảnh báo màu hổ phách `⚠️ Không áp dụng cho ô fix` kèm dòng hướng dẫn chi tiết, ẩn/vô hiệu hóa các nút chia đố cánh để tránh thao tác nhầm.
- **Tương Tác Kéo Thả Điều Chỉnh Kích Thước Đố Khung & Đố Cánh Trực Tiếp Trên Canvas CAD 2D ([`cad-split-resizer.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-split-resizer.tsx), [`door-cad-renderer.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx), [`cad-tree-traverser.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/cad-tree-traverser.ts)):**
  - **Kéo trượt bằng chuột trái (Left-Click Drag):** Khắc phục lỗi sự kiện `onMouseDown` chỉ bắt chuột phải (`e.button === 2`); hiện tại người dùng có thể nhấp giữ chuột trái và kéo trượt thanh đố một cách tự nhiên.
  - **Cơ chế phân biệt thông minh Click tĩnh vs Kéo trượt (Click-vs-Drag):** Nhấp chuột tại chỗ ($< 3\text{px}$) sẽ mở modal thanh tra thông số đố (`MullionInspectorModal`). Khi kéo rê ($\ge 3\text{px}$), hệ thống kích hoạt chế độ kéo trượt di chuyển đố với phản hồi mượt mà và không bật modal làm phiền.
  - **Hợp nhất tương tác Đố Cánh (Sash Mullions):** Trích xuất danh sách thanh đố cánh (kể cả phân chia đệ quy nhiều cấp) và đưa vào chung layer `<CadSplitResizer>` ở lớp trên cùng của SVG; đố cánh giờ đây có đầy đủ con trỏ `col-resize` / `row-resize`, hitbox nhạy bén, highlight màu hổ phách/xanh và thanh đo kích thước động.
  - **Quy đổi tọa độ màn hình chuẩn xác qua SVG CTM (`getScreenCTM`):** Khóa bám dính vị trí thanh đố theo đầu con trỏ chuột 1:1, loại bỏ hiện tượng trôi lệch khi thu phóng cửa sổ.
  - **Kích thước tối thiểu thích ứng linh hoạt (Adaptive Min Dimension):** Loại bỏ giới hạn cứng `minDim = 100mm`, chuyển sang công thức động `Math.min(50, Math.max(20, Math.floor(totalDim * 0.15)))` giúp các ô đố cánh nhỏ ($\le 200\text{mm}$) di chuyển trơn tru không bị khóa cứng.
  - **Đồng bộ hóa mảng `sashMullions.positions`:** Cập nhật đồng bộ kích thước mảng vị trí khi đố cánh được kéo trượt hoặc thay đổi thông số.

## [Unreleased] - 2026-10-09

### Added & Enhanced

- **Tích Hợp Giao Diện Quản Lý & Thư Viện Mặt Cắt Profile Nhôm Chuẩn Windova 1:1 ([`profile-bar-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/profile-bars/_components/profile-bar-modal.tsx), [`profile-section-library-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/profile-bars/_components/profile-section-library-modal.tsx), [`profile-bar-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/profile-bars/_components/profile-bar-table.tsx)):**
  - **Khối Mặt Cắt Profile Trung Tâm (Windova Header):** Hiển thị ô vuông trực quan render vector SVG mặt cắt nhôm (`svgPathData` & `viewBox`), nút đỏ `✕` gỡ bỏ mặt cắt và nhãn `SVG (Vector)`. Click vào ô kích hoạt mở Modal Thư viện mặt cắt.
  - **Modal "Thư viện mặt cắt SVG" Độc Lập:**
    - Thanh công cụ tìm kiếm theo tên và lọc theo phân loại (Khung bao, Cánh cửa, Đố chia, Nẹp kính, Ray trượt...).
    - Toggle checkbox `Sửa mặt cắt` bật/tắt chế độ quản trị cho phép xóa mặt cắt khỏi thư viện.
    - Nút `📥 Tải lên file mới` hỗ trợ chọn file vector `.svg`, tự động phân tích cú pháp XML/SVG trích xuất `viewBox` và đường vẽ vector `path d="..."` để tạo mới bản ghi `ProfileSection`.
    - Lưới thẻ card 4 cột trực quan hiển thị hình vẽ SVG, tên, mã, badge số lượng profile đang sử dụng (`X profile`) và badge loại thanh. Click để chọn và gán mặt cắt ngay lập tức.
  - **Tối Ưu Form Sửa/Thêm Profile Nhôm:** Tái cơ cấu layout gọn gàng chuẩn Windova: Hãng nhôm · Serie cửa · Chiều dài $\rightarrow$ Mã thanh · Tên thanh · Phân loại $\rightarrow$ Khung "Thông số kích thước & tỷ trọng" (Tỷ trọng, Chiều cao tiết diện, Trừ cánh, Trừ nẹp, Trừ kính, Trừ đố chia).
  - **Thumbnail Mặt Cắt Trên Bảng Danh Sách (`ProfileBarTable`):** Hiển thị mini vector SVG ngay cạnh mã thanh nhôm ở cột đầu tiên, giúp kỹ sư xưởng nhận diện tiết diện thanh nhôm trực quan trong nháy mắt.

## [Unreleased] - 2026-10-05

### Added & Enhanced

- **Đồng Bộ Hóa Động Nhóm Kiểu Mở Cánh (Sash Family) Theo Loại Cửa & Khắc Phục Lỗi Hardcode Cố Định ([`config-sash-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/config/config-sash-tab.tsx), [`useDoorStudioState.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/hooks/useDoorStudioState.ts), [`studio-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx)):**
  - **Khắc phục chuỗi tĩnh cố định:** Xóa bỏ text hardcode `"▾ Cánh cửa sổ mở quay / hất / lật"` trên thanh tiêu đề màu xanh; chuyển sang hiển thị động 100% theo trường `config.family` (`▾ Cánh ${config.family || 'cửa'}`).
  - **Đồng bộ tự động theo loại cửa (`door.type`):** Khi nạp hoặc chuyển đổi loại cửa là Cửa đi (`cd`), hệ thống tự động gán `family = 'Cửa đi mở quay'`; khi là Cửa sổ (`cs`), tự động gán `family = 'Cửa sổ mở quay/Hất'`.
  - **Chuẩn hóa nhãn phân loại cánh:** Cập nhật nhãn `Loại cánh (${config.family})` và 2 nút lựa chọn chung `Cánh tiêu chuẩn` / `Cánh vô cực (Slim)` tương thích hoàn hảo cho mọi hệ cửa (Cửa đi, Cửa sổ, Cửa lùa, Cửa xếp trượt).

- **Tích Hợp Toàn Diện Module "2B. Khung Bảo Vệ" Chuẩn Windova ([`config-frame-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/config/config-frame-tab.tsx), [`studio-types.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-types.ts), [`cad-safety-bars.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-safety-bars.tsx), [`door-cad-renderer.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx)):**
  - **Giao diện cấu hình Card 2B chuyên nghiệp:** Bổ sung Card `2B Khung bảo vệ` với công tắc Switch bật/tắt độc lập và 3 Preset:
    1. `4 cạnh · Bằng khung` (`equal_frame`): Cấu hình Profile khung, Góc ghép (`Ghép 45°` | `90° Dọc phủ`), hiển thị Section profile tự động và chọn Profile Đố chia (Cây dọc, Cây ngang).
    2. `4 cạnh · Lọt lòng` (`inset`): Cấu hình thêm trường `Độ hở lắp lọt lòng (mm)` (mặc định 3mm) kèm chú thích trừ tự động.
    3. `Không khung` (`no_frame`): Cấu hình thanh nan bảo vệ trực tiếp (Cây dọc, Cây ngang).
  - **Cảnh báo thông minh khác Serie:** Tự động phát hiện và hiển thị nhãn cảnh báo `⚠️ khác serie` khi người dùng chọn profile nhôm khác với hệ nhôm chính của cửa.
  - **Giữ bản vẽ CAD 2D sạch đẹp chuẩn kỹ thuật:** Không vẽ các nan đan chéo/lưới đè lên mặt kính và đố cửa trên CAD 2D nhằm tránh gây rối mắt và che khuất kết cấu cửa, toàn bộ dữ liệu kích thước cắt nhôm và con ke của Khung bảo vệ được chuyển giao cho Backend bóc tách chính xác trong BOM.

- **Chuẩn Hóa Đồ Họa Cửa Vòm 2 Cánh Mở Quay & Sửa Triệt Để Lỗi Mối Cắt Mòi 45° ([`cad-curved-door.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-curved-door.tsx), [`cell-inspector.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/cell-inspector.tsx), [`studio-types.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-types.ts)):**
  - **Góc vát mòi 45° chuẩn xác ở đỉnh vòm (Apex - Hình 2):** Thay thế thanh chữ nhật bằng đa giác `polygon` vát mòi 45° nhọn lên tận đỉnh dạ vòm `(xMid, oy + frameD)` cho cả 2 cánh trái/phải; xóa bỏ nét ngang cắt ngang đố đứng, giữ lại đường chỉ tim đứng phân cách giữa 2 cánh và mối nối nẹp kính vuông vắn sạch sẽ.
  - **Khắc phục lỗi đan chéo chữ X / bát quái ở chân tim giữa 2 cánh:** Cho 2 thanh đố đứng trung tâm chạy thẳng xuống tận chân cánh, 2 thanh cánh ngang đáy đâm vuông góc 90° vào thanh đứng; nẹp đứng và nẹp ngang đáy khớp kín 100%, xóa bỏ toàn bộ các đường chéo dị dạng và ô vuông cắt chéo ở chân tim.
  - **Chuẩn hóa mối ghép chân khung bao 90° & mòi cánh 45° (Hình 2 Windova):** Loại bỏ hoàn toàn các khối chữ nhật `<rect>` vẽ đè gây lỗi xuất hiện đồng thời cả đường cắt 90° và 45° ở góc cánh; chân khung bao ngoài hiển thị 1 đường đứng 90° duy nhất, góc cánh và nẹp kính chỉ có 1 đường mòi 45° đồng quy sắc nét.
  - **Sửa triệt để lỗi nét đỏ hình con diều:** Đặt đỉnh nhọn 2 bên tại trung điểm chiều cao lòng cánh `yHingeMid = (yOpeningTop + yOpeningBot) / 2`, tạo thành hình thoi mở quay đối xứng, cân đối 100% cho mọi kích thước cửa ($H=1600, 2350...$).
  - **Tích hợp Panel "Cấu hình vòm / góc" ở thanh bên phải:**
    - Bán kính $R$ (mm): Tự động tính theo $W / 2$ hoặc cho phép người dùng tùy biến nhập $R$.
    - Cắt vòm tại đỉnh: Checkbox bật/tắt vết cắt nối tại tim đỉnh khung bao nhôm.
    - Kẹp phôi (mm): Mặc định 400mm, tính toán phần chiều dài cây nhôm hao hụt khi uốn.
  - **Chuẩn hóa tay nắm mở quay:** Render duy nhất 1 tay nắm trên cánh chính, hỗ trợ 4 kiểu (`lever`, `multipoint`, `pull`, `crescent`) đồng bộ với sidebar phải.

- **Hoàn Thiện Tùy Chọn Cấu Hình & Bóc Tách Đố Chia Dọc / Ngang Riêng Biệt ([`config-frame-tab.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/config/config-frame-tab.tsx)):**
  - **Tách biệt 2 trường lựa chọn Profile:** Khi chọn chế độ "Dọc / Ngang riêng", giao diện hiển thị 2 dropdown độc lập: "Đố đứng (Dọc)" (`mullionVertProfileId`) và "Đố ngang" (`mullionHorizProfileId`), thay vì chỉ hiển thị 1 dropdown chung như trước.
  - **Đồng bộ hóa 2 chiều:** Tự động fallback về profile chung `mullionProfileId` khi chưa cấu hình riêng lẻ, giúp chuyển đổi qua lại giữa các chế độ mượt mà không bị mất dữ liệu.

- **Engine CAD Đồ Họa 2D Hỗ Trợ Đầy Đủ Góc Cắt Ngàm Nẹp 90° & 45° ([`cad-bead.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-bead.tsx), [`cad-rectangular-leaf.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-rectangular-leaf.tsx)):**
  - **Hỗ trợ 2 kiểu ghép nẹp chuẩn xưởng:**
    - **Cắt 90° (Butt Joint):** Nẹp đứng chạy suốt chiều cao ô kính, 2 nẹp ngang ăn vuông góc 90° sập vào giữa 2 nẹp đứng.
    - **Cắt 45° (Miter Joint):** Ghép mòi 45° chuẩn xác tại 4 góc ô kính.
  - **Liên kết động với thuộc tính ô:** `cad-rectangular-leaf.tsx` truyền trực tiếp `node.beadJoint` vào `renderCadBead`, phản hồi trực quan ngay lập tức trên bản vẽ khi người dùng chuyển đổi góc cắt ở bảng bên phải.

## [Unreleased] - 2026-10-01

### Changed & Refactored

- **Chuẩn Hóa Hợp Đồng Dữ Liệu Phụ Kiện & Loại Bỏ Lỗi `Phụ kiện #undefined` / `NaN đ` ([`useDoorStudioState.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/hooks/useDoorStudioState.ts), [`selected-items-panel.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/accessories/selected-items-panel.tsx)):**
  - **Đồng bộ chuẩn hợp đồng 2 mảng độc lập:**
    - `selectedComboIds: number[]`: Nạp và lưu danh sách ID các gói combo chuẩn gán cho cửa.
    - `selectedAccessories: SelectedAccessoryItem[]`: Chỉ chứa phụ kiện rời thực sự (`{ accessoryId, quantity, note }`).
  - **Khắc phục triệt để lỗi hiển thị:** Loại bỏ hoàn toàn tình trạng các combo cũ bị đọc nhầm thành phụ kiện rời gây ra các dòng `Phụ kiện #undefined`, `NaN đ`, `NaN Phụ kiện rời` và cảnh báo duplicate key trên console.
  - **Gán `key` duy nhất an toàn:** Cập nhật key trong `SelectedItemsPanel` dạng `sel-acc-${item.accessoryId}-${idx}` ngăn chặn lỗi rendering trong mọi tình huống.

- **Chuyển Đổi 100% Thương Hiệu Phụ Kiện & Phân Loại Sang Dữ Liệu Động Từ CSDL ([`types.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/accessories/types.ts), [`accessories-tab-view.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/accessories-tab-view.tsx), [`useDoorStudioState.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/hooks/useDoorStudioState.ts)):**
  - **Xóa Bỏ Mảng Tĩnh `KNOWN_BRANDS`:** Xóa hoàn toàn danh sách thương hiệu fix cứng trong code frontend. 100% thương hiệu hiển thị trên dải Filter Pills được truy vấn tự động từ bảng `brands` trong CSDL PostgreSQL qua API `getBrands({ limit: 200, isActive: true })`.
  - **Nhận Diện Nhóm Phụ Kiện Chuẩn Xác Từ CSDL:** Hàm `detectComboCategory` phân loại chính xác dựa trên trường `combo.description` lưu chuẩn xưởng (`DANH_CHO:frame` $\rightarrow$ Khung, `DANH_CHO:sash` $\rightarrow$ Cánh, `DANH_CHO:direction` $\rightarrow$ Hướng mở), thay vì phán đoán mơ hồ theo chuỗi.
  - **Khớp Thương Hiệu Combo Động:** `detectComboBrand` ưu tiên ánh xạ `combo.brandId` trực tiếp với bảng `brands` trong DB, kết hợp quét chi tiết từng món vật tư (`comboItems[].brandName`), đảm bảo tính chính xác tuyệt đối và tự động tương thích khi thêm/sửa hãng mới trong CSDL.
  - **Nâng Cấp Query Limit Combo:** Tăng giới hạn query combo từ 100 lên 500 gói để tải trọn vẹn 163 combo thực tế có trong cơ sở dữ liệu.

- **Tái Thiết Kế Toàn Diện Giao Diện Quản Lý Phụ Kiện Trực Quan Chuẩn Xưởng ([`accessories-tab-view.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/accessories-tab-view.tsx)):**
  - **Khắc Phục Triệt Để Khó Khăn Khi Hủy Combo:**
    - Bổ sung bảng **"Chi tiết (X mục đã chọn)"** (`SelectedItemsPanel`) luôn hiện diện cố định ở phía dưới, liệt kê tập trung toàn bộ các combo và phụ kiện đang gán cho cửa.
    - Cung cấp nút `[ ✕ Hủy ]` màu đỏ cạnh từng mục đã chọn: Người dùng có thể xóa/hủy bất kỳ combo nào chỉ bằng **1-click ngay tại bảng**, hoàn toàn không cần phải cuộn chuột tìm kiếm lại trong danh sách 100 combo khả dụng.
    - Tích hợp nút `[ Hủy tất cả ]` giúp dọn sạch toàn bộ phụ kiện chỉ trong 1 thao tác.
    - Trạng thái rỗng hiển thị thông báo hướng dẫn trực quan theo đúng mẫu tham chiếu của người dùng.
  - **Phân Loại Cấu Trúc Cửa & Dải Nhãn Thương Hiệu:**
    - Cụm tab phân loại nhanh: `[ 🚪 Khung ]`, `[ 🪟 Cánh ]`, `[ 🔁 Hướng mở ]`, `[ 📦 Phụ kiện lẻ ]` và `[ Tất cả combo ]`.
    - Dải Brand Pills (`Tất cả`, `3H`, `ALVERO`, `BOGO`, `Cmech`, `Cologe`, `Draho`, `Kinlong`, `Generic`...) cho phép lọc tức thì combo theo nhà sản xuất phụ kiện.
  - **Nút Hành Động Trực Quan Trên Từng Thẻ Combo (`ComboCard`):**
    - Chuyển đổi checkbox nhỏ khó bấm thành nút hành động rõ nét: `[ + Thêm ]` (màu cam/vàng) khi chưa chọn và `[ ✓ Đã thêm ] / [ ✕ Bỏ chọn ]` khi đã chọn.
  - **Tái Cấu Trúc Mã Nguồn Clean Code (Rule 3):**
    - Phân tách file khổng lồ cũ ($539$ dòng) thành module con độc lập tại [`studio/panels/accessories/`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/accessories/):
      - `types.ts` ($70$ dòng): Types và thuật toán nhận diện nhóm Khung/Cánh/Hướng mở & Hãng.
      - `combo-card.tsx` ($95$ dòng): Component thẻ combo với nút Thêm/Đã thêm.
      - `selected-items-panel.tsx` ($180$ dòng): Bảng quản lý các mục đã chọn kèm hủy nhanh.
      - `individual-accessories-view.tsx` ($170$ dòng): Giao diện tìm kiếm và chọn phụ kiện lẻ.
      - `accessories-tab-view.tsx` ($250$ dòng): View orchestrator chính gọn gàng, 100% tuân thủ chuẩn $< 300$ dòng.

- **Tối Giản Hóa Toàn Diện Giao Diện Tab Kết Quả Bóc Tách Vật Tư ([`results-tab-view.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/results-tab-view.tsx)):**
  - **Triệt Tiêu Hoàn Toàn Màu Sắc Lòe Loẹt & Khối Thừa:**
    - Xóa bỏ khối Banner nền gradient xanh tím to cồng kềnh (`blue-700 via-indigo-700 to-slate-800`), loại bỏ tiêu đề lớn *"Bóc tách Kỹ thuật Cắt nhôm & Kính"* và câu mô tả dài dòng không cần thiết.
    - Xóa bỏ 3 ô thẻ KPI lớn cồng kềnh chiếm không gian dọc và toàn bộ các icon màu mè trang trí (`CheckCircle`, `Scale`, `Maximize2`, `Scissors`, emojis ⚠️).
  - **Thanh Thông Số Kỹ Thuật Tinh Gọn 1 Dòng (Compact Technical Ribbon):**
    - Thiết kế thanh Ribbon phẳng thanh lịch nền trắng viền xám (`bg-white border border-gray-200 rounded-lg px-4 py-2.5`), hiển thị thẳng hàng các thông số cốt lõi: Kích thước ($W \times H\text{ mm}$), Diện tích ($\text{m}^2$), Khối lượng nhôm ($\text{kg}$), Diện tích kính ($\text{m}^2$), Tổng thanh cắt xưởng ($\text{thanh}$) và Tỷ trọng ($\text{kg/m}^2$) với phông chữ kỹ thuật monospace sắc nét.
  - **Cảnh Báo Cấu Hình Tối Giản (Minimalist Issue Alert):**
    - Chuyển đổi khối cảnh báo vàng dày cộp sang thanh thông báo phẳng, viền mảnh thanh lịch, liên kết điều hướng text đơn giản `Cấu hình nhôm →` và `Chọn phụ kiện & ke →` không màu mè.
  - **Bảng Cắt Nhôm & Kính Chuẩn Mực Xưởng:**
    - Đồng bộ bảng dữ liệu với tone màu trung tính, loại bỏ các badge và màu chữ phân mảnh (tím, xanh lá, vàng, cam), đưa số lượng và thông số kỹ thuật về màu đen đậm rõ ràng, giúp kỹ sư xưởng đọc số đo cắt nhanh chóng, trực quan.

## [Unreleased] - 2026-09-30

### Added & Enhanced

- **Tối Ưu Trải Nghiệm Studio Thiết Kế Cửa Trên Điện Thoại & Máy Tính Bảng (Mobile & Tablet CAD Experience):**
  - **Triết Lý "Canvas is the Hero" (Vùng Vẽ CAD Chiếm Trọn 100% Màn Hình):**
    - **Desktop ($\ge 1024\text{px}$):** Giữ nguyên vẹn 100% bố cục 3 cột (`ToolboxLeft` $320\text{px}$ + `CanvasCadView` flex-1 + `Right Inspector / BOM` $340\text{px}$).
    - **Mobile & Tablet ($< 1024\text{px}$):** Bản vẽ CAD chiếm $100\%$ chiều rộng và chiều cao hiển thị. Cột công cụ và bảng thuộc tính được chuyển hóa thành hệ thống **Floating Action Bar & Bottom Sheet Drawer**.
  - **Thanh Điều Hướng Nổi (Floating Island Bar) Tiện Dụng Ở Đáy:**
    - Cố định nổi trên Canvas với phong cách Glassmorphism (`backdrop-blur-md bg-slate-900/90 shadow-2xl rounded-full`).
    - Tích hợp 2 nút thao tác nhanh `[ ↩️ Hoàn tác ]` & `[ ↪️ Làm lại ]`.
    - 3 nút mở ngăn kéo Bottom Sheet linh hoạt: `[ 🛠️ Vẽ cửa ]` (chỉnh kích thước W/H, màu nhôm, màu phụ kiện, hình dạng khung, chia đố, ghép khung), `[ 🔍 Ô kính ]` (chọn ô kính, chia đố con, đổi loại cánh, nẹp kính), `[ 📊 BOM ]` (xem kết quả bóc tách nhanh).
  - **Bottom Sheet Drawer Tương Tác Thời Gian Thực (Live Reactive):**
    - Trượt mượt mà từ đáy màn hình lên với chiều cao thích ứng $60\text{vh}$, nửa trên màn hình vẫn luôn hiển thị bản vẽ CAD. Mọi thay đổi về thông số hay vật liệu trong Drawer lập tức render cập nhật ngay trên bản vẽ CAD ở nửa trên.
    - **Chạm Chọn Ô Tự Động Kích Hoạt Drawer:** Khi người dùng chạm ngón tay vào một ô kính trên Canvas CAD, Drawer "Thuộc tính ô" tự động trượt lên để chỉnh sửa tức thì mà không cần tìm nút bấm.
    - Tích hợp thanh chuyển tab nhanh ngay trong header Drawer (`Vẽ cửa ↔ Ô kính ↔ BOM`) kèm nút đóng `✕`.
  - **Hỗ Trợ Cảm Ứng Đa Điểm Chuẩn CAD (Multi-touch Gestures):**
    - **1 Ngón Tay (Touch Pan):** Vuốt nhẹ trên nền bản vẽ để di chuyển (Pan) bản vẽ CAD mượt mà theo mọi hướng.
    - **2 Ngón Tay (Pinch Zoom):** Thao tác chụm/mở 2 ngón tay để phóng to/thu nhỏ (Pinch-to-zoom) tỷ lệ bản vẽ CAD chính xác và trực quan.
  - **Tối Ưu Toàn Diện Header, Body & Footer Của Modal Studio:**
    - **Header Tabs:** Hỗ trợ cuộn ngang (`overflow-x-auto no-scrollbar whitespace-nowrap`), chống tràn và chống đè lên nút đóng `✕`.
    - **Body Modal:** Loại bỏ hack âm `h-[80vh] -m-4`, chuyển sang kiến trúc Flexbox `flex-1 h-full overflow-hidden` vừa khít 100% mọi kích cỡ màn hình.
    - **Footer Modal:** Ẩn bớt mô tả dài trên màn hình nhỏ, 2 nút "Đóng" và "Lưu thiết kế" căn chỉnh linh hoạt, kích thước vừa vặn cho ngón tay cái.
    - **Các Tab Khác (Info, Config, Results, Accessories):** Tự động dàn layout từ 2-3 cột sang 1 cột linh hoạt trên màn hình hẹp, bảng phụ kiện lẻ hỗ trợ cuộn ngang chống vỡ giao diện.
  - **Tối Ưu Modal Thiết Kế Kính Nan Đồng (`GlassGrilleModal`):**
    - Áp dụng kiến trúc Canvas Hero: trên điện thoại/máy tính bảng, vùng vẽ kính nan đồng chiếm trọn $100\%$ màn hình thay vì bị 2 cột ép bóp nghẹt làm mất canvas.
    - Thanh Floating Pill Bar tích hợp nút mở Bottom Sheet: `[ 📐 Kích thước & Lưới nan ]` và `[ 🌸 Hoa văn & Mẫu nan ]`.
    - Header modal gọn gàng: nút *"Hủy"* và nút *"Áp dụng"* không bị bẻ rớt dòng `whitespace-nowrap`.
  - **Tối Ưu Tab Cấu Hình Khung & Cánh (`ConfigTabView`):**
    - Ẩn triệt để thanh cuộn ngang xám dày cộm (`no-scrollbar`) trên header.
    - Nút chọn kiểu khung (*Khung kín 4 cạnh* / *Khung hở 3 cạnh*) và đố chia chuyển sang `grid-cols-1 sm:grid-cols-2/3` không bị co ép chữ.
  - **Tối Ưu Tab Quản Lý Phụ Kiện (`AccessoriesTabView`):**
    - Header banner chuyển sang layout `flex-col sm:flex-row`, tiêu đề và nút Sub-tab không còn đè ép nhau.
    - Thanh tổng tiền tạm tính ở chân trang (Footer) hiển thị chuẩn mực, không bị rớt dòng số tiền và đơn vị `đ`.

### Refactored & Architecture Optimization

- **Chuẩn Hóa Dữ Liệu Nan & Dọn Sạch Từ Khóa Hệ Thống:**
  - **Loại Bỏ Hoàn Toàn Dữ Liệu Fallback Tĩnh Mẫu Nan & Hoa Văn:**
    - Xóa bỏ mảng tĩnh `DEFAULT_WINDOVA_TEMPLATES` trong [`types.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/types.ts>).
    - Cập nhật [`useGlassGrilleState.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/hooks/useGlassGrilleState.ts>) lấy 100% mẫu nan từ CSDL (`brass_patterns`); không tự động gán đè 4 hoa văn mẫu hardcoded khi mở ô kính mới mà để rỗng `motifs: []` theo đúng dữ liệu thực tế.
  - **Loại Bỏ Triệt Để Tất Cả Các Từ "Windova" Khỏi Toàn Bộ Giao Diện & Mã Nguồn:**
    - Chuẩn hóa text hiển thị UI: "nan", "mẫu nan", "hoa văn nan đồng", "Thiết kế Kính nan đồng", "Mở Studio thiết kế cửa", "Gán 4 góc đối xứng".
    - Thay thế các tên component và alias `WindovaMotifSvg` $\rightarrow$ `GrilleMotifSvg`, `WINDOVA_MOTIF_DEFS` $\rightarrow$ `MOTIF_DEFS`.
  - **Đồng Bộ & Nâng Cấp Thumbnail Preview Mẫu Nan 1:1 Với Bản Vẽ Thực Tế:**
    - Cập nhật [`grille-template-mini-preview.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/components/grille-template-mini-preview.tsx>) hiển thị trực tiếp biểu tượng hoa văn CAD thật (`GrilleMotifSvg`) thay vì chấm tròn đơn sơ bị che khuất.
    - Thêm nền mask ngắt nan chuẩn CAD giúp hoa văn nổi bật rõ ràng, không bị nan lưới đè qua.
    - Giới hạn các nan lưới chia ô nằm gọn bên trong lòng khung viền khi mẫu có nan viền lề (`hasBorder`), khắc phục tình trạng nan đâm thủng viền kính.

- **Tái Cấu Trúc Toàn Diện Module Cửa (`doors`) Chuẩn Kiến Trúc Doanh Nghiệp (Lộ Trình A):**
  - **Khắc Phục Điểm Nóng Số 1 - `glass-grille-modal.tsx` (Từ 2.785 Dòng $\rightarrow$ Dưới 190 Dòng):**
    - Phân tách thành module con độc lập tại [`panels/glass-grille/`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/>):
      - [`hooks/useGlassGrilleState.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/hooks/useGlassGrilleState.ts>): Đóng gói toàn bộ logic React Query, tương tác kéo thả nan/hoa văn CAD, tính toán vật tư và đồng bộ state.
      - [`components/grille-canvas.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/components/grille-canvas.tsx>): Canvas SVG render nan và hoa văn đục lỗ mask.
      - [`components/grille-cad-dimensions.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/components/grille-cad-dimensions.tsx>): Hệ thống đường gióng kích thước CAD và badge kích thước tương tác.
      - [`components/grille-left-panel.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/components/grille-left-panel.tsx>): Panel bên trái quản lý lưới nan, viền, góc, đơn giá và hoa văn đang chọn.
      - [`components/grille-right-panel.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/components/grille-right-panel.tsx>): Thư viện hoa văn và mẫu nan lưu trong Database.
      - [`components/grille-dim-dialog.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/components/grille-dim-dialog.tsx>): Popover chỉnh sửa kích thước đường gióng CAD trực tiếp.
      - Giữ nguyên [`panels/glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>) làm proxy re-export đảm bảo 100% tương thích ngược.
  - **Khắc Phục Điểm Nóng Số 2 - `studio-modal.tsx` (Từ 1.161 Dòng $\rightarrow$ 235 Dòng):**
    - Trích xuất toàn bộ thuật toán thao tác cây Scene Graph (`updateNode`, `findNode`, `findParentNode`, `rescaleTree`, `applySashTypeToCluster`, `resizeCellInParent`...) sang [`utils/door-tree-utils.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/utils/door-tree-utils.ts>).
    - Tạo custom hook [`hooks/useDoorStudioState.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/hooks/useDoorStudioState.ts>) đóng gói toàn bộ state lịch sử Undo/Redo, mutations, queries và handlers.
    - File [`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>) trở thành View Component gọn gàng, trong sáng (< 250 dòng).
  - **Khắc Phục Điểm Nóng Số 3 - `modals.tsx` (Từ 676 Dòng $\rightarrow$ Phân Tách Thư Mục `modals/`):**
    - Phân tách 3 modal riêng biệt vào [`_components/modals/`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/modals/>):
      - [`door-create-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/modals/door-create-modal.tsx>) (< 230 dòng).
      - [`door-update-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/modals/door-update-modal.tsx>) (< 280 dòng).
      - [`door-delete-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/modals/door-delete-modal.tsx>) (< 40 dòng).
    - Duy trì [`_components/modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/modals.tsx>) re-export proxy đảm bảo tương thích 100%.
  - **Khắc Phục Điểm Nóng Số 4 - `bom-modal.tsx` (Từ 559 Dòng $\rightarrow$ Dưới 220 Dòng):**
    - Tách các bảng bóc tách thành các component con tại [`_components/bom/`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/bom/>):
      - `BomBarsTable` (cắt nhôm), `BomBeadsTable` (cắt nẹp), `BomGlassTable` (đặt kính), `BomJointsTable` (liên kết góc), `BomGrillesTable` (kính nan đồng).
  - **Khắc Phục Điểm Nóng Số 5 - `results-tab-view.tsx` (Từ 512 Dòng $\rightarrow$ Dưới 250 Dòng):**
    - Trích xuất hàm kiểm tra cấu hình [`detectProfileIssues`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/utils/detect-profile-issues.ts>) sang file utility dùng chung.
  - **Bảo Đảm Tuyệt Đối:**
    - Giữ nguyên 100% giao diện, phong cách thẩm mỹ và toàn bộ hành vi/chức năng nghiệp vụ.
    - 0 lỗi TypeScript (`npx tsc --noEmit` đạt Exit Code 0).
    - Toàn bộ component tuân thủ nghiêm ngặt quy chuẩn Clean Code (không file nào vượt quá 300 dòng).

### Added & Enhanced

- **Lưu Danh Mục & Đơn Giá Hoa Văn Nan Đồng Vào CSDL & Cấu Hình Đơn Giá Từng Hoa Văn Riêng Biệt ([`glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>), [`brass-ornament/index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/brass-ornament/index.ts)):**
  - **Tích Hợp API Danh Mục Hoa Văn CSDL (`/api/v1/brass-ornaments`):**
    - Tạo client action `getBrassOrnaments` gọi backend lấy danh mục hoa văn chuẩn kèm đơn giá lưu trong Database (`chu_van`: 150.000 đ, `kim_cuong_vuong`: 95.000 đ, `tram_kim_cuong`: 380.000 đ).
    - Hiển thị badge đơn giá CSDL nổi bật ngay trên từng thẻ hoa văn ở cột Thư viện bên phải (`150.000 đ/con`, `95.000 đ/con`, `380.000 đ/con`) kèm kích thước milimet.
  - **Tự Động Điền Đơn Giá Chuẩn (`Auto-fill`) Khi Chọn / Gán Hoa Văn:**
    - Khi bấm _"Gán 4 góc chuẩn Windova"_, click vào giao điểm trống hoặc kéo thả hoa văn vào ô kính, từng con hoa văn tự động được gán giá chuẩn của loại hoa văn đó từ CSDL, không còn bị cào bằng giá chung.
  - **Click Chọn Trực Tiếp Con Hoa Văn Trên Bản Vẽ CAD:**
    - Sửa sự kiện click trên vector hoa văn: Luôn kích hoạt `setSelectedMotifId(m.id)` để chọn con hoa văn đó (không tự động ghi đè bằng cọ đang cầm).
    - Làm nổi bật con hoa văn được chọn bằng khung viền cam `#f59e0b`, 4 chấm neo định vị góc CAD và badge giá nhỏ hiển thị trực tiếp bên dưới con hoa văn.
  - **Thẻ Vàng "Hoa văn đang chọn" Ở Cột Trái:**
    - Tự động cuộn mượt (smooth scroll) đến thẻ vàng khi click chọn hoa văn trên CAD.
    - Hiển thị thông tin giao điểm, kích thước, tên hiển thị, phụ kiện liên kết từ kho CSDL.
    - Cho phép người dùng trực tiếp điều chỉnh đơn giá riêng cho từng con hoa văn (`activeMotif.price`), tự động tính lại tổng tiền nan kính dự toán trong BOM.

### Fixed

- **Khắc Phục Lỗi Click Vào Hoa Văn/Nan Bị Biến Mất - Chuyển Hoàn Toàn Sang Cơ Chế Chọn & Điền Thông Tin Cột Trái ([`useGlassGrilleState.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/hooks/useGlassGrilleState.ts>), [`grille-canvas.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille/components/grille-canvas.tsx>)):**
  - **Nguyên nhân gốc rễ (Root Cause):**
    1. Trong hàm `handleAssignOrReplaceMotifAtCell`, khi người dùng bấm chuột vào giao điểm đã có hoa văn và loại hoa văn đó trùng với công cụ active (`activeMotifTool`), mã nguồn cũ kích hoạt logic gỡ bỏ hoa văn (`setMotifs.filter...`), dẫn đến việc hoa văn bị biến mất.
    2. Trong `grille-canvas.tsx`, khung chữ nhật bao ngoài hoa văn để `fill="none"` khiến sự kiện click chuột xuyên qua vùng trống rơi vào vòng tròn giao điểm ở lớp dưới.
  - **Giải pháp xử lý:**
    - Cập nhật `handleAssignOrReplaceMotifAtCell`: Khi người dùng click chuột thông thường vào giao điểm đã có hoa văn, hệ thống **CHỈ CHỌN (`setSelectedMotifId(existing.id)`) để fill toàn bộ thông tin lên thẻ chi tiết ở cột bên trái**, tuyệt đối không xóa/làm biến mất hoa văn (việc thay thế chỉ kích hoạt khi người dùng chủ động kéo thả hoa văn mới vào).
    - Cập nhật `grille-canvas.tsx`: Đặt `pointerEvents="all"` và `fill="transparent"` cho khung bao hoa văn, đồng thời tại điểm snap giao điểm, nếu đã có `existing` thì click sẽ chọn hoa văn đó thay vì gọi hàm gán lại.

- **Khắc Phục Lỗi Hàm Không Thuần Khiết (`Cannot call impure function Date.now during render`) ([`glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>)):**
  - Loại bỏ hoàn toàn 100% các lệnh gọi hàm không thuần khiết `Date.now()` trong việc sinh định danh hoa văn nan kính (`handleAssignOrReplaceMotifAtCell`, `handleAssignFourSymmetricCorners`, `handleApplyTemplate`).
  - Thay thế bằng cơ chế sinh định danh xác định (**Deterministic ID**) dựa trên vị trí cột và hàng của lưới nan (`motif_c${colIdx}_r${rowIdx}`) và mã mẫu template (`motif_tpl_${tpl.id}_${col}_${row}`).
  - Đảm bảo 100% tuân thủ quy chuẩn Pure/Idempotent của React Compiler / React 19, triệt tiêu hoàn toàn cảnh báo Console và tối ưu hóa cơ chế DOM Reconciliation / React Key.

- **Khử Trùng Lặp Bản Ghi & Phòng Vệ Key Trùng Trong Cuộn Vô Hạn ([`table-data-mobile.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/table/table-data-mobile.tsx)):**
  - Thêm bước deduplicate bằng `Set` theo thuộc tính `id` khi gộp mảng `pages.flatMap()` trong `useInfiniteQuery`.
  - Kết hợp `id` và `index` cho thuộc tính `key={`${(item as any)?.id ?? 'item'}-${index}`}` để đảm bảo không bao giờ phát sinh cảnh báo trùng React key trong Console khi cuộn tải trang trên Mobile.

- **Khắc Phục Lỗi Thứ Tự Hook React (Rules of Hooks) ([`glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>)):**
  - Chuyển logic tính toán tổng mét nan (`totalM`) và giá tạm tính (`estimatedTotalPrice`) sang tính toán trực tiếp thay vì bọc trong `useMemo` đặt sau lệnh return sớm (`if (!isOpen || !cell) return null;`), loại bỏ hoàn toàn cảnh báo lỗi _React has detected a change in the order of Hooks called by GlassGrilleModal_.

- **Khắc Phục Lỗi Nan Đồng Chạy Xuyên Vào Trong Hoa Văn & Cải Tiến Kích Thước Bản Vẽ CAD ([`glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>), [`cad-rectangular-leaf.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-rectangular-leaf.tsx>)):**
  - **Áp Dụng SVG Mask Đục Lỗ Ngắt Nan Tự Động Tại Mép Hoa Văn:**
    - Tạo `<mask id="grille-bars-mask">` (trong modal thiết kế) và `grille-leaf-mask-...` (ngoài CAD Studio cánh cửa), tự động đục lỗ che các thanh nan dọc/ngang tại toàn bộ vị trí hoa văn đúc (`tram_kim_cuong` quả trám búp sen, `kim_cuong_vuong` hình thoi, `chu_van` cuốn thư chữ Vạn).
    - Các thanh nan dừng tiếp xúc chính xác tại mép ngoài hoa văn, giải quyết triệt để lỗi nan vàng chạy cắt xuyên qua tâm và lộ ra bên trong các khoảng rỗng của hoa văn đúc đồng.
  - **Tăng Kích Thước Chữ Số Đường Gióng CAD To Rõ & Thiết Kế Badge Pill Nền Trắng:**
    - Tính toán cỡ chữ động `dimFontSize` (từ 22px đến 30px+ theo tỷ lệ kính), tăng hơn 2.3 lần so với trước (không còn bị bé tí lí nhí khó nhìn).
    - Bọc từng con số kích thước trong Badge Pill hình chữ nhật bo tròn nền trắng viền xanh dương `#0284c7` sắc nét, các số phía bên phải được đặt thẳng ngang tự nhiên, không bị xoay ngược 90 độ gây khó đọc.
  - **Chỉnh Sửa Kích Thước Trực Tiếp Bằng Cách Bấm Vào Số Kích Thước Trên Bản Vẽ:**
    - Người dùng có thể click chuột trực tiếp vào bất kỳ con số kích thước nào (khoang cột đáy, khoang hàng bên phải, lề viền nan, chiều dài góc).
    - Hệ thống mở Popover/Modal nhỏ ngay tại chỗ cho phép nhập số mm mong muốn (hỗ trợ phím Enter để xác nhận nhanh).
    - Tự động dịch chuyển nan dọc/ngang tương ứng, đồng bộ đối xứng qua tâm khi chế độ _Khóa đối xứng_ đang bật, và tự động kéo theo các con hoa văn gắn ở giao điểm.

- **Bổ Sung Cấu Hình Bản Rộng Nan Đồng & Đơn Giá Vật Tư BOM ([`glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>)):**
  - **Bộ Chọn Bản Rộng Nan (`barWidth`):** Bổ sung cụm nút bấm chọn nhanh các kích thước nan chuẩn xưởng (6mm, 8mm, 10mm, 12mm, 18mm) kèm ô nhập mm tùy ý, liên kết tự động làm dày/mỏng đường nan trực tiếp trên bản vẽ CAD.
  - **Cấu Hình Đơn Giá Vật Tư Nan Đồng (Tính BOM):** Bổ sung 2 ô nhập đơn giá thanh nan (`unitPricePerM` theo đ/m) và đơn giá hoa văn mặc định (`motifUnitPrice` theo đ/con), tính toán và hiển thị ngay tổng mét dài (đã bù 5% hao hụt) và thành tiền tạm tính của tấm kính ngay tại cột trái.
  - **Thẻ Kích Thước Kính Tinh Gọn:** Hiển thị trực quan kích thước kính, bản nan kèm chấm màu thực tế, tổng mét nan và chi phí dự toán.

### Added & Enhanced (Windova Standard - Interactive Drag & Drop Glass Grille with Symmetric Locking & Authentic Windova API Motifs)

- **Nâng Cấp Thiết Kế Kính Nan Đồng & Trích Xuất Dữ Liệu Gốc Từ Windova API ([`glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>), [`grille-motif-svgs.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/grille-motif-svgs.tsx>), [`cad-rectangular-leaf.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-rectangular-leaf.tsx>), [`studio-types.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-types.ts>)):**
  - **Tích Hợp 100% Vector Đúc Chuẩn Từng Milimet Từ Windova API (`/api/brass-ornaments`):**
    - Trích xuất trực tiếp đường vector khép kín (`filled-path` với `fillRule="evenodd"`) từ API Windova chính thức của 3 mẫu hoa văn đúc đồng:
      1. _Hoa văn cuốn thư chữ Vạn (`chu_van` - Windova ID 1)_: Kích thước $95.9 \times 95.89$ mm, viewBox `0 0 95.900 95.889` (Hoa văn cuốn thư cổ điển đúc đồng - Cột trái Ảnh 2 Windova).
      2. _Hình thoi kim cương vuông (`kim_cuong_vuong` - Windova ID 3)_: Kích thước $105.86 \times 105.86$ mm, viewBox `0 0 105.859 105.859` (Hình thoi kim cương vuông - Cột phải Ảnh 2 Windova).
      3. _Phù điêu trám kim cương lớn (`tram_kim_cuong` - Windova ID 4)_: Kích thước $280.1 \times 437.6$ mm, viewBox `0 0 280.103 437.604` (Phù điêu trám kim cương lớn - Ảnh 3 Windova).
    - Cập nhật cả modal thiết kế lẫn renderer cánh cửa 2D CAD ngoài màn hình Studio sử dụng component `WindovaMotifSvg` đồng nhất.
  - **Cơ Chế Click & Kéo Thả (Drag & Drop) Thay Thế Hoa Văn Trực Tiếp Tại Giao Điểm:**
    - Người dùng có thể kéo thả (Drag & Drop) trực tiếp hoa văn từ thư viện bên phải vào bất kỳ ô giao nhau nào trên bản vẽ để gán/thay thế hoa văn.
    - Click vào bất kỳ giao điểm nào (kể cả đã có hay chưa có hoa văn): Hệ thống sẽ thay thế trực tiếp hoa văn tại giao điểm đó bằng hoa văn đang kích hoạt làm cọ vẽ (click lại chính loại hoa văn đó để gỡ bỏ).
  - \*_Nút Tiện Ích _"Gán 4 góc chuẩn Windova"_:_ Tự động gán cặp đối xứng: 2 con `chu_van` cột trái + 2 con `kim_cuong_vuong` cột phải đúng chuẩn theo mẫu Windova `nan 01`.
  - **Kéo Thả Trực Quan & Khóa Đối Xứng (Symmetric Locking):**
    - Mặc định bật chế độ _"Khóa đối xứng"_ (`isSymmetric = true`): Khi kéo nan dọc/ngang bất kỳ, nan đối diện tự động phản chiếu qua tâm tấm kính (đảm bảo khoảng giữa luôn cân đối đối xứng như mẫu Windova $184 | 172 | 184$), kèm toggle bật/tắt để chỉnh lệch tự do khi cần.
  - **Tái Thiết Kế Giao Diện Thư Viện Mẫu Nan (Templates UI Redesign):**
    - Sửa triệt để lỗi chữ tràn và nút thao tác "Dùng →" bị đè / mờ mờ sau văn bản.
    - Bổ sung **Thumbnail CAD Mini Vector trực quan** (`GrilleTemplateMiniPreview`) cho từng mẫu nan trong danh sách (thể hiện trực quan khung kính, nan viền, nan góc, các đường nan dọc/ngang và các con hoa văn).
    - Hiển thị hệ thống thẻ tag / badge thông số rõ ràng: Tỷ lệ cột $\times$ hàng, Lề viền nan, Số lượng con hoa văn đính kèm.
    - Cụm nút bấm _"Dùng"_ riêng biệt dạng solid button (Amber gold), kèm nút _"Xóa"_ (`Trash2`) cho các mẫu do người dùng tự lưu.
    - Nâng cấp `handleApplyTemplate` và `handleSaveTemplate`: Bảo toàn 100% dữ liệu hoa văn (`motifs`), tự động map và căn chỉnh tọa độ hoa văn khớp với kích thước kính thực tế của ô cửa.

## [2.1.3] - 2026-09-29

### Added & Enhanced (Windova CAD Studio - Decorative Glass Grille & Motifs with Dynamic Pricing & DB Accessories)

- **Tính năng Trang Trí Kính Nan Đồng & Hoa Văn Vector Chuẩn Phong Cách Windova:**
  - **Modal Thiết Kế CAD 3 Cột Chuyên Nghiệp ([`glass-grille-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/glass-grille-modal.tsx>)):**
    - Cột 1 (Thiết lập nan & Thông số): Bật/tắt nan, chọn màu sắc nan đồng (Vàng Gold, Bạc Silver, Trắng, Đen, Đồng cafe), bề rộng nan (6mm, 8mm, 10mm, 18mm), tùy chỉnh chia lưới (hàng/cột), nan viền chu vi, nan góc hoa thị với đường gióng thực tế.
    - Cột 2 (Interactive CAD SVG Canvas): Vẽ trực quan ô kính theo milimet thực tế, đường gióng CAD kích thước lọt lòng và kích thước chia nan, hỗ trợ Zoom in/out, Pan, Undo/Redo, và click/drag tương tác thêm con hoa văn.
    - Cột 3 (Thư viện hoa văn & Mẫu nan dựng sẵn): Cung cấp sẵn 3 con hoa văn đúc vector SVG chuẩn ngành cửa: Hoa 4 cánh đối xứng (`flower_classic`), Hình thoi hoàng gia (`rhombus`), Búp hoa sen cổ điển (`lotus`), cùng 4 mẫu nan phong cách (Cổ điển, Hình thoi sang trọng, Hoa sen tâm điểm, Hoàng gia cao cấp).
    - Hỗ trợ nút _"Áp dụng cho tất cả cánh kính"_ hoặc chỉ áp dụng riêng cho ô kính đang chọn.
  - **Cấu Hình Đơn Giá Động & Liên Kết Kho Phụ Kiện CSDL (Database Accessories Linking):**
    - Không fix cứng đơn giá trong mã nguồn: Cho phép người dùng tùy chỉnh trực tiếp _"Đơn giá nan đồng (đ/m)"_ và _"Đơn giá hoa văn chung (đ/con)"_.
    - Khi click chọn từng con hoa văn trên bản vẽ CAD: Hiển thị thanh thuộc tính chi tiết, cho phép chọn liên kết trực tiếp với phụ kiện có sẵn trong CSDL (`accessories`), tự động lấy mã phụ kiện (`accessoryCode`), tên và đơn giá kho, hoặc nhập đơn giá riêng cho từng con hoa văn.
  - **Tích Hợp CAD Renderer 2D ([`cad-rectangular-leaf.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-rectangular-leaf.tsx>)):**
    - Tự động vẽ nan chia lưới, nan viền, nan góc và các con hoa văn trực tiếp lên ô kính (cả hệ cánh đơn, vách kính cố định và hệ cánh đôi có đố động).
  - **Thanh Công Cụ Ô Kính ([`cell-inspector.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/cell-inspector.tsx>)):**
    - Bổ sung Card "Kính nan đồng" hiển thị tóm tắt cấu hình hiện tại (màu sắc, bề rộng nan, hoa văn), nút _"Thiết kế"_ mở modal Windova và nút _"Căn tim nan"_ tự động cân đối nan theo tỷ lệ ô kính.
  - **Thống Kê Bóc Tách Vật Tư BOM Nan Đồng ([`bom-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/bom-modal.tsx>), [`bom-sidebar.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/bom-sidebar.tsx>), [`results-tab-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/results-tab-view.tsx>)):**
    - Bổ sung Tab và bảng bóc tách chi tiết: Chiều dài nan lưới (m), nan viền (m), nan góc (m), tổng mét dài có bù hao hụt cắt 5%, số lượng con hoa văn, đơn giá và tổng chi phí gia công nan đồng.
  - **Linh Hoạt Cấu Hình Cạnh Dưới Khung Bao & Ngưỡng Sàn ([`config-frame-tab.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/config/config-frame-tab.tsx>)):**
    - Mở rộng dropdown Cạnh Dưới: Phân nhóm rõ ràng giữa _Khung bao tiêu chuẩn (FRAME)_ và _Ngưỡng sàn / Thanh phụ khác (OTHER / SILL)_, cho phép thợ xưởng tự do gán đích danh thanh ngưỡng nhôm dẹt (như `JP-AC713`).
    - Bổ sung ô chọn tùy chọn _Ốp chân ngưỡng / nẹp phụ đi kèm_ (`coverProfileId`) cho phép bốc kèm thanh ốp phụ (như `JP-AC714`) vào danh sách cắt vật tư BOM.

### Fixed

- **Đồng Bộ Hai Chiều & Sửa Lỗi Hiển Thị Phân Loại Thanh Profile ([`profile-bar-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/profile-bars/_components/profile-bar-modal.tsx>), [`profile-bar-table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/profile-bars/_components/profile-bar-table.tsx>)):**
  - Sửa lỗi dropdown phân loại thanh profile bị rỗng khi mở modal Chỉnh sửa: Chuẩn hóa toàn bộ `BAR_TYPE_OPTIONS` sang định dạng in hoa chuẩn quốc tế (`FRAME`, `SASH`, `MULLION`, `BEAD`, `TRACK`, `COVER`, `CORNER`, `OTHER`).
  - Tự động chuẩn hóa `toUpperCase()` khi reset nạp dữ liệu vào form và khi submit lưu payload API xuống CSDL.
  - Cập nhật từ điển `BAR_TYPE_MAP` tại bảng danh sách thanh profile để hiển thị tên tiếng Việt chính xác.

### Removed & Cleaned (Code Hygiene - Rule 13 Strict Compliance)

- **Loại Bỏ 100% Fallback Kép (`camelCase ?? snake_case`) Dư Thừa Trên Toàn Bộ Frontend:**
  - Dọn sạch các fallback kép che giấu lỗi schema và trùng lặp type tại:
    - [`live-map/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/live-map/page.tsx>)
    - [`shifts/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/shifts/page.tsx>)
    - [`leave-requests/_components/leave-request-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/leave-requests/_components/leave-request-modal.tsx>)
    - [`leave-requests/_components/leave-request-table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/leave-requests/_components/leave-request-table.tsx>)
    - [`departments/[id]/_components/members/members-section.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/departments/[id]/_components/members/members-section.tsx>)
    - [`employees/_components/position-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/employees/_components/position-modal.tsx>)
    - [`dashboard/_components/system-history.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/system-history.tsx>)
    - [`actions/report/index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/report/index.ts)
    - [`actions/customer/index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/customer/index.ts)
    - [`types/customer.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/customer.ts), [`types/report.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/report.ts), [`stores/useLeaveRequestStore.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/stores/useLeaveRequestStore.ts).

## [2.1.2] - 2026-09-28

### Added & Enhanced (Windova CAD Studio - Right-Click Interactive Drag Resizer for Mullions & Frame Couplings)

- **Tương Tác Kéo Chuột Phải Di Chuyển Nhanh Đố & Vách Tách Khung (Interactive Drag Resizing):**
  - **Trải nghiệm giống Windova:** Khi rê chuột vào thanh đố T (`mullion`) hoặc vách ngăn tách khung (`coupling seam`), con trỏ đổi thành mũi tên 2 chiều, thanh đố sáng viền highlight.
  - **Giữ chuột phải (`e.button === 2`) hoặc chuột trái:** Người dùng có thể kéo trực tiếp để tăng/giảm kích thước 2 ô liền kề theo thời gian thực (60fps). Chặn hoàn toàn menu chuột phải mặc định của trình duyệt (`onContextMenu e.preventDefault()`).
  - **Live Floating Badge:** Hiển thị thước đo nổi trực quan ngay tại vị trí kéo (`◄ 750 mm | 650 mm ►` hoặc `▲ 600 mm | 1000 mm ▼`).
  - **Làm tròn số kỹ thuật & Ràng buộc an toàn:** Tự động snap theo bước nhảy 5 mm, giới hạn biên an toàn tối thiểu mỗi ô >= 100 mm.
  - **Undo / Redo & Co giãn đệ quy:** Khi nhả chuột, commit vào history stack dưới dạng 1 bước duy nhất (nút Undo/Redo hoạt động mượt mà), các ô con bên trong tự động co giãn tỷ lệ nhờ hàm `rescaleTree`.
  - Bổ sung chỉ dẫn trực quan ngay tại thanh Guide bar ở đáy màn hình CAD: _"Giữ chuột phải đố = trượt nhanh"_.

### Refactored & Optimized (Windova CAD Engine - Modular Architecture Refactoring)

- **Tái Cấu Trúc Toàn Diện Bộ Render CAD ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>)):**
  - Giải quyết triệt để tình trạng "God File" 1.753 dòng, đưa component chính về mức chuẩn Clean Code (~300 dòng), phân tách độc lập các trách nhiệm (Single Responsibility Principle):
    - [`cad-config.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/cad-config.ts>) (40 dòng): Tập trung toàn bộ hằng số tỷ lệ hình học (`CAD_CONFIG`) cho khung, cánh, nẹp và đố.
    - [`cad-types.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/cad-types.ts>) (43 dòng): Định nghĩa các kiểu dữ liệu nội bộ (`DoorCadRendererProps`, `LeafCell`, `MullionBar`, `FrameBox`, `CurvedFramePaths`).
    - [`cad-geometry.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/cad-geometry.ts>) (141 dòng): Thuần toán học giải tích vector cong/vòm (`getCurvedContourPath`, `getCurvedFramePaths`), độc lập 100% với React.
    - [`cad-tree-traverser.ts`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/cad-tree-traverser.ts>) (206 dòng): Thuật toán duyệt đệ quy cây layout (`buildCadLayout`, `getVerticalSlices`, `getHorizontalSlices`), bóc tách độc lập logic tính toán khung ghép (coupling) và đố T.
    - [`components/cad-opening-symbol.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-opening-symbol.tsx>) (93 dòng): Vẽ ký hiệu mở cánh (tam giác đỏ mở quay, lật, hất, trượt).
    - [`components/cad-bead.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-bead.tsx>) (46 dòng): Module tính toán nẹp kính ghép mòi 45°.
    - [`components/cad-sash-box.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-sash-box.tsx>) (68 dòng): Module dựng khung cánh với các phương pháp ghép góc (45°, 90° dọc phủ, 90° ngang phủ, 45° trên 90° dưới).
    - [`components/cad-mitered-frame.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-mitered-frame.tsx>) (119 dòng): Dựng khung bao ngoài và xử lý khung hở sàn 3 cạnh.
    - [`components/cad-curved-door.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-curved-door.tsx>) (338 dòng): Render chuyên dụng cho hệ cửa vòm, cửa tròn 1 cánh & 2 cánh.
    - [`components/cad-rectangular-leaf.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-rectangular-leaf.tsx>) (326 dòng): Render ô cánh và vách kính chữ nhật thông thường.
    - [`components/cad-dimension-overlay.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/components/cad-dimension-overlay.tsx>) (228 dòng): Toàn bộ hệ thống đường gióng thước đo kích thước W/H, kích thước phụ và cao độ khóa.
  - Đảm bảo 100% backward-compatibility (re-export đầy đủ `CAD_CONFIG` và types từ file gốc), TypeScript biên dịch sạch 0 lỗi.

### Added & Changed (Windova CAD Studio - CAD Config Constants & Glazing Bead Enhancement)

- **Tập Trung Hóa Toàn Bộ Tỉ Lệ Kích Thước CAD Vào Hằng Số `CAD_CONFIG` ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>)):**
  - Khởi tạo object cấu hình hằng số `CAD_CONFIG` đặt ngay đầu file với chú thích tiếng Việt chi tiết cho 4 phân hệ hình học:
    - **`FRAME`:** Tỷ lệ độ dày khung bao ngoài (`SCALE_RATIO: 0.026`, giới hạn `7px - 10px`).
    - **`SASH`:** Tỷ lệ khung cánh cửa đi (`DOOR_RATIO: 1.4`), cửa sổ (`WINDOW_RATIO: 1.15`), hệ slim (`SLIM_RATIO: 0.75`), cùng các khoảng min/max pixel tương ứng.
    - **`BEAD`:** Tỷ lệ và độ dày nẹp kính hiển thị (`NORMAL_RATIO: 0.28`, `FIXED_RATIO: 0.35`, `MIN_W: 4px`, `MAX_W: 6.5px`, chiếm tối đa `10%` diện tích lọt lòng cánh).
    - **`MULLION`:** Đố tĩnh T (`SCALE_RATIO: 1.0`, `7px - 10px`) và đố động giữa 2 cánh (`ASTRAGAL_RATIO: 0.5`, `4px - 7px`).
- **Tăng Độ Dày Nẹp Kính Trực Quan:**
  - Nẹp kính được tăng độ dày rõ nét (từ mức cũ ~2-3px lên 4-6.5px), giúp các đường mòi 45° hiển thị chuẩn xác, cân đối như bản vẽ kỹ thuật thực tế.
- **Nâng Cấp Thuật Toán Vẽ Cánh Cong Tự Nhiên Cho Khung Vòm & Cửa Tròn (`Curved Contour Geometry`):**
  - **Khắc phục triệt để lỗi cánh chữ nhật bị xén cụt (`clipPath`):** Trước đây, các bộ cửa vòm (`arch_semicircle`, `arch_half`, `round_top_2`...) và cửa tròn (`circle`, `ellipse`) chỉ vẽ cánh hình chữ nhật phẳng rồi dùng mặt nạ cắt xén, gây lỗi trơ 2 mẩu nhôm đứng ở mép cửa tròn và mất thanh ngang đỉnh vòm.
  - **Thuật toán sinh đường cong song song đa tầng (`getCurvedContourPath`):** Tự động sinh đường bao hình học đồng tâm offset chính xác theo độ dày từng lớp:
    - Mép ngoài cánh / dạ khung bao: offset `frameD`.
    - Mép trong cánh: offset `frameD + sashD`.
    - Mép nẹp kính: offset `frameD + sashD + beadW`.
  - **Bộ Render Chuyên Biệt `renderCurvedDoubleDoor` & `renderCurvedSingleDoor`:**
    - Cửa 2 cánh mở quay đối xứng (`swing_double`): Khung nhôm cánh và nẹp kính ôm trọn 360° theo vòng cung tròn hoặc uốn lượn theo vòm; trục giữa giữ nguyên 2 thanh đứng gặp nhau và đố động thẳng tắp; 2 mặt kính được chia nửa hoàn hảo; tam giác chỉ hướng mở màu đỏ tự động neo vào đúng vị trí bản lề cong theo hình học elip/vòm.
    - Cửa 1 cánh mở quay và vách chết (`fixed`): Tự động uốn theo biên dạng vòm đồng tâm sắc nét.

## [Unreleased] - 2026-09-25

### Added & Enhanced

- **Quản lý Chiều dài Thanh tiêu chuẩn trong Hãng nhôm & Tự động Gợi ý khi Tạo Profile:**
  - Bổ sung `barLengthMm` vào interface `Brand`, `BrandCreate`, `BrandUpdate` ([`src/types/brand.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/brand.ts)).
  - **`BrandModal`:** Hiển thị ô nhập _"Chiều dài thanh tiêu chuẩn (mm)"_ khi phân loại là Hãng nhôm (`aluminum`) hoặc Cả hai (`both`), mặc định 6000mm.
  - **`ProfileBarModal`:** Tự động điền giá trị `barLengthMm` từ Hãng nhôm đã chọn vào ô _"Chiều dài cây gốc (mm)"_ khi tạo mới. Tự động đồng bộ cập nhật khi người dùng chuyển đổi Hãng nhôm khác trong dropdown.
  - **Bảng Danh sách Hãng (`aluminum/index.tsx`):** Hiển thị nhãn thông số chuẩn `• Chuẩn: {barLengthMm}mm` ngay cạnh quốc gia xuất xứ.

## [Unreleased] - 2026-09-23

### Added & Enhanced (Windova CAD Studio 2.0 - Strict Profile Calculation & Elimination of Mock Fallbacks)

- **Loại Bỏ Triệt Để Dữ Liệu Mock/Hardcode Sai Lệch Trong Backend ([`door_calculation_service.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/project/door_calculation_service.py)):**
  - **Khắc phục lỗi tự ý sinh số liệu khi chưa cấu hình:** Trước đây, khi bộ cửa chưa được người dùng chọn thanh nhôm cụ thể trong tab Cấu hình, Backend tự động fallback về các mã thanh mẫu hardcode sẵn (`C80649`, `C76722`, `C86335`) và tính ra khối lượng giả định $37.51\text{ kg}$, gây mâu thuẫn hoàn toàn với cảnh báo thiếu profile ở Frontend.
  - **Đồng bộ hóa với `frameConfig` & `sashConfig` (Studio 2.0):** Cập nhật `_fetch_profile_map` và `_build_frame_bars`, `_build_sashes_and_cells` để đọc chính xác `profileId` từ các cạnh khung bao (`leftEdge`, `topEdge`, `rightEdge`, `bottomEdge`), khung cánh (`leftProfileId`, `beadProfileId`) và đố động (`mullionProfileId`).
  - **Bảo toàn tính toàn vẹn sản xuất:** Nếu thanh nào chưa được cấu hình, Backend trả về `profile_id: None`, `profile_code: None`, `profile_name: "Chưa cấu hình"`, `weight_per_m: 0.0`. Tổng khối lượng nhôm chỉ được tính khi có thanh thật trong cơ sở dữ liệu.

- **Minh Bạch Trạng Thái Cấu Hình Tại Tab Kết Quả ([`results-tab-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/results-tab-view.tsx>)):**
  - **Nhãn hiển thị rõ ràng:** Bổ sung badge nổi bật `<Chưa chọn profile>` ở cột _Mã Profile_ cho các thanh chưa được gán mã nhôm, giúp thợ xưởng và kỹ thuật viên nhận diện ngay thanh nào cần vào tab Cấu hình để chọn.
  - **Chỉ dẫn KPI khối lượng:** Khi tổng khối lượng bằng 0 do chưa cấu hình, hiển thị chú thích `(Cần chọn profile để tính)`, loại bỏ hoàn toàn hiện tượng số liệu ảo gây hiểu lầm.

### Added & Enhanced (Windova CAD Studio 2.0 - CAD Vector SVG Thumbnail Export & Live Table Preview)

- **Tự Động Xuất Ảnh Vector SVG Khi Lưu Thiết Kế ([`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>), [`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>)):**
  - **Khắc phục lỗi thiếu ảnh đại diện khi lưu cửa:** Trước đây, hàm `saveMutation` trong Studio chỉ gửi `systemConfig` mà không trích xuất đồ họa SVG của cửa, khiến trường `image_b64` trong Database bị `NULL` và bảng danh sách ngoài chỉ hiển thị icon fallback `[ | ]`.
  - **Trích xuất SVG Vector Thumbnail tự động:** Thiết lập luồng serialize đồ họa SVG độc lập (`studio-export-cad-svg`) với chế độ `hideDimensions: true` (loại bỏ thước đo để khung cửa chiếm trọn khung hình vuông vắn). Khi bấm **Lưu thiết kế**, toàn bộ đồ họa vector của bộ cửa được mã hóa và gửi thẳng vào trường `imageB64` của payload lưu vào Database.
  - **Đồng bộ gán Hệ nhôm (`doorSeriesId`):** Bổ sung `doorSeriesId: seriesId || null` vào payload lưu cửa, khắc phục triệt để tình trạng ngoài bảng danh sách hiển thị _"Hệ nhôm: Chưa gán"_ dù đã chọn hệ trong Studio.

- **Hiển Thị Bản Vẽ Vector Trực Tiếp Ngoài Bảng Danh Sách Cửa ([`table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/table.tsx>)):**
  - **Cơ chế Fallback thông minh 2 tầng:**
    1. Nếu cửa đã có chuỗi `imageB64` (hoặc ảnh upload `imagePath`), bảng hiển thị thẻ `<img>` siêu nhanh.
    2. Nếu cửa chưa có `imageB64` nhưng đã có cấu trúc thiết kế `systemConfig.rootCell` (như các mẫu cửa đã tạo trước đây), bảng tự động render trực tiếp một bản vẽ CAD vector mini bằng `<DoorCadRenderer hideDimensions={true} />`.
  - **Hiệu quả tức thì:** Mọi mẫu cửa đã lưu trong hệ thống lập tức hiển thị hình ảnh bản vẽ CAD chuẩn xác và sắc nét ngoài bảng danh mục mà người dùng không cần phải mở lại để lưu lại.

### Added & Enhanced (Windova CAD Studio 2.0 - Profile Configuration Validation & Warning Alert Box)

- **Hệ Thống Kiểm Tra Hồ Sơ Profile & Hộp Cảnh Báo Thiết Kế Thiếu Cấu Hình ([`results-tab-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/results-tab-view.tsx>), [`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>)):**
  - **Banner Kết Quả Chuẩn CAD (Dark Slate Header):** Thiết kế thanh tiêu đề màu tối sang trọng `📐 Kết quả tính mẫu W={w} × H={h} mm` hiển thị trực tiếp các chỉ số tổng quan: `Kính: {area} m²` | `Cân nặng: {kg} kg` | `KL/m²: {kg/m2} kg/m²`.
  - **Tự động quét và phát hiện vấn đề cấu hình (`detectProfileIssues`):**
    - Kiểm tra lựa chọn Hệ nhôm (`seriesId`).
    - Kiểm tra cấu hình khung cánh: thiếu profile bao cánh cạnh trái, cạnh trên, cạnh phải, cạnh dưới, thiếu profile đố động giữa 2 cánh (`swing_double`), thiếu profile nẹp kính cánh.
    - Kiểm tra cấu hình khung bao: thiếu profile thanh đứng trái, ngang trên, đứng phải, ngang dưới (nếu không mở đáy).
    - Kiểm tra profile các thanh đố dọc/ngang trên toàn bộ cây Scene Graph (`mullionProfileId`).
    - Kiểm tra tính đầy đủ từ kết quả bóc tách backend (`calcData.bars`).
  - **Khung Cảnh Báo Màu Vàng Nổi Bật (Yellow Warning Alert Box):**
    - Khung cảnh báo chuẩn giao diện mẫu (`bg-[#fffbeb] border-[#fde68a]`): hiển thị tiêu đề `⚠️ Phát hiện X vấn đề profile — kiểm tra lại:` kèm danh sách gạch đầu dòng chi tiết từng lỗi với icon cảnh báo `⚠️`.
    - Tích hợp nút bấm tắt `⚙️ Đến Cấu hình` điều hướng trực tiếp người dùng sang tab Cấu hình để gán profile cho các thanh còn thiếu.
    - Khung cảnh báo sẽ tự động biến mất và hiển thị đầy đủ bảng bóc tách nhôm/nẹp/kính khi người dùng đã cấu hình đầy đủ.

### Added & Enhanced (Windova CAD Studio 2.0 - Single Sliding Sash & Multi-Level Cell Dimensioning)

- **Chuẩn Hóa Cánh Trượt Lùa Thành Kiểu Cánh Đơn (`Single Sliding Sash`) ([`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>), [`sash-type-picker.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/sash-type-picker.tsx>)):**
  - **Khắc phục lỗi tự động nhân đôi cánh lùa:** Trước đây, khi chọn "Trượt lùa" (`sliding`), hệ thống tự động ép chia đôi ô thành cụm 2 cánh lùa (`c0`, `c1`), khiến người dùng không thể tạo cửa 1 cánh lùa, 3 cánh lùa hoặc chia số cánh lùa theo ý muốn.
  - **Trượt lùa độc lập 1 cánh:** Đã chuyển đổi `sliding` thành kiểu cánh đơn chuẩn (`single sash`). Khi chọn "Cánh trượt lùa", ô đang chọn trở thành **đúng 1 cánh lùa duy nhất** (mang biểu tượng `↔`), kích thước và vật liệu hoàn toàn độc lập, không bị tách đôi. Người dùng tự do chia đố dọc thành 2, 3, 4, 6... ô và gán kiểu cánh trượt lùa cho từng ô để tạo cửa lùa 2 cánh, 3 cánh, 4 cánh tùy ý.

- **Hiển Thị Thước Đo Kích Thước Toàn Bộ Cánh Con & Cho Phép Nhập Sửa Kích Thước Trực Tiếp ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>), [`cell-inspector.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/cell-inspector.tsx>), [`draw-tab-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/draw-tab-view.tsx>)):**
  - **Trích xuất đệ quy toàn bộ cột dọc (`getVerticalSlices`):** Thước đo kích thước chân cửa (sub-dimensions) giờ đây đệ quy qua toàn bộ cây Scene Graph, hiển thị đầy đủ số đo của **tất cả từng cánh cửa lùa con** (kể cả khi chia nhiều cấp), người dùng click vào số đo của bất kỳ cánh nào để sửa số mm trực tiếp.
  - **Input chỉnh kích thước trực tiếp trong bảng `CellInspector`:** Bổ sung 2 ô nhập `Rộng W (mm)` và `Cao H (mm)` ngay trong bảng `Tùy chọn ô kính`. Khi click chọn bất kỳ cánh cửa lùa nào, người dùng có thể gõ trực tiếp kích thước mm và nhấn Enter để cập nhật ngay lập tức.
  - **Bảo toàn tổng kích thước:** Cơ chế `resizeCellInParent` tự động bù trừ cho cánh liền kề cùng khoang và chặn sàn an toàn 100mm, giúp việc co giãn cánh diễn ra mượt mà và tổng kích thước bộ cửa không bị xô lệch.

### Added & Enhanced (Windova CAD Studio 2.0 - Adaptive Sash Width & Dynamic CAD Viewport)

- **Phương Án 1: Bề Rộng Thanh Cánh & Nẹp Kính Thích Ứng Động Theo Ô Cửa (`Adaptive Sash & Bead Width`) ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>)):**
  - **Khắc phục triệt để hiện tượng díu dít khi chia nhiều cánh/vách:** Trước đây, bề rộng khung cánh (`sashD`) bị kẹp sàn cứng ở mức tối thiểu 12–13px và nẹp kính (`beadW`) cố định; khi người dùng chia nhiều cánh (4–8 cánh) hoặc nhiều vách kính lọt lòng, các thanh nhôm cánh chiếm tới 65–75% diện tích bề rộng ô, lòng kính chỉ còn lại một khe hẹp như sợi chỉ.
  - **Hàm tính toán thích ứng `getAdaptiveSashD`:** Tự động điều chỉnh độ dày thanh nhôm khung cánh (`sashD`) theo tỷ lệ bề rộng và chiều cao thực tế của từng ô con (`cell.w`, `cell.h`). Thanh cánh 2 bên không bao giờ được chiếm quá 24–32% bề rộng ô (mỗi bên tối đa 12–16%), đảm bảo diện tích lòng kính luôn chiếm từ 68% đến 76% diện tích ô cánh.
  - **Tối ưu thanh cánh cửa lùa (`sliding`):** Cửa trượt lùa tự động áp dụng hệ thanh nhôm thanh mảnh hơn cửa mở quay 25–30% (`ratioW: 0.12`), nẹp kính tự động giới hạn tối đa 10% lòng kính (`Math.min(effectiveBeadW, Math.floor(gw * 0.1))`), giúp toàn bộ các cánh lùa và vách kính hiển thị thanh thoát, cân đối và sắc nét.

- **Phương Án 2: Mở Rộng Linh Hoạt Khung Canvas & ViewBox Theo Tỉ Lệ Bộ Cửa (`Dynamic ViewBox & Viewport`) ([`canvas-cad-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/canvas-cad-view.tsx>), [`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>)):**
  - **Gỡ bỏ giới hạn khung vuông cố định 500x500px:** Mở rộng container vẽ CAD trong `canvas-cad-view.tsx` từ `max-w-[500px] aspect-[500/500]` lên `max-w-[860px] max-h-[640px]`, cho phép bộ cửa trải rộng toàn màn hình làm việc của Studio.
  - **ViewBox động thích ứng theo tỉ lệ thực tế:** Với cửa rộng ngang kích thước lớn (như 4000x2400mm hay 8000x4000mm, `aspect >= 1.25`), `viewBox` tự động mở rộng bề ngang lên tới 780px; với cửa cao đứng (`aspect <= 0.8`), tự động mở rộng chiều cao lên tới 680px.
  - **Diện tích hiển thị cửa tăng gấp 2 lần:** Vùng vẽ cửa thực tế được mở rộng từ 270px lên 420–580px, thước đo kích thước 2 chiều (Dimensions lines) tự động bố trí giãn thoáng, không còn bị chèn ép layout.

### Fixed & Enhanced (Windova CAD Studio 2.0 - Sash Cluster Conversion & State Isolation)

- **Thiết Lập Mặc Định Ban Đầu Là Vách Kính Cố Định (`fixed`) Khi Thêm Mới Cửa ([`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>)):**
  - **Khởi tạo trực quan chuẩn xuất phát điểm:** Khi người dùng mở Studio để thêm mới cửa (hoặc bấm làm mới bản vẽ), mẫu thiết kế mặc định ban đầu là **Vách kính cố định** (`sashType: 'fixed'`, `type: 'ck'`, `children: []`) với kích thước 1400x1600mm.
  - **Tự động highlight nút Vách cố định:** Nút "Vách cố định" trên thanh công cụ bên trái được kích hoạt sẵn màu xanh; từ xuất phát điểm vách kính phẳng này, người dùng có thể dễ dàng chia đố, đổi sang cửa 1 cánh hoặc chuyển sang cửa 2 cánh một cách linh hoạt và tự nhiên nhất.

- **Loại Bỏ Nút "Thêm Thủ Công" Khỏi Danh Sách Thiết Kế Cửa ([`table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/table.tsx>), [`index.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/index.tsx>)):**
  - **Tập trung hóa luồng thiết kế:** Đã xóa bỏ nút `+ Thêm thủ công` trên thanh công cụ lọc của danh mục cửa. Toàn bộ quy trình thêm mới mẫu cửa giờ đây được điều hướng 100% qua công cụ chuyên dụng **🪄 Studio Thiết kế Cửa**, đảm bảo đồng nhất về cấu trúc Scene Graph, tính toán BOM cơ khí và bản vẽ CAD 2D.

- **Khắc Phục Lỗi Rò Rỉ Dữ Liệu Khi Thêm Cửa Mới (State Persistence Isolation) ([`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>), [`index.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/index.tsx>)):**
  - **Nguyên nhân gốc rễ:** Do modal không bị unmount khi đóng và `useEffect` chỉ hydrate khi có `door` mà không có nhánh reset khi `door === null`, dẫn tới khi mở xem cửa cũ rồi bấm "Thêm cửa mới", toàn bộ state thiết kế (cây cửa `rootCell`, kích thước `w, h`, màu nhôm, tên cửa, mã cửa) của cửa cũ vẫn bị lưu giữ trong bộ nhớ component và hiển thị lên canvas.
  - **Tự động Reset toàn bộ State:** Bổ sung khối xử lý chuyên biệt trong `useEffect` của `DoorStudioModal` khi `isOpen && !door`, tự động khôi phục toàn bộ state về trạng thái thiết kế cửa mới sạch sẽ (`createDefaultRootCell(1400, 1600)`, mã rỗng, màu mặc định, xóa trắng lịch sử undo/redo và tiêu điểm chọn).
  - **Cơ chế Key động cách ly Instance:** Gán `key={studioDoor ? "studio-" + studioDoor.id : "studio-new"}` cho `<DoorStudioModal />` ở trang danh sách cửa. Mỗi khi chuyển giữa các cửa hoặc chuyển sang thêm mới, React sẽ tạo một instance hoàn toàn mới, triệt tiêu 100% hiện tượng chồng chéo hoặc rò rỉ dữ liệu giữa các lần mở Studio.

- **Chuẩn Hóa Chuyển Đổi Trạng Thái Giữa Cửa 2 Cánh & Cửa 1 Cánh / Vách Kính Cố Định ([`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>)):**
  - **Khắc phục lỗi ép kiểu cửa 2 cánh:** Trước đây, các kiểu mở đơn như `swing_left`, `swing_right` bị gom chung nhánh với `swing_double`, đồng thời các kiểu khác như `awning`, `tilt`, `tilt_down`, `tilt_turn` áp dụng vào cả 2 cánh con trong cụm `sash_pair` khiến bất kỳ thao tác chọn kiểu cánh nào cũng biến thành cửa 2 cánh mở quay (chỉ có vách kính cố định là thay đổi được).
  - **Tự động hợp nhất (Merge/Flatten) khoang thành 1 cánh đơn duy nhất:** Khi người dùng chọn bất kỳ kiểu cánh đơn nào (`swing_left`, `swing_right`, `awning`, `tilt`, `tilt_down`, `tilt_turn`) hoặc Vách kính cố định (`fixed`), cụm 2 cánh tự động được hợp nhất thành 1 cánh/ô duy nhất toàn khoang (`children: []`, xóa `splitDirection` và `splitType`), tự động bảo toàn vật liệu kính `paneType` đang chọn và kích hoạt khóa/tay nắm chuẩn xác.
  - **Tự động tách đôi khi chuyển sang kiểu cánh đôi:** Khi đang ở ô đơn lẻ, việc chọn _2 cánh mở quay (`swing_double`)_ hoặc _Trượt lùa 2 cánh (`sliding`)_ sẽ tự động chia đôi khoang thành 2 cánh đối xứng chuẩn kỹ thuật cơ khí, khóa gắn trên cánh chính bên phải.
  - **Đồng bộ tiêu điểm chọn (`nextSelectedId`):** Khi hợp nhất về ô đơn hoặc tách thành 2 cánh, hệ thống tự động cập nhật `selectedCellId` tới đúng ô vừa tạo, đảm bảo viền chọn màu cam và bảng thuộc tính `CellInspector` luôn hiển thị chính xác.

### Added & Enhanced (Windova CAD Studio 2.0 - Dynamic Brand Colors & Proportional Profile Rendering)

- **Tích Hợp Bảng Mã Màu Nhôm Động Theo Hãng (`BrandColor`) Vào Studio CAD ([`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>), [`toolbox-left.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/toolbox-left.tsx>), [`info-tab-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/info-tab-view.tsx>), [`draw-tab-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/draw-tab-view.tsx>)):**
  - **Truy vấn danh mục màu thực tế của hãng từ Database:** Khi người dùng chọn Hệ nhôm (`seriesId`), hệ thống tự động nhận diện Hãng nhôm (`brandId`) và gọi API `getBrandColors({ brandId, isActive: true })` để tải trọn vẹn danh mục màu thực tế được hãng phân phối (mã màu, tên màu catalog, mã HEX hiển thị, loại sơn...).
  - **Tự động áp dụng màu mặc định:** Khi đổi sang hệ nhôm/hãng khác, hệ thống tự động đồng bộ màu cửa sang màu mặc định (`isDefault: true`) hoặc màu đầu tiên trong catalog của hãng đó.
  - **Hiển thị nhãn tên màu chuẩn:** Cả ở tab _Thông tin chung_ và thanh công cụ vẽ _Vẽ CAD_, người dùng đều thấy tên màu chính thức của hãng (ví dụ: _Nâu cafe ánh kim_, _Vân gỗ trắc hoàng gia_, _Vàng sâm banh Champagne Anode_...) hiển thị rõ nét bên cạnh bảng màu.
  - **Cơ chế Fallback an toàn:** Nếu hệ nhôm chưa khai báo màu riêng, hệ thống tự động fallback về bảng màu phổ thông tiêu chuẩn, đảm bảo giao diện luôn mượt mà và không bao giờ bị trống.

- **Đồng Bộ Kiểu Cánh Cho Cụm Cửa 2 Cánh & Duy Trì Tương Tác Độc Lập Từng Ô Kính ([`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>)):**
  - **Cơ chế `applySashTypeToCluster` thông minh:** Khi người dùng đang chọn bất kỳ ô con nào trong cụm cửa đôi (`sash_pair`), việc thay đổi kiểu cánh (`sashType`) ở thanh công cụ hoặc bảng thuộc tính sẽ **tự động áp dụng đồng bộ cho toàn bộ cụm cánh**:
    - Chọn _2 cánh mở quay_: Cánh trái tự động quay trái (`swing_left`), cánh phải quay phải (`swing_right`), khóa tích hợp trên cánh chính.
    - Chọn _Trượt lùa 2 cánh_: Cả 2 cánh cùng đồng bộ sang cánh trượt lùa (`sliding`).
    - Chọn _Vách cố định_: Cả 2 cánh cùng chuyển sang ô kính cố định (`fixed`).
    - Chọn _Mở hất / Mở lật_: Cả 2 cánh cùng chuyển đồng bộ sang kiểu mở tương ứng.
  - **Bảo toàn khả năng tương tác độc lập từng ô kính:** Người dùng vẫn click chọn riêng từng ô cánh để cấu hình vật liệu kính (`paneType`: kính, nan chớp louver, tấm nhôm panel, lưới chống muỗi), chọn mã kính catalog, bật/tắt khóa và chỉnh cao độ tay nắm độc lập cho từng ô.
  - **Tự động highlight chuẩn trên thanh công cụ:** Khi nhấp vào bất kỳ cánh nào trong cụm 2 cánh, thanh công cụ bên trái tự động hiển thị và kích hoạt đúng nút của cụm cánh đó (ví dụ: đang là cửa 2 cánh mở quay thì nút "2 cánh mở quay" được highlight).

- **Loại Bỏ Thanh Đố Tĩnh Ở Giữa Cho Cửa 2 Cánh Mở Quay Chuẩn Kỹ Thuật Thực Tế ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>), [`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>)):**
  - **Nhận diện thông minh cặp cánh mở quay đối xứng:** Khi 2 ô liền kề là cặp cánh mở quay (`swing_left` và `swing_right`) hoặc node mang kiểu `sash_pair` / `swing_double`, động cơ CAD tự động nhận diện và **không chèn thanh đố tĩnh (`mullion`) của khung bao vào giữa**.
  - **Hai cánh giáp trực tiếp tại tim cửa:** Thanh đứng cánh trái và thanh đứng cánh phải khép khít trực tiếp vào nhau tại tim cửa (không còn khoảng hở đố màu ghi ở giữa). Góc mòi 45° trên đỉnh và dưới chân của 2 cánh chạm nhau thành hình chữ V sắc nét chạm vào khung bao ngoài, phản ánh đúng 100% kết cấu cơ khí thực tế của cửa đi/cửa sổ 2 cánh mở quay dùng đố động.

- **Tách Cửa 2 Cánh Thành 2 Ô Con Độc Lập & Cấu Hình Khóa / Cao Độ Tay Nắm Chuẩn Windova ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>), [`cell-inspector.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/cell-inspector.tsx>), [`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>)):**
  - **Tách rời 2 ô cánh độc lập (`SceneCellNode`):** Cửa 2 cánh mở quay (`swing_double`) giờ đây được tổ chức chuẩn kiến trúc Scene Graph gồm 2 node con (`cell_0`: mở quay trái `swing_left`, `cell_1`: mở quay phải `swing_right`) ngăn cách bởi đố động. Người dùng có thể nhấp chọn từng cánh riêng biệt để đổi vật liệu (kính, nan chớp, panel) hoặc chia đố con độc lập cho từng cánh.
  - **Hiển thị viền focus màu cam chuẩn Windova:** Khi chọn ô kính, đường viền nét đứt màu cam nổi bật (`stroke="#f59e0b"`, nét đứt 6x4) hiển thị chuẩn xác quanh mặt kính được chọn.
  - **Mô hình hóa Tay nắm gạt thực tế (Lever Handle):** Thay thế khối hình oval cũ ở giữa đố động bằng tay nắm gạt cửa đi thực tế (có ốp thân khóa thẳng đứng, ổ chìa và tay gạt ngang chìa qua mặt kính), gắn chính xác trên thanh đố cánh của cánh chính.
  - **Thước đo Cao độ tim khóa bên hông trái:** Hiển thị đường gióng kích thước từ chân đáy cửa lên tim khóa (`800` mm), cho phép click trực tiếp vào số đo để chỉnh nhanh cao độ hoặc thay đổi trong bảng Thuộc tính.
  - **Bảng điều khiển Khóa & Phụ kiện (`CellInspector`):** Bổ sung switch bật/tắt khóa cho từng cánh, ô nhập cao độ tim khóa (mm) và dropdown chọn kiểu tay nắm (tay gạt cửa đi, tay gạt đa điểm, tay nắm chữ D...).
- **Cửa Sổ Thiết Lập Thông Số Đố / Khung Tương Tác Chuẩn Windova ([`mullion-inspector-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/mullion-inspector-modal.tsx>), [`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>), [`studio-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/studio-modal.tsx>)):**
  - **Tương tác trực tiếp trên bản vẽ CAD:** Người dùng có thể click chuột trực tiếp vào thanh đố khung (mullion) bất kỳ trên canvas. Khu vực hitbox được mở rộng thông minh (+12px) kèm hiệu ứng hover viền vàng hổ phách (`#f59e0b`) giúp thao tác nhấp chính xác và tiện lợi.
  - **Modal "Kích thước khoang" 2 tab chuẩn giao diện chuyên nghiệp:**
    - **Tab Cơ bản:** Hiển thị tổng kích thước khoang liên quan, ô nhập kích thước phân đoạn (mm) tự động cân chỉnh độ rộng khoang liền kề để bảo toàn tổng kích thước; dropdown chọn/override thanh profile đố nhôm từ danh mục hệ nhôm đang chọn; nút chuyển nhanh kiểu cắt (`Lọt khung →`, `Phủ khung →`, `Cắt mòi 45° →`, `Vuông 90° →`); nút **Xóa đố này** hỗ trợ gộp 2 khoang liền kề trở lại thành 1 ô kính hoàn chỉnh hoặc trả về ô cha ban đầu.
    - **Tab Nâng cao:** Hiển thị hướng dẫn quy tắc giao cắt đố _Local transpose_, hỗ trợ định hình đầu thao tác, chọn kiểu cắt mòi/vuông và hướng ưu tiên tại các nút giao cắt đố chữ T / chữ Thập.
  - **Bảo toàn dữ liệu theo chuẩn camelCase:** Tích hợp `MullionInfo` và `MullionCutType` vào cấu trúc node của `systemConfig`, cập nhật mượt mà vào lịch sử Undo/Redo của Studio.
- **Chuẩn Hóa Tỷ Lệ Kích Thước Hình Học Ô Cửa Theo Thông Số Kỹ Thuật Thực Tế ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>)):**
  - **Khắc phục lỗi hiển thị sai lệch tỉ lệ kích thước:** Trước đây khi chia đố (`mullion`) hoặc tách khung (`coupling`), hàm `traverseTree` chia đều cứng `availSpace / count` khiến các ô có số đo khác nhau (ví dụ: ô trên 500mm, ô dưới 1100mm) bị vẽ bằng nhau 50% - 50%.
  - **Tính toán theo tỷ lệ trọng số thực tế:** Tính tổng trọng số `totalWeight` của các ô con theo `child.w` (nếu chia dọc) hoặc `child.h` (nếu chia ngang); tỷ lệ vẽ pixel trên canvas co giãn chính xác 100% theo số đo mm thực tế (ô 1100mm hiển thị cao hơn 2.2 lần so với ô 500mm).
- **Bổ Sung Thước Đo Kích Thước Chiều Rộng Từng Cánh Cho Cửa 2 Cánh (`swing_double`) ([`door-cad-renderer.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/cad-engine/door-cad-renderer.tsx>)):**
  - **Tự động bóc tách phân đoạn kích thước:** Với các mẫu cửa hoặc ô chứa cánh mở quay đôi (`swing_double`), hệ thống tự động sinh 2 phân đoạn kích thước chiều rộng bằng nhau (ví dụ: `700` và `700` cho cửa tổng 1400mm).
  - **Hiển thị tầng gióng thước đo đa tầng:** Thước đo phân đoạn của 2 cánh (`700 | 700`) được hiển thị rõ nét ở tầng trong của cạnh đáy, nằm phía trên thước đo tổng phủ bì (`1400`), đồng bộ hoàn hảo với cách gióng kích thước phân tầng của chiều cao (`500 | 1100` và `1600`) ở cạnh phải.
- **Nâng Cấp Khung Nhìn CAD Canvas Chuẩn Figma / AutoCAD ([`canvas-cad-view.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/studio/panels/canvas-cad-view.tsx>)):**
  - **Scroll to Zoom (Lăn chuột phóng to / thu nhỏ):** Bắt sự kiện `wheel` không bị chặn bởi cuộn trang (`passive: false`), cho phép phóng to / thu nhỏ bản vẽ mượt mà từ 0.3x đến 3.5x.
  - **Click & Drag Pan (Bấm giữ và kéo di chuyển khung nhìn):** Thêm trạng thái `pan = { x, y }`, hỗ trợ click chuột trái hoặc chuột giữa vào vùng trống ngoài cửa để kéo rê bản vẽ tự do trong không gian canvas 2D.
  - **Bấm ra ngoài để tắt focus ô kính (Deselect on Outside Click):** Khi nhấp chuột vào nền canvas, khung bao ngoài hoặc vùng trống bên ngoài ô cửa (không phải thao tác kéo pan), hệ thống tự động hủy trạng thái chọn (`selectedCellId = null`), ẩn viền nét đứt focus và chuyển bảng `CellInspector` về trạng thái mặc định.
  - **Con trỏ chuột trực quan:** Tự động chuyển đổi giữa `cursor-grab` (bàn tay mở) và `cursor-grabbing` (bàn tay nắm) khi đang kéo di chuyển; ưu tiên chọn ô kính khi nhấp trực tiếp vào ô.
  - **Hiển thị tỷ lệ thu phóng:** Bổ sung phần trăm zoom thực tế (ví dụ: `100%`, `120%`) và cập nhật thanh hướng dẫn thao tác phía dưới.

## [Unreleased] - 2026-09-19

### Enhanced & Refactored (Native iOS Stop-Detection Engine & Battery Optimization)

- **Tái Cấu Trúc Động Cơ Định Vị Nền Native iOS Sang Mô Hình Chuẩn Life360 & Transistor ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift)):**
  - **Tích hợp cảm biến chuyển động `CMMotionActivityManager`:** Khai báo quyền `NSMotionUsageDescription` trong [`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist), theo dõi trạng thái `stationary`, `walking`, `running`, `automotive` trực tiếp qua bộ vi xử lý M-series tiết kiệm năng lượng của chip Apple.
  - **Cơ chế Stop-Detection Engine tự động ngắt GPS khi Đứng yên:** Khi nhân viên đứng yên quá 2 phút, app tự động gửi 1 gói tin chốt hạ vị trí neo (`stationary`), thiết lập vùng Geofence `CLCircularRegion` bán kính 100m, kích hoạt Significant Location Changes (SLC) và **gọi `locationManager.stopUpdatingLocation()` để tắt hoàn toàn chip GPS**, đưa app vào giấc ngủ sâu nhằm tiết kiệm 100% pin điện thoại.
  - **Tự động đánh thức và tái kích hoạt GPS khi Di chuyển:** Khi người dùng bước đi/lên xe (`walking`/`automotive`) hoặc bước ra khỏi bán kính 100m (`didExitRegion`), phần cứng iOS tự động đánh thức app dậy ➔ Chuyển ngay sang chế độ dẫn đường cao cấp `kCLLocationAccuracyBestForNavigation` và `activityType = .automotiveNavigation`.
  - **Bộ lọc sai số GPS thích ứng khi thức dậy:** Nới lỏng dung sai `accuracy` lên 90m trong khoảnh khắc đầu tiên xuất phát (`isMovingTransition`), đảm bảo gói tin khởi động không bị vứt bỏ trước khi chip GPS khóa đủ vệ tinh ngoài trời.
  - **Dọn dẹp GCD Timer không khả dụng:** Loại bỏ hoàn toàn luồng `DispatchSourceTimer` (vốn bị iOS Kernel đóng băng khi khóa màn hình) để chuyển hẳn sang cơ chế đánh thức dựa trên sự kiện phần cứng chuẩn Apple.

## [1.0.0] - 2026-09-18

### Fixed & Enhanced (Native iOS Background Location Engine - Chuẩn GCD Kernel Timer & Continuous Tracking)

- **Nâng Cấp Động Cơ Định Vị Chạy Ngầm Native iOS & Khắc Phục Lỗi Mất Tín Hiệu Khi Đứng Yên ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift)):**
  - **Khắc phục triệt để lỗi mất kết nối sau 15 phút khi đặt máy yên trên bàn:** Thay thế hoàn toàn `Timer` trên Main RunLoop (vốn bị iOS đóng băng ngay khi khóa màn hình) bằng **`DispatchSourceTimer` (GCD Kernel Timer)** chạy độc lập trên background queue (`com.xttech.ios.heartbeatQueue`), định kỳ gửi ping nhịp tim thật lên Backend mỗi 60 giây.
  - **Cấu hình `kCLDistanceFilterNone` & `activityType = .other`:** Loại bỏ rào cản lọc 5 mét (khiến máy đứng yên 0m không bao giờ kích hoạt callback), cho phép CoreLocation duy trì liên tục luồng cập nhật ngầm.
  - **Nới lỏng dung sai sai số trong phòng (250m):** Chấp nhận tọa độ ban đầu và nhịp tim trong nhà với độ chính xác đến 250m, tránh tình trạng sóng yếu trong phòng bị loại bỏ.
  - **Chủ động làm mới tọa độ (`locationManager.requestLocation()`):** Tự động kích hoạt chip GPS lấy điểm mới nếu chưa có điểm neo ban đầu trong chu kỳ của Timer.
  - **Bổ sung quyền `fetch` & `processing` vào `UIBackgroundModes` ([`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist)):**
    - Khởi tạo công tắc gạt **"Làm mới trong nền" (Background App Refresh)** trong Cài đặt của iPhone/iPad (giống như Messenger, Zalo).
    - Cấu hình các định danh tác vụ nền `BGTaskSchedulerPermittedIdentifiers` (`com.xttech.app.refresh`, `com.xttech.app.background-processing`), cho phép app giữ nhịp tim định kỳ và chạy ngầm bền bỉ mà không bị iOS đình chỉ tiến trình.
  - **Khắc phục lỗi cú pháp Swift:** Đóng chuẩn xác hàm `openSettings` và loại bỏ hoàn toàn đoạn code lặp `didUpdateLocations`.

### Added & Enhanced (User Profile & Avatar Auto-Synchronization)

- **Tự Động Đồng Bộ Hồ Sơ & Ảnh Đại Diện Ngầm (Background Profile Revalidation & Cache-Busting) ([`useAuthStore.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/stores/useAuthStore.ts), [`layout.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/layout.tsx>), [`mobile-header.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/mobile-header.tsx>)):**
  - **Khắc phục triệt để lỗi avatar cũ trên điện thoại nhân viên sau khi Admin cập nhật:** Khi Admin thay đổi avatar hoặc quyền hạn của nhân viên từ trang quản trị, điện thoại nhân viên trước đây không nhận được do dữ liệu `user` bị đóng băng trong `localStorage` (`xt-auth`).
  - **Tự động đồng bộ ngầm khi mở ứng dụng (`AppLayout`):** Ngay sau khi xác thực token thành công, tự động gọi ngầm `getUser(currentUserId)` từ backend để lấy thông tin mới nhất và cập nhật vào `useAuthStore` mà không làm gián đoạn hay làm chậm giao diện của nhân viên.
  - **Bổ sung phương thức `updateUser` & `setUser` trong `useAuthStore`:** Cho phép cập nhật linh hoạt các trường hồ sơ (avatar, roles, positions, fullName) và đồng bộ tức thì vào cookie `xt-auth` cũng như `localStorage`.
  - **Tích hợp đồng bộ hồ sơ vào nút Refresh của `MobileHeader`:** Khi nhân viên chạm nút Làm mới dữ liệu trên dashboard di động, app đồng thời kéo lại thông tin cá nhân mới nhất từ server.
  - **Cơ chế Cache-Busting cho Avatar:** Bổ sung query string `?v=${user.updatedAt}` vào URL ảnh avatar trên `MobileHeader`, `HeaderProfile` và `ProfileCard`, đảm bảo trình duyệt mobile và PWA Webview luôn tải phiên bản ảnh mới nhất, tránh bị dính cache ảnh cũ.

### Added & Enhanced (Page Loader & Transition System)

- **Nâng Cấp Tiến Trình Nạp Trang 0 - 100% & Khử Hiện Tượng Chớp Nháy Khung Hình ([`page-loader.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/page-loader/page-loader.tsx), [`PageTransitionProvider.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/contexts/PageTransitionProvider.tsx)):**
  - **Chuyển đổi từ thanh shimmer vô tận sang thanh tiến trình thực tế:** Hiển thị thanh nạp fill theo phần trăm thực tế (`0%` -> `100%`) kèm nhãn số phần trăm sắc nét (`tabular-nums`) và màu thương hiệu XTTech (`#045863` -> `#088395` -> `#0A97B0`).
  - **Mô phỏng tiến trình thông minh (Smart Simulated Progress):** Tăng nhanh phản hồi tức thì lên 15-30% ngay khi chạm, tăng dần đều mượt mà lên ~90% trong lúc nạp, và tự động hoàn thành 100% khi trang đã sẵn sàng.
  - **Thời gian hiển thị tối thiểu 1 giây (Minimum 1000ms Duration):** Đo lường `startTimeRef` và tự động bù trừ thời gian chênh lệch (`Math.max(0, 1000 - elapsed)`) đối với các trang nạp từ cache quá nhanh (50ms - 100ms), triệt tiêu hoàn toàn hiện tượng nhấp nháy (flicker) gây mỏi mắt người dùng.
  - **Giới hạn hiển thị độc quyền trên thiết bị Mobile (< 768px):** Tích hợp kiểm tra `isMobileScreen()` trong [`PageTransitionProvider.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/contexts/PageTransitionProvider.tsx) và class CSS `md:hidden` tại [`page-loader.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/page-loader/page-loader.tsx), tắt hoàn toàn màn hình loader trên Desktop để người dùng PC chuyển trang tức thì không bị che khuất tầm nhìn, đồng thời giữ nguyên trải nghiệm Super App mượt mà trên Mobile & App iOS/Android.
  - **Hiệu ứng sóng nước dâng theo tiến trình & 1 ngọn sóng cuộn trào đồng nhất màu chủ đạo XTTech:**
    - **Chiều cao dâng nước:** Mực nước dâng tỉ lệ thuận với `currentProgress` từ 10% cơ sở và đạt đỉnh chạm ngưỡng tối đa đúng **50% chiều cao màn hình** (`50vh`) khi nạp đạt 100% (`transition: height 300ms ease-out`).
    - **1 ngọn sóng duy nhất chuẩn màu XTTech (#045863):** Loại bỏ hoàn toàn lớp sóng mờ phụ phía sau, chỉ giữ lại 1 ngọn sóng chính sắc nét cuộn dập dềnh (`wave-flow` 2.8s) liền mạch với thân nước bên dưới tạo thành một khối nước màu chủ đạo `#045863` thống nhất, rõ ràng và sang trọng.
  - **Tinh chỉnh bố cục tối giản chuẩn Mobile UX:**
    - Thu nhỏ khung icon xuống `h-14 w-14` (56px) và biểu tượng `size={24}` thanh thoát.
    - Lược bỏ hoàn toàn nhãn chữ "Tiến trình nạp" và số phần trăm `%`, nâng cấp thanh Progress Bar lên độ dày vừa vặn `h-2.5` (10px) giúp dải chuyển màu thương hiệu hiển thị rõ ràng và bắt mắt.
    - Đẩy cụm thông tin lên vị trí 1/3 phía trên màn hình (`pt-[10vh]`), tạo khoảng thở thị giác rộng rãi và thoáng đãng, tuyệt đối không bị ngọn sóng 50vh che khuất.

### Fixed (Page Transition Lifecycle & Route Duplication)

- **Khắc phục triệt để lỗi kẹt loading 7 giây khi bấm lại vào chính trang đang đứng:**
  - Bổ sung Guard Clause `isSameRoute(targetUrl)` so sánh chính xác cả `pathname` và `searchParams` chuẩn hóa (loại trừ trailing slash).
  - Bỏ qua ngay lập tức và không kích hoạt `isTransitioning = true` trong `startTransition`, `navigateTo`, `handleGlobalClick`, và `window.history.pushState` khi người dùng bấm lại vào cùng trang hiện tại, giải quyết nguyên nhân Next.js không đổi route khiến effect tắt loader không chạy và bị kẹt chờ timer 7 giây.
- **Khắc phục triệt để lỗi Race Condition khiến loader bị đơ cứng ở 34%:**
  - Bổ sung `fromPathRef` lưu lại URL ban đầu khi bắt đầu transition.
  - Ngăn chặn `useEffect` chạy sớm khi `pathname` vẫn là trang cũ, chỉ kích hoạt giai đoạn hoàn tất 100% khi Next.js thực sự chuyển sang URL mới (`currentUrl !== fromPathRef`).
  - Loại bỏ hoàn toàn lỗi hàm cleanup của React hủy ngang `finishInterval` giữa chừng khi Next.js cập nhật route.
- **Khắc phục triệt để hiện tượng nháy nhẹ khi bấm vào icon chuyển trang:**
  - Loại bỏ hoàn toàn hiệu ứng mờ dần lúc mở (`transition-all duration-300`), chuyển sang cơ chế **Instant Snap-In 0ms**: khi người dùng chạm vào icon, màn hình loading lập tức phủ trắng 100% che đậy hoàn toàn trang cũ, triệt tiêu 100% cảm giác màn hình bị chớp mờ nửa trong suốt.
  - Tách biệt cơ chế fade-out mượt mà (`transition-opacity duration-200`) chỉ áp dụng khi giai đoạn nạp đã hoàn tất 100% để hiển thị trang mới êm dịu.
  - Bọc `setTimeout(0)` trong `window.history.pushState` và `replaceState` để tuân thủ nghiêm ngặt chuẩn React 19 (ngăn chặn lỗi `useInsertionEffect must not schedule updates`), đồng thời giữ cơ chế bắt sự kiện click DOM (`handleGlobalClick`) trực tiếp 0ms tức thì khi người dùng chạm vào icon.
- **Đồng bộ hóa 100% màu sắc và triệt tiêu toàn bộ ranh giới, đường kẻ trên sóng nước:**
  - Tách riêng thẻ `<path>` tô màu (`stroke="none"`) và `<path>` kẻ viền đỉnh sóng (`stroke="#045863"`), loại bỏ hoàn toàn các cạnh khép góc thẳng đứng ở 2 đầu SVG (`x=0` và `x=1200`), xóa sổ vệt kẻ dọc giữa ngọn sóng.
  - Đồng bộ hóa toàn bộ thân sóng SVG và khối thân nước bên dưới về chung duy nhất một mã màu phẳng Solid chuẩn thương hiệu XTTech (`#5A949C`), loại bỏ hoàn toàn hiện tượng lệch tông màu do dải gradient không đồng đều.
  - Chuẩn hóa chuyển động cuộn sóng thuần ngang (`0%` -> `-50%` trục X) kết hợp kéo dài đáy SVG xuống `y=160` và tăng gối đè an toàn `-mt-3` (12px), biến toàn bộ mặt nước thành một khối liền lạc, mịn màng và không một vết gãy khúc.
- **Khắc phục cảnh báo gọi `setState` đồng bộ trong `useEffect` gây cascading render ([`page-loader.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/page-loader/page-loader.tsx)):**
  - Chuyển `currentProgress` sang mô hình Trạng thái suy luận (Derived State): khi `!isVisible` tự động trả về `0`, loại bỏ hoàn toàn lệnh `setInternalProgress(0)` chạy đồng bộ trên luồng chính của `useEffect`.
  - Khởi tạo tiến trình mượt mà bên trong callback `setInterval` bất đồng bộ và dọn dẹp biến đếm ở hàm `cleanup`, tuân thủ 100% nguyên tắc chuẩn của React 19 và React Compiler.
- **Triệt tiêu hiện tượng nháy đổi icon (từ Loader2 sang icon tính năng thật):**
  - Vô hiệu hóa `PageLoader` trùng lặp trong Next.js native Suspense fallback ([`(sidebar)/loading.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/loading.tsx>) và [`app/loading.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/loading.tsx>)).
  - Trao quyền duy nhất cho `PageTransitionProvider` quản lý màn hình loading, đảm bảo icon chính xác của trang đích được hiển thị ngay lập tức từ mili-giây đầu tiên, xóa bỏ hoàn toàn hiện tượng 2 loader tranh chấp gây chớp đổi icon.

## [Unreleased] - 2026-09-17

### Added & Enhanced (Page Transition Loader)

- **Triển khai Màn hình Loading Chuyển Trang Tức Thì (Zero-Delay Page Transition Loader) Chuẩn Super-App ([`src/components/page-loader`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/page-loader), [`src/contexts/PageTransitionProvider.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/contexts/PageTransitionProvider.tsx)):**
  - **Khắc phục triệt để hiện tượng trễ (delay) khi bấm chuyển trang trên Mobile/iOS:** Giải quyết điểm nghẽn do Next.js chờ tải JS chunks & server API bằng kiến trúc App Shell Pre-loaded Loader.
  - **Phản hồi tương tác tức thì 0ms:** Màn hình loading nằm sẵn trong bộ nhớ RAM của Shell Layout, được kích hoạt ngay khi chạm ngón tay vào link hoặc gọi chuyển trang mà không cần chờ nạp script qua mạng.
  - **Thiết kế thương hiệu XTTech chuẩn mực ([`page-loader.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/page-loader/page-loader.tsx)):**
    - Header đầy đủ nút Quay lại (Back), tiêu đề trang đích, và nút Trang chủ (Home).
    - Khung Icon nổi bật kèm hiệu ứng nhịp thở (`pulse`) và tên tính năng cụ thể tương ứng với từng đường dẫn route đích ([`route-metadata.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/utils/route-metadata.ts)).
    - Thanh tiến trình Progress bar gradient màu chủ đạo XTTech (`#045863` sang `#088395`) chuyển động liên tục (`shimmer`).
    - Nền sóng uốn lượn (SVG Wave) phía chân trang với tone màu pastel XTTech dịu mắt và sang trọng.
  - **Tích hợp toàn diện & Tương thích React 19 / Next.js 16:** Bổ sung `PageTransitionProvider` tại [`AppLayout`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/layout.tsx>), kết hợp bắt sự kiện click link nội bộ toàn cục; tối ưu hóa lịch biểu `startTransition` qua `setTimeout(..., 0)` để tương thích tuyệt đối với `useInsertionEffect` trong React 19; đồng thời hỗ trợ native Next.js Suspense fallback tại [`(sidebar)/loading.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/loading.tsx>).

### Added & Enhanced (Auto Timekeeping Camera Compatibility)

- **Tối ưu hóa Khả năng Tương thích Camera Chấm công trên iOS/Android ([`auto-timekeeping-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/auto-timekeeping-modal/auto-timekeeping-modal.tsx)):**
  - **Cơ chế Fallback 3 tầng:** Tự động chuyển cấp độ ràng buộc từ HD (`1280x720`) -> Camera trước chuẩn (`facingMode: 'user'`) -> Bất kỳ camera nào khả dụng (`video: true`) nhằm khắc phục triệt để lỗi `OverconstrainedError` trên các dòng iPhone kén tỷ lệ khung hình.
  - **Tích hợp Cơ chế Chụp ảnh Bằng Camera Gốc (HTML5 Native Camera Fallback - `capture="user"`):** Bổ sung giải pháp cứu cánh tối thượng khi gặp các thiết bị iPhone bị Apple khóa WebRTC Live Stream (như chế độ PWA hoặc lỗi WebKit). Tự động hiển thị nút "Mở Camera máy" kích hoạt ứng dụng Camera gốc của iPhone ở chế độ Selfie, đảm bảo 100% người dùng chấm công thành công mà không bị chặn bởi bất kỳ rào cản bảo mật nào.

### Fixed (Route Playback Modal)

- **Khắc phục lỗi bản đồ tự động reset zoom / thu nhỏ khi đang xem lộ trình ([`src/components/map-modal/route-playback-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/map-modal/route-playback-modal.tsx)):**
  - **Khống chế số lần tự động căn chỉnh (`hasFittedBoundsRef`):** Chỉ tự động gọi `fitBounds()` 1 lần duy nhất khi dữ liệu lộ trình vừa được nạp lần đầu hoặc khi đổi ngày / nhân viên. Không tự động gọi lại làm giật màn hình khi thuật toán nắn đường OSRM chạy xong hoặc khi component re-render.
  - **Ghi nhớ tham chiếu mảng tọa độ (`useMemo`):** Bọc `points`, `polylineCoords`, và `displayedCoords` bằng `useMemo` để tránh sinh mảng mới ở mỗi vòng render gây trigger `useEffect` thừa.
  - **Bổ sung nút Căn vừa lộ trình (`Focus` button):** Thêm nút bấm căn vừa toàn cảnh lộ trình chủ động ở góc dưới bên phải cạnh nút phóng to toàn màn hình.

## [Unreleased] - 2026-09-16

### Fixed & Enhanced (iOS Background Geolocation)

- **Tái Cấu Trúc Toàn Diện Định Vị Ngầm iOS Theo Kiến Trúc Chuẩn Doanh Nghiệp (Zalo / Life360):**
  - **Khắc phục triệt để lỗi mất biểu tượng định vị sau 1-2 phút khi ra nền / khóa màn hình ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift)):**
    - Loại bỏ hoàn toàn lỗi xung đột luồng: chuyển toàn bộ các lệnh gọi UIKit (`UIApplication.shared.beginBackgroundTask` và `UIDevice.current`) về Main Thread (`DispatchQueue.main.async`), triệt tiêu hoàn toàn lỗi Crash âm thầm và lỗi Watchdog Termination `0x8badf00d`.
    - Gỡ bỏ `startUpdatingHeading()` (cảm biến la bàn): triệt tiêu lỗi `kCLErrorHeadingFailure` bị hệ điều hành ngắt phiên khi ứng dụng chuyển sang trạng thái chạy nền.
    - Chuẩn hóa cấu hình `CoreLocation`: đổi sang `kCLLocationAccuracyBest` và `CLActivityType.other` để tránh cơ chế `locationd` tự động dừng nhận diện khi người dùng đứng yên trong phòng.
    - Loại bỏ mẹo âm thanh ảo `AVAudioPlayer` gây lỗi bị daemon `mediaserverd` của iOS 16/17/18 đình chỉ, đồng thời dọn sạch thẻ `<string>audio</string>` trong [`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist).
  - **Tích Hợp Cơ Chế Vùng Neo Tròn Khi Đứng Yên (Stationary Region Geofence):**
    - Tự động dựng `CLCircularRegion` bán kính 50m quanh vị trí nhân viên khi ngồi làm việc trong phòng; khi nhân viên bước ra ngoài, iOS tự động bắn sự kiện `didExitRegion` đánh thức định vị tần số cao ngay lập tức.
    - Đảm bảo gửi nhịp tim Heartbeat đều đặn mỗi 60 giây khi đứng yên, giúp nhân viên không bao giờ bị hiển thị Offline trên hệ thống quản lý.
  - **Cơ Chế Hồi Sinh Khi Ứng Dụng Bị Thu Hồi RAM (Significant Location Changes):**
    - Đăng ký `startMonitoringSignificantLocationChanges()` và tự động tái khởi tạo theo dõi vị trí trong `AppDelegate` & `load()` nếu ca làm việc trước đó đang diễn ra.

### Changed & Assets

- **Đồng Bộ App Icon iOS Khớp Nhận Diện Thương Hiệu Android ([`AppIcon-512@2x.png`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png)):**
  - Thay thế toàn diện icon mặc định màu xanh dương của Capacitor bằng logo XTTech chính thức xuất từ file vector gốc [`logo-xttech.svg`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/public/image-xttech/logo-xttech.svg).
  - Tối ưu kích thước hiển thị chuẩn Apple HIG: canvas 1024x1024 px, tỷ lệ logo căn giữa 56% trên nền trắng thuần `#FFFFFF`, loại bỏ hoàn toàn kênh Alpha (RGB 24-bit) để tránh lỗi từ chối của App Store hoặc lỗi nền đen khi bo góc.
  - Đồng bộ giao diện biểu tượng ứng dụng hoàn toàn thống nhất giữa hai nền tảng Android và iOS.

## [Unreleased] - 2026-09-15

### Changed & Configured

- **Cấu hình Ứng dụng Di động Tràn viền Toàn màn hình trên iOS ([`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist)):**
  - Bổ sung `<key>UIStatusBarHidden</key><true/>` và chuyển `<key>UIViewControllerBasedStatusBarAppearance</key><false/>`.
  - Ẩn hoàn toàn thanh trạng thái hệ thống (Status Bar gồm giờ, pin, cột sóng, wifi) trên iPhone, giúp giao diện ứng dụng hiển thị tràn viền toàn màn hình (True Fullscreen) liền mạch, tối ưu diện tích hiển thị cho nhân viên.

## [Unreleased] - 2026-09-14

### Fixed

- **Khắc phục Triệt để Lỗi SSR "window is not defined" do Leaflet:**
  - Chuyển toàn bộ `import L from 'leaflet'` sang `import type L from 'leaflet'` trong [`route-playback-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/map-modal/route-playback-modal.tsx), đảm bảo mã Leaflet không bao giờ bị thực thi trên môi trường Server (Node.js).
  - Khởi tạo icon tùy chỉnh và `fitBounds` hoàn toàn qua dynamic runtime `leaflet` được nạp an toàn trên Client (`useEffect`).

### Changed & Optimized

- **Tối ưu Barrel Export & Cô lập Bản đồ:**
  - Gỡ bỏ `export * from './map-modal'` khỏi [`src/components/index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/index.ts) để giải phóng toàn bộ `AdminLayout` và các trang vệ tinh khỏi việc nạp mã Leaflet nặng trên Server.
  - Áp dụng `dynamic(() => import('./_components/live-map').then((mod) => mod.LiveMap), { ssr: false })` cho trang [`live-map/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/live-map/page.tsx>).
- **Render Động Tiện Ích Doanh Nghiệp Theo Phân Quyền Vai Trò (Role-based RBAC):**
  - Tái cấu trúc [`QuickActionsGrid`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/quick-actions-grid.tsx>) trên Dashboard di động: tích hợp trực tiếp với ma trận phân quyền `isRouteAllowedForRole` từ [`src/config/sidebar.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/config/sidebar.ts) và `useAuthStore`.
  - Tự động ẩn/hiện các tính năng theo đúng vai trò thực tế của người dùng (`admin`, `hr`, `sale`, `technician`, `accountant`, `employee`), triệt tiêu lỗi 403 Forbidden khi nhân viên bấm vào tính năng quản trị.
  - Cập nhật số lượng tính năng hiển thị linh hoạt `{visibleActions.length} tính năng` thay vì viết cứng.
- **Phân Quyền Khối Lịch Sử Dashboard & Bảo Vệ Nhật Ký Hệ Thống (Audit Logs):**
  - Tạo mới component [`PersonalAttendanceHistory`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/personal-attendance-history.tsx>) hiển thị 5 ngày chấm công gần nhất của chính nhân viên (ngày, ca, giờ check-in/out, badge đúng giờ/muộn).
  - Ẩn hoàn toàn [`SystemHistory`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/system-history.tsx>) (Audit Log nhạy cảm) đối với các vai trò `employee`, `technician`, `sale`, `accountant` và thay thế bằng `PersonalAttendanceHistory`.
  - Giữ lại `SystemHistory` chỉ cho `admin` và `hr`.
- **Chuẩn Hóa Màu Sắc Tối Giản & Đồng Bộ Màu Thương Hiệu (Design System Alignment):**
  - **Khối Yêu cầu chờ phê duyệt ([`PendingApprovalsCard`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/pending-approvals-card.tsx>)):**
    - Loại bỏ hoàn toàn các viền vàng chói, nền vàng và các nút màu cam/xanh rời rạc.
    - Chuẩn hóa theo phong cách Corporate Minimalist: viền xám nhẹ `border-gray-100`, icon tiêu đề & badge số lượng đồng bộ màu nhận diện thương hiệu `bg-primary/10 text-primary` (`#045863`).
    - 2 Thẻ hành động nhanh ("Đơn nghỉ phép" & "Giải trình công") chuyển sang dạng thẻ trung tính hiện đại: nền xám nhạt `bg-gray-50/80` viền mảnh, icon màu thương hiệu tinh tế.
  - **Biểu đồ Chuyên cần 7 ngày ([`WeeklyAttendanceChart`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/weekly-attendance-chart.tsx>)):**
    - Cột **"Có mặt"**: Chuyển từ màu xanh neon `#10b981` sang màu nhận diện thương hiệu XTTech **`#045863` (Teal)**.
    - Cột **"Đi muộn"**: Chuyển từ màu cam chói `#f59e0b` sang tone trung tính nhẹ **`#94a3b8` (Slate-400)** dịu mắt, không gây rối mắt cho người quản lý.
    - Hiệu ứng hover chuột: Dùng dải mờ nhẹ `rgba(0, 0, 0, 0.03)` thay cho khối xám đặc.

### Removed

- **Dọn dẹp Mã nguồn Trùng lặp (DRY):**
  - Xóa bỏ file trùng lặp `src/app/(auth)/app/(sidebar)/attendances/_components/route-playback-modal.tsx`.
  - Tái sử dụng thống nhất [`RoutePlaybackModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/map-modal/route-playback-modal.tsx) trên cả 2 trang Chấm công (`attendances`) và Bản đồ trực tiếp (`live-map`).

## [Unreleased] - 2026-09-12

### Added & Redesigned

- **Thiết kế lại Trang Dashboard Doanh Nghiệp Thời Gian Thực & Bộ Tiện Ích Di Động Super-App ([`dashboard/`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard>)):**
  - **Loại bỏ triệt để dữ liệu mockup ảo:** Thay thế toàn bộ các chỉ số thống kê giả lập, tài liệu ảo, lịch đào tạo ảo và biểu đồ tĩnh bằng 100% dữ liệu sống từ hệ thống (Nhân sự, Chấm công hôm nay, Đơn xin nghỉ phép đang chờ duyệt, Giải trình công, Dự án và GPS Live Map).
  - **Trải nghiệm Mobile Chuẩn Super-App Doanh nghiệp (Lark Suite / Base.vn style):**
    - [`MobileHeader`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/mobile-header.tsx>): Lời chào cá nhân hóa thông minh theo thời gian trong ngày, Avatar, Chức vụ, Thứ/Ngày/Tháng tiếng Việt kèm nút làm mới tức thì.
    - **Tối ưu hóa Toàn diện UI/UX Modal Chấm Công Tự Động ([`src/components/auto-timekeeping-modal/`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/auto-timekeeping-modal)):**
      - **Tối ưu Layout & Xóa bỏ khoảng trắng thừa:** Chuyển layout sang dạng Sticky Footer cố định ở chân trang với dải nền phân cách nổi bật; khu vực nội dung bên trên co giãn linh hoạt và cuộn mượt mà trên thiết bị di động.
      - **Thiết kế lại Nút hành động chính (CTA):** Thay thế nút tròn cũ bằng nút chữ nhật bo góc rộng toàn mép (full-width) màu xanh ngọc chủ đạo (Teal/Primary) với nhãn hành động rõ ràng: `📸 Chụp ảnh chấm công` ở bước chụp và `Xác nhận Check-in / Check-out` ở bước xác nhận.
      - **Đồng nhất Màu sắc & Cấu trúc Badge:** Thay các badge màu chói bằng badge nền đen bán trong suốt (`rgba(0,0,0,0.6)` + `backdrop-blur-md`) viền kính tinh tế; camera trực tiếp sử dụng dấu chấm đỏ nhấp nháy (pulsating red dot) kèm nhãn "Trực tiếp" sang trọng.
      - **Gom nhóm thông tin dạng Card UI:** Đặt cụm [Toạ độ + Bản đồ GPS] và [Ghi chú chấm công] vào các Card nền xám nhạt (`bg-slate-50 border border-slate-200/80 rounded-xl`), tạo phân cấp khối thông tin trực quan, ngăn nắp.
      - **Tinh chỉnh Typography & Icon:** Hạ cỡ chữ tiêu đề xuống mức chuẩn 18px-20px, đồng bộ phong cách và kích thước icon thống nhất trên toàn modal.

    - [`QuickActionsGrid`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/quick-actions-grid.tsx>): Lưới 8 tiện ích doanh nghiệp di động chuẩn 4 cột với icon bo góc mềm mại, phối màu hiện đại và badge đếm đơn từ chờ duyệt: Bản đồ Live, Xin nghỉ phép, Giải trình, Bảng công, Dự án, Danh bạ, Góp ý, Báo cáo.
    - [`PendingApprovalsCard`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/pending-approvals-card.tsx>): Thẻ cảnh báo và xử lý nhanh các đơn xin nghỉ phép và khiếu nại công dành riêng cho HR / Admin / Ban giám đốc.

  - **Trải nghiệm Desktop Bảng Điều Hành Trung Tâm (Command Center):**
    - 4 Thẻ KPI chính xác theo thời gian thực (Tổng nhân sự, Chuyên cần hôm nay, Hồ sơ chờ duyệt, Dự án đang chạy).
    - [`WeeklyAttendanceChart`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/weekly-attendance-chart.tsx>): Biểu đồ Recharts cột đôi thể hiện số lượng nhân sự có mặt và đi muộn trong 7 ngày gần nhất.
    - [`LiveStaffWidget`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/live-staff-widget.tsx>): Widget theo dõi danh sách kỹ thuật viên/nhân sự đang trực tuyến định vị GPS ngoài thực địa theo thời gian thực.
  - **Tích hợp API Backend & Cơ chế Fallback Không Gián Đoạn ([`src/actions/dashboard/index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/dashboard/index.ts)):**
    - Xây dựng action `getDashboardSummary()` ưu tiên gọi endpoint tổng hợp tối ưu từ backend, đồng thời trang bị cơ chế tự động fallback tổng hợp dữ liệu song song client-side từ các API sẵn có, đảm bảo hoạt động trơn tru 100% không gián đoạn trên cả môi trường local và production.

### Refactored & Enhanced

- **Tái cấu trúc & Nâng cấp Trải nghiệm Sidebar Quản trị ([`src/config/sidebar.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/config/sidebar.ts), [`src/components/sidebar/sidebar.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/sidebar/sidebar.tsx)):**
  - **Cặp Biểu Tượng Ghim / Hủy Ghim Thông Minh (Pin / PinOff):** Chuẩn hóa hoàn toàn nút điều khiển ở Header chỉ với 2 trạng thái: **Ghim 📌 (`Pin`)** khi đang mở tạm thời do rê chuột (hover) để cố định thanh menu mở rộng, và **Hủy ghim 📍✕ (`PinOff`)** khi đang mở cố định để chuyển sang chế độ tự động thu nhỏ khi rời chuột, loại bỏ hoàn toàn biểu tượng thu nhỏ rườm rà.
  - **Tính năng Hover-to-Expand thông minh & Chống giật vỡ chữ (Text Wrapping):** Khi Sidebar ở trạng thái thu nhỏ (`isCollapsed = true`), rê chuột vào sidebar sẽ tự động mở rộng mượt mà (`w-72`) kèm bóng nổi (`shadow-2xl z-30`). Áp dụng `whitespace-nowrap`, `truncate` và `overflow-hidden` trên toàn bộ nhãn, tiêu đề và menu con, triệt tiêu hoàn toàn hiện tượng chữ bị rớt thành 2 dòng rồi co lại thành 1 dòng trong quá trình co giãn chiều rộng.
  - **Tối ưu hóa Phân nhóm (Section):** Gom 5 nhóm rời rạc thành 4 nhóm cân đối, liền mạch: `Điều hành`, `Nhân sự & Chấm công`, `Dự án & Đối tác`, `Tiện ích & Hệ thống`.
  - **Đặt lại vị trí Bản đồ trực tiếp (Live Map):** Chuyển từ nhóm Nhân sự lên nhóm `Điều hành` cạnh `Tổng quan` đúng ngữ cảnh giám sát hiện trường thời gian thực.
  - **Hợp nhất và phân loại rõ ràng:** Tích hợp `Ca làm việc` vào hệ sinh thái Chấm công; đổi tên `Dự án` thành `Dự án & Đối tác` bao quát cả Khách hàng và Nhà cung cấp; gộp Góp ý và Quản trị thành `Tiện ích & Hệ thống`.
  - **Đồng bộ hóa Icon ngữ nghĩa:** Thay thế các icon trùng lặp bằng bộ icon trực quan của Lucide (`LayoutDashboard`, `Compass`, `Users`, `FolderKanban`, `Building2`, `ClockAlert`, `MessageSquarePlus`, `Sliders`).

- **Chuẩn hóa Đường dẫn Hình ảnh & Tệp tin ([`src/utils/string.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/utils/string.ts)):**
  - Xây dựng hàm tiện ích tập trung `getFileUrl(path, fallback)` xử lý toàn diện các trường hợp ngoại lệ: `undefined`/`null`, tự động chuẩn hóa dấu gạch chéo `/`, hỗ trợ link tuyệt đối (`http://`, `https://`, `blob:`, `data:`), loại bỏ triệt để hiện tượng URL rác hoặc double slash.

### Removed

- **Dọn dẹp các Component Mockup Thừa Không Sử Dụng:**
  - Xóa bỏ `src/app/(auth)/app/(sidebar)/dashboard/_components/document.tsx` (danh sách tài liệu mockup cũ).
  - Xóa bỏ `src/app/(auth)/app/(sidebar)/dashboard/_components/schedule.tsx` (lịch họp/đào tạo mockup cũ).
  - Xóa bỏ `src/app/(auth)/app/(sidebar)/dashboard/_components/analytics-chart.tsx` (biểu đồ mockup cũ đã được thay bằng `WeeklyAttendanceChart`).
  - Xóa bỏ `src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx` (file re-export trung gian cũ sau khi đã chuẩn hóa vị trí tại `src/components/auto-timekeeping-modal/`).

### Fixed & Enhanced

- **Khắc phục Triệt để Lỗi "Maximum update depth exceeded" do Resize Loop của Recharts ([`WeeklyAttendanceChart`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/dashboard/_components/weekly-attendance-chart.tsx>)):**
  - **Loại bỏ vòng lặp `setContainerSize`:** Gỡ bỏ state `barSize` và sự kiện resize thủ công `window.addEventListener('resize')` gây xung đột với `SizeDetectorContainer` của Recharts. Chuyển sang cơ chế tự co giãn tự nhiên qua `maxBarSize={32}` và `barCategoryGap="20%"`.
  - **Trang bị cơ chế Debounce & Mount an toàn:** Thêm `debounce={50}`, `minWidth={0}`, `minHeight={260}` và kiểm tra `mounted` trước khi render `ResponsiveContainer` trên client.
  - **Chống tràn lưới CSS Grid:** Bổ sung thuộc tính `min-w-0` vào các cột lưới `col-span-8` và `col-span-4` trên tất cả 6 trang Dashboard role (`admin`, `hr`, `employee`, `sale`, `technician`, `accountant`), triệt tiêu hoàn toàn hiện tượng layout co giãn không điểm dừng.
- **Tối ưu hóa Cơ chế Định vị Chạy Ngầm Native trên iOS ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift), [`NativeTrackingPlugin.m`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.m), [`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist)):**
  - **Khắc phục triệt để lỗi khóa màn hình bị ngắt kết nối (Offline):**
    - Loại bỏ mẹo "Silent Audio Keep-Alive" và chế độ `audio` ngầm (dễ bị iOS 15+ phát hiện tạm dừng và vi phạm Apple App Store Review Guideline 2.5.4).
    - Tự động kiểm tra và yêu cầu cấp quyền "Luôn luôn" (`authorizedAlways`) thay vì chỉ dừng ở "Khi dùng ứng dụng" (`authorizedWhenInUse`).
    - Bổ sung 2 native method `checkPermission` và `openSettings` hỗ trợ kiểm tra và điều hướng người dùng mở Cài đặt iPhone để nâng cấp quyền lên "Luôn luôn" và bật "Vị trí chính xác".
  - **Sửa lỗi biên dịch Xcode Build trên CI/CD (`NativeTrackingPlugin.swift`):**
    - Khắc phục lỗi `value of type 'CAPPluginCall' has no member 'reject'` bằng cách chuẩn hóa kết quả trả về `call.resolve(["success": false])` trong phương thức `openSettings`, đảm bảo tương thích hoàn toàn với kiến trúc SPM / Objective-C bridge của Capacitor và đồng bộ với interface `Promise<{ success: boolean }>` phía Frontend.
  - **Tận dụng Chu kỳ Đánh thức của CoreLocation khi ở trong phòng kín:**
    - Thay vì drop hoàn toàn các mốc vị trí có sai số $> 50\text{m}$ (do tường che khuất GPS trong phòng làm việc), hệ thống tận dụng các chu kỳ đánh thức của phần cứng để gửi gói tin Heartbeat duy trì kết nối với Điểm neo chuẩn xác cuối cùng (`lastAccurateLocation`) nếu đã quá 2 phút chưa gửi ping.
    - Đảm bảo nhân viên ngồi làm việc trong phòng khóa màn hình đút túi suốt ca làm vẫn duy trì trạng thái Trực tuyến (Đứng yên) và không bao giờ bị Backend chuyển sang Offline sau 10 phút.
- **Đồng bộ hóa Interface tại Web Frontend ([`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts)):**
  - Cập nhật interface `NativeTrackingPlugin` nhận diện `checkPermission` và `openSettings`.
  - Tự động kiểm tra quyền vị trí trên iOS sau khi bắt đầu tracking và phát cảnh báo nếu chưa được cấp quyền `Always`.

## [Unreleased] - 2026-09-11

- **Giải pháp Toàn diện Giữ Nhịp Chạy Ngầm & Chống Nhảy Bản Đồ trên iOS ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift) & [`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist)):**
  - **Tích hợp Silent Audio Keep-Alive chuẩn Enterprise:** Bổ sung quyền `audio` vào `UIBackgroundModes`, tự động khởi tạo luồng âm thanh tĩnh vô thanh trong bộ nhớ (in-memory 8kHz mono PCM WAV, volume = 0, loop vô hạn) kèm cấu hình `AVAudioSession` chế độ `.playback` và option `.mixWithOthers`. Giúp ngăn chặn 100% việc iOS đóng băng (suspend) tiến trình CPU và các Timer khi người dùng khóa màn hình hoặc chuyển sang ứng dụng khác mà không làm ảnh hưởng đến âm nhạc, cuộc gọi của người dùng.
  - **Cơ chế Neo Tọa Độ & Chống Nhảy Map (Anchor Point & Anti-Drift Filter):**
    - Thiết lập bộ lọc khắt khe: Chỉ cập nhật vị trí bản đồ khi độ chính xác thực tế $\le 50\text{m}$.
    - Khi nhân viên ở trong phòng kín/văn phòng (mất GPS, chỉ có sóng BTS/Wi-Fi sai số lớn), hệ thống tự động từ chối cập nhật tọa độ hiển thị để triệt tiêu hiện tượng "nhảy dù" (GPS drift/jitter) trên Live Map.
    - Timer Heartbeat định kỳ 2 phút sử dụng lại chính Điểm neo chuẩn xác cuối cùng (`lastAccurateLocation`) để gửi gói tin duy trì trạng thái lên máy chủ, đảm bảo nhân viên luôn hiển thị Online (Đứng yên) và không bao giờ bị Backend đánh dấu Offline sau thời gian nghỉ.
  - **Cấu hình `activityType = .otherNavigation`:** Tối ưu hóa bộ quản lý CoreLocation để báo hiệu cho iOS ưu tiên duy trì luồng định vị liên tục, tránh bị hệ điều hành giảm tần suất.

- **Nâng cấp Cơ chế Định vị Chạy Ngầm & Đánh thức Ứng dụng trên iOS ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift) & [`AppDelegate.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/AppDelegate.swift)):**
  - **Đăng ký `startMonitoringSignificantLocationChanges()` song song:** Cho phép hệ điều hành iOS tự động đánh thức (wake up / relaunch in background) ứng dụng khi nhân viên di chuyển đổi trạm phát sóng di động (Cell Tower / Wi-Fi), kể cả khi ứng dụng bị tạm đóng băng hoặc bị giải phóng bộ nhớ RAM.
  - **Xử lý `handleLocationWakeUp()` trong `AppDelegate`:** Bắt sự kiện `launchOptions[UIApplication.LaunchOptionsKey.location]` để tiếp tục quy trình định vị và gửi ping tọa độ dưới nền ngay khi được hệ điều hành kích hoạt.
  - **Thay thế Foundation `Timer` bằng `DispatchSourceTimer` trên Background Queue:** Chạy độc lập trên hàng đợi ngầm `com.xttech.ios.heartbeat`.

- **Hàm Tiện ích Xử lý Lỗi Toàn cục ([`error.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/utils/error.ts)):**
  - Xây dựng `getErrorMessage(err, fallback)` và `showErrorToast(err, fallback)` tự động bóc tách thông báo lỗi thông minh và an toàn kiểu (Type-safe) từ mọi định dạng phản hồi của server: FastAPI (`detail` dạng chuỗi hoặc mảng validation Pydantic), Backend Chấm công (`details.message`), Chuẩn Enterprise (`error.message`), NestJS/Express (`message` chuỗi hoặc mảng), và JavaScript/Axios Network Error.
  - Tích hợp và re-export tập trung qua [`src/utils/index.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/utils/index.ts).

### Changed / Refactored

- **Chuẩn hóa Xử lý Lỗi Toàn cục (DRY Error Handling) trên toàn hệ thống:**
  - **Module Chấm công (`attendances`):**
    - [`auto-timekeeping-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx>): Rút gọn khối `catch` chấm công tự động sang `showErrorToast`.
    - [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx>): Khối `handleDeleteConfirm` dùng `showErrorToast`.
    - [`overtime-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/overtime-modal.tsx>): Thay thế toàn bộ 6 dòng bóc tách lỗi thủ công trong `catch` bằng `showErrorToast`.
    - [`adjustments/_components/add-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/adjustments/_components/add-modal.tsx>): Loại bỏ hàm `handleCreateError` thủ công hơn 25 dòng, chuẩn hóa qua `showErrorToast`.
    - [`adjustments/_components/edit-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/adjustments/_components/edit-modal.tsx>): Bắt lỗi qua `showErrorToast`.
    - [`adjustments/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/adjustments/page.tsx>): Xử lý lỗi duyệt và xóa khiếu nại bằng `showErrorToast`.
    - [`reports/_components/action-bar.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/action-bar.tsx>): Xuất Excel bắt lỗi chi tiết qua `getErrorMessage`.
    - [`live-map/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx>): Bắt lỗi fetch vị trí qua `showErrorToast`.
    - [`edit-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/edit-modal.tsx>) & [`add-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/add-modal.tsx>): Đồng bộ callback `onError` sử dụng `showErrorToast`.
  - **Module Phiên bản Ứng dụng (`app-versions`):**
    - [`release-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/release-modal.tsx>): Đồng bộ `setErrorMsg` và `showErrorToast` cùng hiển thị message chi tiết từ server.
    - [`table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/table.tsx>): Chuẩn hóa `fetcher` `catch (err)` dùng `showErrorToast`.
  - **Module Nghỉ phép (`leave-requests`):**
    - [`leave-request-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/leave-requests/_components/leave-request-modal.tsx>): Thay thế toàn bộ 4 hàm `onError` của mutations (`create`, `update`, `delete`, `review`) sang `showErrorToast`.
  - **Module Ca làm việc (`shifts`):**
    - [`form-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/shifts/_components/form-modal.tsx>): Đồng bộ 2 callbacks `onError` (`createMutation`, `updateMutation`) sang `showErrorToast`.
    - [`table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/shifts/_components/table.tsx>): Bắt lỗi `deleteMutation.onError` bằng `showErrorToast`.
  - **Module Vai trò & Phân quyền (`roles`):**
    - [`role-table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/roles/_components/role-table.tsx>): Chuẩn hóa `fetcher` và `handleDeleteRole.onError` sang `showErrorToast`.
    - [`role-form-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/roles/_components/role-form-modal.tsx>): `onError` lưu vai trò dùng `showErrorToast`.
  - **Module Đề xuất & Góp ý (`suggestions`):**
    - [`suggestion-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/suggestions/_components/suggestion-modal.tsx>): Cập nhật 4 callbacks `onError` (gửi, cập nhật, xóa, duyệt đề xuất) sang `showErrorToast`.
    - [`suggestion-table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/suggestions/_components/suggestion-table.tsx>): `fetcher` bắt lỗi bằng `showErrorToast`.
  - **Module Dự án & Cấu hình Dự án (`projects` & `projects/configuration`):**
    - [`table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/table.tsx>): Bọc `fetcher` với try/catch gọi `showErrorToast`.
    - [`modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/modals.tsx>): Cập nhật `createMutation.onError` và `updateMutation.onError` sang `showErrorToast`.
    - [`quotation-modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/quotation-modals.tsx>): Cập nhật tạo và cập nhật báo giá `onError` sang `showErrorToast`.
    - [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/page.tsx>): Cập nhật `deleteProjectMutation.onError` sang `showErrorToast`.
    - [`[id]/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/page.tsx>): Chuẩn hóa `deleteProjectMutation.onError` và `changeQuotationStatus.onError` sang `showErrorToast`.
    - **Cấu hình Vật liệu (`materials`):** [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/materials/page.tsx>) & [`modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/materials/_components/modals.tsx>): Đồng bộ toàn bộ `onError` của xóa, tạo, sửa vật tư sang `showErrorToast`.
    - **Cấu hình Cửa (`doors`):** [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/page.tsx>) & [`modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/modals.tsx>): Đồng bộ toàn bộ `onError` của xóa, tạo, sửa hệ cửa sang `showErrorToast`.
    - **Cấu hình Phụ kiện (`accessories`):** [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/accessories/page.tsx>) & [`modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/accessories/_components/modals.tsx>): Đồng bộ toàn bộ `onError` của xóa, tạo, sửa phụ kiện sang `showErrorToast`.
  - **Module Khách hàng (`customers`):**
    - [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/page.tsx>): Cập nhật `deleteCustomerMutation.onError` sang `showErrorToast`.
    - [`modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx>): Cập nhật `createMutation.onError` và `updateMutation.onError` sang `showErrorToast`.
  - **Module Phòng ban (`departments`):**
    - [`table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/departments/_components/table.tsx>): Chuẩn hóa `deleteDepartment.onError` sang `showErrorToast`.
    - [`form-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/departments/_components/form-modal.tsx>): Đồng bộ `createDepartment.onError` và `updateDepartment.onError` sang `showErrorToast`.

## [Unreleased] - 2026-09-10

### Added

- **Nâng cấp & Chuẩn hóa Modal Lộ trình Di chuyển theo chuẩn Google Maps ([`route-playback-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/route-playback-modal.tsx>)):**
  - **Nút Thumbnail Chuyển đổi Vệ tinh / Bản đồ (Góc dưới bên trái):**
    - Thiết kế ô thumbnail vuông bo góc `w-14 h-14` chuẩn Google Maps với viền trắng nổi và nhãn chữ mờ dưới đáy.
    - Hiển thị ảnh chụp vệ tinh thực tế thu nhỏ khi ở chế độ đường phố (Giao thông) và ảnh bản đồ khi ở chế độ Vệ tinh; click hoán đổi linh hoạt giữa Bản đồ và Vệ tinh Hybrid.
  - **Nút Tròn Phóng to Toàn màn hình chuẩn Google Maps (Góc dưới bên phải):**
    - Tích hợp nút tròn màu trắng có icon 4 góc phóng to kinh điển của Google Maps ở góc dưới bên phải bản đồ.
    - Hỗ trợ phím tắt `Escape` để thu nhỏ nhanh.
  - **Khắc phục Triệt để Lỗi Phóng to (True 100vw x 100vh Fullscreen):**
    - Sử dụng `rootClassName="route-playback-fullscreen-root"` ghi đè toàn bộ padding/margin của Ant Design Modal, mở rộng modal tràn viền `100vw x 100vh`.
    - Khóa chiều cao khung bản đồ bằng CSS calc (`calc(100vh - 185px)`), triệt tiêu hoàn toàn lỗi suy biến chiều cao về `0px`.
    - Duy trì thẻ `<MapContainer>` luôn luôn được mount cố định; hiển thị banner nổi tinh gọn khi chưa có điểm GPS thay vì unmount bản đồ.
    - Bổ sung `fitBounds` tự động căn chỉnh góc nhìn bao quát toàn bộ hành trình khi tải xong điểm GPS.

- **Module Quản lý Nhà cung cấp (Customer Providers) & Tích hợp Quick-Create vào Khách hàng:**
  - **Trang Quản trị Danh mục Nhà cung cấp ([`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/providers/page.tsx>)):**
    - Đường dẫn chuẩn: `/app/customers/providers` (sub-route bên trong module Khách hàng).
    - Thẻ thống kê 4 ô chuẩn hệ thống (`StatsCard`: Tổng số nhà cung cấp, Đang hoạt động, Nguồn đối tác, Mới cập nhật).
    - Thanh tìm kiếm theo mã, tên nhà cung cấp (`useQueryParam('search')`).
    - Bảng dữ liệu chuẩn `TableData` hỗ trợ đầy đủ Desktop & Mobile card view, định dạng ngày tháng và phân trang.
    - Modal Thêm / Cập nhật nhà cung cấp ([`provider-form-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/provider-form-modal.tsx>)) dùng chung cho toàn bộ cụm `customers`, chuẩn DRY 100%, loại bỏ hoàn toàn việc import chéo.
    - Modal Xác nhận xóa an toàn gọi API xóa mềm backend.
  - **Tiện ích Quick-Create tại Form Khách hàng ([`modals.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx>)):**
    - Tích hợp Selectbox "Nhà cung cấp / Đối tác" vào `CustomerFormModal`.
    - Thêm nút `+` nằm ngay bên phải ô Selectbox: mở popup mini tạo nhanh tại chỗ, sau khi lưu sẽ tự động invalidate cache React Query và gán ngay ID vừa tạo vào form mà **không làm mất thông tin form đang nhập dở**.
  - **Hiển thị thông tin Nhà cung cấp:**
    - Cột "Nhà cung cấp" trong Bảng Khách hàng ([`table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx>)) cả trên giao diện Desktop lẫn thẻ Mobile.
    - Trường "Nhà cung cấp / Đối tác" trong Thẻ chi tiết khách hàng ([`customer-info.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/[id]/_components/customer-info.tsx>)).
  - **API Actions & Type Safety:**
    - Tạo `src/types/customer-provider.ts` và cập nhật `src/types/customer.ts` bổ sung `providerId`, `provider`.
    - Tạo `src/actions/customer-provider/index.ts` kết nối đồng bộ với endpoint `/api/v1/customer-providers`.

### Fixed

- **Tối ưu hóa Hệ thống Live Map Realtime & Triệt tiêu Lộ trình Zic Zac Con thoi:**
  - **Khắc phục lỗi Live Map bị đơ / phải reload mới cập nhật ([`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx>)):**
    - Tích hợp cơ chế **WebSocket Auto-Reconnect** tự động kết nối lại sau 3s khi đứt mạng, đóng nắp máy hoặc đổi Wi-Fi.
    - Bổ sung **Fallback Polling** định kỳ (10s/lần khi mất socket và 60s dự phòng) giúp dữ liệu bản đồ luôn cập nhật mượt mà, không bao giờ phải F5.
  - **Tính năng Tự động Theo sát Nhân viên (Auto-Follow Mode) ([`live-map.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx>)):**
    - Tự động gọi `map.panTo()` mượt mà giữ nhân viên luôn ở tâm màn hình khi họ di chuyển.
    - Thêm nút toggle nổi _"Đang theo sát"_ / _"Bật theo sát"_ ở góc phải bản đồ để admin chủ động kiểm soát.
  - **Triệt tiêu hiện tượng lộ trình chạy ngược chạy xuôi zic zac trên đường ([`route-playback-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/route-playback-modal.tsx>)):**
    - Thuật toán **Ping-Pong Spike Filter** $O(n)$: phát hiện và loại bỏ các điểm nhảy sang trạm sóng BTS rồi quay về vị trí cũ.
    - Đổi mặc định `isSnapToRoad = false` giúp hiển thị đường Polyline GPS tự nhiên, không bị OSRM bẻ ngoặt thành các vòng lặp quay đầu xe trên đường đôi.
  - **Khắc phục xung đột trạm sóng BTS & GPS ([`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java) & [`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift)):**
    - Ưu tiên tuyệt đối `GPS_PROVIDER`, tự động bỏ qua toàn bộ điểm từ `NETWORK_PROVIDER` khi GPS đang hoạt động trong vòng 25s.
    - Chuẩn hóa ngưỡng sai số khi di chuyển về mức 45m.
  - **Khắc phục trùng lặp luồng & trễ 30s trên Web Tracker ([`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts)):**
    - Tắt Web Worker heartbeat khi chạy trong Native container để tránh bắn đè tọa độ cũ lên server.
    - Bỏ rào chắn `elapsed >= 30000`, kích hoạt nhịp gửi 3 giây khi di chuyển ngoài đường.
  - **Tài liệu kỹ thuật chi tiết:** Đã xuất bản file [`livemap-and-gps-fix-log.md`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/docs/location-tracking/livemap-and-gps-fix-log.md) ghi nhận đầy đủ nguyên nhân và cách xử lý.

## [Unreleased] - 2026-09-08

### Added

- **Tính năng Tự động Cập nhật APK Nội bộ (In-App APK Auto-Updater) cho Android:**
  - **Native Plugin (`AppUpdatePlugin.java` & `MainActivity.java`):** Tích hợp plugin Capacitor Native đọc `versionCode`/`versionName` từ Android `PackageInfo`, sử dụng luồng tải ngầm đa luồng truyền thẳng file APK vào bộ nhớ cache, phát sự kiện tiến trình tải theo thời gian thực (`downloadProgress`).
  - **Tự động kích hoạt cài đặt (`FileProvider` & `ACTION_VIEW`):** Cấp quyền `REQUEST_INSTALL_PACKAGES` trong `AndroidManifest.xml` và cấu hình `file_paths.xml`. Tự động kích hoạt Intent cài đặt hệ thống của Android với cờ `FLAG_GRANT_READ_URI_PERMISSION`. Hỗ trợ mở cài đặt cấp quyền cài app không rõ nguồn gốc nếu Android 8.0+ yêu cầu.
  - **Tự động hóa Phiên bản trong Gradle ([`build.gradle`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/build.gradle)):** Tự động đồng bộ `versionName` từ `package.json` và tự động tính `versionCode` theo số lượng commit Git (`git rev-list --count HEAD`), loại bỏ hoàn toàn việc gõ tay số phiên bản.
  - **Kết nối Backend FastAPI ([`AppUpdateModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/app-update-modal/index.tsx)):** Gọi trực tiếp endpoint `/api/v1/system/app-versions/latest?platform=android` từ Backend Railway thay vì lưu file tĩnh trên frontend.
  - **Giao diện Modal Thông báo Cập nhật ([`AppUpdateModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/app-update-modal/index.tsx)):** Tự động phát hiện khi mở ứng dụng trên Android, hiển thị popup thân thiện với danh sách tính năng mới, thanh tiến trình % tải xuống trực quan và các nút điều hướng cài đặt 1 chạm.
  - **Trang Quản lý Phiên bản Ứng dụng Di động ([`app-versions/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/page.tsx>)):**
    - Bổ sung nhóm mục **"Hệ thống"** trên Sidebar (`/app/app-versions`, phân quyền `super`, `admin`).
    - Tái cấu trúc layout đồng bộ 100% với các trang chuẩn (`customers`, `departments`, `shifts`):
      - Khối thống kê 4 thẻ chuẩn [`StatsCard`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/stats-card.tsx) (Bản mới nhất, Tổng bản phát hành, Yêu cầu bắt buộc, Nền tảng hỗ trợ).
      - Bỏ box header dư thừa ở đầu trang, đưa nút hành động "Phát hành bản mới" lên Action Bar chuẩn.
      - Tích hợp ô tìm kiếm và bộ lọc Nền tảng (Android / iOS) trực tiếp vào [`TableData`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/table.tsx>).
      - Chuẩn hóa form modal phát hành [`ReleaseModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/release-modal.tsx>) đồng bộ styling với các form modal trong hệ thống.

### Changed

- **Tối ưu hóa luồng Check-in & Loại bỏ Ping thủ công ([`auto-timekeeping-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx>)):**
  - Lược bỏ hoàn toàn lệnh gọi `sendLocationPing` thủ công sau khi Check-in thành công. Toàn bộ việc khởi tạo Live Location và broadcast WebSocket hiện được Backend tự động thực hiện từ chính toạ độ của form chấm công.

### Fixed

- **Chuẩn hóa cơ chế tự động bay về nhân sự tuân thủ React 19 Compiler ([`live-map.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx>) & [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx>)):**
  - Bổ sung timestamp `_selectedAt` mỗi khi click chọn nhân sự ở Sidebar.
  - Sử dụng duy nhất một `lastSelectedAtRef` khai báo chuẩn ở đầu component, loại bỏ hoàn toàn các ref mutate trong render body và các hook vi phạm thứ tự của React 19 Compiler.
  - Xóa bỏ lỗi `Error: This value cannot be modified` và đảm bảo click lại vào nhân viên bất kỳ lúc nào thì bản đồ đều bay về đúng vị trí tức thì.
- **Triệt tiêu lỗi vòng lặp render vô hạn `Maximum update depth exceeded` trên Live Map ([`live-map.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx>)):**
  - Xóa bỏ state rác `mapVersion` liên tục ép re-render trong sự kiện di chuyển bản đồ.
  - Bỏ listener `moveend`, chỉ cập nhật `currentZoom` khi giá trị thực tế thay đổi (`zoomend`) và có guard `prev !== newZoom`.
  - Chuẩn hóa callback ref cho `<MapContainer ref={handleMapRef}>` qua `React.useCallback` ngăn React gọi lại inline ref liên tục.
  - Tách `clustersRef` khỏi dependency array của `useEffect` bay tới nhân sự, chấm dứt triệt để chuỗi domino kích hoạt re-render lặp.
- **Hỗ trợ định vị Wi-Fi / IP trên Laptop & Môi trường Web ([`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts)):**
  - Đồng bộ chuẩn hóa các ngưỡng lọc định vị trên thiết bị.

## [Unreleased] - 2026-09-07

### Added

- **Tính năng Marker Clustering & Spiderfy (Gom cụm và Xòe nan hoa) trên Live Map ([`live-map.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx>)):**
  - **Thuật toán Gom cụm theo khoảng cách Pixel thích ứng theo mức Zoom (Zoom-Adaptive Clustering):** Khi zoom xa (zoom $< 11$: $65\text{px}$, zoom $< 13$: $55\text{px}$), tự động gom các nhân sự trong cùng thành phố/tỉnh thành 1 Marker Cụm duy nhất; khi zoom gần (zoom $\ge 13$: $38\text{px}$), tách ra từng phòng/tòa nhà riêng biệt.
  - **Hiển thị thông minh theo mức Zoom (Clean Map UI):** Khi zoom xa ($< 14$), tự động ẩn nhãn tên để bản đồ thoáng đãng, chỉ giữ Avatar tròn mini ($32\text{px}$) kèm viền màu trạng thái, nhãn tên tự động hiện lên khi rê chuột `hover` hoặc khi click chọn; khi zoom gần ($\ge 14$), hiển thị nhãn tên đầy đủ.
  - **Rút gọn tên nhân viên thông minh (`formatShortStaffName`):** Tự động chuyển `System Administrator` thành `Admin`, giới hạn độ dài tên tránh hiện tượng chữ quá dài đè lên marker khác.
  - **Hiệu ứng Spiderfy xòe nan hoa:** Khi click vào Cụm, bản đồ bung các nhân sự ra thành một vòng tròn đều xung quanh tâm với đường chỉ nối nan hoa tinh tế. Cho phép click chọn từng nhân sự riêng biệt, xem chi tiết và lộ trình mà không bao giờ bị đè lấp lẫn nhau. Tự động thu gọn khi click ra ngoài bản đồ.
  - **Auto-Spiderfy khi chọn từ Sidebar:** Khi Admin click vào nhân sự ở danh sách bên trái, bản đồ tự động bay tới và bung xòe cụm chứa nhân sự đó.

### Fixed

- **Khắc phục vòng lặp tự bung xòe nan hoa (Spiderfy Loop), tự zoom gần lại và gom nhầm nhân sự ở xa trên Live Map ([`live-map.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx>)):**
  - **Khắc phục lỗi tự động phóng to lại mức 16 khi vừa zoom xa (Auto Zoom-In Loop):** Di chuyển lệnh `map.flyTo(..., 16)` vào bên trong guard `selectedStaff.userId !== prevSelectedStaffIdRef.current`. Chỉ bay tới nhân viên khi người dùng mới chủ động click chọn từ Sidebar, không tự động flyTo lại khi zoom xa hoặc re-render bản đồ.
  - **Khắc phục lỗi tự động mở nan hoa liên tục khi zoom (Zoom Loop):** Loại bỏ việc re-trigger `useEffect` mở Spiderfy phụ thuộc vào `clusters`. Sử dụng `prevSelectedStaffIdRef` đảm bảo Spiderfy chỉ kích hoạt khi người dùng chủ động click chọn cụm trên bản đồ hoặc click chọn nhân sự mới từ Sidebar.
  - **Tự động thu gọn nan hoa khi Zoom xa:** Bổ sung cơ chế tự động reset `activeSpiderfyClusterId = null` khi mức zoom $< 14$, ngăn ngừa nan hoa bị giãn/nhảy rối mắt khi quan sát ở phạm vi thành phố/toàn quốc.
  - **Ràng buộc khoảng cách địa lý thực tế ($\le 150\text{m}$):** Bổ sung điều kiện kiểm tra khoảng cách thực tế bằng `map.distance` trước khi gộp marker theo khoảng cách pixel màn hình. Tuyệt đối không gom nhân sự ở khác quận, tỉnh (ví dụ Nam Định với Hải Phòng) vào chung một cụm văn phòng khi zoom xa.

### Added

- **Khắc phục triệt để lỗi sai lệch vị trí giữa Chấm công và Live Map, loại bỏ Stale Cache quá khứ và hỗ trợ định vị trong nhà:**
  - **Triệt tiêu Stale Cache Android ([`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java)):** Kiểm tra thời gian ghi nhận của `lastKnownLocation`. Nếu điểm lưu quá $60$ giây từ quá khứ, vứt bỏ ngay lập tức, chấm dứt triệt để lỗi vừa khởi động app đã bắn tọa độ cũ đi xe ngoài đường (kèm tốc độ cũ $48\text{ km/h}$) lên Live Map.
  - **Hỗ trợ định vị đa tầng trong nhà (Dual Provider):** Đăng ký song song cả `GPS_PROVIDER` (cho ngoài trời) và `NETWORK_PROVIDER` (cho trong phòng / văn phòng qua Wi-Fi) kèm bộ lọc ưu tiên, đảm bảo khi nhân viên ngồi trong văn phòng mất sóng vệ tinh thì hệ thống vẫn cập nhật vị trí văn phòng chuẩn xác.
  - **Bộ lọc sai số thích ứng (Adaptive Accuracy):** Áp dụng đồng bộ trên cả 3 nền tảng ([`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java), [`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift), [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts)): siết chặt `accuracy <= 30m` khi di chuyển ngoài đường, nới lỏng `accuracy <= 80m` khi đứng yên trong phòng (chuẩn hóa `speed = 0`).
  - **Đồng bộ khởi tạo tức thì khi Check-in ([`auto-timekeeping-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx>)):** Tự động gửi ping khởi tạo với `speed = 0` ngay khi bấm Chấm công thành công, đồng bộ ngay lập tức điểm chấm công lên Redis Live Map.
- **Triệt tiêu hiện tượng lộ trình bị giật loằng ngoằng do Fallback trạm phát sóng di động (Cellular BTS) và thiếu bộ lọc điểm rác:**
  - **Web Geolocation Tracker (`useLocationTracker.ts`):** Loại bỏ hoàn toàn cơ chế fallback gọi lại `getCurrentPosition` với `enableHighAccuracy: false` (nguyên nhân gây lấy vị trí cột sóng BTS/IP sai số 500m - 1000m). Tăng thời gian chờ định vị `timeout` lên 12s và siết `maximumAge: 5000` để đảm bảo luôn nhận tín hiệu vệ tinh phần cứng.
  - **Chốt chặn độ chính xác Client (`useLocationTracker.ts`):** Lọc cứng toàn bộ điểm có `accuracy > 30m` hoặc bước nhảy dị biệt $> 200m$ trong thời gian $< 6s$, không gửi điểm rác lên backend.
  - **Android Native Tracking Service (`TrackingLocationService.java`):** Chuyển sang ưu tiên độc quyền `GPS_PROVIDER`, chỉ kích hoạt `NETWORK_PROVIDER` khi chip GPS bị tắt hoàn toàn trong cài đặt; bổ sung bộ lọc `accuracy > 30.0f` và kiểm tra bước nhảy dị biệt.
  - **iOS Native Tracking Plugin (`NativeTrackingPlugin.swift`):** Siết ngưỡng sai số `horizontalAccuracy > 30.0` và tích hợp bộ lọc bước nhảy dị biệt (Jump Outlier Filter $> 200m$ trong $< 6s$) ngay tại tầng Native CoreLocation của iOS.
  - **Lọc lộ trình thông minh trên bản đồ (`route-playback-modal.tsx`):** Bổ sung thuật toán loại bỏ điểm văng gai nhọn (Outlier Spike Filter) trước khi đưa vào OSRM Map Matching hoặc vẽ Polyline, đảm bảo đường đi luôn mượt mà và bám sát tim đường giao thông thực tế.

## [Unreleased] - 2026-09-05

### Fixed

- **Khắc phục lỗi app Android bị chuyển về trạng thái `offline` sau khoảng 40 - 60 phút (Background Tracking):**
  - **Tự động Refresh Token trong Background Service:** Bổ sung việc lưu trữ `refreshToken` trong [`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java). Khi Access Token hết hạn (mặc định 30 phút theo cấu hình backend) và API trả về `HTTP 401 Unauthorized`, Service tầng Native sẽ tự động gọi endpoint `/api/v1/auth/refresh`, lưu Access Token mới và retry ping ngay lập tức mà không làm gián đoạn luồng định vị.
  - **Đồng bộ Token thời gian thực:** Cập nhật [`NativeTrackingPlugin.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/NativeTrackingPlugin.java) với method `updateToken` và hook [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts) lắng nghe sự kiện cập nhật token từ `useAuthStore` để đồng bộ tức thời xuống Service nền.
  - **Chống Android Doze Mode & CPU Sleep:** Khai báo quyền `WAKE_LOCK` và `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` trong [`AndroidManifest.xml`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/AndroidManifest.xml). Sử dụng `PARTIAL_WAKE_LOCK` ngắn (tối đa 15s) trong `TrackingLocationService` để giữ CPU hoạt động trọn vẹn trong quá trình gửi gói tin mạng HTTP khi thiết bị tắt màn hình và để yên.
- **Khắc phục lỗi iOS bị chuyển về trạng thái `offline` khi khóa màn hình ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift) & [`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist)):**
  - **Giữ nhịp CoreLocation liên tục (`kCLDistanceFilterNone`):** Loại bỏ khoảng cách 5m tĩnh của phần cứng, chuyển sang dùng `kCLDistanceFilterNone` để CoreLocation luôn đánh thức (wake up) ứng dụng theo chu kỳ định vị ngầm ngay cả khi người dùng ngồi yên hoặc khóa màn hình, duy trì gửi heartbeat mỗi 2 phút để không bao giờ bị Backend chuyển sang `offline` sau 10 phút.
  - **Bảo toàn gói tin mạng khi màn hình tắt (`beginBackgroundTask`):** Bọc các yêu cầu mạng qua `URLSession` (`sendPing` và `refreshAccessToken`) bằng `UIApplication.shared.beginBackgroundTask` để iOS cấp đủ thời gian CPU nền hoàn tất 100% việc gửi dữ liệu trước khi đưa ứng dụng vào trạng thái ngủ.
  - **Bổ sung quyền `NSLocationAlwaysUsageDescription`:** Đảm bảo tương thích toàn diện với cơ chế cấp quyền "Luôn luôn" (Always) trên các phiên bản iOS.

### Added

- **Xem Lộ trình theo đúng Ca Chấm công ([`route-playback-modal.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/route-playback-modal.tsx>) & [`page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx>)):**
  - Khi bấm xem "Lộ trình" của nhân viên trên Live-Map, modal tự động lọc chính xác chuỗi tọa độ GPS gắn liền với bản ghi chấm công đó (`attendanceId`), không bị vẽ nối hoặc lẫn lộn với các ca làm việc khác trong ngày.
  - Bổ sung nút chuyển đổi linh hoạt `[Theo ca #ID]` và `[Cả ngày]` ngay trên thanh điều khiển của modal để người quản trị dễ dàng so sánh lộ trình ca hiện tại hoặc toàn bộ hành trình trong ngày.
- **Nâng cấp cơ chế 'Ping 3s Thông minh (Smart Adaptive Location Tracking)' trên Android, iOS và Web:**
  - **Tần suất 3 giây khi di chuyển:** Khi nhân viên thực sự di chuyển (`speed >= 1.0 m/s` hoặc khoảng cách $\ge 5$m), tần suất gửi ping được rút ngắn từ 10s xuống còn **3 giây/lần** trên cả 3 nền tảng ([`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java), [`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift), [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts)), mang lại trải nghiệm Live-Map mượt mà tức thời theo thời gian thực.
  - **Tự động tiết kiệm Pin khi dừng lại:** Khi nhân viên dừng lại (đèn đỏ, dừng xe, ngồi yên một chỗ với `speed < 0.5 m/s` và khoảng cách $< 5$m), thiết bị tự động hoãn gửi ping 3s dồn dập, chuyển sang cơ chế giữ nhịp tim Heartbeat để tối ưu hóa thời lượng pin và dung lượng 4G của điện thoại.
  - **Bảo toàn Cơ sở dữ liệu:** Bộ lọc Smart GPS Filter tại backend giữ nguyên cơ chế chỉ ghi vào PostgreSQL khi di chuyển $\ge 25$m, ngăn ngừa triệt để nguy cơ phình to database.
- **Xây dựng module iOS Native Swift Background Tracking Service ([`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift) & [`NativeTrackingPlugin.m`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.m)):**
  - Tích hợp trực tiếp `CoreLocation` (`CLLocationManager`) chạy ngầm dưới tầng Swift Native của Apple với `allowsBackgroundLocationUpdates = true`, `pausesLocationUpdatesAutomatically = false` và `showsBackgroundLocationIndicator = true` (hiển thị biểu tượng mũi tên xanh chuẩn Apple trên thanh trạng thái / Dynamic Island).
  - Tự động gửi tọa độ lên endpoint `/api/v1/attendances/location-ping` bằng `URLSession` độc lập, duy trì định vị liên tục và ổn định ngay cả khi tắt màn hình đút túi quần.
  - Tự động bắt mã `HTTP 401` để refresh access token bằng `refreshToken` độc lập dưới tầng Native.
  - Bổ sung cơ chế Fallback mượt mà trong [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts) tự động chuyển sang Web Geolocation nếu module Native gặp sự cố.
- Khởi tạo nền tảng **iOS Native (`@capacitor/ios`)** cho ứng dụng di động:
  - Cài đặt `@capacitor/ios` và chạy `npx cap add ios` sinh khung dự án Xcode `ios/App/App.xcworkspace`.
  - Cấu hình các quyền riêng tư trong [`Info.plist`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/Info.plist): `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`, `UIBackgroundModes` (`location`) hỗ trợ định vị, cùng `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription` hỗ trợ chụp ảnh selfie chấm công khuôn mặt và đính kèm chứng từ.
- Thiết lập quy trình **CI/CD tự động đóng gói file iOS IPA ([`.github/workflows/build-ios-unsigned.yml`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/.github/workflows/build-ios-unsigned.yml))** trên GitHub Actions:
  - Tự động chạy trên môi trường macOS M1/M2 ảo (`macos-14`) của GitHub.
  - Biên dịch dự án thành bản lưu trữ Release không yêu cầu chứng chỉ trả phí (`CODE_SIGNING_ALLOWED=NO`).
  - Đóng gói ứng dụng thành file `App-unsigned.ipa` đẩy lên mục Artifacts để tải về máy tính Windows và ký qua 3uTools bằng tài khoản Apple ID cá nhân (sử dụng 7 ngày).

## [Unreleased] - 2026-08-30

### Added

- Bổ sung modal [`CustomerExportModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx>) hỗ trợ xuất file Excel báo cáo khách hàng phân tầng đa Sheet theo nhân viên phụ trách.
- Bổ sung các preset chọn nhanh thời gian thông minh (_Tuần này (mặc định)_, _Tuần trước_, _Tháng này_, _Tháng trước_, _Tùy chọn ngày_) cùng dropdown lọc nhân viên phụ trách dành cho Quản lý.
- Thêm action [`exportCustomersExcel`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/customer/index.ts) và type [`CustomerExportQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/customer.ts).
- Tích hợp nút bấm **"Xuất Excel"** (`FileSpreadsheet`) trên thanh công cụ quản lý khách hàng tại [`customers/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx>).
- Tích hợp giao diện **Hướng dẫn cấp lại quyền vị trí trực quan (Visual Permission Guide)** và cơ chế **Tự động bắt quyền (Auto-Permission Recovery)** trong [`AutoTimekeepingModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx>): Hướng dẫn chi tiết từng bước cho cả 3 nền tảng (🤖 Android App / PWA cài đặt, 🍏 iPhone iOS Safari / Standalone, 💻 Máy tính Chrome/Edge), kèm lắng nghe sự kiện `navigator.permissions` tự động kích hoạt lấy vị trí ngay khi người dùng vừa bật lại quyền.

### Fixed

- Chuẩn hóa thiết kế giao diện [`CustomerExportModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx>) đồng bộ 100% với hệ thống Modal của dự án: cấu trúc container `flex flex-col gap-4 py-2`, spacing `gap-3`, tiêu đề súc tích, bộ chọn mốc thời gian chip và nút bấm `Button` chuẩn Design System.
- Sửa lỗi cảnh báo React render phase _"Cannot access refs during render"_ tại [`quotation-info.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/quotations/[quotationId]/components/editor/quotation-info.tsx>) khi truyền thuộc tính `width` chứa `ref.current`.

### Changed / Refactored

- Tối ưu hóa và tái cấu trúc toàn diện trang Quản lý chấm công [`attendances/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx>): loại bỏ hơn 350 dòng code rác, các state mồ côi (`filterEmployeeId`, `filterStartDate`, `filterEndDate`, `filterShift`, `isLoading`, `showTimekeepingModal`, `reviewModalState`), các modal không sử dụng (`ReviewAdjustmentModal`, `AutoTimekeepingModal`) và các khối JSX comment cũ; chuẩn hóa bộ lọc `TableData` và tối ưu hiệu năng render.

### Removed

- Loại bỏ nút xuất lẻ Excel theo từng nhân sự tại Bảng báo cáo chấm công [`attendances/reports/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/table.tsx>), action `exportUserAttendanceDetailReport` và type `UserAttendanceDetailReportQueryParams`.

## [0.1.0] - 2026-08-26

- Xây dựng **Android Native Foreground Service (`TrackingLocationService.java`)** độc lập chạy ngầm liên tục chuẩn như Zalo/Grab:
  - Khởi tạo tiến trình nền độc lập dưới tầng Android OS với `START_STICKY`, Notification Channel cố định (_"XTTech đang hoạt động"_) và gắn cờ `android:stopWithTask="false"` trong `AndroidManifest.xml`.
  - Bắt sự kiện `onTaskRemoved()`: Khi người dùng vuốt đóng app hoàn toàn khỏi màn hình đa nhiệm (Recent Apps), tầng Java Native tiếp tục duy trì hoạt động, lắng nghe `LocationManager` và gửi HTTP POST trực tiếp lên endpoint `/api/v1/attendances/location-ping` bằng `HttpURLConnection` mà không cần WebView hay JavaScript phải thức.
  - Tích hợp cầu nối `NativeTrackingPlugin.java` đăng ký trong `MainActivity.java` và kết nối với hook [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts) để kích hoạt tự động theo ca làm việc.
- Thêm component [`AppLauncherRedirect`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/_components/AppLauncherRedirect.tsx) vào trang chủ [`src/app/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/page.tsx):
  - Tự động nhận diện môi trường ứng dụng di động qua `Capacitor.isNativePlatform()`.
  - Đưa người dùng vào thẳng `/app/dashboard` nếu đã đăng nhập hoặc `/signin` nếu chưa đăng nhập, loại bỏ việc người dùng bị kẹt tại trang landing page khi mở app Android.
- Bổ sung cơ chế **Heartbeat (Nhịp tim định kỳ)** trong hook [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts):
  - Tự động gửi gói tin nhịp tim mỗi 3 phút (`heartbeatMs = 180000`) khi thiết bị đứng yên một chỗ, duy trì trạng thái 🟢 Trực tuyến (`stationary`) trên Bản đồ Giám sát Admin, tránh bị Backend đánh dấu `offline` sau 10 phút.
  - Lưu cache tọa độ đã biết gần nhất `lastKnownCoordsRef`, gửi ping với vận tốc 0 khi đứng yên mà không cần ép chip GPS bật quét liên tục, tối ưu thời lượng pin.
  - Đồng bộ cơ chế kích hoạt lại nhịp tim khi người dùng bật lại màn hình hoặc focus vào ứng dụng.

### Fixed

- Sửa dứt điểm lỗi hiển thị chuỗi văn bản thô (RSC Flight Payload `:HL... 0:{"tree":...}`) trên ứng dụng Android khi đăng xuất hoặc đăng nhập lại:
  - Chuẩn hóa kiến trúc Server Layout tại [`src/app/(auth)/layout.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/layout.tsx>) với `export const dynamic = 'force-dynamic'` và `revalidate = 0`, ngăn chặn Next.js tự động prerender tĩnh khu vực authenticated routes và loại bỏ hoàn toàn header `s-maxage=31536000`.
  - Tách riêng component guard phía client [`AuthClientLayout`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/_components/auth-client-layout.tsx>) để xử lý hydrate Zustand và bảo vệ phân quyền.
  - Bổ sung cấu hình `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` và `CDN-Cache-Control: no-store` cho toàn bộ route `/app/:path*` trong [`next.config.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/next.config.ts) và Middleware [`src/proxy.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/proxy.ts), ngăn chặn hoàn toàn Edge CDN của Railway lưu cache nhầm response dạng `text/x-component`.
  - Giữ nguyên URL điều hướng sạch đẹp (`/app/dashboard`) bằng `window.location.replace` mà không cần dùng query param tạm thời (`?_t=...`).
  - Tối ưu [`MainActivity.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/MainActivity.java): Bật `setAcceptThirdPartyCookies`, đồng thời gọi `CookieManager.getInstance().flush()` ngay trong sự kiện vòng đời `onResume()` để đồng bộ cookie tức thời.
- Tính năng **Giám sát Vị trí Nhân sự Trực tiếp & Lịch sử Lộ trình** ([`attendances/live-map/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx>)):
  - Trang Bản đồ Admin kết hợp bản đồ Leaflet mượt mà và danh sách nhân sự trực tuyến ([`LiveMap`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx>), [`StaffList`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/staff-list.tsx>)).
  - Kết nối Realtime **WebSocket** nhận cập nhật tọa độ tức thời với trạng thái di chuyển (Moving / Stationary / Offline), mức pin và vận tốc.
  - Modal xem lại lộ trình di chuyển theo ngày ([`RoutePlaybackModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/route-playback-modal.tsx>)) vẽ đường đi Polyline, tổng km đã đi và mốc thời gian.
    - Hook định vị thông minh [`useLocationTracker`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts) tích hợp cơ chế chống đóng băng toàn diện (**Web Worker Timer** chạy độc lập không bị throttle khi ẩn tab, **`watchPosition`** lắng nghe phần cứng GPS, **Screen WakeLock API**, và tự động ping bù khi bật màn hình / focus tab).
  - Tích hợp `useLocationTracker` trực tiếp vào layout toàn cục [`layout.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/layout.tsx>) tự động kích hoạt định vị khi đăng nhập.
  - Bổ sung cơ chế kích hoạt gửi ping vị trí tức thời ngay khi nhân viên bấm Check-in thành công trong [`AutoTimekeepingModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx>).
- Thêm action [`exportUserAttendanceDetailReport`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/report/index.ts) và type [`UserAttendanceDetailReportQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/report.ts) để gọi API xuất file Excel chi tiết chấm công và bảng lương theo từng nhân sự.
- Bổ sung nút bấm 📊 **"Xuất chi tiết Excel"** (`FileSpreadsheet`) vào cột Thao tác (`actions`) và giao diện Mobile Card trong Bảng báo cáo chấm công ([`attendances/reports/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/table.tsx>)).
- Tích hợp trạng thái `exportingUserId` để hiển thị spinner loading xoay tròn (`Loader2`) khi tải file và thông báo tiến trình bằng `react-hot-toast`.

### Fixed

- Sửa dứt điểm lỗi hiển thị phần trăm pin `null%` và icon pin màu đỏ khi thiết bị không cung cấp thông số pin:
  - Cập nhật [`live-map.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx>) và [`staff-list.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/staff-list.tsx>) kiểm tra chặt chẽ `typeof batteryLevel === 'number'`, hiển thị `--` hoặc ẩn icon pin khi không có dữ liệu.
  - Bổ sung cơ chế cache giữ lại mức pin đọc được gần nhất trong [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts).
- Sửa lỗi mảng `staffLocations` bị nhân đôi 2 phần tử của cùng 1 nhân sự trên trang Giám sát Vị trí ([`attendances/live-map/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx>)):
  - Chuẩn hóa hàm nhận WebSocket `onmessage` với cơ chế phòng thủ 2 lớp (hỗ trợ cả `userId` và `user_id`), tự động map các thuộc tính về `StaffLiveLocation` và merge state an toàn.
- Cập nhật [`src/types/location.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/location.ts) và [`RoutePlaybackModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/route-playback-modal.tsx>):
  - Đồng bộ hỗ trợ cả `camelCase` (`totalDistanceKm`, `recordedAt`) và `snake_case` tránh lỗi hiển thị tổng quãng đường `0 km` hoặc thời gian không xác định khi xem lộ trình.
- Sửa lỗi logo hệ thống (`XTLogo`) bị tàng hình / biến mất trên giao diện Sidebar Mobile do xung đột ID `<linearGradient>` tĩnh với Sidebar Desktop (`display: none`):
  - Áp dụng `React.useId()` trong [`XTLogo`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/logo/logo.tsx) để sinh ID động duy nhất cho từng thể hiện SVG, tránh xung đột CSS Paint Server trong DOM.
- Sửa lỗi phân trang tự động reset về trang 1 khi chuyển sang trang 2, 3, 4 trên toàn bộ các trang bảng dữ liệu:
  - Loại bỏ biến `offset` thừa khỏi mảng `queryKey` tại: [`materials/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/materials/_components/table.tsx>), [`doors/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/table.tsx>), [`formulas/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/formulas/_components/table.tsx>), [`extra-options/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/extra-options/_components/table.tsx>), [`accessories/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/accessories/_components/table.tsx>), [`projects/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/table.tsx>), và [`customers/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx>).
  - Tránh kích hoạt nhầm hook tự động reset `offset=0` trong [`TableDataDesktop`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/table/table-data-desktop.tsx) khi người dùng chuyển trang.
- Sửa lỗi TypeScript interface trong [`attendances/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx>) sau khi đồng bộ branch dev.

## [1.1.0] - 2026-08-24

### Added

- Bổ sung `departmentId` vào [`AttendanceQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/attendance.ts) và truyền `departmentId` vào hàm `fetcher` trong [`attendances/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx>) để hỗ trợ lọc danh sách chấm công theo phòng ban.
- Mở rộng phân quyền chọn nhân viên khi tạo khiếu nại chấm công trong [`AddAdjustmentModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/adjustment/add-modal.tsx>) cho tài khoản có vai trò `hr`.
- Tính năng tự động nạp phụ kiện theo Hệ nhôm (Material) & Biên dạng cửa (Door) trong trình chỉnh sửa chi tiết báo giá:
  - Tự động gọi API `GET /api/v1/accessories` với `materialId`, `doorId` và `limit=100` để lấy danh sách phụ kiện cấu hình sẵn khi tạo cửa mới hoặc khi chọn lại biên dạng cửa.
  - Bổ sung nút bấm 🔄 **"Nạp gợi ý"** trong phần _Phụ kiện đính kèm_ của từng cửa ([`QuotationDoor`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/quotations/[quotationId]/components/editor/quotation-door.tsx>)) cho phép chủ động tải lại phụ kiện mặc định bất cứ lúc nào.
  - Bổ sung action `setAccessories` vào [`useQuotationStore`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/stores/useQuotationStore.ts).
- Tích hợp `Image.PreviewGroup` từ thư viện `antd` trong [`CustomerInfo`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/[id]/customer-logs/_components/customer-info.tsx>) để hỗ trợ xem ảnh đính kèm khách hàng ở chế độ full screen, zoom phóng to, thu nhỏ, xoay và chuyển ảnh mượt mà.
- Tối ưu hóa cấu trúc Bảng danh sách Khách hàng ([`customers/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx>)):
  - Rút gọn từ 8 cột cồng kềnh sang 5 cột tinh gọn: _Khách hàng (Tên + Badge Loại KH + Mã định danh)_, _Liên hệ (SĐT + Email)_, _Địa chỉ & Vị trí (Địa chỉ + Link mở nhanh Google Maps)_, _Phụ trách_, và _Hành động_.
  - Loại bỏ hoàn toàn thanh cuộn ngang (horizontal scroll), tối ưu trải nghiệm trực quan theo chuẩn SaaS CRM hiện đại.
- Bổ sung bộ lọc (Filters) cho Bảng quản lý khách hàng ([`customers/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx>)):
  - Lọc theo **Loại khách hàng** (_Tiềm năng, Đang hoạt động, Ngưng hoạt động, VIP_).
  - Lọc theo **Nhân viên phụ trách** (Tự động hiển thị danh sách nhân viên cho Admin/HR, và cố định theo tài khoản của Sale).
  - Đồng bộ trạng thái lọc vào `queryKey` và `fetcher` để phân trang chuẩn xác từ Backend API.
- Bổ sung nút 📍 **"Lấy vị trí hiện tại"** trong Form Thêm & Sửa khách hàng ([`CustomerFormModal`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx>)): sử dụng HTML5 Geolocation API để tự động xác định tọa độ GPS của thiết bị và điền vào các ô Vĩ độ & Kinh độ.

### Fixed

- Tái cấu trúc và dọn dẹp mã nguồn trang Bảng công cá nhân ([`attendances/payroll/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/payroll/page.tsx>)):
  - Loại bỏ các state và biến thừa (`filterStartDate`, `filterEndDate`, `dateOptions`, các import icon không dùng).
  - Tinh gọn hàm `fetcher`, bỏ toàn bộ các bước lọc thủ công trùng lặp ở Client để giao quyền phân trang và lọc chuẩn cho Backend API.
  - Gom các hàm tính toán thống kê (Tổng ngày công, Ngày phép, Ngày nghỉ, Tăng ca, Đi muộn/về sớm) vào duy nhất 1 hook `useMemo` tính toán 1 lượt (`O(n)`), nâng cao hiệu năng render.
- Sửa lỗi nhận diện sai trạng thái nút Check-in / Check-out trên trang Chấm công cá nhân ([`attendances/payroll/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/payroll/page.tsx>)):
  - Ưu tiên tìm kiếm phiên chấm công đang mở (`checkIn` có giá trị và `checkOut` chưa có) trong danh sách chấm công thay vì chỉ đọc bản ghi đầu tiên trong ngày theo `workDate`.
  - Đảm bảo khi nhân viên có phiên làm việc dở dang (ví dụ đã check-in 13:00 và sau đó tạo thêm bản ghi ca sáng 7:00-11:00) thì hệ thống vẫn luôn hiển thị nút **"Check-out ngay"** chính xác.
- Căn chỉnh và hoàn thiện giao diện Khối Chi tiết Khách hàng ([`CustomerInfo`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/[id]/_components/customer-info.tsx>)):
  - Tổ chức lại layout thành lưới 8 ô chuẩn (4 cột x 2 hàng), bổ sung ô _Nhân viên phụ trách_ để cân đối 100% không gian.
  - Sửa lỗi hiển thị chuỗi UUID `staffId` sang họ tên đầy đủ của nhân viên phụ trách (`customer.staff?.fullName || customer.staff?.username`).
  - Sửa lỗi vỡ dòng icon và text của nút _Mở Google Maps_, thiết kế dạng inline badge sang trọng (`whitespace-nowrap`, bo góc, hiệu ứng hover mượt mà).
- Sửa lỗi phân trang trên trang Quản lý chấm công ([`attendances/page.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx>)):
  - Cập nhật hàm `fetcher` để đọc chính xác `response.meta.total`, `response.meta.offset`, `response.meta.limit` và `response.meta.next` từ Backend trả về, thay vì tính fallback `items.length`.
  - Bỏ cấu hình `syncToUrl={false}` trong `TableData` để đồng bộ URL Query Parameters (`offset`, `limit`) chuẩn hóa với toàn hệ thống.
  - Sử dụng hook `useQueryParam('search')` cho ô tìm kiếm để tự động đồng bộ từ khóa và reset `offset=0`.
- Tối ưu hóa [`TableDataDesktop`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/table/table-data-desktop.tsx): Tự động cập nhật URL đưa `offset` về `0` khi `queryKey` (từ khóa tìm kiếm, bộ lọc) thay đổi và người dùng đang ở trang $> 1$.
