# Changelog

All notable changes to the frontend project will be documented in this file.

## [Unreleased] - 2026-08-24

### Added
- Bổ sung `departmentId` vào [`AttendanceQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/attendance.ts) và truyền `departmentId` vào hàm `fetcher` trong [`attendances/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx) để hỗ trợ lọc danh sách chấm công theo phòng ban.
- Mở rộng phân quyền chọn nhân viên khi tạo khiếu nại chấm công trong [`AddAdjustmentModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/adjustment/add-modal.tsx) cho tài khoản có vai trò `hr`.
- Tính năng tự động nạp phụ kiện theo Hệ nhôm (Material) & Biên dạng cửa (Door) trong trình chỉnh sửa chi tiết báo giá:
  - Tự động gọi API `GET /api/v1/accessories` với `materialId`, `doorId` và `limit=100` để lấy danh sách phụ kiện cấu hình sẵn khi tạo cửa mới hoặc khi chọn lại biên dạng cửa.
  - Bổ sung nút bấm 🔄 **"Nạp gợi ý"** trong phần *Phụ kiện đính kèm* của từng cửa ([`QuotationDoor`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/quotations/[quotationId]/components/editor/quotation-door.tsx)) cho phép chủ động tải lại phụ kiện mặc định bất cứ lúc nào.
  - Bổ sung action `setAccessories` vào [`useQuotationStore`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/stores/useQuotationStore.ts).

### Fixed
- Sửa lỗi phân trang trên trang Quản lý chấm công ([`attendances/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx)):
  - Cập nhật hàm `fetcher` để đọc chính xác `response.meta.total`, `response.meta.offset`, `response.meta.limit` và `response.meta.next` từ Backend trả về, thay vì tính fallback `items.length`.
  - Bỏ cấu hình `syncToUrl={false}` trong `TableData` để đồng bộ URL Query Parameters (`offset`, `limit`) chuẩn hóa với toàn hệ thống.
  - Sử dụng hook `useQueryParam('search')` cho ô tìm kiếm để tự động đồng bộ từ khóa và reset `offset=0`.
- Tối ưu hóa [`TableDataDesktop`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/table/table-data-desktop.tsx): Tự động cập nhật URL đưa `offset` về `0` khi `queryKey` (từ khóa tìm kiếm, bộ lọc) thay đổi và người dùng đang ở trang $> 1$.
