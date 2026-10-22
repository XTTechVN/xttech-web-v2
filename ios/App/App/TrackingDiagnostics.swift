import Foundation
import UIKit
import CoreLocation
import MetricKit

/// Thu thập thông tin chẩn đoán gửi kèm location-ping để xác định chính xác nguyên nhân mất tín hiệu:
/// - Trạng thái hệ thống: quyền vị trí, tiết kiệm pin, làm mới nền, trạng thái app.
/// - Vòng đời tiến trình: lý do khởi chạy, suy luận lý do tiến trình trước đó kết thúc (bị kill / vuốt tắt / khởi động lại máy).
/// - Chất lượng truyền: mã HTTP, số lần gửi thất bại liên tiếp, lý do thất bại.
/// - Luồng vị trí: số điểm nhận / bị lọc, tuổi điểm gần nhất, lỗi CoreLocation.
/// - MetricKit: lý do app bị hệ thống kết thúc (RAM, watchdog, crash...) do iOS tổng hợp mỗi 24 giờ.
final class TrackingDiagnostics: NSObject {
    static let shared = TrackingDiagnostics()

    private enum DefaultsKey {
        static let sessionState = "xttech_diag_session_state"
        static let buildKey = "xttech_diag_build_key"
        static let bootTime = "xttech_diag_boot_time"
        static let exitMetrics = "xttech_diag_exit_metrics"
    }

    private enum SessionState {
        static let foreground = "foreground"
        static let background = "background"
        static let terminated = "terminated"
    }

    /// Sai lệch tối đa (giây) khi so sánh thời điểm khởi động máy giữa hai lần chạy
    private static let bootTimeTolerance: TimeInterval = 60.0

    private let defaults = UserDefaults.standard
    private let lock = NSLock()

    private var hasStarted = false
    private let launchId = UUID().uuidString
    private var launchReason = "user_or_other"
    private var previousExit: String?
    private var appState = "inactive"

    private var lastPingHttpStatus: Int?
    private var consecutiveFailures = 0
    private var lastFailureReason: String?

    private var receivedLocationCount = 0
    private var filteredLocationCount = 0
    private var lastLocationAt: Date?
    private var lastLocationErrorCode: Int?

