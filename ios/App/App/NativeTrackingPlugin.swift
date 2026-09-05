import Foundation
import CoreLocation
import Capacitor
import UIKit

@objc(NativeTrackingPlugin)
public class NativeTrackingPlugin: CAPPlugin, CLLocationManagerDelegate {
    private var locationManager: CLLocationManager?
    private var isTracking = false
    private var accessToken: String?
    private var refreshToken: String?
    private var apiUrl: String?
    private var lastPingTime: Date = Date.distantPast
    private var lastLocation: CLLocation?
    private var heartbeatTimer: Timer?
    private var lastBatteryLevel: Double = -1.0

    private let prefsKeyToken = "xttech_ios_access_token"
    private let prefsKeyRefreshToken = "xttech_ios_refresh_token"
    private let prefsKeyApiUrl = "xttech_ios_api_url"

    public override func load() {
        super.load()
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
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.isTracking = false
            self.locationManager?.stopUpdatingLocation()
            self.heartbeatTimer?.invalidate()
            self.heartbeatTimer = nil
        }
        call.resolve(["success": true])
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

        if status == .notDetermined {
            locationManager?.requestAlwaysAuthorization()
        }

        locationManager?.startUpdatingLocation()
        isTracking = true
    }

    private func startHeartbeat() {
        heartbeatTimer?.invalidate()
        // Mỗi 60 giây kiểm tra: nếu quá 2 phút không có ping di chuyển -> gửi heartbeat đứng yên (khi app ở tiền cảnh)
        heartbeatTimer = Timer.scheduledTimer(withTimeInterval: 60.0, repeats: true) { [weak self] _ in
            guard let self = self, self.isTracking else { return }
            let elapsed = Date().timeIntervalSince(self.lastPingTime)
            if elapsed >= 120.0, let loc = self.lastLocation {
                self.sendPing(location: loc, isHeartbeat: true)
            }
        }
    }

    // CLLocationManagerDelegate
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // Bỏ qua các điểm có sai số lớn (accuracy > 35m)
        if location.horizontalAccuracy < 0 || location.horizontalAccuracy > 35.0 {
            return
        }

        let now = Date()
        let elapsed = now.timeIntervalSince(lastPingTime)

        let speed = max(0.0, location.speed)
        let distance = lastLocation != nil ? location.distance(from: lastLocation!) : 999.0

        // Smart Adaptive: Xác định có đang di chuyển (speed >= 1.0 m/s hoặc di dời >= 5m)
        let isMoving = speed >= 1.0 || distance >= 5.0

        if isMoving {
            // Khi đang di chuyển: throttle 3.0 giây / lần để Live-Map mượt mà
            if elapsed < 3.0 {
                return
            }
        } else {
            // Khi dừng lại / khóa màn hình: Giữ nhịp gửi ping đứng yên mỗi 2 phút (120s)
            // để đảm bảo Backend không đánh dấu Offline sau 10 phút
            if elapsed < 120.0 {
                return
            }
        }

        self.lastLocation = location
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
