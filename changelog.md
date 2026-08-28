# Changelog

All notable changes to the frontend project will be documented in this file.

## [Unreleased] - 2026-08-26

### Added
- Thêm action [`exportUserAttendanceDetailReport`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/report/index.ts) và type [`UserAttendanceDetailReportQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/report.ts) để gọi API xuất file Excel chi tiết chấm công và bảng lương theo từng nhân sự.
- Bổ sung nút bấm 📊 **"Xuất chi tiết Excel"** (`FileSpreadsheet`) vào cột Thao tác (`actions`) và giao diện Mobile Card trong Bảng báo cáo chấm công ([`attendances/reports/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/table.tsx)).
- Tích hợp trạng thái `exportingUserId` để hiển thị spinner loading xoay tròn (`Loader2`) khi tải file và thông báo tiến trình bằng `react-hot-toast`.

### Fixed
- Sửa lỗi logo hệ thống (`XTLogo`) bị tàng hình / biến mất trên giao diện Sidebar Mobile do xung đột ID `<linearGradient>` tĩnh với Sidebar Desktop (`display: none`):
  - Áp dụng `React.useId()` trong [`XTLogo`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/logo/logo.tsx) để sinh ID động duy nhất cho từng thể hiện SVG, tránh xung đột CSS Paint Server trong DOM.
- Sửa lỗi phân trang tự động reset về trang 1 khi chuyển sang trang 2, 3, 4 trên toàn bộ các trang bảng dữ liệu:
  - Loại bỏ biến `offset` thừa khỏi mảng `queryKey` tại: [`materials/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/materials/_components/table.tsx), [`doors/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/table.tsx), [`formulas/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/formulas/_components/table.tsx), [`extra-options/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/extra-options/_components/table.tsx), [`accessories/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/accessories/_components/table.tsx), [`projects/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/table.tsx), và [`customers/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx).
  - Tránh kích hoạt nhầm hook tự động reset `offset=0` trong [`TableDataDesktop`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/table/table-data-desktop.tsx) khi người dùng chuyển trang.
- Sửa lỗi TypeScript interface trong [`attendances/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx) sau khi đồng bộ branch dev.


## [1.1.0] - 2026-08-24


### Added
- Bổ sung `departmentId` vào [`AttendanceQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/attendance.ts) và truyền `departmentId` vào hàm `fetcher` trong [`attendances/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx) để hỗ trợ lọc danh sách chấm công theo phòng ban.
- Mở rộng phân quyền chọn nhân viên khi tạo khiếu nại chấm công trong [`AddAdjustmentModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/adjustment/add-modal.tsx) cho tài khoản có vai trò `hr`.
- Tính năng tự động nạp phụ kiện theo Hệ nhôm (Material) & Biên dạng cửa (Door) trong trình chỉnh sửa chi tiết báo giá:
  - Tự động gọi API `GET /api/v1/accessories` với `materialId`, `doorId` và `limit=100` để lấy danh sách phụ kiện cấu hình sẵn khi tạo cửa mới hoặc khi chọn lại biên dạng cửa.
  - Bổ sung nút bấm 🔄 **"Nạp gợi ý"** trong phần *Phụ kiện đính kèm* của từng cửa ([`QuotationDoor`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/quotations/[quotationId]/components/editor/quotation-door.tsx)) cho phép chủ động tải lại phụ kiện mặc định bất cứ lúc nào.
  - Bổ sung action `setAccessories` vào [`useQuotationStore`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/stores/useQuotationStore.ts).
- Tích hợp `Image.PreviewGroup` từ thư viện `antd` trong [`CustomerInfo`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/[id]/customer-logs/_components/customer-info.tsx) để hỗ trợ xem ảnh đính kèm khách hàng ở chế độ full screen, zoom phóng to, thu nhỏ, xoay và chuyển ảnh mượt mà.
- Tối ưu hóa cấu trúc Bảng danh sách Khách hàng ([`customers/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx)):
  - Rút gọn từ 8 cột cồng kềnh sang 5 cột tinh gọn: *Khách hàng (Tên + Badge Loại KH + Mã định danh)*, *Liên hệ (SĐT + Email)*, *Địa chỉ & Vị trí (Địa chỉ + Link mở nhanh Google Maps)*, *Phụ trách*, và *Hành động*.
  - Loại bỏ hoàn toàn thanh cuộn ngang (horizontal scroll), tối ưu trải nghiệm trực quan theo chuẩn SaaS CRM hiện đại.
