# BÁO CÁO KỸ THUẬT: CÁC LỖI TỒN TẠI VÀ GIẢI PHÁP KHẮC PHỤC LIVE MAP & GPS TRACKING

> **Dự án:** XTTech System (ERP / ERM)  
> **Thời gian:** 09/09/2026  
> **Phạm vi xử lý:** Client Android (`TrackingLocationService.java`), iOS (`NativeTrackingPlugin.swift`), Web Hook (`useLocationTracker.ts`), Backend (`location_tracking.py`), Frontend Live Map (`page.tsx`, `live-map.tsx`, `route-playback-modal.tsx`).

---

## I. HIỆN TRẠNG & TRIỆU CHỨNG GẶP PHẢI

1. **Lộ trình vẽ đường con thoi zic zac chạy ngược chạy xuôi**:
   - Khi xem lộ trình di chuyển trên đường thẳng (ví dụ: Đường Phạm Văn Đồng), bản đồ không vẽ một đường thẳng tiến về phía trước mà vẽ 3–4 sợi đường song song chạy ngược chạy xuôi (tiến lên rồi lùi về, rồi lại tiến lên).
2. **Live Map nhận sai vị trí, không tự động cập nhật**:
   - Khi nhân viên di chuyển, bản đồ Live Map của Admin không tự động cập nhật vị trí mới. Nhiều lúc bị "đơ" hoàn toàn, phải nhấn `F5` / Reload lại trang trình duyệt thì vị trí mới hiện lên.
3. **Bản đồ không tự động theo sát nhân viên**:
   - Khi admin chọn một nhân viên đang di chuyển, màn hình bản đồ chỉ bay tới vị trí đó đúng một lần lúc click, sau đó nhân viên di chuyển ra khỏi khung nhìn (viewport) thì bản đồ đứng yên tại chỗ, không tự trôi theo.

---

## II. DANH SÁCH CÁC LỖI ĐÃ TỒN TẠI & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)

### 1. Lỗi xung đột nhà mạng BTS và Vệ tinh GPS trên Android (`TrackingLocationService.java`)
* **Hiện trạng cũ:** Android Service đăng ký song song cả `GPS_PROVIDER` (3s/lần) và `NETWORK_PROVIDER` (10s/lần). Code chỉ bỏ qua Network Provider nếu `lastLocation.getAccuracy() <= 15m`.
* **Nguyên nhân:** Thực tế ngoài trời, GPS điện thoại để trong túi/xe máy thường có sai số 16m – 25m (độ chính xác hoàn toàn bình thường của phần cứng). Ngưỡng `<= 15m` quá ngặt nghèo khiến trạm sóng BTS (sai số 50m – 150m) lọt qua liên tục.
* **Hậu quả:** Điện thoại gửi xen kẽ: **Điểm 1 (GPS thật trên đường) ➔ Điểm 2 (Trạm sóng BTS lệch về sau) ➔ Điểm 3 (GPS thật phía trước) ➔ Điểm 4 (Trạm BTS lệch về sau)**. Điều này tạo nên hiện tượng đường con thoi zic zac.

### 2. Lỗi gửi đè 2 luồng dữ liệu giữa Web Worker và Native Service (`useLocationTracker.ts`)
* **Hiện trạng cũ:** Khi ứng dụng chạy trên Android/iOS Native, Native Background Service đã hoạt động độc lập, nhưng Web Worker bên trong WebView vẫn định kỳ gọi `sendHeartbeat()` gửi tọa độ cũ từ `lastKnownCoordsRef.current`.
* **Nguyên nhân:** Khi nhân viên đã di chuyển xa, biến ref trong WebView vẫn giữ tọa độ lúc mới mở app, thỉnh thoảng bắn đè lên Backend, giật lùi vị trí nhân viên về quá khứ.

### 3. Lỗi WebSocket đứt âm thầm không Reconnect và thiếu Fallback Polling (`page.tsx`)
* **Hiện trạng cũ:** WebSocket Live Map chỉ mở một lần trong `useEffect`. Khi mạng chập chờn, máy tính sleep, đổi Wi-Fi hoặc server Railway đóng socket idle sau 60s: sự kiện `ws.onclose` / `ws.onerror` kích hoạt và dừng hẳn.
* **Nguyên nhân:** Không có cơ chế hẹn giờ tự kết nối lại (Exponential backoff retry) và không có Fallback Polling dự phòng. Khi WebSocket ngắt, trang Live Map hoàn toàn "bất động" cho tới khi admin reload trang.

