# Kiến trúc theo dõi vị trí trên iOS

> Phạm vi: theo dõi vị trí nhân sự thời gian thực trên app iOS (Capacitor).
> File nguồn chính: ios/App/App/NativeTrackingPlugin.swift, NativeTrackingPlugin.m, AppDelegate.swift, SceneDelegate.swift, Info.plist, src/hooks/useLocationTracker.ts, src/app/(auth)/app/(sidebar)/live-map/page.tsx.
> Tài liệu liên quan: livemap-and-gps-fix-log.md (lịch sử lỗi, chủ yếu cho Android và Web).
> Lưu ý (cập nhật 30/10/2026): mã hiện tại KHÔNG dùng CoreMotion và KHÔNG có chế độ moving/stationary với timer 120s. Phân biệt di chuyển bằng speed >= 0.8 m/s hoặc dịch chuyển >= 10m so với điểm đã gửi. Throttle: 3s khi di chuyển, 60s khi đứng yên. Có thêm heartbeat timer 60s độc lập với callback GPS, thử lại có backoff (5s, 10s... tối đa 30s) sau khi gửi thất bại, và điểm có accuracy > 200m vẫn gửi nhịp tim (server giữ tọa độ tốt gần nhất). Native phát sự kiện locationUpdate và authError lên JS sau khi gửi ping. Các thao tác CLLocationManager (checkPermission, ensureAlwaysPermission) chạy trên main thread. Refresh token: server /auth/refresh chỉ trả access token mới, không xoay vòng refresh token.

---

## 1. Tổng quan

Tracking trên iOS không chạy trong WebView. JavaScript chỉ start/stop tracking, cấp token và nhận sự kiện. GPS, CoreMotion, gửi ping lên server và refresh token đều nằm trong plugin Swift NativeTracking, nên tracking vẫn chạy khi app ở nền hoặc màn hình khóa.

```
WebView (Next.js)
  useLocationTracker.ts
    - NativeTracking.startTracking({token, apiUrl})
    - NativeTracking.updateToken() khi token đổi
    - nghe: locationUpdate / authError / permissionChanged
        |
        | Capacitor bridge
        v
Native (Swift) - NativeTrackingPlugin
  CLLocationManager  -> didUpdateLocations
  CMMotionActivity   -> chế độ Moving / Stationary
  Region 100m / SLC  -> đánh thức app từ nền
  URLSession POST /api/v1/attendances/location-ping
  refresh token khi 401
        |
        | HTTPS
        v
Server  --WebSocket /api/v1/ws/live-tracking-->  Live Map (admin)
```

Hai luồng dữ liệu:
1. Ghi: Native gửi ping lên server.
2. Đọc: server phát qua WebSocket tới Live Map của admin. Luồng này không đi qua app iOS.

---

## 2. Các thành phần

### 2.1 NativeTrackingPlugin.swift
Plugin Capacitor (CAPPlugin) và cũng là CLLocationManagerDelegate. Có biến static shared để AppDelegate gọi lại khi iOS đánh thức app từ nền.

| Method JS gọi | Tác dụng |
|---|---|
| startTracking({token, refreshToken, apiUrl}) | Lưu thông tin xác thực vào UserDefaults, bật cờ xttech_ios_is_tracking, khởi động CoreMotion và CoreLocation |
| updateToken({token, refreshToken}) | Chỉ cập nhật token, không đổi trạng thái tracking |
| stopTracking() | Tắt cờ, dừng mọi nguồn (GPS, CoreMotion, SLC, region, heartbeat), xóa điểm cache |
| checkPermission() | Trả về status (always, whenInUse, denied...), isAlways, isPrecise |
| openSettings() | Mở màn hình Settings của app |

Event phát về JS qua notifyListeners:
- locationUpdate: sau khi ping thành công (latitude, longitude, speed, timestamp).
- authError: refresh token thất bại, code UNAUTHORIZED.
- permissionChanged: khi người dùng đổi quyền vị trí.

### 2.2 NativeTrackingPlugin.m
File này không còn tồn tại trong ios/App/App. Plugin được đăng ký bằng code trong MainViewController (registerPluginInstance) và danh sách method nằm ở mảng pluginMethods của NativeTrackingPlugin.swift. Thêm method mới cho JS phải thêm vào mảng này, rồi cập nhật interface trong useLocationTracker.ts.

