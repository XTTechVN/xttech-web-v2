import Foundation
import CoreLocation
import Capacitor
import UIKit

@objc(NativeTrackingPlugin)
public class NativeTrackingPlugin: CAPPlugin, CLLocationManagerDelegate {
    public static var shared: NativeTrackingPlugin?

    private var locationManager: CLLocationManager?
    private var isTracking = false
    private var accessToken: String?
    private var refreshToken: String?
    private var apiUrl: String?
    private var lastPingTime: Date = Date.distantPast
    private var lastLocation: CLLocation?
    private var lastAccurateLocation: CLLocation?
    private var stationaryRegion: CLCircularRegion?
    private var lastBatteryLevel: Double = -1.0

    // Heartbeat Timer an toàn trên Main RunLoop
    private var heartbeatTimer: Timer?

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

        // Tự động khôi phục theo dõi nếu ca làm việc trước đó chưa kết thúc
        if defaults.bool(forKey: prefsKeyIsTracking) {
            DispatchQueue.main.async { [weak self] in
                self?.setupLocationManager()
                self?.startHeartbeatTimer()
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
            self.setupLocationManager()
            self.startHeartbeatTimer()
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
            self.locationManager?.stopUpdatingLocation()
            if CLLocationManager.significantLocationChangeMonitoringAvailable() {
                self.locationManager?.stopMonitoringSignificantLocationChanges()
            }
            self.stopStationaryRegionMonitoring()
            self.stopHeartbeatTimer()
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

        call.resolve([
            "status": isAlways ? "always" : isWhenInUse ? "whenInUse" : "denied",
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

    // MARK: - CoreLocation Configuration (Chuẩn Zalo / Life360 / Grab)
    private func setupLocationManager() {
        if locationManager == nil {
            locationManager = CLLocationManager()
            locationManager?.delegate = self
            locationManager?.desiredAccuracy = kCLLocationAccuracyBestForNavigation
            locationManager?.distanceFilter = 5.0
            
            // Cấu hình định vị chạy ngầm liên tục chuẩn Apple Automotive Navigation
            locationManager?.allowsBackgroundLocationUpdates = true
            locationManager?.pausesLocationUpdatesAutomatically = false
            locationManager?.activityType = .automotiveNavigation // CHUẨN APPLE: Giữ GPS sống 100% khi đi xe máy/ô tô
            if #available(iOS 11.0, *) {
                locationManager?.showsBackgroundLocationIndicator = true
            }
        }

        let status: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            status = locationManager?.authorizationStatus ?? .notDetermined
        } else {
            status = CLLocationManager.authorizationStatus()
        }

        if status == .notDetermined || status == .authorizedWhenInUse {
            locationManager?.requestAlwaysAuthorization()
        }

        locationManager?.startUpdatingLocation()

        // Đăng ký nhận đánh thức khi đổi trạm phát sóng viễn thông (SLC)
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            locationManager?.startMonitoringSignificantLocationChanges()
        }
        isTracking = true
        print("[NativeTracking iOS] CoreLocation initialized with Apple Automotive Navigation grade background tracking.")
    }

    // MARK: - Stationary Geofencing Engine (Bán kính 120m chuẩn Apple để chống bỏ qua sự kiện)
    private func updateStationaryRegion(around location: CLLocation) {
        guard CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) else { return }
        
        // Tránh tạo lại liên tục nếu điểm neo cũ chưa đổi quá 60m
        if let existing = self.stationaryRegion {
            let dist = location.distance(from: CLLocation(latitude: existing.center.latitude, longitude: existing.center.longitude))
            if dist < 60.0 {
                return
            }
        }
        stopStationaryRegionMonitoring()

        // Bán kính vùng tròn neo đậu chuẩn Apple (>= 100m): 120 mét
        let region = CLCircularRegion(
            center: location.coordinate,
            radius: 120.0,
            identifier: "com.xttech.stationary_anchor"
        )
        region.notifyOnExit = true
        region.notifyOnEntry = false
        self.stationaryRegion = region
        self.locationManager?.startMonitoring(for: region)
    }

    private func stopStationaryRegionMonitoring() {
        if let region = self.stationaryRegion {
            self.locationManager?.stopMonitoring(for: region)
            self.stationaryRegion = nil
        }
    }

