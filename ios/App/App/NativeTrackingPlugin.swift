import Foundation
import CoreLocation
import CoreMotion
import Capacitor
import UIKit

@objc(NativeTrackingPlugin)
public class NativeTrackingPlugin: CAPPlugin, CLLocationManagerDelegate {
    public static var shared: NativeTrackingPlugin?

    private var locationManager: CLLocationManager?
    private let motionActivityManager = CMMotionActivityManager()
    private var isTracking = false
    private var isStationaryMode = false
    private var stationaryTimer: Timer?
    private var heartbeatTimer: DispatchSourceTimer?
    private var isMovingTransition = false

    private var accessToken: String?
    private var refreshToken: String?
    private var apiUrl: String?
    private var lastPingTime: Date = Date.distantPast
    private var lastPingAttemptTime: Date = Date.distantPast
    private var lastLocation: CLLocation?
    private var lastAccurateLocation: CLLocation?
    private var stationaryRegion: CLCircularRegion?
    private var lastBatteryLevel: Double = -1.0

    private let prefsKeyToken = "xttech_ios_access_token"
    private let prefsKeyRefreshToken = "xttech_ios_refresh_token"
    private let prefsKeyApiUrl = "xttech_ios_api_url"
    private let prefsKeyIsTracking = "xttech_ios_is_tracking"

    public override func load() {
        super.load()
        NativeTrackingPlugin.shared = self
        let defaults = UserDefaults.standard
        self.accessToken = defaults.string(forKey: prefsKeyToken)
        self.refreshToken = defaults.string(forKey: prefsKeyRefreshToken)
        self.apiUrl = defaults.string(forKey: prefsKeyApiUrl)

        // Giám sát mức pin thiết bị
        setupBatteryMonitoring()

        // Tự động khôi phục theo dõi nếu ca làm việc trước đó chưa kết thúc
        if defaults.bool(forKey: prefsKeyIsTracking) {
            DispatchQueue.main.async { [weak self] in
                self?.isTracking = true
                self?.startMotionActivityMonitoring()
                self?.setupLocationManager()
            }
        }
    }

    private func setupBatteryMonitoring() {
        UIDevice.current.isBatteryMonitoringEnabled = true
        let initialLevel = UIDevice.current.batteryLevel
        if initialLevel >= 0 {
            self.lastBatteryLevel = Double(initialLevel * 100.0)
        }
        NotificationCenter.default.addObserver(
            forName: UIDevice.batteryLevelDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            let lvl = UIDevice.current.batteryLevel
            if lvl >= 0 {
                self?.lastBatteryLevel = Double(lvl * 100.0)
            }
        }
    }

    @objc func startTracking(_ call: CAPPluginCall) {
        let token = call.getString("token", "")
        if !token.isEmpty {
            self.accessToken = token
            UserDefaults.standard.set(token, forKey: prefsKeyToken)
        }
        let refreshToken = call.getString("refreshToken", "")
        if !refreshToken.isEmpty {
            self.refreshToken = refreshToken
            UserDefaults.standard.set(refreshToken, forKey: prefsKeyRefreshToken)
        }
        let apiUrl = call.getString("apiUrl", "")
        if !apiUrl.isEmpty {
            self.apiUrl = apiUrl
            UserDefaults.standard.set(apiUrl, forKey: prefsKeyApiUrl)
        }
        UserDefaults.standard.set(true, forKey: prefsKeyIsTracking)

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.isTracking = true
            self.startMotionActivityMonitoring()
            self.setupLocationManager()
        }