### 2.3 AppDelegate.swift
Trong didFinishLaunchingWithOptions, nếu launchOptions[.location] có giá trị thì app được iOS đánh thức do sự kiện vị trí khi ở nền (SLC hoặc region exit). Lúc đó gọi NativeTrackingPlugin.handleLocationWakeUp().

### 2.4 SceneDelegate.swift
Tạo CAPBridgeViewController và chuyển tiếp callback mở URL, user activity cho SceneDelegateProxy. Không liên quan trực tiếp đến tracking.

### 2.5 Info.plist
- UIBackgroundModes = location: bắt buộc để nhận vị trí ở nền.
- NSLocationWhenInUseUsageDescription, NSLocationAlwaysAndWhenInUseUsageDescription, NSLocationAlwaysUsageDescription: nội dung hỏi quyền bằng tiếng Việt. Thiếu hoặc sai mục đích thì Apple có thể từ chối app.
- NSMotionUsageDescription: cho CoreMotion.

### 2.6 useLocationTracker.ts (phía JS)
Hook React, chỉ điều khiển native:
- Nếu Capacitor.isNativePlatform() là true: gọi NativeTracking.startTracking. Nếu lỗi thì rơi về Web Geolocation.
- Khi accessToken hoặc refreshToken trong useAuthStore đổi: gọi updateToken.
- Khi enabled = false: gọi stopTracking. Khi unmount thì không gọi stopTracking, đây là chủ ý (xem mục 7).
- Trên native, Web Worker heartbeat và ping ban đầu của web bị tắt để không gửi chồng hai luồng dữ liệu.

---

## 3. Trạng thái và các chế độ

### 3.1 Cờ trong NativeTrackingPlugin

| Biến | Ý nghĩa |
|---|---|
| isTracking | Đang trong ca. Mọi callback kiểm tra cờ này trước khi làm việc |
| isStationaryMode | Đang ở chế độ đứng yên (tiết kiệm pin) |
| isMovingTransition | Vừa chuyển sang moving, nới lỏng ngưỡng accuracy tạm thời |
| stationaryTimer | Đếm 120s khi CoreMotion báo đứng yên |
| heartbeatTimer | DispatchSourceTimer 180s khi ở stationary |
| stationaryRegion | Vùng tròn 100m quanh điểm neo, theo dõi exit |
| lastAccurateLocation, lastLocation | Điểm neo và điểm gần nhất |
| lastPingTime, lastPingAttemptTime | Dùng cho throttle và lọc nhảy điểm |

Khóa UserDefaults để khôi phục sau khi app bị kill: xttech_ios_access_token, xttech_ios_refresh_token, xttech_ios_api_url, xttech_ios_is_tracking.

### 3.2 Sơ đồ chuyển chế độ

```
          startTracking
               |
               v
        +-------------+  CoreMotion: walking/running/automotive/cycling
        |   MOVING    |<---------------------------------------------+
        | GPS Best    |                                              |
        | filter 10m  |                                              |
        +------+------+                                              |
               | CoreMotion báo đứng yên liên tục 120s               |
               v                                                     |
        +-------------+  rời vùng 100m (didExitRegion)               |
        | STATIONARY  |---------------------------------------------+
        | HundredM    |  hoặc di chuyển >100m với accuracy <=100m
        | filter 50m  |
        | heartbeat   |
        | 180s + SLC  |
        +-------------+
```

Moving mode (enterMovingMode): desiredAccuracy = kCLLocationAccuracyBest, distanceFilter = 10m, activityType = .otherNavigation. Dừng heartbeat và gỡ geofence cũ.

Stationary mode (enterStationaryMode): gửi một ping neo tại vị trí hiện tại, đặt geofence 100m quanh điểm đó, hạ desiredAccuracy xuống HundredMeters và distanceFilter 50m. Không tắt GPS hoàn toàn để giữ phiên vị trí trong nền. Bật heartbeat 180s và SLC dự phòng.

### 3.3 Nguồn kích hoạt chuyển chế độ

