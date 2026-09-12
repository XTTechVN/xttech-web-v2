# Changelog

All notable changes to the frontend project will be documented in this file.

## [Unreleased] - 2026-09-12

### Refactored & Enhanced
- **Chuẩn hóa Đường dẫn Hình ảnh & Tệp tin ([`src/utils/string.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/utils/string.ts)):**
  - Xây dựng hàm tiện ích tập trung `getFileUrl(path, fallback)` xử lý toàn diện các trường hợp ngoại lệ: `undefined`/`null`, tự động chuẩn hóa dấu gạch chéo `/`, hỗ trợ link tuyệt đối (`http://`, `https://`, `blob:`, `data:`), loại bỏ triệt để hiện tượng URL rác hoặc double slash.
  - Refactor đồng bộ toàn bộ codebase (hơn 20 files: Header, Profile, Quản lý nhân sự, Cửa & Phụ kiện, Báo giá, Điểm danh, Live Map, Leave Requests...) chuyển từ nối chuỗi thủ công `BASE_MINIO_URL` sang `getFileUrl()`.

### Fixed & Enhanced
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
    - [`auto-timekeeping-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx): Rút gọn khối `catch` chấm công tự động sang `showErrorToast`.
    - [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx): Khối `handleDeleteConfirm` dùng `showErrorToast`.
    - [`overtime-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/overtime-modal.tsx): Thay thế toàn bộ 6 dòng bóc tách lỗi thủ công trong `catch` bằng `showErrorToast`.
    - [`adjustments/_components/add-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/adjustments/_components/add-modal.tsx): Loại bỏ hàm `handleCreateError` thủ công hơn 25 dòng, chuẩn hóa qua `showErrorToast`.
    - [`adjustments/_components/edit-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/adjustments/_components/edit-modal.tsx): Bắt lỗi qua `showErrorToast`.
    - [`adjustments/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/adjustments/page.tsx): Xử lý lỗi duyệt và xóa khiếu nại bằng `showErrorToast`.
    - [`reports/_components/action-bar.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/action-bar.tsx): Xuất Excel bắt lỗi chi tiết qua `getErrorMessage`.
    - [`live-map/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx): Bắt lỗi fetch vị trí qua `showErrorToast`.
    - [`edit-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/edit-modal.tsx) & [`add-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/add-modal.tsx): Đồng bộ callback `onError` sử dụng `showErrorToast`.
  - **Module Phiên bản Ứng dụng (`app-versions`):**
    - [`release-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/release-modal.tsx): Đồng bộ `setErrorMsg` và `showErrorToast` cùng hiển thị message chi tiết từ server.
    - [`table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/table.tsx): Chuẩn hóa `fetcher` `catch (err)` dùng `showErrorToast`.
  - **Module Nghỉ phép (`leave-requests`):**
    - [`leave-request-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/leave-requests/_components/leave-request-modal.tsx): Thay thế toàn bộ 4 hàm `onError` của mutations (`create`, `update`, `delete`, `review`) sang `showErrorToast`.
  - **Module Ca làm việc (`shifts`):**
    - [`form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/shifts/_components/form-modal.tsx): Đồng bộ 2 callbacks `onError` (`createMutation`, `updateMutation`) sang `showErrorToast`.
    - [`table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/shifts/_components/table.tsx): Bắt lỗi `deleteMutation.onError` bằng `showErrorToast`.
  - **Module Vai trò & Phân quyền (`roles`):**
    - [`role-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/roles/_components/role-table.tsx): Chuẩn hóa `fetcher` và `handleDeleteRole.onError` sang `showErrorToast`.
    - [`role-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/roles/_components/role-form-modal.tsx): `onError` lưu vai trò dùng `showErrorToast`.
  - **Module Đề xuất & Góp ý (`suggestions`):**
    - [`suggestion-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/suggestions/_components/suggestion-modal.tsx): Cập nhật 4 callbacks `onError` (gửi, cập nhật, xóa, duyệt đề xuất) sang `showErrorToast`.
    - [`suggestion-table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/suggestions/_components/suggestion-table.tsx): `fetcher` bắt lỗi bằng `showErrorToast`.
  - **Module Dự án & Cấu hình Dự án (`projects` & `projects/configuration`):**
    - [`table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/table.tsx): Bọc `fetcher` với try/catch gọi `showErrorToast`.
    - [`modals.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/modals.tsx): Cập nhật `createMutation.onError` và `updateMutation.onError` sang `showErrorToast`.
    - [`quotation-modals.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/_components/quotation-modals.tsx): Cập nhật tạo và cập nhật báo giá `onError` sang `showErrorToast`.
    - [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/page.tsx): Cập nhật `deleteProjectMutation.onError` sang `showErrorToast`.
    - [`[id]/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/page.tsx): Chuẩn hóa `deleteProjectMutation.onError` và `changeQuotationStatus.onError` sang `showErrorToast`.
    - **Cấu hình Vật liệu (`materials`):** [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/materials/page.tsx) & [`modals.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/materials/_components/modals.tsx): Đồng bộ toàn bộ `onError` của xóa, tạo, sửa vật tư sang `showErrorToast`.
    - **Cấu hình Cửa (`doors`):** [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/page.tsx) & [`modals.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/doors/_components/modals.tsx): Đồng bộ toàn bộ `onError` của xóa, tạo, sửa hệ cửa sang `showErrorToast`.
    - **Cấu hình Phụ kiện (`accessories`):** [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/accessories/page.tsx) & [`modals.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/configuration/accessories/_components/modals.tsx): Đồng bộ toàn bộ `onError` của xóa, tạo, sửa phụ kiện sang `showErrorToast`.
  - **Module Khách hàng (`customers`):**
    - [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/page.tsx): Cập nhật `deleteCustomerMutation.onError` sang `showErrorToast`.
    - [`modals.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx): Cập nhật `createMutation.onError` và `updateMutation.onError` sang `showErrorToast`.
  - **Module Phòng ban (`departments`):**
    - [`table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/departments/_components/table.tsx): Chuẩn hóa `deleteDepartment.onError` sang `showErrorToast`.
    - [`form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/departments/_components/form-modal.tsx): Đồng bộ `createDepartment.onError` và `updateDepartment.onError` sang `showErrorToast`.

## [Unreleased] - 2026-09-10

### Added
- **Nâng cấp & Chuẩn hóa Modal Lộ trình Di chuyển theo chuẩn Google Maps ([`route-playback-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/route-playback-modal.tsx)):**
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
  - **Trang Quản trị Danh mục Nhà cung cấp ([`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/providers/page.tsx)):**
    - Đường dẫn chuẩn: `/app/customers/providers` (sub-route bên trong module Khách hàng).
    - Thẻ thống kê 4 ô chuẩn hệ thống (`StatsCard`: Tổng số nhà cung cấp, Đang hoạt động, Nguồn đối tác, Mới cập nhật).
    - Thanh tìm kiếm theo mã, tên nhà cung cấp (`useQueryParam('search')`).
    - Bảng dữ liệu chuẩn `TableData` hỗ trợ đầy đủ Desktop & Mobile card view, định dạng ngày tháng và phân trang.
    - Modal Thêm / Cập nhật nhà cung cấp ([`provider-form-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/provider-form-modal.tsx)) dùng chung cho toàn bộ cụm `customers`, chuẩn DRY 100%, loại bỏ hoàn toàn việc import chéo.
    - Modal Xác nhận xóa an toàn gọi API xóa mềm backend.
  - **Tiện ích Quick-Create tại Form Khách hàng ([`modals.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx)):**
    - Tích hợp Selectbox "Nhà cung cấp / Đối tác" vào `CustomerFormModal`.
    - Thêm nút `+` nằm ngay bên phải ô Selectbox: mở popup mini tạo nhanh tại chỗ, sau khi lưu sẽ tự động invalidate cache React Query và gán ngay ID vừa tạo vào form mà **không làm mất thông tin form đang nhập dở**.
  - **Hiển thị thông tin Nhà cung cấp:**
    - Cột "Nhà cung cấp" trong Bảng Khách hàng ([`table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx)) cả trên giao diện Desktop lẫn thẻ Mobile.
    - Trường "Nhà cung cấp / Đối tác" trong Thẻ chi tiết khách hàng ([`customer-info.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/[id]/_components/customer-info.tsx)).
  - **API Actions & Type Safety:**
    - Tạo `src/types/customer-provider.ts` và cập nhật `src/types/customer.ts` bổ sung `providerId`, `provider`.
    - Tạo `src/actions/customer-provider/index.ts` kết nối đồng bộ với endpoint `/api/v1/customer-providers`.


### Fixed
- **Tối ưu hóa Hệ thống Live Map Realtime & Triệt tiêu Lộ trình Zic Zac Con thoi:**
  - **Khắc phục lỗi Live Map bị đơ / phải reload mới cập nhật ([`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx)):**
    - Tích hợp cơ chế **WebSocket Auto-Reconnect** tự động kết nối lại sau 3s khi đứt mạng, đóng nắp máy hoặc đổi Wi-Fi.
    - Bổ sung **Fallback Polling** định kỳ (10s/lần khi mất socket và 60s dự phòng) giúp dữ liệu bản đồ luôn cập nhật mượt mà, không bao giờ phải F5.
  - **Tính năng Tự động Theo sát Nhân viên (Auto-Follow Mode) ([`live-map.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx)):**
    - Tự động gọi `map.panTo()` mượt mà giữ nhân viên luôn ở tâm màn hình khi họ di chuyển.
    - Thêm nút toggle nổi *"Đang theo sát"* / *"Bật theo sát"* ở góc phải bản đồ để admin chủ động kiểm soát.
  - **Triệt tiêu hiện tượng lộ trình chạy ngược chạy xuôi zic zac trên đường ([`route-playback-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/route-playback-modal.tsx)):**
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
  - **Trang Quản lý Phiên bản Ứng dụng Di động ([`app-versions/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/page.tsx)):**
    - Bổ sung nhóm mục **"Hệ thống"** trên Sidebar (`/app/app-versions`, phân quyền `super`, `admin`).
    - Tái cấu trúc layout đồng bộ 100% với các trang chuẩn (`customers`, `departments`, `shifts`):
      - Khối thống kê 4 thẻ chuẩn [`StatsCard`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/components/stats-card.tsx) (Bản mới nhất, Tổng bản phát hành, Yêu cầu bắt buộc, Nền tảng hỗ trợ).
      - Bỏ box header dư thừa ở đầu trang, đưa nút hành động "Phát hành bản mới" lên Action Bar chuẩn.
      - Tích hợp ô tìm kiếm và bộ lọc Nền tảng (Android / iOS) trực tiếp vào [`TableData`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/table.tsx).
      - Chuẩn hóa form modal phát hành [`ReleaseModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/app-versions/_components/release-modal.tsx) đồng bộ styling với các form modal trong hệ thống.

### Changed
- **Tối ưu hóa luồng Check-in & Loại bỏ Ping thủ công ([`auto-timekeeping-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx)):**
  - Lược bỏ hoàn toàn lệnh gọi `sendLocationPing` thủ công sau khi Check-in thành công. Toàn bộ việc khởi tạo Live Location và broadcast WebSocket hiện được Backend tự động thực hiện từ chính toạ độ của form chấm công.

### Fixed
- **Chuẩn hóa cơ chế tự động bay về nhân sự tuân thủ React 19 Compiler ([`live-map.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx) & [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx)):**
  - Bổ sung timestamp `_selectedAt` mỗi khi click chọn nhân sự ở Sidebar.
  - Sử dụng duy nhất một `lastSelectedAtRef` khai báo chuẩn ở đầu component, loại bỏ hoàn toàn các ref mutate trong render body và các hook vi phạm thứ tự của React 19 Compiler.
  - Xóa bỏ lỗi `Error: This value cannot be modified` và đảm bảo click lại vào nhân viên bất kỳ lúc nào thì bản đồ đều bay về đúng vị trí tức thì.
- **Triệt tiêu lỗi vòng lặp render vô hạn `Maximum update depth exceeded` trên Live Map ([`live-map.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx)):**
  - Xóa bỏ state rác `mapVersion` liên tục ép re-render trong sự kiện di chuyển bản đồ.
  - Bỏ listener `moveend`, chỉ cập nhật `currentZoom` khi giá trị thực tế thay đổi (`zoomend`) và có guard `prev !== newZoom`.
  - Chuẩn hóa callback ref cho `<MapContainer ref={handleMapRef}>` qua `React.useCallback` ngăn React gọi lại inline ref liên tục.
  - Tách `clustersRef` khỏi dependency array của `useEffect` bay tới nhân sự, chấm dứt triệt để chuỗi domino kích hoạt re-render lặp.
- **Hỗ trợ định vị Wi-Fi / IP trên Laptop & Môi trường Web ([`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts)):**
  - Đồng bộ chuẩn hóa các ngưỡng lọc định vị trên thiết bị.


## [Unreleased] - 2026-09-07


### Added
- **Tính năng Marker Clustering & Spiderfy (Gom cụm và Xòe nan hoa) trên Live Map ([`live-map.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx)):**
  - **Thuật toán Gom cụm theo khoảng cách Pixel thích ứng theo mức Zoom (Zoom-Adaptive Clustering):** Khi zoom xa (zoom $< 11$: $65\text{px}$, zoom $< 13$: $55\text{px}$), tự động gom các nhân sự trong cùng thành phố/tỉnh thành 1 Marker Cụm duy nhất; khi zoom gần (zoom $\ge 13$: $38\text{px}$), tách ra từng phòng/tòa nhà riêng biệt.
  - **Hiển thị thông minh theo mức Zoom (Clean Map UI):** Khi zoom xa ($< 14$), tự động ẩn nhãn tên để bản đồ thoáng đãng, chỉ giữ Avatar tròn mini ($32\text{px}$) kèm viền màu trạng thái, nhãn tên tự động hiện lên khi rê chuột `hover` hoặc khi click chọn; khi zoom gần ($\ge 14$), hiển thị nhãn tên đầy đủ.
  - **Rút gọn tên nhân viên thông minh (`formatShortStaffName`):** Tự động chuyển `System Administrator` thành `Admin`, giới hạn độ dài tên tránh hiện tượng chữ quá dài đè lên marker khác.
  - **Hiệu ứng Spiderfy xòe nan hoa:** Khi click vào Cụm, bản đồ bung các nhân sự ra thành một vòng tròn đều xung quanh tâm với đường chỉ nối nan hoa tinh tế. Cho phép click chọn từng nhân sự riêng biệt, xem chi tiết và lộ trình mà không bao giờ bị đè lấp lẫn nhau. Tự động thu gọn khi click ra ngoài bản đồ.
  - **Auto-Spiderfy khi chọn từ Sidebar:** Khi Admin click vào nhân sự ở danh sách bên trái, bản đồ tự động bay tới và bung xòe cụm chứa nhân sự đó.

### Fixed
- **Khắc phục vòng lặp tự bung xòe nan hoa (Spiderfy Loop), tự zoom gần lại và gom nhầm nhân sự ở xa trên Live Map ([`live-map.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx)):**
  - **Khắc phục lỗi tự động phóng to lại mức 16 khi vừa zoom xa (Auto Zoom-In Loop):** Di chuyển lệnh `map.flyTo(..., 16)` vào bên trong guard `selectedStaff.userId !== prevSelectedStaffIdRef.current`. Chỉ bay tới nhân viên khi người dùng mới chủ động click chọn từ Sidebar, không tự động flyTo lại khi zoom xa hoặc re-render bản đồ.
  - **Khắc phục lỗi tự động mở nan hoa liên tục khi zoom (Zoom Loop):** Loại bỏ việc re-trigger `useEffect` mở Spiderfy phụ thuộc vào `clusters`. Sử dụng `prevSelectedStaffIdRef` đảm bảo Spiderfy chỉ kích hoạt khi người dùng chủ động click chọn cụm trên bản đồ hoặc click chọn nhân sự mới từ Sidebar.
  - **Tự động thu gọn nan hoa khi Zoom xa:** Bổ sung cơ chế tự động reset `activeSpiderfyClusterId = null` khi mức zoom $< 14$, ngăn ngừa nan hoa bị giãn/nhảy rối mắt khi quan sát ở phạm vi thành phố/toàn quốc.
  - **Ràng buộc khoảng cách địa lý thực tế ($\le 150\text{m}$):** Bổ sung điều kiện kiểm tra khoảng cách thực tế bằng `map.distance` trước khi gộp marker theo khoảng cách pixel màn hình. Tuyệt đối không gom nhân sự ở khác quận, tỉnh (ví dụ Nam Định với Hải Phòng) vào chung một cụm văn phòng khi zoom xa.

### Added
- **Khắc phục triệt để lỗi sai lệch vị trí giữa Chấm công và Live Map, loại bỏ Stale Cache quá khứ và hỗ trợ định vị trong nhà:**
  - **Triệt tiêu Stale Cache Android ([`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java)):** Kiểm tra thời gian ghi nhận của `lastKnownLocation`. Nếu điểm lưu quá $60$ giây từ quá khứ, vứt bỏ ngay lập tức, chấm dứt triệt để lỗi vừa khởi động app đã bắn tọa độ cũ đi xe ngoài đường (kèm tốc độ cũ $48\text{ km/h}$) lên Live Map.
  - **Hỗ trợ định vị đa tầng trong nhà (Dual Provider):** Đăng ký song song cả `GPS_PROVIDER` (cho ngoài trời) và `NETWORK_PROVIDER` (cho trong phòng / văn phòng qua Wi-Fi) kèm bộ lọc ưu tiên, đảm bảo khi nhân viên ngồi trong văn phòng mất sóng vệ tinh thì hệ thống vẫn cập nhật vị trí văn phòng chuẩn xác.
  - **Bộ lọc sai số thích ứng (Adaptive Accuracy):** Áp dụng đồng bộ trên cả 3 nền tảng ([`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java), [`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift), [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts)): siết chặt `accuracy <= 30m` khi di chuyển ngoài đường, nới lỏng `accuracy <= 80m` khi đứng yên trong phòng (chuẩn hóa `speed = 0`).
  - **Đồng bộ khởi tạo tức thì khi Check-in ([`auto-timekeeping-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx)):** Tự động gửi ping khởi tạo với `speed = 0` ngay khi bấm Chấm công thành công, đồng bộ ngay lập tức điểm chấm công lên Redis Live Map.
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
- **Xem Lộ trình theo đúng Ca Chấm công ([`route-playback-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/route-playback-modal.tsx) & [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx)):**
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
- Bổ sung modal [`CustomerExportModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx) hỗ trợ xuất file Excel báo cáo khách hàng phân tầng đa Sheet theo nhân viên phụ trách.
- Bổ sung các preset chọn nhanh thời gian thông minh (*Tuần này (mặc định)*, *Tuần trước*, *Tháng này*, *Tháng trước*, *Tùy chọn ngày*) cùng dropdown lọc nhân viên phụ trách dành cho Quản lý.
- Thêm action [`exportCustomersExcel`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/customer/index.ts) và type [`CustomerExportQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/customer.ts).
- Tích hợp nút bấm **"Xuất Excel"** (`FileSpreadsheet`) trên thanh công cụ quản lý khách hàng tại [`customers/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/table.tsx).
- Tích hợp giao diện **Hướng dẫn cấp lại quyền vị trí trực quan (Visual Permission Guide)** và cơ chế **Tự động bắt quyền (Auto-Permission Recovery)** trong [`AutoTimekeepingModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx): Hướng dẫn chi tiết từng bước cho cả 3 nền tảng (🤖 Android App / PWA cài đặt, 🍏 iPhone iOS Safari / Standalone, 💻 Máy tính Chrome/Edge), kèm lắng nghe sự kiện `navigator.permissions` tự động kích hoạt lấy vị trí ngay khi người dùng vừa bật lại quyền.

### Fixed
- Chuẩn hóa thiết kế giao diện [`CustomerExportModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/customers/_components/modals.tsx) đồng bộ 100% với hệ thống Modal của dự án: cấu trúc container `flex flex-col gap-4 py-2`, spacing `gap-3`, tiêu đề súc tích, bộ chọn mốc thời gian chip và nút bấm `Button` chuẩn Design System.
- Sửa lỗi cảnh báo React render phase *"Cannot access refs during render"* tại [`quotation-info.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/projects/[id]/quotations/[quotationId]/components/editor/quotation-info.tsx) khi truyền thuộc tính `width` chứa `ref.current`.

### Changed / Refactored
- Tối ưu hóa và tái cấu trúc toàn diện trang Quản lý chấm công [`attendances/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/page.tsx): loại bỏ hơn 350 dòng code rác, các state mồ côi (`filterEmployeeId`, `filterStartDate`, `filterEndDate`, `filterShift`, `isLoading`, `showTimekeepingModal`, `reviewModalState`), các modal không sử dụng (`ReviewAdjustmentModal`, `AutoTimekeepingModal`) và các khối JSX comment cũ; chuẩn hóa bộ lọc `TableData` và tối ưu hiệu năng render.

### Removed
- Loại bỏ nút xuất lẻ Excel theo từng nhân sự tại Bảng báo cáo chấm công [`attendances/reports/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/table.tsx), action `exportUserAttendanceDetailReport` và type `UserAttendanceDetailReportQueryParams`.

## [0.1.0] - 2026-08-26

- Xây dựng **Android Native Foreground Service (`TrackingLocationService.java`)** độc lập chạy ngầm liên tục chuẩn như Zalo/Grab:
  - Khởi tạo tiến trình nền độc lập dưới tầng Android OS với `START_STICKY`, Notification Channel cố định (*"XTTech đang hoạt động"*) và gắn cờ `android:stopWithTask="false"` trong `AndroidManifest.xml`.
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
  - Chuẩn hóa kiến trúc Server Layout tại [`src/app/(auth)/layout.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/layout.tsx) với `export const dynamic = 'force-dynamic'` và `revalidate = 0`, ngăn chặn Next.js tự động prerender tĩnh khu vực authenticated routes và loại bỏ hoàn toàn header `s-maxage=31536000`.
  - Tách riêng component guard phía client [`AuthClientLayout`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/_components/auth-client-layout.tsx) để xử lý hydrate Zustand và bảo vệ phân quyền.
  - Bổ sung cấu hình `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` và `CDN-Cache-Control: no-store` cho toàn bộ route `/app/:path*` trong [`next.config.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/next.config.ts) và Middleware [`src/proxy.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/proxy.ts), ngăn chặn hoàn toàn Edge CDN của Railway lưu cache nhầm response dạng `text/x-component`.
  - Giữ nguyên URL điều hướng sạch đẹp (`/app/dashboard`) bằng `window.location.replace` mà không cần dùng query param tạm thời (`?_t=...`).
  - Tối ưu [`MainActivity.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/MainActivity.java): Bật `setAcceptThirdPartyCookies`, đồng thời gọi `CookieManager.getInstance().flush()` ngay trong sự kiện vòng đời `onResume()` để đồng bộ cookie tức thời.
- Tính năng **Giám sát Vị trí Nhân sự Trực tiếp & Lịch sử Lộ trình** ([`attendances/live-map/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx)):
  - Trang Bản đồ Admin kết hợp bản đồ Leaflet mượt mà và danh sách nhân sự trực tuyến ([`LiveMap`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx), [`StaffList`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/staff-list.tsx)).
  - Kết nối Realtime **WebSocket** nhận cập nhật tọa độ tức thời với trạng thái di chuyển (Moving / Stationary / Offline), mức pin và vận tốc.
  - Modal xem lại lộ trình di chuyển theo ngày ([`RoutePlaybackModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/route-playback-modal.tsx)) vẽ đường đi Polyline, tổng km đã đi và mốc thời gian.
    - Hook định vị thông minh [`useLocationTracker`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts) tích hợp cơ chế chống đóng băng toàn diện (**Web Worker Timer** chạy độc lập không bị throttle khi ẩn tab, **`watchPosition`** lắng nghe phần cứng GPS, **Screen WakeLock API**, và tự động ping bù khi bật màn hình / focus tab).
  - Tích hợp `useLocationTracker` trực tiếp vào layout toàn cục [`layout.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/layout.tsx) tự động kích hoạt định vị khi đăng nhập.
  - Bổ sung cơ chế kích hoạt gửi ping vị trí tức thời ngay khi nhân viên bấm Check-in thành công trong [`AutoTimekeepingModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal.tsx).
- Thêm action [`exportUserAttendanceDetailReport`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/actions/report/index.ts) và type [`UserAttendanceDetailReportQueryParams`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/report.ts) để gọi API xuất file Excel chi tiết chấm công và bảng lương theo từng nhân sự.
- Bổ sung nút bấm 📊 **"Xuất chi tiết Excel"** (`FileSpreadsheet`) vào cột Thao tác (`actions`) và giao diện Mobile Card trong Bảng báo cáo chấm công ([`attendances/reports/_components/table.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/reports/_components/table.tsx)).
- Tích hợp trạng thái `exportingUserId` để hiển thị spinner loading xoay tròn (`Loader2`) khi tải file và thông báo tiến trình bằng `react-hot-toast`.

### Fixed
- Sửa dứt điểm lỗi hiển thị phần trăm pin `null%` và icon pin màu đỏ khi thiết bị không cung cấp thông số pin:
  - Cập nhật [`live-map.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx) và [`staff-list.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/staff-list.tsx) kiểm tra chặt chẽ `typeof batteryLevel === 'number'`, hiển thị `--` hoặc ẩn icon pin khi không có dữ liệu.
  - Bổ sung cơ chế cache giữ lại mức pin đọc được gần nhất trong [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts).
- Sửa lỗi mảng `staffLocations` bị nhân đôi 2 phần tử của cùng 1 nhân sự trên trang Giám sát Vị trí ([`attendances/live-map/page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx)):
  - Chuẩn hóa hàm nhận WebSocket `onmessage` với cơ chế phòng thủ 2 lớp (hỗ trợ cả `userId` và `user_id`), tự động map các thuộc tính về `StaffLiveLocation` và merge state an toàn.
- Cập nhật [`src/types/location.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/types/location.ts) và [`RoutePlaybackModal`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/route-playback-modal.tsx):
  - Đồng bộ hỗ trợ cả `camelCase` (`totalDistanceKm`, `recordedAt`) và `snake_case` tránh lỗi hiển thị tổng quãng đường `0 km` hoặc thời gian không xác định khi xem lộ trình.
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