        call.resolve(["success": true])
    }

    @objc func updateToken(_ call: CAPPluginCall) {
        let token = call.getString("token", "")
        if !token.isEmpty {
            self.accessToken = token
            UserDefaults.standard.set(token, forKey: prefsKeyToken)
        }
        let refreshToken = call.getString("refreshToken", "")
        if !refreshToken.isEmpty {
            self.refreshToken = refreshToken
            UserDefaults.standard.set(refreshToken, forKey: prefsKeyRefreshToken)
        }
        call.resolve(["success": true])
    }

    @objc func stopTracking(_ call: CAPPluginCall) {
        UserDefaults.standard.set(false, forKey: prefsKeyIsTracking)
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.isTracking = false
            self.isStationaryMode = false
            self.stationaryTimer?.invalidate()
            self.stationaryTimer = nil
            self.stopHeartbeatTimer()
            self.stopMotionActivityMonitoring()
            self.locationManager?.stopUpdatingLocation()
            if CLLocationManager.significantLocationChangeMonitoringAvailable() {
                self.locationManager?.stopMonitoringSignificantLocationChanges()
            }
            self.stopStationaryRegionMonitoring()

            // Dọn sạch mốc điểm cũ để ca sau không bị dùng điểm nhầm
            self.lastAccurateLocation = nil
            self.lastLocation = nil
            self.lastPingTime = Date.distantPast
            self.lastPingAttemptTime = Date.distantPast
        }
        call.resolve(["success": true])
    }

    @objc func checkPermission(_ call: CAPPluginCall) {
        let status: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            status = locationManager?.authorizationStatus ?? CLLocationManager().authorizationStatus
        } else {
            status = CLLocationManager.authorizationStatus()
        }

        let isAlways = (status == .authorizedAlways)
        let isWhenInUse = (status == .authorizedWhenInUse)
        var isPrecise = true
        if #available(iOS 14.0, *) {
            isPrecise = (locationManager?.accuracyAuthorization ?? .fullAccuracy) == .fullAccuracy
        }

        let statusStr: String = {
            switch status {
            case .authorizedAlways: return "always"
            case .authorizedWhenInUse: return "whenInUse"
            case .notDetermined: return "notDetermined"
            case .restricted: return "restricted"
            case .denied: return "denied"
            @unknown default: return "denied"
            }
        }()

        call.resolve([
            "status": statusStr,
            "isAlways": isAlways,
            "isPrecise": isPrecise
        ])
    }

    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let url = URL(string: UIApplication.openSettingsURLString), UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:]) { success in
                    call.resolve(["success": success])
                }
            } else {
                call.resolve(["success": false])
            }
        }
    }

    // MARK: - CoreMotion Stop-Detection Engine (Chuẩn Life360 / Transistor)
    private func startMotionActivityMonitoring() {
        guard CMMotionActivityManager.isActivityAvailable() else { return }
        stopMotionActivityMonitoring()
        motionActivityManager.startActivityUpdates(to: .main) { [weak self] activity in
            guard let self = self, self.isTracking, let activity = activity else { return }
            self.handleMotionActivity(activity)
        }
    }

    private func stopMotionActivityMonitoring() {
        if CMMotionActivityManager.isActivityAvailable() {
            motionActivityManager.stopActivityUpdates()
        }
        stationaryTimer?.invalidate()
        stationaryTimer = nil
    }

    private func handleMotionActivity(_ activity: CMMotionActivity) {
        guard isTracking else { return }

        // 1. Khi phát hiện bước đi, chạy bộ, đi xe đạp hoặc di chuyển ô tô/xe máy:
        if activity.walking || activity.running || activity.automotive || activity.cycling {
            stationaryTimer?.invalidate()
            stationaryTimer = nil
            if isStationaryMode {
                print("[NativeTracking iOS] CoreMotion phát hiện di chuyển (walking/cycling/automotive). Đánh thức và bật lại GPS tần số cao.")
                enterMovingMode()
            }
        }
        // 2. Khi phát hiện đứng yên ổn định: Khởi động bộ đếm Timer 120s
        else if activity.stationary {
            if !isStationaryMode && stationaryTimer == nil {
                print("[NativeTracking iOS] CoreMotion phát hiện đứng yên. Bắt đầu đếm Timer 120 giây...")
                DispatchQueue.main.async { [weak self] in
                    guard let self = self, self.stationaryTimer == nil else { return }
                    self.stationaryTimer = Timer.scheduledTimer(withTimeInterval: 120.0, repeats: false) { [weak self] _ in
                        guard let self = self, self.isTracking, !self.isStationaryMode else { return }
                        self.stationaryTimer = nil
                        print("[NativeTracking iOS] Xác nhận đứng yên đủ 120 giây liên tục. Kích hoạt Stationary Mode tiết kiệm pin.")
                        self.enterStationaryMode()
                    }
                }
            }
        }
    }

    // MARK: - Chế độ Đứng yên (Stationary Mode): Hạ cấu hình tiết kiệm pin + Heartbeat Timer 180s
    private func enterStationaryMode() {
        guard isTracking, !isStationaryMode else { return }
        isStationaryMode = true
        stationaryTimer?.invalidate()
        stationaryTimer = nil

        // 1. Gửi ping chốt hạ vị trí neo với trạng thái đứng yên
        if let anchor = self.lastAccurateLocation ?? self.lastLocation {
            sendPing(location: anchor, isHeartbeat: true)
            updateStationaryRegion(around: anchor)
        }

        // 2. TUYỆT ĐỐI KHÔNG tắt GPS hoàn toàn để giữ Location Session sống trong nền
        // Hạ cấu hình xuống chế độ độ chính xác trung bình (HundredMeters/Cell/WiFi) tiết kiệm pin tối đa
        locationManager?.desiredAccuracy = kCLLocationAccuracyHundredMeters
        locationManager?.distanceFilter = 50.0
        locationManager?.startUpdatingLocation()

        // 3. Khởi động Timer nội bộ (DispatchSourceTimer) gửi nhịp tim định kỳ 180s (3 phút)
        startHeartbeatTimer()

        // 4. Bật Significant Location Changes dự phòng
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            locationManager?.startMonitoringSignificantLocationChanges()
        }

        print("[NativeTracking iOS] Đã chuyển sang Stationary Mode (HundredMeters, Geofence 100m, Heartbeat Timer 180s).")
    }

    // MARK: - Chế độ Di chuyển (Moving Mode): Bật GPS tần số cao chuẩn Navigation
    private func enterMovingMode() {
        guard isTracking else { return }
        isStationaryMode = false
        stationaryTimer?.invalidate()
        stationaryTimer = nil
        isMovingTransition = true // Nới lỏng accuracy khi vừa xuất phát

        // 1. Dừng nhịp tim định kỳ của chế độ đứng yên
        stopHeartbeatTimer()

        // 2. Dỡ bỏ geofence cũ
        stopStationaryRegionMonitoring()

        // 3. Bật lại GPS tần số cao với cấu hình tối ưu năng lượng (.otherNavigation)
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
        locationManager?.activityType = .otherNavigation
        locationManager?.distanceFilter = 10.0
        locationManager?.startUpdatingLocation()
        print("[NativeTracking iOS] Đã bật lại GPS tần số cao (.otherNavigation, kCLLocationAccuracyBest).")
    }

    // MARK: - Heartbeat Timer 180s (Phát nhịp tim neo tĩnh khi đứng yên)
    private func startHeartbeatTimer() {
        stopHeartbeatTimer()
        let queue = DispatchQueue(label: "com.xttech.heartbeat_queue", qos: .utility)
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now() + 180.0, repeating: 180.0)
        timer.setEventHandler { [weak self] in
            guard let self = self, self.isTracking, self.isStationaryMode else { return }
            if let anchor = self.lastAccurateLocation ?? self.lastLocation {
                print("[NativeTracking iOS] Heartbeat timer (180s): Gửi nhịp tim neo tĩnh giữ kết nối Server.")
                self.sendPing(location: anchor, isHeartbeat: true)
            }
        }
        self.heartbeatTimer = timer
        timer.resume()
    }

    private func stopHeartbeatTimer() {
        heartbeatTimer?.cancel()
        heartbeatTimer = nil
    }

    // MARK: - CoreLocation Configuration
    private func setupLocationManager() {
        if locationManager == nil {
            locationManager = CLLocationManager()
            locationManager?.delegate = self
            locationManager?.desiredAccuracy = kCLLocationAccuracyBest
            locationManager?.distanceFilter = 10.0
            
            // Cấu hình định vị chạy ngầm liên tục chuẩn Apple
            locationManager?.allowsBackgroundLocationUpdates = true
            locationManager?.pausesLocationUpdatesAutomatically = false
            locationManager?.activityType = .otherNavigation
            if #available(iOS 11.0, *) {
                locationManager?.showsBackgroundLocationIndicator = true
            }
        }

        // Xin quyền lũy tiến (Progressive Permissions): WhenInUse -> Always
        requestLocationPermission()

        locationManager?.startUpdatingLocation()

        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            locationManager?.startMonitoringSignificantLocationChanges()
        }
        isTracking = true
        isStationaryMode = false
        print("[NativeTracking iOS] CoreLocation initialized with .otherNavigation.")
    }

    private func requestLocationPermission() {
        let status: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            status = locationManager?.authorizationStatus ?? .notDetermined
        } else {
            status = CLLocationManager.authorizationStatus()
        }

        if status == .notDetermined {
            locationManager?.requestWhenInUseAuthorization()
        } else if status == .authorizedWhenInUse {
            locationManager?.requestAlwaysAuthorization()
        }
    }

    // Lắng nghe thay đổi quyền từ người dùng
    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            status = manager.authorizationStatus
        } else {
            status = CLLocationManager.authorizationStatus()
        }
        let isAlways = (status == .authorizedAlways)
        let isWhenInUse = (status == .authorizedWhenInUse)

        let statusStr: String = {
            switch status {
            case .authorizedAlways: return "always"
            case .authorizedWhenInUse: return "whenInUse"
            case .notDetermined: return "notDetermined"
            case .restricted: return "restricted"
            case .denied: return "denied"
            @unknown default: return "denied"
            }
        }()

        self.notifyListeners("permissionChanged", data: [
            "status": statusStr,
            "isAlways": isAlways
        ])

        // Nếu quyền bị hạ xuống WhenInUse: Tiếp tục xin Always nếu ca làm việc đang theo dõi
        if isTracking && status == .authorizedWhenInUse {
            locationManager?.requestAlwaysAuthorization()
        }
    }

    // MARK: - Stationary Geofencing Engine (Bán kính 100m)
    private func updateStationaryRegion(around location: CLLocation) {
        guard CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) else { return }
        
        if let existing = self.stationaryRegion {
            let dist = location.distance(from: CLLocation(latitude: existing.center.latitude, longitude: existing.center.longitude))
            if dist < 50.0 {
                return
            }
        }
        stopStationaryRegionMonitoring()

        let region = CLCircularRegion(
            center: location.coordinate,
            radius: 100.0,
            identifier: "com.xttech.stationary_anchor"
        )
        region.notifyOnExit = true
        region.notifyOnEntry = false
        self.stationaryRegion = region
        self.locationManager?.startMonitoring(for: region)
    }

    private func stopStationaryRegionMonitoring() {
        self.stationaryRegion = nil
        if let mgr = self.locationManager {
            for region in mgr.monitoredRegions {
                if region.identifier == "com.xttech.stationary_anchor" {
                    mgr.stopMonitoring(for: region)
                }
            }
        }
    }

    public func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        if region.identifier == "com.xttech.stationary_anchor" {
            print("[NativeTracking iOS] didExitRegion: Thiết bị rời khỏi bán kính 100m. Đánh thức app dậy di chuyển.")
            enterMovingMode()
        }
    }

    /// Xử lý khi hệ thống iOS đánh thức ứng dụng từ nền (do SLC hoặc Region Exit)
    @objc public static func handleLocationWakeUp() {
        let defaults = UserDefaults.standard
        let wasTracking = defaults.bool(forKey: "xttech_ios_is_tracking")
        guard wasTracking else { return }

        DispatchQueue.main.async {
            if let plugin = shared {
                plugin.startMotionActivityMonitoring()
                plugin.setupLocationManager()
            } else {
                let standalone = NativeTrackingPlugin()
                standalone.accessToken = defaults.string(forKey: "xttech_ios_access_token")
                standalone.refreshToken = defaults.string(forKey: "xttech_ios_refresh_token")
                standalone.apiUrl = defaults.string(forKey: "xttech_ios_api_url")
                
                // Kích hoạt giám sát pin cho standalone instance
                standalone.setupBatteryMonitoring()
                
                standalone.startMotionActivityMonitoring()
                standalone.setupLocationManager()
                shared = standalone
            }
            print("[NativeTracking iOS] App awakened by iOS Kernel for background location update.")
        }
    }

    // MARK: - CLLocationManagerDelegate
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard isTracking, let location = locations.last else { return }
        
        // Bỏ qua nếu điểm cache đã quá 60 giây
        if abs(location.timestamp.timeIntervalSinceNow) > 60.0 {
            return
        }

        let now = Date()
        let elapsedAttempt = now.timeIntervalSince(lastPingAttemptTime)

        // Khởi tạo điểm ban đầu an toàn
        guard let lastAcc = self.lastAccurateLocation else {
            if location.horizontalAccuracy >= 0 && location.horizontalAccuracy <= 150.0 {
                self.lastAccurateLocation = location
                self.lastLocation = location
                sendPing(location: location, isHeartbeat: true)
                updateStationaryRegion(around: location)
            }
            return
        }

        let distance = location.distance(from: lastAcc)

        // Nếu đang ở trạng thái Stationary nhưng nhận được điểm di chuyển đáng kể (> 100m):
        // Bắt buộc kiểm tra horizontalAccuracy <= 100m để loại bỏ trạm sóng SLC ảo (sai số hàng trăm mét)
        if isStationaryMode && distance >= 100.0 {
            if location.horizontalAccuracy > 0 && location.horizontalAccuracy <= 100.0 {
                print("[NativeTracking iOS] Phát hiện di chuyển xa (>100m) với độ chính xác cao (\(location.horizontalAccuracy)m). Chuyển sang moving mode.")
                enterMovingMode()
            } else {
                print("[NativeTracking iOS] Bỏ qua điểm di chuyển xa do sai số quá lớn: \(location.horizontalAccuracy)m")
                return
            }
        }

        let rawSpeed = max(0.0, location.speed)
        let speed = rawSpeed >= 0.8 ? rawSpeed : 0.0
        let isMoving = speed >= 0.8 || distance >= 10.0

        // Kiểm tra sai số GPS thích ứng:
        let maxAllowedAccuracy: Double = {
            if isMovingTransition { return 90.0 }
            if isMoving { return 65.0 }
            return 150.0
        }()

        if location.horizontalAccuracy < 0 || location.horizontalAccuracy > maxAllowedAccuracy {
            return
        }

        if isMovingTransition {
            isMovingTransition = false
        }

        // Chống bước nhảy dị biệt (outlier jump filter từ trạm sóng BTS ảo)
        let elapsedSuccess = now.timeIntervalSince(lastPingTime)
        let jumpSpeed = elapsedSuccess > 0 ? distance / elapsedSuccess : 999.0
        if distance > 200.0 && (jumpSpeed > 35.0 || (distance > 500.0 && elapsedSuccess < 30.0)) {
            print("[NativeTracking iOS] Discarding outlier jump point: \(distance)m, speed=\(jumpSpeed)m/s")
            return
        }

        // Cập nhật tọa độ chuẩn xác
        self.lastAccurateLocation = location
        self.lastLocation = location

        if isMoving {
            // Khi di chuyển: throttle nhịp 3.0 giây giữa các lần THỬ gửi (attempt) để chống dồn ứ request
            if elapsedAttempt < 3.0 {
                return
            }
        }

        sendPing(location: location, isHeartbeat: isStationaryMode)
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("[NativeTracking iOS] Location manager error: \(error.localizedDescription)")
    }

    // MARK: - Network Dispatcher & Token Refresh
    private func sendPing(location: CLLocation, isHeartbeat: Bool, retryCount: Int = 0) {
        guard let apiUrl = self.apiUrl, !apiUrl.isEmpty else { return }

        var baseUrl = apiUrl
        if baseUrl.hasSuffix("/") {
            baseUrl.removeLast()
        }
        guard let url = URL(string: "\(baseUrl)/api/v1/attendances/location-ping") else { return }

        // Cập nhật mốc thời gian thử gửi ngay lập tức để áp dụng Throttle
        self.lastPingAttemptTime = Date()

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 15.0

        if let token = self.accessToken, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let rawBattery = UIDevice.current.batteryLevel
        if rawBattery >= 0 {
            self.lastBatteryLevel = Double(rawBattery * 100.0)
        }
        let batteryLevel = self.lastBatteryLevel
        let speed = isHeartbeat ? 0.0 : max(0.0, location.speed)
        let heading = location.course >= 0 ? location.course : 0.0

        var payload: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "speed": speed,
            "heading": heading
        ]
        if batteryLevel >= 0 {
            payload["battery_level"] = batteryLevel
        }

        guard let httpBody = try? JSONSerialization.data(withJSONObject: payload, options: []) else { return }
        request.httpBody = httpBody

        // Yêu cầu iOS cấp quyền CPU chạy nền
        var bgTask: UIBackgroundTaskIdentifier = .invalid
        DispatchQueue.main.async {
            bgTask = UIApplication.shared.beginBackgroundTask(withName: "XTTechLocationPing") {
                if bgTask != .invalid {
                    UIApplication.shared.endBackgroundTask(bgTask)
                    bgTask = .invalid
                }
            }
        }

        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            defer {
                DispatchQueue.main.async {
                    if bgTask != .invalid {
                        UIApplication.shared.endBackgroundTask(bgTask)
                        bgTask = .invalid
                    }
                }
            }
            guard let self = self else { return }
            if let httpResponse = response as? HTTPURLResponse {
                if (200...299).contains(httpResponse.statusCode) {
                    DispatchQueue.main.async {
                        self.lastPingTime = Date()
                        // Phát sự kiện vị trí thành công cho tầng JS
                        self.notifyListeners("locationUpdate", data: [
                            "latitude": location.coordinate.latitude,
                            "longitude": location.coordinate.longitude,
                            "speed": speed,
                            "timestamp": Date().timeIntervalSince1970
                        ])
                    }
                } else if httpResponse.statusCode == 401 && retryCount == 0 {
                    self.refreshAccessToken { success in
                        if success {
                            DispatchQueue.main.async {
                                self.sendPing(location: location, isHeartbeat: isHeartbeat, retryCount: 1)
                            }
                        } else {
                            // Phát thông báo lỗi phiên cho Frontend xử lý đăng xuất
                            self.notifyListeners("authError", data: ["code": "UNAUTHORIZED", "message": "Phiên làm việc hết hạn"])
                        }
                    }
                }
            }
        }
        task.resume()
    }

    private func refreshAccessToken(completion: @escaping (Bool) -> Void) {
        guard let apiUrl = self.apiUrl, let refreshToken = self.refreshToken, !refreshToken.isEmpty else {
            completion(false)
            return
        }

        var baseUrl = apiUrl
        if baseUrl.hasSuffix("/") {
            baseUrl.removeLast()
        }
        guard let url = URL(string: "\(baseUrl)/api/v1/auth/refresh") else {
            completion(false)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 15.0

        let payload = ["refreshToken": refreshToken]
        guard let httpBody = try? JSONSerialization.data(withJSONObject: payload, options: []) else {
            completion(false)
            return
        }
        request.httpBody = httpBody

        var bgTask: UIBackgroundTaskIdentifier = .invalid
        DispatchQueue.main.async {
            bgTask = UIApplication.shared.beginBackgroundTask(withName: "XTTechRefreshToken") {
                if bgTask != .invalid {
                    UIApplication.shared.endBackgroundTask(bgTask)
                    bgTask = .invalid
                }
            }
        }

        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            defer {
                DispatchQueue.main.async {
                    if bgTask != .invalid {
                        UIApplication.shared.endBackgroundTask(bgTask)
                        bgTask = .invalid
                    }
                }
            }
            guard let self = self, let data = data, let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                completion(false)
                return
            }

            if let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                var newAccessToken: String? = json["accessToken"] as? String ?? json["access_token"] as? String
                var newRefreshToken: String? = json["refreshToken"] as? String ?? json["refresh_token"] as? String
                
                if newAccessToken == nil, let dataObj = json["data"] as? [String: Any] {
                    newAccessToken = dataObj["accessToken"] as? String ?? dataObj["access_token"] as? String
                    newRefreshToken = dataObj["refreshToken"] as? String ?? dataObj["refresh_token"] as? String
                }

                if let token = newAccessToken, !token.isEmpty {
                    DispatchQueue.main.async {
                        self.accessToken = token
                        UserDefaults.standard.set(token, forKey: self.prefsKeyToken)
                        
                        // Lưu đồng thời Refresh Token mới nếu backend trả về (xoay vòng token)
                        if let rToken = newRefreshToken, !rToken.isEmpty {
                            self.refreshToken = rToken
                            UserDefaults.standard.set(rToken, forKey: self.prefsKeyRefreshToken)
                        }
                    }
                    completion(true)
                    return
                }
            }
            completion(false)
        }
        task.resume()
    }
}