- Bổ sung bộ lọc (Filters) cho Bảng quản lý khách hàng ([`customers/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx)):
  - Lọc theo **Loại khách hàng** (*Tiềm năng, Đang hoạt động, Ngưng hoạt động, VIP*).
  - Lọc theo **Nhân viên phụ trách** (Tự động hiển thị danh sách nhân viên cho Admin/HR, và cố định theo tài khoản của Sale).
  - Đồng bộ trạng thái lọc vào `queryKey` và `fetcher` để phân trang chuẩn xác từ Backend API.
- Bổ sung nút 📍 **"Lấy vị trí hiện tại"** trong Form Thêm & Sửa khách hàng ([`CustomerFormModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx)): sử dụng HTML5 Geolocation API để tự động xác định tọa độ GPS của thiết bị và điền vào các ô Vĩ độ & Kinh độ.

### Fixed
- Tái cấu trúc và dọn dẹp mã nguồn trang Bảng công cá nhân ([`attendances/payroll/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/payroll/page.tsx)):
  - Loại bỏ các state và biến thừa (`filterStartDate`, `filterEndDate`, `dateOptions`, các import icon không dùng).
  - Tinh gọn hàm `fetcher`, bỏ toàn bộ các bước lọc thủ công trùng lặp ở Client để giao quyền phân trang và lọc chuẩn cho Backend API.
  - Gom các hàm tính toán thống kê (Tổng ngày công, Ngày phép, Ngày nghỉ, Tăng ca, Đi muộn/về sớm) vào duy nhất 1 hook `useMemo` tính toán 1 lượt (`O(n)`), nâng cao hiệu năng render.
- Sửa lỗi nhận diện sai trạng thái nút Check-in / Check-out trên trang Chấm công cá nhân ([`attendances/payroll/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/payroll/page.tsx)):
  - Ưu tiên tìm kiếm phiên chấm công đang mở (`checkIn` có giá trị và `checkOut` chưa có) trong danh sách chấm công thay vì chỉ đọc bản ghi đầu tiên trong ngày theo `workDate`.
  - Đảm bảo khi nhân viên có phiên làm việc dở dang (ví dụ đã check-in 13:00 và sau đó tạo thêm bản ghi ca sáng 7:00-11:00) thì hệ thống vẫn luôn hiển thị nút **"Check-out ngay"** chính xác.
- Căn chỉnh và hoàn thiện giao diện Khối Chi tiết Khách hàng ([`CustomerInfo`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/[id]/_components/customer-info.tsx)):
  - Tổ chức lại layout thành lưới 8 ô chuẩn (4 cột x 2 hàng), bổ sung ô *Nhân viên phụ trách* để cân đối 100% không gian.
  - Sửa lỗi hiển thị chuỗi UUID `staffId` sang họ tên đầy đủ của nhân viên phụ trách (`customer.staff?.fullName || customer.staff?.username`).
  - Sửa lỗi vỡ dòng icon và text của nút *Mở Google Maps*, thiết kế dạng inline badge sang trọng (`whitespace-nowrap`, bo góc, hiệu ứng hover mượt mà).
- Sửa lỗi phân trang trên trang Quản lý chấm công ([`attendances/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx)):
  - Cập nhật hàm `fetcher` để đọc chính xác `response.meta.total`, `response.meta.offset`, `response.meta.limit` và `response.meta.next` từ Backend trả về, thay vì tính fallback `items.length`.
  - Bỏ cấu hình `syncToUrl={false}` trong `TableData` để đồng bộ URL Query Parameters (`offset`, `limit`) chuẩn hóa với toàn hệ thống.
  - Sử dụng hook `useQueryParam('search')` cho ô tìm kiếm để tự động đồng bộ từ khóa và reset `offset=0`.
- Tối ưu hóa [`TableDataDesktop`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/table/table-data-desktop.tsx): Tự động cập nhật URL đưa `offset` về `0` khi `queryKey` (từ khóa tìm kiếm, bộ lọc) thay đổi và người dùng đang ở trang $> 1$.