    // MARK: - Khởi động (gọi một lần từ AppDelegate.didFinishLaunching)
    func start(launchedBySystem: Bool) {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in self?.start(launchedBySystem: launchedBySystem) }
            return
        }
        lock.lock()
        guard !hasStarted else {
            lock.unlock()
            return
        }
        hasStarted = true
        launchReason = launchedBySystem ? "system_location" : "user_or_other"
        previousExit = inferPreviousExit()
        appState = Self.currentApplicationStateName()
        lock.unlock()

        persistSessionState(appState == "background" ? SessionState.background : SessionState.foreground)
        registerLifecycleObservers()
        registerMetricKit()
    }

    /// Suy luận lý do tiến trình trước đó kết thúc dựa trên cờ trạng thái lưu lại ở lần chạy trước
    private func inferPreviousExit() -> String? {
        let currentBuildKey = Self.buildKey
        let currentBootTime = Self.systemBootTime()
        let previousState = defaults.string(forKey: DefaultsKey.sessionState)
        let previousBuildKey = defaults.string(forKey: DefaultsKey.buildKey)
        let previousBootTime = defaults.object(forKey: DefaultsKey.bootTime) as? Double

        defaults.set(currentBuildKey, forKey: DefaultsKey.buildKey)
        if let currentBootTime = currentBootTime {
            defaults.set(currentBootTime, forKey: DefaultsKey.bootTime)
        }

        // Lần chạy đầu tiên sau khi cài đặt: chưa có dữ liệu để suy luận
        guard let previousState = previousState else { return nil }

        if let previousBuildKey = previousBuildKey, previousBuildKey != currentBuildKey {
            return "app_updated"
        }
        if let previousBootTime = previousBootTime,
           let currentBootTime = currentBootTime,
           abs(previousBootTime - currentBootTime) > Self.bootTimeTolerance {
            return "device_rebooted"
        }

        switch previousState {
        case SessionState.terminated: return "user_terminated"
        case SessionState.foreground: return "foreground_kill_suspected"
        case SessionState.background: return "background_kill_suspected"
        default: return nil
        }
    }

    // MARK: - Vòng đời ứng dụng
    private func registerLifecycleObservers() {
        let center = NotificationCenter.default
        center.addObserver(self, selector: #selector(handleDidBecomeActive), name: UIApplication.didBecomeActiveNotification, object: nil)
        center.addObserver(self, selector: #selector(handleWillResignActive), name: UIApplication.willResignActiveNotification, object: nil)
        center.addObserver(self, selector: #selector(handleDidEnterBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
        center.addObserver(self, selector: #selector(handleWillTerminate), name: UIApplication.willTerminateNotification, object: nil)
    }

    @objc private func handleDidBecomeActive() {
        updateAppState("active", persistedAs: SessionState.foreground)
    }

    @objc private func handleWillResignActive() {
        updateAppState("inactive", persistedAs: nil)
    }

    @objc private func handleDidEnterBackground() {
        updateAppState("background", persistedAs: SessionState.background)
    }

    @objc private func handleWillTerminate() {
        updateAppState("terminated", persistedAs: SessionState.terminated)
    }

    private func updateAppState(_ state: String, persistedAs sessionState: String?) {
        lock.lock()
        appState = state
        lock.unlock()
        if let sessionState = sessionState {
            persistSessionState(sessionState)
        }
    }

    private func persistSessionState(_ state: String) {
        defaults.set(state, forKey: DefaultsKey.sessionState)
    }

    // MARK: - Ghi nhận kết quả gửi ping
    func recordPingSuccess(statusCode: Int) {
        lock.lock()
        defer { lock.unlock() }
        lastPingHttpStatus = statusCode
        consecutiveFailures = 0
        lastFailureReason = nil
    }

    func recordPingFailure(statusCode: Int?, error: Error?) {
        lock.lock()
        defer { lock.unlock() }
        lastPingHttpStatus = statusCode
        consecutiveFailures += 1
        lastFailureReason = Self.failureReason(statusCode: statusCode, error: error)
    }

    func recordTokenRefreshFailure() {
        lock.lock()
        defer { lock.unlock() }
        lastFailureReason = "refresh_failed"
    }

    private static func failureReason(statusCode: Int?, error: Error?) -> String {
        if let statusCode = statusCode {
            return "http_\(statusCode)"
        }
        guard let urlError = error as? URLError else { return "network_error" }
        switch urlError.code {
        case .timedOut:
            return "timeout"
        case .notConnectedToInternet, .networkConnectionLost, .dataNotAllowed, .internationalRoamingOff:
            return "no_network"
        case .cannotFindHost, .dnsLookupFailed:
            return "dns"
        case .cannotConnectToHost:
            return "connect_failed"
        case .secureConnectionFailed, .serverCertificateUntrusted, .serverCertificateHasBadDate, .serverCertificateHasUnknownRoot:
            return "tls"
        default:
            return "network_error"
        }
    }

    // MARK: - Ghi nhận luồng vị trí
    /// - Parameter isFiltered: điểm bị bỏ qua (quá cũ / sai số lớn) nên không dùng để gửi ping
    func recordLocationUpdate(isFiltered: Bool) {
        lock.lock()
        defer { lock.unlock() }
        receivedLocationCount += 1
        if isFiltered {
            filteredLocationCount += 1
        } else {
            // Đã nhận lại điểm hợp lệ: lỗi CoreLocation trước đó chỉ là tạm thời, không còn cần cảnh báo
            lastLocationErrorCode = nil
        }
        lastLocationAt = Date()
    }

    func recordLocationError(_ error: Error) {
        lock.lock()
        defer { lock.unlock() }
        lastLocationErrorCode = (error as NSError).code
    }

    // MARK: - Snapshot gửi kèm ping
    /// Dựng bản chẩn đoán (camelCase, khớp schema DeviceDiagnostics của Backend). Chỉ chứa giá trị không nil.
    func snapshot(locationManager: CLLocationManager?) -> [String: Any] {
        return Self.runOnMainThread { self.buildSnapshot(locationManager: locationManager) }
    }

    private func buildSnapshot(locationManager: CLLocationManager?) -> [String: Any] {
        let manager = locationManager ?? CLLocationManager()
        var info: [String: Any] = [
            "appVersion": Self.appVersion,
            "appBuild": Self.appBuild,
            "osVersion": UIDevice.current.systemVersion,
            "deviceModel": Self.deviceModel,
            "launchId": launchId,
            "authorizationStatus": Self.authorizationStatusName(manager.authorizationStatus),
            "isPreciseLocation": manager.accuracyAuthorization == .fullAccuracy,
            "isLowPowerMode": ProcessInfo.processInfo.isLowPowerModeEnabled,
            "backgroundRefreshStatus": Self.backgroundRefreshStatusName()
        ]

        lock.lock()
        info["launchReason"] = launchReason
        info["appState"] = appState
        info["consecutiveFailures"] = consecutiveFailures
        info["receivedLocationCount"] = receivedLocationCount
        info["filteredLocationCount"] = filteredLocationCount
        if let previousExit = previousExit { info["previousExit"] = previousExit }
        if let lastPingHttpStatus = lastPingHttpStatus { info["lastPingHttpStatus"] = lastPingHttpStatus }
        if let lastFailureReason = lastFailureReason { info["lastFailureReason"] = lastFailureReason }
        if let lastLocationErrorCode = lastLocationErrorCode { info["lastLocationErrorCode"] = lastLocationErrorCode }
        if let lastLocationAt = lastLocationAt {
            info["lastLocationAgeSec"] = max(0.0, Date().timeIntervalSince(lastLocationAt))
        }
        lock.unlock()

        let exitMetrics = storedExitMetrics()
        if !exitMetrics.isEmpty { info["exitMetrics"] = exitMetrics }
        return info
    }

    // MARK: - MetricKit
    private func registerMetricKit() {
        let manager = MXMetricManager.shared
        manager.add(self)
        // Nạp ngay các báo cáo đã có trong 24 giờ qua, không cần chờ lần gửi kế tiếp của iOS
        storeExitMetrics(from: manager.pastPayloads)
        storeCrashCount(from: manager.pastDiagnosticPayloads)
    }

    private func storeExitMetrics(from payloads: [MXMetricPayload]) {
        var totals = [String: Int]()
        for payload in payloads {
            guard let exitMetric = payload.applicationExitMetrics else { continue }
            for (key, count) in Self.exitCounts(from: exitMetric) {
                totals[key, default: 0] += count
            }
        }
        guard !totals.isEmpty else { return }

        lock.lock()
        var merged = storedExitMetrics().filter { $0.key == "crash_diagnostics" }
        for (key, count) in totals where count > 0 {
            merged[key] = count
        }
        defaults.set(merged, forKey: DefaultsKey.exitMetrics)
        lock.unlock()
    }

    private func storeCrashCount(from payloads: [MXDiagnosticPayload]) {
        let crashCount = payloads.reduce(0) { $0 + ($1.crashDiagnostics?.count ?? 0) }
        guard crashCount > 0 else { return }

        lock.lock()
        var merged = storedExitMetrics()
        merged["crash_diagnostics"] = crashCount
        defaults.set(merged, forKey: DefaultsKey.exitMetrics)
        lock.unlock()
    }

    private func storedExitMetrics() -> [String: Int] {
        return defaults.dictionary(forKey: DefaultsKey.exitMetrics) as? [String: Int] ?? [:]
    }

    private static func exitCounts(from exitMetric: MXAppExitMetric) -> [String: Int] {
        let background = exitMetric.backgroundExitData
        let foreground = exitMetric.foregroundExitData
        return [
            "bg_normal": background.cumulativeNormalAppExitCount,
            "bg_memory_limit": background.cumulativeMemoryResourceLimitExitCount,
            "bg_memory_pressure": background.cumulativeMemoryPressureExitCount,
            "bg_cpu_limit": background.cumulativeCPUResourceLimitExitCount,
            "bg_watchdog": background.cumulativeAppWatchdogExitCount,
            "bg_bad_access": background.cumulativeBadAccessExitCount,
            "bg_abnormal": background.cumulativeAbnormalExitCount,
            "bg_illegal_instruction": background.cumulativeIllegalInstructionExitCount,
            "bg_locked_file": background.cumulativeSuspendedWithLockedFileExitCount,
            "bg_task_timeout": background.cumulativeBackgroundTaskAssertionTimeoutExitCount,
            "fg_normal": foreground.cumulativeNormalAppExitCount,
            "fg_memory_limit": foreground.cumulativeMemoryResourceLimitExitCount,
            "fg_watchdog": foreground.cumulativeAppWatchdogExitCount,
            "fg_bad_access": foreground.cumulativeBadAccessExitCount,
            "fg_abnormal": foreground.cumulativeAbnormalExitCount,
            "fg_illegal_instruction": foreground.cumulativeIllegalInstructionExitCount
        ]
    }

    // MARK: - Helpers đọc thông tin hệ thống
    private static func runOnMainThread<T>(_ work: () -> T) -> T {
        if Thread.isMainThread {
            return work()
        }
        return DispatchQueue.main.sync(execute: work)
    }

    private static func currentApplicationStateName() -> String {
        switch UIApplication.shared.applicationState {
        case .active: return "active"
        case .background: return "background"
        default: return "inactive"
        }
    }

    private static func authorizationStatusName(_ status: CLAuthorizationStatus) -> String {
        switch status {
        case .authorizedAlways: return "always"
        case .authorizedWhenInUse: return "when_in_use"
        case .denied: return "denied"
        case .restricted: return "restricted"
        case .notDetermined: return "not_determined"
        @unknown default: return "unknown"
        }
    }

    private static func backgroundRefreshStatusName() -> String {
        switch UIApplication.shared.backgroundRefreshStatus {
        case .available: return "available"
        case .denied: return "denied"
        case .restricted: return "restricted"
        @unknown default: return "unknown"
        }
    }

    private static var appVersion: String {
        return Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "unknown"
    }

    private static var appBuild: String {
        return Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "unknown"
    }

    /// Khóa phiên bản app + hệ điều hành: đổi giá trị nghĩa là app hoặc iOS vừa được cập nhật
    private static var buildKey: String {
        return "\(appVersion)(\(appBuild))|\(UIDevice.current.systemVersion)"
    }

    private static var deviceModel: String {
        var systemInfo = utsname()
        uname(&systemInfo)
        return withUnsafeBytes(of: &systemInfo.machine) { rawBuffer in
            String(decoding: rawBuffer.prefix(while: { $0 != 0 }), as: UTF8.self)
        }
    }

    /// Thời điểm khởi động máy (epoch giây) lấy từ kernel, không bị lệch khi máy ngủ
    private static func systemBootTime() -> TimeInterval? {
        var mib = [CTL_KERN, KERN_BOOTTIME]
        var bootTime = timeval()
        var size = MemoryLayout<timeval>.stride
        guard sysctl(&mib, UInt32(mib.count), &bootTime, &size, nil, 0) == 0 else { return nil }
        return TimeInterval(bootTime.tv_sec)
    }
}

// MARK: - MXMetricManagerSubscriber
extension TrackingDiagnostics: MXMetricManagerSubscriber {
    func didReceive(_ payloads: [MXMetricPayload]) {
        storeExitMetrics(from: payloads)
    }

    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        storeCrashCount(from: payloads)
    }
}
