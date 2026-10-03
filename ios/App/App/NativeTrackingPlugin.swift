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
    private var lastSentLocation: CLLocation?
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
                self?.isTracking = true
                self?.setupLocationManager()
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
            self.enableBatteryMonitoringIfNeeded()
            _ = self.getCurrentBatteryLevel()
            self.isTracking = true
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
            self.locationManager?.stopUpdatingLocation()
            if CLLocationManager.significantLocationChangeMonitoringAvailable() {
                self.locationManager?.stopMonitoringSignificantLocationChanges()
            }
            self.lastSentLocation = nil
            print("[NativeTracking iOS] Stopped live tracking.")
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

    /// Kiểm tra quyền Vị trí Luôn luôn. Nếu chưa có, hiển thị trực tiếp UIAlertController gốc của iOS
    @objc func ensureAlwaysPermission(_ call: CAPPluginCall) {
        let status: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            status = locationManager?.authorizationStatus ?? CLLocationManager().authorizationStatus
        } else {
            status = CLLocationManager.authorizationStatus()
        }

        let isAlways = (status == .authorizedAlways)
        if isAlways {
            call.resolve([
                "isAlways": true,
                "action": "already_granted"
            ])
            return
        }

        // Chưa có quyền Luôn luôn: Hiển thị Native Pop-up UIAlertController chuẩn iOS
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                call.resolve(["isAlways": false, "action": "dismissed"])
                return
            }

            let alert = UIAlertController(
                title: "Yêu cầu quyền Vị trí \"Luôn luôn\"",
                message: "Để duy trì chấm công và theo dõi lộ trình làm việc liên tục khi khóa màn hình, vui lòng cấp quyền vị trí \"Luôn luôn\" (Always) và bật \"Vị trí chính xác\" cho XTTech.",
                preferredStyle: .alert
            )

            alert.addAction(UIAlertAction(title: "Hủy", style: .cancel) { _ in
                call.resolve([
                    "isAlways": false,
                    "action": "cancelled"
                ])
            })

            alert.addAction(UIAlertAction(title: "Mở Cài đặt", style: .default) { _ in
                if let url = URL(string: UIApplication.openSettingsURLString), UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url, options: [:]) { _ in
                        call.resolve([
                            "isAlways": false,
                            "action": "settings_opened"
                        ])
                    }
                } else {
                    call.resolve([
                        "isAlways": false,
                        "action": "failed_open_settings"
                    ])
                }
            })

            self.bridge?.viewController?.present(alert, animated: true, completion: nil)
        }
    }

    // MARK: - Battery Monitoring Engine
    private func enableBatteryMonitoringIfNeeded() {
        if !UIDevice.current.isBatteryMonitoringEnabled {
            UIDevice.current.isBatteryMonitoringEnabled = true
        }
    }

    private func getCurrentBatteryLevel() -> Double? {
        enableBatteryMonitoringIfNeeded()
        let raw = UIDevice.current.batteryLevel
        if raw >= 0.0 {
            let pct = Double(round(raw * 100.0))
            self.lastBatteryLevel = pct
            return pct
        }
        // Fallback: Sử dụng mức pin hợp lệ gần nhất nếu hệ thống tạm thời chưa kịp đọc
        if self.lastBatteryLevel >= 0.0 {
            return self.lastBatteryLevel
        }
        return nil
    }

    @objc func getBatteryLevel(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                call.resolve(["level": -1])
                return
            }
            if let level = self.getCurrentBatteryLevel() {
                call.resolve(["level": level])
            } else {
                call.resolve(["level": -1])
            }
        }
    }

    // MARK: - CoreLocation Active Tracking Engine (Chuẩn Live Location Zalo / Grab)
    private func setupLocationManager() {
        if locationManager == nil {
            locationManager = CLLocationManager()
            locationManager?.delegate = self
        }

        // Cấu hình GPS phần cứng chất lượng cao nhất, không tự ý ngắt chip GPS
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
        locationManager?.distanceFilter = kCLDistanceFilterNone
        locationManager?.allowsBackgroundLocationUpdates = true
        locationManager?.pausesLocationUpdatesAutomatically = false
        locationManager?.activityType = .automotiveNavigation

        // Hiển thị viên thuốc màu xanh trên Status Bar / Dynamic Island (chuẩn Apple cho ứng dụng Live Tracking)
        if #available(iOS 11.0, *) {
            locationManager?.showsBackgroundLocationIndicator = true
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

        // Lưới an toàn cứu sinh: Giữ đánh thức SLC khi khởi động lại máy hoặc bị hệ thống kill
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            locationManager?.startMonitoringSignificantLocationChanges()
        }

        isTracking = true
        print("[NativeTracking iOS] Active Live-Tracking started (kCLLocationAccuracyBest, showsBackgroundLocationIndicator=true).")
    }

    /// Đánh thức ứng dụng từ nền khi nhận sự kiện hệ thống
    @objc public static func handleLocationWakeUp() {
        let defaults = UserDefaults.standard
        let wasTracking = defaults.bool(forKey: "xttech_ios_is_tracking")
        guard wasTracking else { return }

        DispatchQueue.main.async {
            if let plugin = shared {
                plugin.setupLocationManager()
            } else {
                let standalone = NativeTrackingPlugin()
                standalone.accessToken = defaults.string(forKey: "xttech_ios_access_token")
                standalone.refreshToken = defaults.string(forKey: "xttech_ios_refresh_token")
                standalone.apiUrl = defaults.string(forKey: "xttech_ios_api_url")
                standalone.setupLocationManager()
                shared = standalone
            }
            print("[NativeTracking iOS] App awakened by iOS Kernel for background location update.")
        }
    }

    // MARK: - CLLocationManagerDelegate (Active Live-Tracking Delegate)
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard isTracking, let location = locations.last else { return }

        // Bỏ qua tọa độ cũ đã lưu cache quá 30 giây
        if abs(location.timestamp.timeIntervalSinceNow) > 30.0 {
            return
        }

        // Bỏ qua tọa độ sai số quá lớn (> 200m)
        if location.horizontalAccuracy < 0 || location.horizontalAccuracy > 200.0 {
            return
        }

        let now = Date()
        let elapsed = now.timeIntervalSince(lastPingTime)

        // Tính toán khoảng cách dịch chuyển so với điểm đã gửi trước đó
        let distance: Double = {
            if let lastSent = self.lastSentLocation {
                return location.distance(from: lastSent)
            }
            return 999.0
        }()

        let rawSpeed = max(0.0, location.speed)
        let speed = rawSpeed >= 0.8 ? rawSpeed : 0.0

        // Nhận diện trạng thái di chuyển:
        // Có tốc độ >= 0.8 m/s (~ 2.88 km/h) HOẶC dịch chuyển vị trí >= 10 mét
        let isMoving = speed >= 0.8 || distance >= 10.0

        // Lọc bước nhảy dị biệt (outlier jump do chuyển đổi trạm BTS ảo)
        if distance > 250.0 && elapsed > 0 {
            let jumpSpeed = distance / elapsed
            if jumpSpeed > 45.0 { // Vượt quá 162 km/h
                print("[NativeTracking iOS] Discarding outlier jump point: \(distance)m in \(elapsed)s")
                return
            }
        }

        // Điều tiết tần suất gửi (Throttling Engine):
        if isMoving {
            // Khi di chuyển ngoài đường: Gửi thời gian thực mỗi 3.0 giây / lần (chuẩn Live-Map như Zalo / Grab)
            if elapsed < 3.0 {
                return
            }
        } else {
            // Khi đứng yên một chỗ (văn phòng / nhà ở): Gửi nhịp tim mỗi 60.0 giây / lần để Server luôn nhận Online
            if elapsed < 60.0 {
                return
            }
        }

        self.lastPingTime = now
        self.lastSentLocation = location
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

        let speed = isHeartbeat ? 0.0 : max(0.0, location.speed)
        let heading = location.course >= 0 ? location.course : 0.0

        var payload: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "speed": speed,
            "heading": heading
        ]
        if let battery = getCurrentBatteryLevel() {
            payload["battery_level"] = battery
            payload["batteryLevel"] = battery
        }

        guard let httpBody = try? JSONSerialization.data(withJSONObject: payload, options: []) else { return }
        request.httpBody = httpBody

        // Yêu cầu iOS cấp quyền CPU chạy nền an toàn
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
