# Changelog

All notable changes to the frontend project will be documented in this file.

## [Unreleased] - 2026-08-24

### Fixed
- Sửa lỗi phân trang trên trang Quản lý chấm công ([`attendances/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx)):
  - Cập nhật hàm `fetcher` để đọc chính xác `response.meta.total`, `response.meta.offset`, `response.meta.limit` và `response.meta.next` từ Backend trả về, thay vì tính fallback `items.length`.
  - Bỏ cấu hình `syncToUrl={false}` trong `TableData` để đồng bộ URL Query Parameters (`offset`, `limit`) chuẩn hóa với toàn hệ thống.
