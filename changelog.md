# Changelog

All notable changes to the frontend project will be documented in this file.

## [Unreleased] - 2026-09-03

### Added

- **Đột phá thiết kế đồ họa 3D & Hệ thống Ma trận nhân sự Matrix (Phong cách Saffron / Griflan)**:
  - **Mô Phỏng 3D Lắp Ghép Tetris Nhôm Kính & Đồng Hồ Đo Phôi Thừa Động (Scene 1)**: Đột phá thay thế hoàn toàn mô hình bánh răng/logo cũ bằng **4 phân đoạn Profile nhôm định hình kỹ thuật đa khoang** (Cánh chính `2400mm`, Đố tĩnh `1850mm`, Nẹp kính `1200mm`, Khung bao `1500mm`) nằm tản mác ở 4 góc không gian 3D cùng các mẩu phôi thừa vụn nhấp nháy đỏ cảnh báo lãng phí. Khi cuộn chuột, kích hoạt **Thuật toán Nam Châm AI Nesting**: cả 4 thanh nhôm đồng loạt bay lượn dọc các đường laser dẫn hướng, xoay lật và khóa khít rịt vào nhau thành 1 cây nhôm nguyên bản thẳng tắp 6 mét; đồng thời **Đồng hồ Hologram HUD 3D nhảy số liên tục đếm lùi hao hụt từ 18.2% xuống 1.5%** và thanh đo chuyển từ Đỏ Báo Động sang Xanh Neon Emerald `TỐI ƯU PHÔI: 98.5%`. Phủ chất liệu hợp kim nhôm Anode bạc Platinum sáng rực (`metalness: 0.98`, `clearcoat: 0.95`).
  - **Mô Hình 3D Chuẩn Nhận Diện Thương Hiệu XTTech Tràn Viền Tự Do (Borderless Free-Floating 3D XTTech Logo)**: Tái hiện trọn vẹn 100% đường nét vector logo chính thức của XTTech từ nhánh `dev` ([`public/image-xttech/logo-xttech.svg`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/public/image-xttech/logo-xttech.svg)) thành khối 3D đùn thực thụ (Solid Mesh) nổi lơ lửng tự do trực tiếp trên nền trang web, loại bỏ triệt để các khung viền/badge HUD hộp gò bó. Tinh chỉnh tỉ lệ thu phóng (`scale: 0.68`), lùi khoảng cách camera (`Z = 420`) và đồng bộ bán kính vành đai orbit Torus (`96`) giúp toàn bộ khối logo xoay 360° thanh thoát, không bao giờ bị chạm mép hay che khuất.
  - **Đồng Bộ Nhận Diện Thương Hiệu XTLogo Vào Header**: Tích hợp component `<XTLogo />` chính thức từ nhánh `origin/dev` vào Header trang Landing Page ([`src/app/(auth)/app/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/page.tsx)), thay thế hoàn toàn icon hộp tạm thời để tạo sự nhất quán thương hiệu từ thanh điều hướng đến không gian 3D.
  - **Tái Cấu Trúc Toàn Bộ Nội Dung Theo Chuẩn Pitch Deck Doanh Nghiệp & Gọi Vốn Đầu Tư (B2B SaaS Enterprise Pitch)**: Loại bỏ hoàn toàn các thuật ngữ lập trình viên kỹ thuật (như `Redis GEO Engine`, `JWT Blacklist`, `Haversine < 5m`, `WebSocket Kép`, `mảng lục địa phát sáng`, `mô phỏng mạng lưới vi mạch`). Thay thế 100% bằng ngôn từ kinh doanh, tập trung vào giải quyết "nỗi đau" thị trường: **Tối Ưu Chi Phí Vật Tư & Phôi Thừa 98.5%**, **Bảo Toàn Dòng Tiền & Chống Thất Thoát Tài Chính**, **Năng Lực Mở Rộng Quy Mô Toàn Quốc Thần Tốc (Scalability)**, và **Nâng Cao 40% Hiệu Suất Đội Ngũ Vận Hành Hiện Trường**.
  - **Bộ Cửa Nhôm Kính Thủy Lực Hoàng Gia Cao Cấp (Luxury Architectural Aluminum Door)**: Thay thế hoàn toàn két sắt ngân hàng bằng mô hình 3D thực tế của ngành cơ khí nhôm kính XTTech: Khung bao nhôm hộp xước sơn tĩnh điện xám đen, 2 cánh kính cường lực phản quang sang trọng tích hợp hệ nan đồng hình thoi & chữ nhật mạ vàng hoàng gia, họa tiết hoa văn 4 góc mạ vàng đúc, cặp tay nắm cửa thủy lực dài mạ vàng và cơ chế bản lề sàn xoay mở êm ái khi cuộn chuột.
  - **Quả Địa Cầu NASA 2K & Cú Lao Máy Quay Zoom Thẳng Vào Việt Nam**: Tinh chỉnh đầu kim định vị GPS siêu mảnh lộ rõ toàn bộ dải đất hình chữ S, vành tọa độ trong suốt mảnh như sợi tơ; kích hoạt cú lao máy quay (Cinematic Dive Camera) zoom cận cảnh thẳng xuống mặt đất Việt Nam trước khi chuyển tiếp vào thực địa.
  - **Ma Trận Nhân Sự Retina 1024x512 & Chùm Xung Laser Dữ Liệu Liên Tục**: Thẻ Hologram Nhân Sự phóng to rõ nét với độ phân giải cao, ngàm góc HUD kỹ thuật `[ ]`, hiển thị mã định danh `ID: XT-8801`, dự án đang phụ trách, vạch pin `98%` và tín hiệu 5G; rãnh mạch PCB vuông góc 90° có chùm photon laser 3 hạt chuyển động nối tiếp liên tục kèm các cột mã số Telemetry ma trận ở hậu cảnh.
  - **Hệ Sinh Thái Nền Không Gian Mạng Đa Tầng (Deep Cyberspace Matrix Environment)**: Tích hợp mạng lưới Tron Horizon Grid 3D vô tận trôi dạt dọc trục không gian, các dải cáp quang dữ liệu, đám mây 1,200 hạt bụi ánh sáng số, các quầng sáng cực quang số Cyber Aurora (Cyan/Indigo/Emerald), tia quét laser radar Cathode Scanline chuyển động và dải dữ liệu vi tính biên màn hình.
  - **Bố Cục Tách Đôi Asymmetric Split-Screen**: Phân tách triệt để: Nửa trái (40%) cho Typography & Metric Dashboard thanh thoát; Nửa phải (60%) cho toàn bộ không gian 3D, không bao giờ bị chồng đè lên nhau.

## [Unreleased] - 2026-08-26

### Added

- Thêm action [`exportUserAttendanceDetailReport`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/report/index.ts) và type [`UserAttendanceDetailReportQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/report.ts) để gọi API xuất file Excel chi tiết chấm công và bảng lương theo từng nhân sự.
- Bổ sung nút bấm 📊 **"Xuất chi tiết Excel"** (`FileSpreadsheet`) vào cột Thao tác (`actions`) và giao diện Mobile Card trong Bảng báo cáo chấm công ([`attendances/reports/_components/table.tsx`](<file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/table.tsx>)).
- Tích hợp trạng thái `exportingUserId` để hiển thị spinner loading xoay tròn (`Loader2`) khi tải file và thông báo tiến trình bằng `react-hot-toast`.

### Fixed

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
