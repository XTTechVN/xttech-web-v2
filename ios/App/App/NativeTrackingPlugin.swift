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
    private var heartbeatSource: DispatchSourceTimer?
    private let heartbeatQueue = DispatchQueue(label: "com.xttech.ios.heartbeat", qos: .background)
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

        // Bật giám sát pin từ sớm và đăng ký lắng nghe thay đổi mức pin
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
            self.setupLocationManager()
            self.startHeartbeat()
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
            self.stopHeartbeat()
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
                call.reject("Cannot open settings")
            }
        }
    }

    private func setupLocationManager() {
        if locationManager == nil {
            locationManager = CLLocationManager()
            locationManager?.delegate = self
            locationManager?.desiredAccuracy = kCLLocationAccuracyBest
            locationManager?.distanceFilter = kCLDistanceFilterNone // Đảm bảo phần cứng giữ nhịp định vị ngay cả khi đứng yên
            
            // Cấu hình định vị chạy ngầm liên tục chuẩn iOS
            locationManager?.allowsBackgroundLocationUpdates = true
            locationManager?.pausesLocationUpdatesAutomatically = false
            locationManager?.activityType = .otherNavigation // Ưu tiên định vị liên tục, hạn chế iOS ngắt ngầm
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
        // Kích hoạt song song cơ chế đánh thức ngầm khi đổi trạm phát sóng (kể cả khi app bị tắt / thu hồi RAM)
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            locationManager?.startMonitoringSignificantLocationChanges()
        }
        isTracking = true
    }

    private func startHeartbeat() {
        stopHeartbeat()
        let timer = DispatchSource.makeTimerSource(queue: heartbeatQueue)
        timer.schedule(deadline: .now() + 60.0, repeating: 60.0)
        timer.setEventHandler { [weak self] in
            guard let self = self, self.isTracking else { return }
            let elapsed = Date().timeIntervalSince(self.lastPingTime)
            // Nếu đã quá 2 phút chưa có ping nào gửi lên (do đứng yên trong phòng làm việc)
            if elapsed >= 120.0 {
                if let anchorLocation = self.lastAccurateLocation ?? self.lastLocation {
                    self.sendPing(location: anchorLocation, isHeartbeat: true)
                }
            }
        }
        timer.resume()
        self.heartbeatSource = timer
    }

    private func stopHeartbeat() {
        if let timer = heartbeatSource {
            timer.cancel()
            heartbeatSource = nil
        }
    }

    /// Xử lý đánh thức ứng dụng trong nền khi nhận được sự kiện vị trí từ iOS
    @objc public static func handleLocationWakeUp() {
        let defaults = UserDefaults.standard
        let wasTracking = defaults.bool(forKey: "xttech_ios_is_tracking")
        guard wasTracking else { return }

        DispatchQueue.main.async {
            if let plugin = shared {
                plugin.setupLocationManager()
                plugin.startHeartbeat()
            } else {
                let standalone = NativeTrackingPlugin()
                standalone.accessToken = defaults.string(forKey: "xttech_ios_access_token")
                standalone.refreshToken = defaults.string(forKey: "xttech_ios_refresh_token")
                standalone.apiUrl = defaults.string(forKey: "xttech_ios_api_url")
                standalone.setupLocationManager()
                standalone.startHeartbeat()
                shared = standalone
            }
        }
    }

    // CLLocationManagerDelegate
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // Bỏ qua nếu điểm cache đã quá 60 giây (loại bỏ stale cache từ quá khứ)
        if abs(location.timestamp.timeIntervalSinceNow) > 60.0 {
            return
        }

        // Khởi tạo điểm ban đầu nếu chưa có bất kỳ vị trí nào
        if self.lastAccurateLocation == nil {
            if location.horizontalAccuracy >= 0 && location.horizontalAccuracy <= 100.0 {
                self.lastAccurateLocation = location
                self.lastLocation = location
                self.lastPingTime = Date()
                sendPing(location: location, isHeartbeat: true)
            }
            return
        }

        let now = Date()
        let elapsed = now.timeIntervalSince(lastPingTime)

        // Chống nhảy Map: Chỉ chấp nhận cập nhật vị trí hiển thị nếu độ chính xác đạt chuẩn (<= 50m)
        // Nếu ở trong phòng sai số trạm BTS/Wi-Fi vọt lên > 50m hoặc không hợp lệ:
        // TỪ CHỐI cập nhật vị trí mới để chống giật map, NHƯNG tận dụng CPU vừa được iOS đánh thức
        // để gửi nhịp tim giữ kết nối (Heartbeat) với tọa độ chuẩn cũ nếu đã quá 2 phút!
        if location.horizontalAccuracy < 0 || location.horizontalAccuracy > 50.0 {
            if elapsed >= 120.0 {
                if let anchorLocation = self.lastAccurateLocation ?? self.lastLocation {
                    print("[NativeTracking iOS] Indoor weak GPS (>50m). Sending stationary heartbeat with anchor location.")
                    sendPing(location: anchorLocation, isHeartbeat: true)
                }
            }
            return
        }

        let rawSpeed = max(0.0, location.speed)
        let speed = rawSpeed >= 0.8 ? rawSpeed : 0.0
        let distance = location.distance(from: self.lastAccurateLocation!)

        // Chốt chặn bước nhảy dị biệt (Jump / Outlier Filter):
        let jumpSpeed = elapsed > 0 ? distance / elapsed : 999.0
        if distance > 150.0 && (jumpSpeed > 35.0 || (distance > 400.0 && elapsed < 30.0)) {
            print("[NativeTracking iOS] Discarding outlier jump point: \(distance)m, speed=\(jumpSpeed)m/s")
            return
        }

        // Cập nhật điểm neo chuẩn xác cuối cùng
        self.lastAccurateLocation = location
        self.lastLocation = location

        // Smart Adaptive: Xác định có đang di chuyển (speed >= 1.0 m/s hoặc di dời >= 5m)
        let isMoving = speed >= 1.0 || distance >= 5.0

        if isMoving {
            // Khi đang di chuyển: throttle 3.0 giây / lần để Live-Map mượt mà
            if elapsed < 3.0 {
                return
            }
        } else {
            // Khi đứng yên ngoài trời (GPS vẫn bắt được): giữ nhịp gửi ping mỗi 2 phút (120s)
            if elapsed < 120.0 {
                return
            }
        }

        sendPing(location: location, isHeartbeat: !isMoving)
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("[NativeTracking iOS] Location manager error: \(error.localizedDescription)")
    }

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

        // Yêu cầu iOS cấp quyền CPU chạy nền để hoàn tất gửi gói tin mạng khi màn hình khóa
        var bgTask: UIBackgroundTaskIdentifier = .invalid
        bgTask = UIApplication.shared.beginBackgroundTask(withName: "XTTechLocationPing") {
            if bgTask != .invalid {
                UIApplication.shared.endBackgroundTask(bgTask)
                bgTask = .invalid
            }
        }

        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            defer {
                if bgTask != .invalid {
                    UIApplication.shared.endBackgroundTask(bgTask)
                    bgTask = .invalid
                }
            }
            guard let self = self else { return }
            if let httpResponse = response as? HTTPURLResponse {
                if (200...299).contains(httpResponse.statusCode) {
                    self.lastPingTime = Date()
                } else if httpResponse.statusCode == 401 && retryCount == 0 {
                    // Token hết hạn -> tự động refresh token
                    self.refreshAccessToken { success in
                        if success {
                            self.sendPing(location: location, isHeartbeat: isHeartbeat, retryCount: 1)
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
                if bgTask != .invalid {
                    UIApplication.shared.endBackgroundTask(bgTask)
                    bgTask = .invalid
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
                    self.accessToken = token
                    UserDefaults.standard.set(token, forKey: self.prefsKeyToken)
                    completion(true)
                    return
                }
            }
            completion(false)
        }
        task.resume()
    }
}
