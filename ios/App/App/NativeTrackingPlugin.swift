import Foundation
import CoreLocation
import Capacitor
import UIKit
import UserNotifications

/// Loại sự kiện gửi kèm location-ping (đồng bộ enum `eventType` phía Backend)
private enum PingEventType {
    static let location = "location"
    static let appClosed = "app_closed"
}

/// Local notification nhắc nhân viên mở lại app khi lỡ vuốt tắt trong ca làm việc
private enum AppClosedReminder {
    static let identifier = "com.xttech.app_closed_reminder"

    static func requestAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }

    static func schedule(group: DispatchGroup) {
        let content = UNMutableNotificationContent()
        content.title = "⚠️ Cảnh báo ca làm việc!"
        content.body = "Đang trong ca làm việc, vui lòng vào lại app XTTech và không đóng app!"
        content.sound = UNNotificationSound(named: UNNotificationSoundName("nhac_out_app.wav"))
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        group.enter()
        UNUserNotificationCenter.current().add(request) { _ in group.leave() }
    }

    static func clear() {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [identifier])
        center.removeDeliveredNotifications(withIdentifiers: [identifier])
    }
}

@objc(NativeTrackingPlugin)
public class NativeTrackingPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    // Metadata đăng ký plugin cho Capacitor 6+ (plugin nội bộ app phải đăng ký thủ công qua MainViewController)
    public let identifier = "NativeTrackingPlugin"
    public let jsName = "NativeTracking"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCurrentPosition", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestLocationPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openLocationSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "ensureAlwaysPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getBatteryLevel", returnType: CAPPluginReturnPromise)
    ]

    public static var shared: NativeTrackingPlugin?

    private final class PendingPositionRequest {
        let id = UUID()
        let call: CAPPluginCall
        let enableHighAccuracy: Bool
        let desiredAccuracyMeters: Double
        let maximumAgeMs: Int
        let timeoutSec: TimeInterval
        var waitingForAuthorization: Bool
        var locationEnabled: Bool
        var bestLocation: CLLocation?
        var bestSource: String?
        var timeoutWorkItem: DispatchWorkItem?

        init(
            call: CAPPluginCall,
            enableHighAccuracy: Bool,
            desiredAccuracyMeters: Double,
            maximumAgeMs: Int,
            timeoutSec: TimeInterval,
            waitingForAuthorization: Bool,
            locationEnabled: Bool,
            bestLocation: CLLocation? = nil,
            bestSource: String? = nil
        ) {
            self.call = call
            self.enableHighAccuracy = enableHighAccuracy
            self.desiredAccuracyMeters = desiredAccuracyMeters
            self.maximumAgeMs = maximumAgeMs
            self.timeoutSec = timeoutSec
            self.waitingForAuthorization = waitingForAuthorization
            self.locationEnabled = locationEnabled
            self.bestLocation = bestLocation
            self.bestSource = bestSource
        }
    }

    private var locationManager: CLLocationManager?
    private var isTracking = false
    private var pendingPermissionCall: CAPPluginCall?
    private var pendingLocationPermissionCall: CAPPluginCall?
    private var pendingPositionRequests: [PendingPositionRequest] = []

    private func getOrCreateLocationManager() -> CLLocationManager {
        // CLLocationManager phải được tạo trên main thread (có run loop) để didUpdateLocations luôn được gọi.
        // Capacitor chạy plugin method trên hàng đợi nền nên cần chuyển sang main khi tạo lần đầu.
        if !Thread.isMainThread {
            return DispatchQueue.main.sync { self.getOrCreateLocationManager() }
        }
        if let lm = self.locationManager {
            return lm
        }
        let lm = CLLocationManager()
        lm.delegate = self
        self.locationManager = lm
        return lm
    }

    private var accessToken: String?
    private var refreshToken: String?
    private var apiUrl: String?
    private var lastPingTime: Date = Date.distantPast
    private var lastSentLocation: CLLocation?
    private var lastBatteryLevel: Double = -1.0

    // Nhịp tim độc lập với callback GPS: iOS có thể ngừng gọi didUpdateLocations nhưng tiến trình vẫn sống
    private let heartbeatInterval: TimeInterval = 60.0
    private var heartbeatTimer: DispatchSourceTimer?

    // Thử lại có giới hạn khi gửi thất bại: không gửi lại trước mốc này (tăng dần 5s, 10s... tối đa 30s)
    private var retryNotBefore: Date = Date.distantPast
    private var pingFailureStreak = 0
    private let maxRetryBackoff: TimeInterval = 30.0

    // Geofence neo: nguồn đánh thức app của iOS sau khi bị vuốt tắt (force-quit) khi nhân viên rời đi
    private var anchorCenter: CLLocation?
    private let anchorRegionId = "com.xttech.anchor_region"
    private let anchorRegionRadius: CLLocationDistance = 150.0
    private let anchorRefreshDistance: CLLocationDistance = 100.0
    private let anchorMaxAccuracy: CLLocationAccuracy = 100.0

    private static let prefsKeyIsTrackingShared = "xttech_ios_is_tracking"
    private let prefsKeyToken = "xttech_ios_access_token"
    private let prefsKeyRefreshToken = "xttech_ios_refresh_token"
    private let prefsKeyApiUrl = "xttech_ios_api_url"
    private let prefsKeyIsTracking = NativeTrackingPlugin.prefsKeyIsTrackingShared

    // Timeout mạng nền: đủ rộng cho 4G yếu, vẫn nằm trong thời gian CPU nền (~30s) do beginBackgroundTask cấp
    private let networkRequestTimeout: TimeInterval = 15.0
    private let networkResourceTimeout: TimeInterval = 25.0

    // Chống gửi chồng ping: chỉ cho 1 ping chạy tại một thời điểm (tự hết hạn để không bị kẹt nếu request treo)
    private let pingStateLock = NSLock()
    private var pingInFlightSince: Date?
    private let pingInFlightMaxAge: TimeInterval = 30.0

    // Custom URLSession tối ưu riêng cho tác vụ nền (Background Network)
    private lazy var backgroundSession: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = networkRequestTimeout
        config.timeoutIntervalForResource = networkResourceTimeout
        config.waitsForConnectivity = false
        config.allowsCellularAccess = true
        config.httpMaximumConnectionsPerHost = 2
        return URLSession(configuration: config)
    }()

    private func beginPingIfIdle() -> Bool {
        pingStateLock.lock()
        defer { pingStateLock.unlock() }
        if let startedAt = pingInFlightSince, Date().timeIntervalSince(startedAt) < pingInFlightMaxAge {
            return false
        }
        pingInFlightSince = Date()
        return true
    }

    private func finishPing() {
        pingStateLock.lock()
        pingInFlightSince = nil
        pingStateLock.unlock()
    }

    public override func load() {
        super.load()
        // Giải phóng instance standalone (tạo lúc iOS đánh thức app từ nền) để tránh 2 luồng GPS gửi ping trùng
        if let previous = NativeTrackingPlugin.shared, previous !== self {
            previous.releaseLocationManager()
        }
        NativeTrackingPlugin.shared = self
        AppClosedReminder.clear()
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
        AppClosedReminder.requestAuthorization()

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
            self.stopHeartbeatTimer()
            self.resetRetryBackoff()
            self.stopLocationUpdatesIfIdle()
            if CLLocationManager.significantLocationChangeMonitoringAvailable() {
                self.locationManager?.stopMonitoringSignificantLocationChanges()
            }
            self.locationManager?.stopMonitoringVisits()
            self.stopAnchorRegionMonitoring()
            self.lastSentLocation = nil
            AppClosedReminder.clear()
            print("[NativeTracking iOS] Stopped live tracking.")
        }
        call.resolve(["success": true])
    }

    private func fetchLocationServicesEnabled(completion: @escaping (Bool) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            let enabled = CLLocationManager.locationServicesEnabled()
            DispatchQueue.main.async {
                completion(enabled)
            }
        }
    }

    private func currentAuthorizationStatus(for manager: CLLocationManager) -> CLAuthorizationStatus {
        if #available(iOS 14.0, *) {
            return manager.authorizationStatus
        }
        return CLLocationManager.authorizationStatus()
    }

    private func isPreciseAccuracy(for manager: CLLocationManager) -> Bool {
        if #available(iOS 14.0, *) {
            return manager.accuracyAuthorization == .fullAccuracy
        }
        return true
    }

    @objc func checkPermission(_ call: CAPPluginCall) {
        // Đọc locationServicesEnabled() trên background queue để tuân thủ Main Thread Checker iOS 16+
        fetchLocationServicesEnabled { [weak self] locationEnabled in
            guard let self = self else {
                call.reject("Plugin deallocated")
                return
            }
            self.resolvePermissionStatus(call, locationEnabled: locationEnabled)
        }
    }

    private static func authorizationStatusString(_ status: CLAuthorizationStatus) -> String {
        switch status {
        case .authorizedAlways: return "always"
        case .authorizedWhenInUse: return "whenInUse"
        case .notDetermined: return "notDetermined"
        case .restricted: return "restricted"
        case .denied: return "denied"
        @unknown default: return "denied"
        }
    }

    private func resolvePermissionStatus(_ call: CAPPluginCall, locationEnabled: Bool) {
        let manager = getOrCreateLocationManager()
        let status = currentAuthorizationStatus(for: manager)
        let isAlways = (status == .authorizedAlways)
        let isWhenInUse = (status == .authorizedWhenInUse)
        let isPrecise = isPreciseAccuracy(for: manager)
        let statusStr = NativeTrackingPlugin.authorizationStatusString(status)

        call.resolve([
            "status": statusStr,
            "isAlways": isAlways,
            "isWhenInUse": isWhenInUse,
            "isPrecise": isPrecise,
            "locationEnabled": locationEnabled,
            "isLowPowerMode": ProcessInfo.processInfo.isLowPowerModeEnabled
        ])
    }

    @objc func requestLocationPermission(_ call: CAPPluginCall) {
        fetchLocationServicesEnabled { [weak self] locationEnabled in
            guard let self = self else {
                call.reject("Plugin deallocated")
                return
            }
            let manager = self.getOrCreateLocationManager()
            let status = self.currentAuthorizationStatus(for: manager)
            let isPrecise = self.isPreciseAccuracy(for: manager)
            let statusStr = NativeTrackingPlugin.authorizationStatusString(status)

            if status == .notDetermined {
                if let previous = self.pendingLocationPermissionCall {
                    previous.resolve([
                        "granted": false,
                        "status": "notDetermined",
                        "isAlways": false,
                        "isWhenInUse": false,
                        "isPrecise": isPrecise,
                        "locationEnabled": locationEnabled,
                        "canAskAgain": true
                    ])
                }
                self.pendingLocationPermissionCall = call
                manager.requestWhenInUseAuthorization()
                return
            }

            let granted = (status == .authorizedAlways || status == .authorizedWhenInUse)
            call.resolve([
                "granted": granted,
                "status": statusStr,
                "isAlways": status == .authorizedAlways,
                "isWhenInUse": status == .authorizedWhenInUse,
                "isPrecise": isPrecise,
                "locationEnabled": locationEnabled,
                "canAskAgain": false
            ])
        }
    }

    @objc func getCurrentPosition(_ call: CAPPluginCall) {
        let enableHighAccuracy = call.getBool("enableHighAccuracy", true)
        let rawTimeoutMs = call.getInt("timeoutMs") ?? call.getDouble("timeoutMs").map { Int($0) } ?? 12000
        let timeoutMs = max(2000, min(60000, rawTimeoutMs))
        let rawMaxAgeMs = call.getInt("maximumAgeMs") ?? call.getDouble("maximumAgeMs").map { Int($0) } ?? 15000
        let maximumAgeMs = max(0, rawMaxAgeMs)
        let rawDesired = call.getDouble("desiredAccuracyMeters") ?? call.getInt("desiredAccuracyMeters").map { Double($0) }
        let defaultDesired = enableHighAccuracy ? 50.0 : 200.0
        let desiredAccuracyMeters = (rawDesired != nil && rawDesired! > 0.0) ? rawDesired! : defaultDesired
        let requestPermission = call.getBool("requestPermission", false)

        fetchLocationServicesEnabled { [weak self] locationEnabled in
            guard let self = self else {
                call.resolve([
                    "success": false,
                    "errorCode": "CONTEXT_UNAVAILABLE",
                    "errorMessage": "Plugin instance unavailable",
                    "provider": "corelocation",
                    "isPrecise": false,
                    "authorizationStatus": "denied",
                    "locationEnabled": false,
                    "isLowPowerMode": ProcessInfo.processInfo.isLowPowerModeEnabled
                ])
                return
            }

            let manager = self.getOrCreateLocationManager()
            let status = self.currentAuthorizationStatus(for: manager)
            let isPrecise = self.isPreciseAccuracy(for: manager)
            let statusStr = NativeTrackingPlugin.authorizationStatusString(status)

            if status == .denied || status == .restricted {
                call.resolve(self.buildPositionErrorPayload(
                    errorCode: "PERMISSION_DENIED",
                    errorMessage: status == .restricted ? "Location access is restricted on this device" : "Location permission denied",
                    isPrecise: isPrecise,
                    statusStr: statusStr,
                    locationEnabled: locationEnabled
                ))
                return
            }

            if status == .notDetermined {
                if !requestPermission {
                    call.resolve(self.buildPositionErrorPayload(
                        errorCode: "PERMISSION_NOT_DETERMINED",
                        errorMessage: "Location permission has not been requested yet",
                        isPrecise: isPrecise,
                        statusStr: statusStr,
                        locationEnabled: locationEnabled
                    ))
                    return
                }

                let req = PendingPositionRequest(
                    call: call,
                    enableHighAccuracy: enableHighAccuracy,
                    desiredAccuracyMeters: desiredAccuracyMeters,
                    maximumAgeMs: maximumAgeMs,
                    timeoutSec: TimeInterval(timeoutMs) / 1000.0,
                    waitingForAuthorization: true,
                    locationEnabled: locationEnabled
                )
                self.enqueuePositionRequest(req)
                manager.requestWhenInUseAuthorization()
                return
            }

            guard locationEnabled else {
                call.resolve(self.buildPositionErrorPayload(
                    errorCode: "LOCATION_SERVICES_DISABLED",
                    errorMessage: "Location services are disabled on this device",
                    isPrecise: isPrecise,
                    statusStr: statusStr,
                    locationEnabled: false
                ))
                return
            }

            self.startPositionRequestIfNeeded(
                call: call,
                manager: manager,
                statusStr: statusStr,
                isPrecise: isPrecise,
                locationEnabled: locationEnabled,
                enableHighAccuracy: enableHighAccuracy,
                desiredAccuracyMeters: desiredAccuracyMeters,
                maximumAgeMs: maximumAgeMs,
                timeoutSec: TimeInterval(timeoutMs) / 1000.0
            )
        }
    }

    @objc func openLocationSettings(_ call: CAPPluginCall) {
        openSettings(call)
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

    /// Kiểm tra quyền Vị trí Luôn luôn. Nếu chưa có, kích hoạt xin quyền iOS hoặc hiển thị hướng dẫn vào Cài đặt
    @objc func ensureAlwaysPermission(_ call: CAPPluginCall) {
        // pendingPermissionCall và CLLocationManager chỉ được chạm tới trên main thread (tránh race với delegate callback)
        DispatchQueue.main.async {
            self.resolveAlwaysPermission(call)
        }
    }

    private func resolveAlwaysPermission(_ call: CAPPluginCall) {
        let manager = getOrCreateLocationManager()
        let status = currentAuthorizationStatus(for: manager)
        let isPrecise = isPreciseAccuracy(for: manager)
        let statusStr = NativeTrackingPlugin.authorizationStatusString(status)

        if status == .authorizedAlways {
            call.resolve([
                "isAlways": true,
                "action": "already_granted",
                "status": statusStr,
                "isPrecise": isPrecise
            ])
            return
        }

        // Hủy call cũ nếu có request trước đó đang chờ
        if let previousCall = self.pendingPermissionCall {
            previousCall.resolve([
                "isAlways": false,
                "action": "superseded",
                "status": statusStr,
                "isPrecise": isPrecise
            ])
            self.pendingPermissionCall = nil
        }

        // 1. Máy chưa từng được hỏi quyền (.notDetermined):
        // BẮT BUỘC gọi requestAlwaysAuthorization() của iOS để hệ điều hành bung popup xin quyền gốc của Apple!
        // Khi popup này xuất hiện, iOS sẽ lập tức đăng ký App vào Cài đặt -> Vị trí.
        if status == .notDetermined {
            self.pendingPermissionCall = call
            DispatchQueue.main.async {
                manager.requestAlwaysAuthorization()
            }
            return
        }

        // 2. Người dùng đã cấp quyền "Khi dùng ứng dụng" (.authorizedWhenInUse):
        // Trong Cài đặt iPhone chắc chắn 100% ĐÃ CÓ mục "Vị trí".
        // Hướng dẫn người dùng vào Cài đặt để nâng cấp lên "Luôn luôn".
        if status == .authorizedWhenInUse {
            showOpenSettingsAlert(
                call: call,
                statusStr: statusStr,
                isPrecise: isPrecise,
                title: "Yêu cầu quyền Vị trí \"Luôn luôn\"",
                message: "Để duy trì chấm công và theo dõi lộ trình làm việc liên tục khi khóa màn hình, vui lòng cấp quyền vị trí \"Luôn luôn\" (Always) và bật \"Vị trí chính xác\" cho XTTech."
            )
            return
        }

        // 3. Đã bị từ chối (.denied hoặc .restricted):
        showOpenSettingsAlert(
            call: call,
            statusStr: statusStr,
            isPrecise: isPrecise,
            title: "Quyền Vị trí đã bị từ chối",
            message: "Ứng dụng XTTech cần quyền vị trí để hỗ trợ chấm công và định vị làm việc. Vui lòng mở Cài đặt để cấp lại quyền Vị trí."
        )
    }

    private func showOpenSettingsAlert(call: CAPPluginCall, statusStr: String, isPrecise: Bool, title: String, message: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                call.resolve([
                    "isAlways": false,
                    "action": "dismissed",
                    "status": statusStr,
                    "isPrecise": isPrecise
                ])
                return
            }

            let alert = UIAlertController(
                title: title,
                message: message,
                preferredStyle: .alert
            )

            alert.addAction(UIAlertAction(title: "Hủy", style: .cancel) { _ in
                call.resolve([
                    "isAlways": false,
                    "action": "cancelled",
                    "status": statusStr,
                    "isPrecise": isPrecise
                ])
            })

            alert.addAction(UIAlertAction(title: "Mở Cài đặt", style: .default) { _ in
                if let url = URL(string: UIApplication.openSettingsURLString), UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url, options: [:]) { _ in
                        call.resolve([
                            "isAlways": false,
                            "action": "settings_opened",
                            "status": statusStr,
                            "isPrecise": isPrecise
                        ])
                    }
                } else {
                    call.resolve([
                        "isAlways": false,
                        "action": "failed_open_settings",
                        "status": statusStr,
                        "isPrecise": isPrecise
                    ])
                }
            })

            self.bridge?.viewController?.present(alert, animated: true, completion: nil)
        }
    }

    // MARK: - CoreLocation Authorization Delegate
    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        handleAuthorizationChange(manager: manager)
    }

    public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        handleAuthorizationChange(manager: manager)
    }

    private func handleAuthorizationChange(manager: CLLocationManager) {
        let status = currentAuthorizationStatus(for: manager)

        // Bỏ qua callback ban đầu khi hệ thống vừa khởi tạo delegate mà người dùng chưa đưa ra lựa chọn
        guard status != .notDetermined else { return }

        let statusStr = NativeTrackingPlugin.authorizationStatusString(status)
        let isAlways = (status == .authorizedAlways)
        let isWhenInUse = (status == .authorizedWhenInUse)
        let isPrecise = isPreciseAccuracy(for: manager)

        // Báo JS mỗi khi quyền thay đổi (kể cả khi không có popup xin quyền đang chờ) để web hiển thị cảnh báo
        notifyListeners("permissionChanged", data: [
            "status": statusStr,
            "isAlways": isAlways
        ])

        // 1. Xử lý riêng requestLocationPermission() — không bao giờ bật popup bắt buộc "Luôn luôn"
        if let locPermCall = self.pendingLocationPermissionCall {
            self.pendingLocationPermissionCall = nil
            fetchLocationServicesEnabled { [weak self] locationEnabled in
                guard let self = self else {
                    locPermCall.resolve([
                        "granted": isAlways || isWhenInUse,
                        "status": statusStr,
                        "isAlways": isAlways,
                        "isWhenInUse": isWhenInUse,
                        "isPrecise": isPrecise,
                        "locationEnabled": true,
                        "canAskAgain": false
                    ])
                    return
                }
                let latestStatus = self.currentAuthorizationStatus(for: manager)
                let latestStr = NativeTrackingPlugin.authorizationStatusString(latestStatus)
                let latestAlways = (latestStatus == .authorizedAlways)
                let latestWhenInUse = (latestStatus == .authorizedWhenInUse)
                let latestPrecise = self.isPreciseAccuracy(for: manager)
                locPermCall.resolve([
                    "granted": latestAlways || latestWhenInUse,
                    "status": latestStr,
                    "isAlways": latestAlways,
                    "isWhenInUse": latestWhenInUse,
                    "isPrecise": latestPrecise,
                    "locationEnabled": locationEnabled,
                    "canAskAgain": false
                ])
            }
        }

        // 2. Xử lý các pendingPositionRequests đang chờ kết quả xin quyền (hoặc bị thu hồi quyền)
        if status == .denied || status == .restricted {
            failPendingPositionRequests(
                errorCode: "PERMISSION_DENIED",
                errorMessage: status == .restricted ? "Location access is restricted on this device" : "Location permission denied"
            )
        } else if !self.pendingPositionRequests.isEmpty {
            let waitingIds = self.pendingPositionRequests.filter { $0.waitingForAuthorization }.map { $0.id }
            if !waitingIds.isEmpty {
                fetchLocationServicesEnabled { [weak self] locationEnabled in
                    guard let self = self else { return }
                    let latestManager = self.getOrCreateLocationManager()
                    let latestStatus = self.currentAuthorizationStatus(for: latestManager)
                    let latestStr = NativeTrackingPlugin.authorizationStatusString(latestStatus)
                    let latestPrecise = self.isPreciseAccuracy(for: latestManager)

                    if latestStatus == .denied || latestStatus == .restricted {
                        self.failPendingPositionRequests(
                            errorCode: "PERMISSION_DENIED",
                            errorMessage: "Location permission denied"
                        )
                        return
                    }

                    var shouldStartUpdating = false
                    for id in waitingIds {
                        guard let idx = self.pendingPositionRequests.firstIndex(where: { $0.id == id }) else { continue }
                        let req = self.pendingPositionRequests[idx]
                        req.locationEnabled = locationEnabled

                        if !locationEnabled {
                            req.timeoutWorkItem?.cancel()
                            req.timeoutWorkItem = nil
                            self.pendingPositionRequests.remove(at: idx)
                            req.call.resolve(self.buildPositionErrorPayload(
                                errorCode: "LOCATION_SERVICES_DISABLED",
                                errorMessage: "Location services are disabled on this device",
                                isPrecise: latestPrecise,
                                statusStr: latestStr,
                                locationEnabled: false
                            ))
                            continue
                        }

                        req.waitingForAuthorization = false
                        if let cached = self.findCachedLocation(manager: latestManager, maximumAgeMs: req.maximumAgeMs) {
                            let isAcceptable = self.isCacheAcceptable(
                                cached,
                                isPrecise: latestPrecise,
                                enableHighAccuracy: req.enableHighAccuracy,
                                desiredAccuracyMeters: req.desiredAccuracyMeters
                            )
                            if isAcceptable {
                                req.timeoutWorkItem?.cancel()
                                req.timeoutWorkItem = nil
                                self.pendingPositionRequests.remove(at: idx)
                                req.call.resolve(self.buildPositionSuccessPayload(
                                    location: cached,
                                    source: "cache",
                                    isPrecise: latestPrecise,
                                    statusStr: latestStr,
                                    locationEnabled: locationEnabled
                                ))
                                continue
                            }
                            req.bestLocation = cached
                            req.bestSource = "cache"
                        }

                        if !self.isTracking {
                            latestManager.desiredAccuracy = req.enableHighAccuracy ? kCLLocationAccuracyBest : kCLLocationAccuracyHundredMeters
                            latestManager.distanceFilter = kCLDistanceFilterNone
                        }
                        shouldStartUpdating = true
                    }

                    if shouldStartUpdating {
                        latestManager.startUpdatingLocation()
                    }
                    self.stopLocationUpdatesIfIdle()
                }
            }
        }

        // 3. Xử lý riêng ensureAlwaysPermission()
        guard let call = self.pendingPermissionCall else { return }
        self.pendingPermissionCall = nil

        if isAlways {
            call.resolve([
                "isAlways": true,
                "action": "already_granted",
                "status": statusStr,
                "isPrecise": isPrecise
            ])
            return
        }

        if isWhenInUse {
            // Người dùng vừa chọn "Khi dùng ứng dụng" từ hộp thoại cấp quyền của Apple.
            // Lúc này XTTech đã chính thức được iOS ghi nhận vào Cài đặt -> Vị trí.
            // Hiển thị popup hướng dẫn mở Cài đặt để nâng cấp lên "Luôn luôn".
            DispatchQueue.main.async { [weak self] in
                self?.showOpenSettingsAlert(
                    call: call,
                    statusStr: statusStr,
                    isPrecise: isPrecise,
                    title: "Yêu cầu quyền Vị trí \"Luôn luôn\"",
                    message: "Để duy trì chấm công và theo dõi lộ trình làm việc liên tục khi khóa màn hình, vui lòng cấp quyền vị trí \"Luôn luôn\" (Always) và bật \"Vị trí chính xác\" cho XTTech."
                )
            }
            return
        }

        // Người dùng chọn từ chối (.denied hoặc .restricted)
        call.resolve([
            "isAlways": false,
            "action": "denied",
            "status": statusStr,
            "isPrecise": isPrecise
        ])
    }

    // MARK: - Foreground Check-In Position Acquisition Helpers
    private func startPositionRequestIfNeeded(
        call: CAPPluginCall,
        manager: CLLocationManager,
        statusStr: String,
        isPrecise: Bool,
        locationEnabled: Bool,
        enableHighAccuracy: Bool,
        desiredAccuracyMeters: Double,
        maximumAgeMs: Int,
        timeoutSec: TimeInterval
    ) {
        var initialBest: CLLocation?
        var initialBestSource: String?

        if maximumAgeMs > 0, let cached = findCachedLocation(manager: manager, maximumAgeMs: maximumAgeMs) {
            if isCacheAcceptable(
                cached,
                isPrecise: isPrecise,
                enableHighAccuracy: enableHighAccuracy,
                desiredAccuracyMeters: desiredAccuracyMeters
            ) {
                call.resolve(buildPositionSuccessPayload(
                    location: cached,
                    source: "cache",
                    isPrecise: isPrecise,
                    statusStr: statusStr,
                    locationEnabled: locationEnabled
                ))
                return
            }
            initialBest = cached
            initialBestSource = "cache"
        }

        let req = PendingPositionRequest(
            call: call,
            enableHighAccuracy: enableHighAccuracy,
            desiredAccuracyMeters: desiredAccuracyMeters,
            maximumAgeMs: maximumAgeMs,
            timeoutSec: timeoutSec,
            waitingForAuthorization: false,
            locationEnabled: locationEnabled,
            bestLocation: initialBest,
            bestSource: initialBestSource
        )
        enqueuePositionRequest(req)

        if !self.isTracking {
            manager.desiredAccuracy = enableHighAccuracy ? kCLLocationAccuracyBest : kCLLocationAccuracyHundredMeters
            manager.distanceFilter = kCLDistanceFilterNone
        }
        manager.startUpdatingLocation()
    }

    private func enqueuePositionRequest(_ req: PendingPositionRequest) {
        let reqId = req.id
        let workItem = DispatchWorkItem { [weak self] in
            guard let self = self,
                  let idx = self.pendingPositionRequests.firstIndex(where: { $0.id == reqId }) else { return }
            let timedOutReq = self.pendingPositionRequests.remove(at: idx)
            timedOutReq.timeoutWorkItem = nil

            let manager = self.getOrCreateLocationManager()
            let status = self.currentAuthorizationStatus(for: manager)
            let statusStr = NativeTrackingPlugin.authorizationStatusString(status)
            let isPrecise = self.isPreciseAccuracy(for: manager)

            if let best = timedOutReq.bestLocation {
                timedOutReq.call.resolve(self.buildPositionSuccessPayload(
                    location: best,
                    source: timedOutReq.bestSource ?? "live",
                    isPrecise: isPrecise,
                    statusStr: statusStr,
                    locationEnabled: timedOutReq.locationEnabled
                ))
            } else {
                timedOutReq.call.resolve(self.buildPositionErrorPayload(
                    errorCode: "TIMEOUT",
                    errorMessage: "Timed out acquiring CoreLocation position",
                    isPrecise: isPrecise,
                    statusStr: statusStr,
                    locationEnabled: timedOutReq.locationEnabled
                ))
            }
            self.stopLocationUpdatesIfIdle()
        }
        req.timeoutWorkItem = workItem
        pendingPositionRequests.append(req)
        DispatchQueue.main.asyncAfter(deadline: .now() + req.timeoutSec, execute: workItem)
    }

    private func findCachedLocation(manager: CLLocationManager, maximumAgeMs: Int) -> CLLocation? {
        guard maximumAgeMs > 0 else { return nil }
        let maxAgeSec = TimeInterval(maximumAgeMs) / 1000.0
        var candidates: [CLLocation] = []
        if isTracking, let sent = self.lastSentLocation {
            candidates.append(sent)
        }
        if let mgrLoc = manager.location {
            candidates.append(mgrLoc)
        }

        let validFresh = candidates.filter { loc in
            guard isValidCoordinateLocation(loc) else { return false }
            let age = Date().timeIntervalSince(loc.timestamp)
            return age >= -5.0 && age <= maxAgeSec
        }

        return validFresh.min { a, b in
            if abs(a.horizontalAccuracy - b.horizontalAccuracy) > 10.0 {
                return a.horizontalAccuracy < b.horizontalAccuracy
            }
            return a.timestamp > b.timestamp
        }
    }

    private func isValidCoordinateLocation(_ location: CLLocation) -> Bool {
        guard CLLocationCoordinate2DIsValid(location.coordinate),
              location.horizontalAccuracy >= 0 else {
            return false
        }
        let lat = location.coordinate.latitude
        let lng = location.coordinate.longitude
        if lat.isNaN || lng.isNaN || lat.isInfinite || lng.isInfinite {
            return false
        }
        return !(abs(lat) < 1e-7 && abs(lng) < 1e-7)
    }

    private func isCacheAcceptable(
        _ location: CLLocation,
        isPrecise: Bool,
        enableHighAccuracy: Bool,
        desiredAccuracyMeters: Double
    ) -> Bool {
        if !isPrecise || !enableHighAccuracy {
            return true
        }
        return location.horizontalAccuracy <= max(desiredAccuracyMeters, 80.0)
    }

    private func stopLocationUpdatesIfIdle() {
        if !self.isTracking && self.pendingPositionRequests.isEmpty {
            self.locationManager?.stopUpdatingLocation()
        }
    }

    private func failPendingPositionRequests(
        errorCode: String,
        errorMessage: String,
        osErrorCode: Int? = nil
    ) {
        guard !self.pendingPositionRequests.isEmpty else { return }
        let requests = self.pendingPositionRequests
        self.pendingPositionRequests.removeAll()

        let manager = self.locationManager
        let status: CLAuthorizationStatus = {
            if let mgr = manager {
                return self.currentAuthorizationStatus(for: mgr)
            }
            if #available(iOS 14.0, *) {
                return CLLocationManager().authorizationStatus
            }
            return CLLocationManager.authorizationStatus()
        }()
        let statusStr = NativeTrackingPlugin.authorizationStatusString(status)
        let isPrecise = manager.map { self.isPreciseAccuracy(for: $0) } ?? true

        for req in requests {
            req.timeoutWorkItem?.cancel()
            req.timeoutWorkItem = nil
            req.call.resolve(buildPositionErrorPayload(
                errorCode: errorCode,
                errorMessage: errorMessage,
                isPrecise: isPrecise,
                statusStr: statusStr,
                locationEnabled: req.locationEnabled,
                osErrorCode: osErrorCode
            ))
        }
        stopLocationUpdatesIfIdle()
    }

    private func buildPositionSuccessPayload(
        location: CLLocation,
        source: String,
        isPrecise: Bool,
        statusStr: String,
        locationEnabled: Bool
    ) -> [String: Any] {
        let ageMs = max(0, Int64((Date().timeIntervalSince(location.timestamp) * 1000.0).rounded()))
        let timestampMs = Int64((location.timestamp.timeIntervalSince1970 * 1000.0).rounded())

        var payload: [String: Any] = [
            "success": true,
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "timestamp": timestampMs,
            "provider": "corelocation",
            "source": source,
            "ageMs": ageMs,
            "isPrecise": isPrecise,
            "authorizationStatus": statusStr,
            "locationEnabled": locationEnabled,
            "isLowPowerMode": ProcessInfo.processInfo.isLowPowerModeEnabled
        ]
        if location.verticalAccuracy >= 0 {
            payload["altitude"] = location.altitude
        }
        if location.speed >= 0 {
            payload["speed"] = location.speed
        }
        if location.course >= 0 {
            payload["heading"] = location.course
        }
        return payload
    }

    private func buildPositionErrorPayload(
        errorCode: String,
        errorMessage: String,
        isPrecise: Bool,
        statusStr: String,
        locationEnabled: Bool,
        osErrorCode: Int? = nil
    ) -> [String: Any] {
        var payload: [String: Any] = [
            "success": false,
            "errorCode": errorCode,
            "errorMessage": errorMessage,
            "provider": "corelocation",
            "isPrecise": isPrecise,
            "authorizationStatus": statusStr,
            "locationEnabled": locationEnabled,
            "isLowPowerMode": ProcessInfo.processInfo.isLowPowerModeEnabled
        ]
        if let osErrorCode = osErrorCode {
            payload["osErrorCode"] = osErrorCode
        }
        return payload
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
        let manager = getOrCreateLocationManager()
        // Mọi đường khởi tạo (kể cả iOS đánh thức ngầm) đều phải bật theo dõi pin trước khi gửi ping
        enableBatteryMonitoringIfNeeded()

        // Cấu hình GPS phần cứng chất lượng cao nhất, không tự ý ngắt chip GPS
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = kCLDistanceFilterNone
        manager.allowsBackgroundLocationUpdates = true
        manager.pausesLocationUpdatesAutomatically = false
        manager.activityType = .otherNavigation

        // Hiển thị viên thuốc màu xanh trên Status Bar / Dynamic Island (chuẩn Apple cho ứng dụng Live Tracking)
        if #available(iOS 11.0, *) {
            manager.showsBackgroundLocationIndicator = true
        }

        let status: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            status = manager.authorizationStatus
        } else {
            status = CLLocationManager.authorizationStatus()
        }

        if status == .notDetermined || status == .authorizedWhenInUse {
            manager.requestAlwaysAuthorization()
        }

        manager.startUpdatingLocation()

        // Lưới an toàn cứu sinh: Giữ đánh thức SLC khi khởi động lại máy hoặc bị hệ thống kill
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            manager.startMonitoringSignificantLocationChanges()
        }
        // Visits: thêm một nguồn đánh thức hệ thống (vẫn hoạt động sau khi app bị vuốt tắt)
        manager.startMonitoringVisits()

        startHeartbeatTimer()

        isTracking = true
        print("[NativeTracking iOS] Active Live-Tracking started (kCLLocationAccuracyBest, showsBackgroundLocationIndicator=true).")
    }

    private func releaseLocationManager() {
        isTracking = false
        failPendingPositionRequests(
            errorCode: "CONTEXT_UNAVAILABLE",
            errorMessage: "Plugin instance released"
        )
        stopHeartbeatTimer()
        locationManager?.stopUpdatingLocation()
        locationManager?.delegate = nil
        locationManager = nil
    }

    // MARK: - Heartbeat Timer & Retry Backoff
    /// Chạy trên main queue. Chỉ gửi khi đã quá `heartbeatInterval` kể từ lần gửi cuối (GPS bình thường thì không bao giờ kích hoạt)
    private func startHeartbeatTimer() {
        stopHeartbeatTimer()
        let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
        timer.schedule(deadline: .now() + heartbeatInterval, repeating: heartbeatInterval, leeway: .seconds(5))
        timer.setEventHandler { [weak self] in
            self?.heartbeatTick()
        }
        timer.resume()
        heartbeatTimer = timer
    }

    private func stopHeartbeatTimer() {
        heartbeatTimer?.cancel()
        heartbeatTimer = nil
    }

    private func heartbeatTick() {
        guard isTracking else { return }
        let now = Date()
        guard now >= retryNotBefore, now.timeIntervalSince(lastPingTime) >= heartbeatInterval else { return }
        // Dùng điểm đã gửi gần nhất để không làm "giật lùi" vị trí trên Live Map
        let location: CLLocation
        if let sent = lastSentLocation {
            location = sent
        } else if let cached = locationManager?.location {
            // Điểm cache của hệ thống có thể rất cũ: gắn sai số lớn để server chỉ làm mới trạng thái sống, không đổi vị trí
            location = CLLocation(
                coordinate: cached.coordinate,
                altitude: cached.altitude,
                horizontalAccuracy: max(cached.horizontalAccuracy, 1000.0),
                verticalAccuracy: cached.verticalAccuracy,
                timestamp: cached.timestamp
            )
        } else {
            return
        }
        lastPingTime = now
        sendPing(location: location, isHeartbeat: true)
    }

    /// Gọi trên main thread
    private func registerPingFailure() {
        pingFailureStreak += 1
        let backoff = min(maxRetryBackoff, 5.0 * Double(pingFailureStreak))
        retryNotBefore = Date().addingTimeInterval(backoff)
        // Cho phép gửi lại ngay khi hết thời gian chờ (không bắt chờ thêm 60s throttle của chế độ đứng yên)
        lastPingTime = Date().addingTimeInterval(-heartbeatInterval)
    }

    /// Gọi trên main thread
    private func resetRetryBackoff() {
        pingFailureStreak = 0
        retryNotBefore = Date.distantPast
    }

    // MARK: - Anchor Geofence Engine (đánh thức app sau force-quit khi rời khỏi vị trí)
    private func refreshAnchorRegionIfNeeded(around location: CLLocation) {
        guard location.horizontalAccuracy <= anchorMaxAccuracy,
              CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self),
              let manager = locationManager else { return }
        if let center = anchorCenter, location.distance(from: center) < anchorRefreshDistance {
            return
        }
        let region = CLCircularRegion(center: location.coordinate, radius: anchorRegionRadius, identifier: anchorRegionId)
        region.notifyOnExit = true
        region.notifyOnEntry = false
        // Cùng identifier: iOS tự thay thế region cũ, không bị cộng dồn giới hạn 20 region
        manager.startMonitoring(for: region)
        anchorCenter = location
    }

    private func stopAnchorRegionMonitoring() {
        anchorCenter = nil
        guard let manager = locationManager else { return }
        for region in manager.monitoredRegions where region.identifier == anchorRegionId {
            manager.stopMonitoring(for: region)
        }
    }

    /// Đánh thức ứng dụng từ nền khi nhận sự kiện hệ thống
    @objc public static func handleLocationWakeUp() {
        let defaults = UserDefaults.standard
        let wasTracking = defaults.bool(forKey: prefsKeyIsTrackingShared)
        guard wasTracking else { return }

        DispatchQueue.main.async {
            if let plugin = shared {
                plugin.setupLocationManager()
            } else {
                let standalone = NativeTrackingPlugin()
                standalone.accessToken = defaults.string(forKey: "xttech_ios_access_token")
                standalone.refreshToken = defaults.string(forKey: "xttech_ios_refresh_token")
                standalone.apiUrl = defaults.string(forKey: "xttech_ios_api_url")
                // Instance standalone không chạy load(): phải tự bật theo dõi pin để ping không thiếu batteryLevel
                standalone.enableBatteryMonitoringIfNeeded()
                _ = standalone.getCurrentBatteryLevel()
                standalone.setupLocationManager()
                shared = standalone
            }
            print("[NativeTracking iOS] App awakened by iOS Kernel for background location update.")
        }
    }

    // MARK: - CLLocationManagerDelegate (Active Live-Tracking Delegate)
    private func processPendingPositionRequests(manager: CLLocationManager, locations: [CLLocation]) {
        guard !self.pendingPositionRequests.isEmpty, !locations.isEmpty else { return }

        let status = currentAuthorizationStatus(for: manager)
        let statusStr = NativeTrackingPlugin.authorizationStatusString(status)
        let isPrecise = isPreciseAccuracy(for: manager)

        var remaining: [PendingPositionRequest] = []
        var settledAny = false

        for req in self.pendingPositionRequests {
            if req.waitingForAuthorization {
                remaining.append(req)
                continue
            }

            let maxReplayAgeSec: TimeInterval = req.maximumAgeMs <= 0
                ? 5.0
                : max(5.0, Double(req.maximumAgeMs) / 1000.0)

            var settledReq = false
            for loc in locations {
                guard isValidCoordinateLocation(loc) else { continue }
                guard abs(loc.timestamp.timeIntervalSinceNow) <= maxReplayAgeSec else { continue }

                let shouldReplaceBest: Bool = {
                    guard let currentBest = req.bestLocation else { return true }
                    if req.bestSource == "cache" { return true }
                    return loc.horizontalAccuracy <= currentBest.horizontalAccuracy
                }()
                if shouldReplaceBest {
                    req.bestLocation = loc
                    req.bestSource = "live"
                }

                // Khi tắt Vị trí chính xác (!isPrecise), chấp nhận luôn điểm hợp lệ (kể cả > 200m)
                let isAcceptable = !isPrecise || loc.horizontalAccuracy <= req.desiredAccuracyMeters
                if isAcceptable {
                    req.timeoutWorkItem?.cancel()
                    req.timeoutWorkItem = nil
                    req.call.resolve(buildPositionSuccessPayload(
                        location: loc,
                        source: "live",
                        isPrecise: isPrecise,
                        statusStr: statusStr,
                        locationEnabled: req.locationEnabled
                    ))
                    settledReq = true
                    settledAny = true
                    break
                }
            }

            if !settledReq {
                remaining.append(req)
            }
        }

        if settledAny {
            self.pendingPositionRequests = remaining
            self.stopLocationUpdatesIfIdle()
        }
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // 1. Luôn phục vụ các yêu cầu one-shot getCurrentPosition TRƯỚC guard isTracking
        processPendingPositionRequests(manager: manager, locations: locations)

        // 2. Chỉ cập nhật diagnostics & gửi ping theo dõi ca khi isTracking == true
        guard isTracking, let location = locations.last else { return }
        let diagnostics = TrackingDiagnostics.shared

        // Bỏ qua tọa độ cũ đã lưu cache quá 30 giây
        if abs(location.timestamp.timeIntervalSinceNow) > 30.0 {
            diagnostics.recordLocationUpdate(isFiltered: true)
            return
        }

        // Tọa độ không hợp lệ (accuracy âm): bỏ qua hoàn toàn
        if location.horizontalAccuracy < 0 {
            diagnostics.recordLocationUpdate(isFiltered: true)
            return
        }

        // Sai số quá lớn (> 200m, vd người dùng tắt "Vị trí chính xác"): không dùng làm tọa độ/lộ trình,
        // nhưng vẫn gửi nhịp tim để server biết thiết bị còn sống và nhận được bản chẩn đoán
        if location.horizontalAccuracy > 200.0 {
            diagnostics.recordLocationUpdate(isFiltered: true)
            sendLowAccuracyHeartbeatIfDue(location)
            return
        }
        diagnostics.recordLocationUpdate(isFiltered: false)

        refreshAnchorRegionIfNeeded(around: location)

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

        // Đang trong thời gian chờ thử lại sau khi gửi thất bại
        if now < retryNotBefore {
            return
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

    /// Gửi nhịp tim cho điểm sai số lớn: tối đa 1 lần / heartbeatInterval, KHÔNG cập nhật điểm neo (lastSentLocation)
    /// để không làm sai lệch bộ lọc di chuyển. Server giữ nguyên tọa độ tốt gần nhất và chỉ làm mới trạng thái sống.
    private func sendLowAccuracyHeartbeatIfDue(_ location: CLLocation) {
        let now = Date()
        guard now >= retryNotBefore, now.timeIntervalSince(lastPingTime) >= heartbeatInterval else { return }
        lastPingTime = now
        sendPing(location: location, isHeartbeat: true)
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        if isTracking {
            TrackingDiagnostics.shared.recordLocationError(error)
        }
        print("[NativeTracking iOS] Location manager error: \(error.localizedDescription)")

        if let clError = error as? CLError {
            // Bỏ qua lỗi tạm thời .locationUnknown để tiếp tục chờ GPS/Wi-Fi trong nhà đến hết timeout
            if clError.code == .locationUnknown {
                return
            }
            if clError.code == .denied {
                failPendingPositionRequests(
                    errorCode: "PERMISSION_DENIED",
                    errorMessage: "Location access denied by user or system",
                    osErrorCode: (error as NSError).code
                )
            }
        }
    }

    public func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        guard region.identifier == anchorRegionId, isTracking else { return }
        // Rời vùng neo: buộc dựng neo mới tại điểm GPS kế tiếp và đảm bảo GPS liên tục đang chạy
        anchorCenter = nil
        manager.startUpdatingLocation()
    }

    public func locationManager(_ manager: CLLocationManager, didVisit visit: CLVisit) {
        guard isTracking else { return }
        manager.startUpdatingLocation()
    }

    public func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
        guard region?.identifier == anchorRegionId else { return }
        anchorCenter = nil
        print("[NativeTracking iOS] Anchor region monitoring failed: \(error.localizedDescription)")
    }

    // MARK: - App Termination (người dùng vuốt tắt app trong ca làm việc)
    /// Gọi từ AppDelegate.applicationWillTerminate: báo Server trạng thái app_closed + đặt local notification nhắc mở lại.
    /// iOS chỉ cho vài giây trước khi kill process nên chờ tối đa 3 giây.
    @objc public static func handleAppWillTerminate() {
        guard UserDefaults.standard.bool(forKey: prefsKeyIsTrackingShared) else { return }
        let group = DispatchGroup()
        AppClosedReminder.schedule(group: group)
        shared?.sendAppClosedPing(group: group)
        _ = group.wait(timeout: .now() + 3.0)
    }

    private func sendAppClosedPing(group: DispatchGroup) {
        guard let location = lastSentLocation ?? locationManager?.location,
              let request = makePingRequest(location: location, speed: 0.0, eventType: PingEventType.appClosed) else { return }
        group.enter()
        // Completion chạy trên delegate queue riêng của URLSession nên không deadlock với main thread đang chờ
        backgroundSession.dataTask(with: request) { _, _, _ in group.leave() }.resume()
    }

    // MARK: - Main-Thread-Safe Network Dispatcher
    private func makePingRequest(location: CLLocation, speed: Double, eventType: String) -> URLRequest? {
        guard let apiUrl = self.apiUrl, !apiUrl.isEmpty else { return nil }

        var baseUrl = apiUrl
        if baseUrl.hasSuffix("/") {
            baseUrl.removeLast()
        }
        guard let url = URL(string: "\(baseUrl)/api/v1/attendances/location-ping") else { return nil }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = networkRequestTimeout

        if let token = self.accessToken, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let heading = location.course >= 0 ? location.course : 0.0
        var payload: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "speed": speed,
            "heading": heading,
            "eventType": eventType,
            "platform": "ios"
        ]
        if let battery = getCurrentBatteryLevel() {
            payload["battery_level"] = battery
            payload["batteryLevel"] = battery
        }
        payload["diagnostics"] = TrackingDiagnostics.shared.snapshot(locationManager: self.locationManager)

        guard let httpBody = try? JSONSerialization.data(withJSONObject: payload, options: []) else { return nil }
        request.httpBody = httpBody
        return request
    }

    private func sendPing(location: CLLocation, isHeartbeat: Bool, retryCount: Int = 0) {
        let speed = isHeartbeat ? 0.0 : max(0.0, location.speed)
        let isRetry = retryCount > 0
        guard let request = makePingRequest(location: location, speed: speed, eventType: PingEventType.location) else {
            if isRetry { finishPing() }
            return
        }
        // Ping đang bay thì bỏ qua (vị trí mới sẽ tới sau); lần retry sau refresh token đã giữ quyền sở hữu
        guard isRetry || beginPingIfIdle() else { return }

        // Yêu cầu iOS cấp quyền CPU chạy nền an toàn
        var bgTaskId: UIBackgroundTaskIdentifier = .invalid
        bgTaskId = UIApplication.shared.beginBackgroundTask(withName: "XTTechLocationPing") {
            if bgTaskId != .invalid {
                UIApplication.shared.endBackgroundTask(bgTaskId)
                bgTaskId = .invalid
            }
        }

        let endBgTask = {
            DispatchQueue.main.async {
                if bgTaskId != .invalid {
                    let currentId = bgTaskId
                    bgTaskId = .invalid
                    UIApplication.shared.endBackgroundTask(currentId)
                }
            }
        }

        let task = self.backgroundSession.dataTask(with: request) { [weak self] data, response, error in
            var isHandingOffToRetry = false
            defer {
                endBgTask()
                if !isHandingOffToRetry { self?.finishPing() }
            }
            guard let self = self else { return }
            guard let httpResponse = response as? HTTPURLResponse else {
                TrackingDiagnostics.shared.recordPingFailure(statusCode: nil, error: error)
                DispatchQueue.main.async { self.registerPingFailure() }
                return
            }
            if (200...299).contains(httpResponse.statusCode) {
                TrackingDiagnostics.shared.recordPingSuccess(statusCode: httpResponse.statusCode)
                DispatchQueue.main.async {
                    self.lastPingTime = Date()
                    self.resetRetryBackoff()
                }
                self.notifyListeners("locationUpdate", data: [
                    "latitude": location.coordinate.latitude,
                    "longitude": location.coordinate.longitude,
                    "speed": speed,
                    "timestamp": Date().timeIntervalSince1970
                ])
                return
            }

            TrackingDiagnostics.shared.recordPingFailure(statusCode: httpResponse.statusCode, error: nil)
            guard httpResponse.statusCode == 401 && !isRetry else {
                DispatchQueue.main.async { self.registerPingFailure() }
                return
            }
            isHandingOffToRetry = true
            self.refreshAccessToken { success in
                guard success else {
                    TrackingDiagnostics.shared.recordTokenRefreshFailure()
                    self.notifyListeners("authError", data: ["code": "UNAUTHORIZED"])
                    DispatchQueue.main.async { self.registerPingFailure() }
                    self.finishPing()
                    return
                }
                DispatchQueue.main.async {
                    self.sendPing(location: location, isHeartbeat: isHeartbeat, retryCount: 1)
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
        request.timeoutInterval = networkRequestTimeout

        let payload = ["refreshToken": refreshToken]
        guard let httpBody = try? JSONSerialization.data(withJSONObject: payload, options: []) else {
            completion(false)
            return
        }
        request.httpBody = httpBody

        var bgTaskId: UIBackgroundTaskIdentifier = .invalid
        bgTaskId = UIApplication.shared.beginBackgroundTask(withName: "XTTechRefreshToken") {
            if bgTaskId != .invalid {
                UIApplication.shared.endBackgroundTask(bgTaskId)
                bgTaskId = .invalid
            }
        }

        let endBgTask = {
            DispatchQueue.main.async {
                if bgTaskId != .invalid {
                    let currentId = bgTaskId
                    bgTaskId = .invalid
                    UIApplication.shared.endBackgroundTask(currentId)
                }
            }
        }

        let task = self.backgroundSession.dataTask(with: request) { [weak self] data, response, error in
            defer {
                endBgTask()
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