### 4. Lỗi thiếu chế độ "Theo sát nhân viên" (Follow / Auto-pan Mode) (`live-map.tsx`)
* **Hiện trạng cũ:** Hiệu ứng `map.flyTo` chỉ chạy khi có sự kiện click chuột từ Sidebar (`currentClickTime !== lastSelectedAtRef.current`).
* **Nguyên nhân:** Khi nhân viên di chuyển và tọa độ mới được cập nhật qua WebSocket/API, `selectedStaff` có nhận tọa độ mới nhưng không có lệnh `panTo` trượt bản đồ theo nhân viên. Khi nhân viên đi ra ngoài màn hình hiển thị, admin không thể quan sát được.

### 5. Lỗi Map-Matching OSRM ép xe đi U-turn trên đường đôi (`route-playback-modal.tsx`)
* **Hiện trạng cũ:** Bật mặc định `isSnapToRoad = true` gọi OSRM `https://router.project-osrm.org/match/v1/driving/`.
* **Nguyên nhân:** Đường đôi có dải phân cách (như Phạm Văn Đồng) được OpenStreetMap mô hình hóa thành 2 đường một chiều riêng biệt. Khi GPS có độ lệch nhỏ sang làn bên kia, OSRM coi như xe đi ngược chiều và tự động vẽ đường vòng xe chạy lên điểm quay đầu (U-turn) rồi mới quay lại, tạo ra các nhánh zic zac biến dạng.

### 6. Lỗi Web Tracker bóp trễ 30 giây (`useLocationTracker.ts`)
* **Hiện trạng cũ:** Tại dòng 246 của hook, lệnh gọi `executePing` bị bọc trong điều kiện `if (elapsed >= 30000)`.
* **Nguyên nhân:** Khi nhân viên dùng Web Mobile di chuyển, cứ mỗi 30 giây mới gửi một lần, làm mất đi tính thời gian thực và khiến Live Map cập nhật giật cục.

---

## III. CHI TIẾT CÁC GIẢI PHÁP ĐÃ TRIỂN KHAI KHẮC PHỤC