| Nguồn | Điều kiện | Hành động |
|---|---|---|
| CoreMotion | walking, running, automotive, cycling | enterMovingMode (nếu đang stationary) |
| CoreMotion | stationary liên tục 120s | enterStationaryMode |
| Region exit | Rời bán kính 100m | enterMovingMode |
| didUpdateLocations | Cách điểm neo >= 100m, accuracy <= 100m, đang stationary | enterMovingMode |
| SLC hoặc region exit khi app bị kill | iOS đánh thức app | handleLocationWakeUp khôi phục plugin |

---

## 4. Xử lý một điểm GPS

Hàm locationManager(_:didUpdateLocations:) chạy theo thứ tự:

1. Bỏ qua nếu không tracking hoặc điểm đã cache quá 60 giây.
2. Nếu chưa có lastAccurateLocation: chỉ nhận điểm có accuracy trong [0, 150]m, gửi ping ngay và đặt geofence.
3. Nếu đang stationary và điểm cách neo >= 100m: accuracy trong (0, 100] thì chuyển sang moving, ngược lại bỏ điểm (coi là trạm BTS ảo).
4. Tính trạng thái di chuyển: speed >= 0.8 m/s hoặc distance >= 10m.
5. Lọc accuracy thích ứng: moving transition <= 90m, đang di chuyển <= 65m, đứng yên <= 150m.
6. Lọc nhảy điểm: distance > 200m và (tốc độ > 35 m/s hoặc (distance > 500m và cách ping thành công trước < 30s)) thì bỏ.
7. Cập nhật lastAccurateLocation và lastLocation.
8. Throttle: khi đang di chuyển, tối thiểu 3 giây giữa các lần thử gửi.
9. Gọi sendPing(location, isHeartbeat: isStationaryMode).

---

## 5. Gửi ping và refresh token

sendPing:
- POST {apiUrl}/api/v1/attendances/location-ping, timeout 15s, header Authorization: Bearer.
- Body: latitude, longitude, accuracy, speed (0 nếu là heartbeat), heading, battery_level nếu có.
- Dùng beginBackgroundTask để iOS không ngắt kết nối khi app ở nền.
- Thành công (2xx): cập nhật lastPingTime và phát locationUpdate.
- 401 lần đầu: gọi refreshAccessToken, nếu được thì gửi lại đúng một lần (retryCount = 1). Nếu không được thì phát authError.

refreshAccessToken: POST {apiUrl}/api/v1/auth/refresh với refreshToken. Chấp nhận accessToken hoặc access_token ở gốc JSON hoặc trong data. Nếu server xoay vòng refresh token thì lưu token mới vào UserDefaults.

---

## 6. Đánh thức app từ nền

Khi app bị kill hoặc suspend, iOS vẫn đánh thức được nhờ:
- Significant Location Changes (SLC), bật ở cả hai chế độ.
- Region exit của geofence 100m khi đứng yên.
- allowsBackgroundLocationUpdates = true cùng UIBackgroundModes location.

Khi được đánh thức, AppDelegate gọi handleLocationWakeUp(). Nếu shared đã có thì dùng lại; nếu chưa thì tạo instance mới, nạp token từ UserDefaults, rồi khởi động CoreMotion và CoreLocation. Nếu xttech_ios_is_tracking là false thì bỏ qua.

Khi app mở lại ở foreground, load() cũng tự khôi phục tracking nếu cờ xttech_ios_is_tracking đang bật.

---

## 7. Quyền và vòng đời ca làm việc

Xin quyền lũy tiến:
- Lần đầu: requestWhenInUseAuthorization().
- Đã có WhenInUse: requestAlwaysAuthorization().
- Nếu quyền bị hạ về WhenInUse khi đang tracking: xin lại Always và phát permissionChanged.
- Không có quyền Always thì tracking chỉ chạy tốt khi app đang mở. Hook chỉ in cảnh báo qua checkPermission, không chặn người dùng.

Tracking chỉ dừng khi:
- JS gọi stopTracking(), hoặc
- người dùng/hệ thống thu hồi quyền.