    public func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        if region.identifier == "com.xttech.stationary_anchor" {
            print("[NativeTracking iOS] Nhân viên rời khỏi vị trí đứng yên (>120m). Tăng tốc lấy GPS tần số cao.")
            self.stopStationaryRegionMonitoring()
            self.locationManager?.startUpdatingLocation()
        }
    }

    // MARK: - Heartbeat Timer (Giữ kết nối online khi đứng yên)
    private func startHeartbeatTimer() {
        stopHeartbeatTimer()
        // Chạy trên Main RunLoop với common modes để không bị ngắt khi vuốt màn hình
        let timer = Timer(timeInterval: 60.0, repeats: true) { [weak self] _ in
            guard let self = self, self.isTracking else { return }
            let elapsed = Date().timeIntervalSince(self.lastPingTime)
            // Nếu quá 60 giây chưa có ping gửi lên (do đứng yên trong phòng)
            if elapsed >= 60.0 {
                if let anchorLocation = self.lastAccurateLocation ?? self.lastLocation {
                    print("[NativeTracking iOS] Stationary heartbeat triggered. Keeping employee online.")
                    self.sendPing(location: anchorLocation, isHeartbeat: true)
                }
            }
        }
        RunLoop.main.add(timer, forMode: .common)
        self.heartbeatTimer = timer
    }

    private func stopHeartbeatTimer() {
        self.heartbeatTimer?.invalidate()
        self.heartbeatTimer = nil
    }

    /// Xử lý khi hệ thống iOS đánh thức ứng dụng từ cõi chết (do SLC hoặc Region Exit)
    @objc public static func handleLocationWakeUp() {
        let defaults = UserDefaults.standard
        let wasTracking = defaults.bool(forKey: "xttech_ios_is_tracking")
        guard wasTracking else { return }

        DispatchQueue.main.async {
            if let plugin = shared {
                plugin.setupLocationManager()
                plugin.startHeartbeatTimer()
            } else {
                let standalone = NativeTrackingPlugin()
                standalone.accessToken = defaults.string(forKey: "xttech_ios_access_token")
                standalone.refreshToken = defaults.string(forKey: "xttech_ios_refresh_token")
                standalone.apiUrl = defaults.string(forKey: "xttech_ios_api_url")
                standalone.setupLocationManager()
                standalone.startHeartbeatTimer()
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
        let elapsed = now.timeIntervalSince(lastPingTime)

        // Khởi tạo điểm ban đầu an toàn (không force-unwrap)
        guard let lastAcc = self.lastAccurateLocation else {
            if location.horizontalAccuracy >= 0 && location.horizontalAccuracy <= 120.0 {
                self.lastAccurateLocation = location
                self.lastLocation = location
                self.lastPingTime = now
                sendPing(location: location, isHeartbeat: true)
                updateStationaryRegion(around: location)
            }
            return
        }

        let rawSpeed = max(0.0, location.speed)
        let speed = rawSpeed >= 0.8 ? rawSpeed : 0.0
        let distance = location.distance(from: lastAcc)
        let isMoving = speed >= 0.8 || distance >= 5.0

        // Kiểm tra sai số GPS thích ứng: nới lỏng 100m trong phòng, siết chặt 45m khi di chuyển ngoài đường
        let maxAllowedAccuracy = isMoving ? 45.0 : 100.0
        if location.horizontalAccuracy < 0 || location.horizontalAccuracy > maxAllowedAccuracy {
            // Khi sóng yếu trong phòng: giữ nhịp gửi Heartbeat mỗi 60 giây để nhân viên không bị Offline
            if elapsed >= 60.0 {
                if let anchorLocation = self.lastAccurateLocation ?? self.lastLocation {
                    print("[NativeTracking iOS] Weak indoor GPS. Sending stationary heartbeat with anchor.")
                    sendPing(location: anchorLocation, isHeartbeat: true)
                }
            }
            return
        }

        // Chống bước nhảy dị biệt (outlier jump filter từ trạm sóng BTS ảo)
        let jumpSpeed = elapsed > 0 ? distance / elapsed : 999.0
        if distance > 200.0 && (jumpSpeed > 35.0 || (distance > 500.0 && elapsed < 30.0)) {
            print("[NativeTracking iOS] Discarding outlier jump point: \(distance)m, speed=\(jumpSpeed)m/s")
            return
        }

        // Cập nhật tọa độ chuẩn xác
        self.lastAccurateLocation = location
        self.lastLocation = location

        if isMoving {
            // Khi di chuyển: throttle nhịp 3.0 giây để Live-Map mượt mà
            if elapsed < 3.0 {
                return
            }
            stopStationaryRegionMonitoring()
        } else {
            // Khi đứng yên trong văn phòng: duy trì gửi ping đều đặn mỗi 60 giây
            if elapsed < 60.0 {
                return
            }
            updateStationaryRegion(around: location)
        }

        sendPing(location: location, isHeartbeat: !isMoving)
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("[NativeTracking iOS] Location manager error: \(error.localizedDescription)")
    }

    // MARK: - Main-Thread-Safe Network Dispatcher
    private func sendPing(location: CLLocation, isHeartbeat: Bool, retryCount: Int = 0) {
        guard let apiUrl = self.apiUrl, !apiUrl.isEmpty else { return }

        var baseUrl = apiUrl
        if baseUrl.hasSuffix("/") {
            baseUrl.removeLast()
        }
        guard let url = URL(string: "\(baseUrl)/api/v1/attendances/location-ping") else { return }

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

        // Yêu cầu iOS cấp quyền CPU chạy nền hoàn toàn trên Main Thread
        var bgTask: UIBackgroundTaskIdentifier = .invalid
        bgTask = UIApplication.shared.beginBackgroundTask(withName: "XTTechLocationPing") {
            if bgTask != .invalid {
                UIApplication.shared.endBackgroundTask(bgTask)
                bgTask = .invalid
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
                    }
                } else if httpResponse.statusCode == 401 && retryCount == 0 {
                    self.refreshAccessToken { success in
                        if success {
                            DispatchQueue.main.async {
                                self.sendPing(location: location, isHeartbeat: isHeartbeat, retryCount: 1)
                            }
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
        bgTask = UIApplication.shared.beginBackgroundTask(withName: "XTTechRefreshToken") {
            if bgTask != .invalid {
                UIApplication.shared.endBackgroundTask(bgTask)
                bgTask = .invalid
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
                if newAccessToken == nil, let dataObj = json["data"] as? [String: Any] {
                    newAccessToken = dataObj["accessToken"] as? String ?? dataObj["access_token"] as? String
                }

                if let token = newAccessToken, !token.isEmpty {
                    DispatchQueue.main.async {
                        self.accessToken = token
                        UserDefaults.standard.set(token, forKey: self.prefsKeyToken)
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