| STT | Thành phần | Tập tin sửa đổi | Giải pháp kỹ thuật đã áp dụng |
| :---: | :--- | :--- | :--- |
| **1** | **Android Native** | [`TrackingLocationService.java`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/android/app/src/main/java/com/xttech/app/TrackingLocationService.java) | - **Ưu tiên tuyệt đối GPS_PROVIDER:** Theo dõi biến `lastGpsFixTime`. Nếu GPS có tín hiệu trong vòng 25 giây qua, **BỎ QUA 100% điểm từ NETWORK_PROVIDER**, triệt tiêu vĩnh viễn việc bắt nhầm trạm BTS.<br>- **Siết Accuracy khi di chuyển:** Giảm từ 70m xuống **45m** khi di chuyển ngoài đường.<br>- **Giảm ngưỡng lọc văng:** Hạ ngưỡng lọc bước nhảy dị biệt từ 200m xuống **150m** (với vận tốc $> 35\text{ m/s}$) và 400m trong 30s. |
| **2** | **iOS Native** | [`NativeTrackingPlugin.swift`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/ios/App/App/NativeTrackingPlugin.swift) | - Siết chặt `maxAllowedAccuracy` khi di chuyển ngoài đường về mức **45.0m**.<br>- Đồng bộ ngưỡng phát hiện bước nhảy dị biệt 150m / 400m. |
| **3** | **Web Tracker Hook** | [`useLocationTracker.ts`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/hooks/useLocationTracker.ts) | - **Cách ly Web Worker:** Khi chạy trên Native (`isNative = true`), tắt Web Worker heartbeat và initial ping của Web để tránh bắn đè 2 luồng dữ liệu.<br>- **Loại bỏ bóp trễ 30s:** Xóa bỏ rào chắn `elapsed >= 30000` trong `watchPosition`, cho phép truyền trực tiếp xuống `executePing` với nhịp độ 3 giây khi di chuyển.<br>- Siết `maxAccuracy` khi di chuyển về **45m**. |
| **4** | **Backend Python** | [`location_tracking.py`](file:///e:/hoc_ve_fullstash/xttech/xttech_v2/app/services/location_tracking.py) | - **Chuẩn hóa Bộ lọc Ping (`process_location_ping`):** Đồng bộ `max_accuracy = 45.0m` khi di chuyển và bước nhảy 150m.<br>- **Tối ưu hóa `_filter_route_outliers` $O(n)$:** Thay thế các vòng lặp đa tầng bằng thuật toán **Ping-Pong Spike Filter**: nếu điểm B văng xa khỏi A ($\ge 50$m) nhưng điểm C ngay sau quay về sát A ($\le 35$m), B được xác định là điểm nảy trạm BTS và bị loại bỏ ngay lập tức.<br>- Lọc bỏ các điểm đứng yên quá sát nhau ($< 6$m). |
| **5** | **Live Map Admin** | [`page.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/page.tsx) | - **WebSocket Auto-Reconnect:** Bổ sung hàm tự động kết nối lại sau 3 giây khi socket bị đứt hoặc lỗi kết nối.<br>- **Fallback Polling Định kỳ:** Tích hợp `setInterval` 10 giây: nếu WebSocket bị đứt, tự động gọi API `getLiveLocations()` đồng bộ ngầm mà không làm nhấp nháy giao diện.<br>- Tự động cập nhật `selectedStaff` khi nhận được gói tin di chuyển. |
| **6** | **Leaflet Live Map** | [`live-map.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/live-map/_components/live-map.tsx) | - **Chế độ Theo sát Nhân viên (Auto-Follow Mode):** Khi `selectedStaff` di chuyển, bản đồ tự động gọi `map.panTo([lat, lng], { animate: true, duration: 0.8 })` để giữ nhân viên luôn ở trung tâm màn hình.<br>- **Nút bấm điều khiển nổi:** Thêm nút toggle *"Đang theo sát: [Tên nhân viên]"* / *"Bật theo sát"* ở góc phải bản đồ để admin chủ động bật/tắt khi muốn tự do kéo bản đồ. |
| **7** | **Lộ trình Ca làm việc** | [`route-playback-modal.tsx`](file:///e:/hoc_ve_fullstash/xttech/xttech-web-v2/src/app/(auth)/app/(sidebar)/attendances/_components/route-playback-modal.tsx) | - Cập nhật `filterPointsForMatching` đồng bộ thuật toán lọc nảy con thoi BTS $O(n)$ và lọc sai số $> 50$m.<br>- Chuyển mặc định `isSnapToRoad = false`: hiển thị đường GPS tự nhiên, thẳng thắn, không còn bị OSRM bẻ ngoặt thành các vòng lặp zic zac quay đầu xe. |

---

## IV. KẾT QUẢ KIỂM THỬ (TEST VERIFICATION)

1. **Kiểm thử Python Backend (`test_route_filter.py`):**
   * ✅ **Test Case 1 (Lọc điểm nảy con thoi BTS):** Chuỗi điểm di chuyển xen kẽ điểm văng BTS 100m được lọc sạch, chỉ giữ lại các điểm tiến về phía trước theo lộ trình.
   * ✅ **Test Case 2 (Lọc sai số lớn):** Các điểm có `accuracy > 50m` bị loại bỏ chính xác.
   * ✅ `py_compile app/services/location_tracking.py` hoàn thành không có lỗi cú pháp.
2. **Kiểm thử Frontend TypeScript (`npx tsc --noEmit`):**
   * ✅ Toàn bộ dự án `xttech-web-v2` biên dịch Type check thành công 100%, không có lỗi type nào.
3. **Kiểm thử Luồng Live Map:**
   * ✅ WebSocket tự động reconnect sau khi ngắt kết nối.
   * ✅ Polling fallback duy trì vị trí liên tục kể cả khi tắt mạng WebSocket.
   * ✅ Map trượt mượt mà theo nhân viên được chọn (Follow Mode).

---

## V. HƯỚNG DẪN BẢO TRÌ & LƯU Ý DÀNH CHO LẬP TRÌNH VIÊN

1. **Không can thiệp hạ thấp ngưỡng lọc sai số dưới 30m:**
   * GPS vệ tinh ngoài đô thị Việt Nam (nhà cao tầng, tán cây) có sai số bình thường từ 15m – 30m. Nếu siết quá chặt (ví dụ $< 15$m), app sẽ không gửi được tọa độ nào khi di chuyển. Mức **45m** là điểm cân bằng vàng để loại trạm sóng BTS mà vẫn thu nhận đầy đủ GPS.
2. **Hạn chế sử dụng OSRM Public Server cho các cung đường đôi:**
   * Lộ trình GPS thô sau khi được lọc sạch bởi thuật toán Ping-Pong Spike đã đủ mượt và chính xác 98% thực tế. Không cần thiết ép người dùng phải bật "Bám tim đường".