Không dừng khi React unmount hoặc khi người dùng vuốt đóng app. Đây là chủ ý, vì nếu dừng ở cleanup thì ca làm việc sẽ mất ngay khi đóng app.

stopTracking xóa lastAccurateLocation, lastLocation, lastPingTime để ca sau không dùng nhầm điểm cũ.

---

## 8. Phía server và Live Map

Phần này nằm ngoài iOS nhưng liên quan trực tiếp:
- Nhận ping: POST /api/v1/attendances/location-ping (backend Python, app/services/location_tracking.py). Bộ lọc phía server đồng bộ với native: accuracy 45m khi di chuyển, nhảy 150m.
- Phát sự kiện: WebSocket /api/v1/ws/live-tracking, message kiểu STAFF_LOCATION_UPDATE.
- Live Map admin: WebSocket tự kết nối lại sau 3 giây, ping giữ kết nối mỗi 25 giây. Polling getLiveLocations() mỗi 10 giây khi WebSocket mất, và mỗi 60 giây dự phòng khi WebSocket còn sống. Chế độ theo sát nhân viên được ghi trong fix log.

---

## 9. Khi cần sửa, đọc phần nào

| Muốn làm gì | Đọc / sửa |
|---|---|
| Đổi ngưỡng accuracy, lọc nhảy điểm | didUpdateLocations trong NativeTrackingPlugin.swift (mục 4) |
| Đổi thời gian đứng yên (120s) hoặc heartbeat (180s) | handleMotionActivity, startHeartbeatTimer |
| Đổi bán kính geofence (100m) | updateStationaryRegion |
| Thêm method mới cho JS | Swift, khai báo trong .m, interface trong useLocationTracker.ts |
| Đổi nội dung xin quyền | Info.plist (khóa NS*UsageDescription) |
| Tracking không khởi động sau khi kill | load(), handleLocationWakeUp(), AppDelegate |
| Token hết hạn, không gửi được ping | sendPing (401), refreshAccessToken, updateToken trong hook |
| Live Map không cập nhật | live-map/page.tsx (mục 8) |

---

## 10. Các điểm cần lưu ý

1. Ngưỡng accuracy khi di chuyển không khớp với fix log. Fix log ghi iOS đã siết xuống 45m, nhưng didUpdateLocations đang dùng 65m khi isMoving. Cần xác nhận giá trị đúng trước khi sửa tiếp.
2. Đường dẫn Live Map. Fix log ghi attendances/live-map/page.tsx, nhưng file hiện có là (sidebar)/live-map/page.tsx. Cần kiểm tra route nào đang được dùng.
3. Điểm neo đầu tiên có thể không được gửi ngay. Nếu accuracy > 150m thì điểm bị bỏ và chờ điểm sau.
4. Heartbeat gửi lại lastAccurateLocation chứ không phải vị trí mới, nên khi đứng yên server chỉ thấy tọa độ cũ, đúng mục đích.
5. handleLocationWakeUp tạo instance độc lập khi chưa có shared. Instance này không gọi load() nên không đăng ký lại listener pin. Hiện không ảnh hưởng vì setupBatteryMonitoring() được gọi thủ công, nhưng dễ gây nhầm khi refactor.
6. Quyền Always là điều kiện bắt buộc. Nếu chỉ cấp WhenInUse, tracking dừng khi app xuống nền.
7. Test trên thiết bị thật. Simulator không mô phỏng đầy đủ CoreMotion, SLC và region exit. Mọi thay đổi ở mục 3 và 6 cần test trên iPhone thật, có khóa màn hình và chuyển sang nền.

---

## 11. Lịch sử thay đổi

| Ngày | Nội dung |
|---|---|
| 28/10/2026 | Tạo tài liệu từ việc đọc code hiện tại (NativeTrackingPlugin.swift, .m, AppDelegate, SceneDelegate, Info.plist, useLocationTracker.ts, live-map/page.tsx). |
| 30/10/2026 | Đồng bộ với code: bỏ CoreMotion và .m, thêm heartbeat timer, backoff thử lại, sự kiện locationUpdate/authError, main thread cho CLLocationManager, cờ awaitingFirstPing phía server, tầng dự phòng định vị mạng khi check-in. |
