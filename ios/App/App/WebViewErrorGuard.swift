import UIKit
import WebKit

/// Proxy bọc `navigationDelegate` gốc của Capacitor để lọc lỗi tải trang chính.
///
/// Mặc định Capacitor iOS đẩy sang `errorPath` (offline.html) với MỌI lỗi điều hướng,
/// kể cả lỗi vặt như `NSURLErrorCancelled (-999)` hay `Frame load interrupted (102)` khi redirect.
/// Hệ quả: máy nào cũng bị đẩy sang trang "lỗi DNS" lúc mở app, web (chấm công / tracking) không chạy.
///
/// Hành vi tương đương `XtTechWebViewClient` bên Android:
/// 1. Bỏ qua lỗi vặt (điều hướng bị hủy / bị thay thế).
/// 2. Lỗi DNS / timeout / không kết nối được máy chủ: tự thử lại tối đa `maxRetryCount` lần.
/// 3. Hết lượt thử (hoặc lỗi không thể thử lại): nạp offline.html kèm `target`, `reason`, `code`.
/// Mọi callback khác được chuyển tiếp nguyên vẹn cho delegate gốc của Capacitor.
final class WebViewErrorGuard: NSObject, WKNavigationDelegate {
    private static let maxRetryCount = 2
    private static let retryDelay: TimeInterval = 2.0
    private static let webKitErrorDomain = "WebKitErrorDomain"
    private static let webKitFrameLoadInterruptedCode = 102

    private enum Reason {
        static let dns = "dns"
        static let noNetwork = "no_network"
        static let timeout = "timeout"
        static let connectFailed = "connect_failed"
        static let tls = "tls"
        static let unknown = "unknown"

        static let retryable: Set<String> = [dns, timeout, connectFailed]
    }

    private let original: WKNavigationDelegate
    private let serverURL: URL?
    private let errorPageURL: URL?
    private var retryCount = 0
    private var pendingRetry: DispatchWorkItem?

    init(original: WKNavigationDelegate, serverURL: URL?, errorPageURL: URL?) {
        self.original = original
        self.serverURL = serverURL
        self.errorPageURL = errorPageURL
        super.init()
    }

    // MARK: - Chuyển tiếp mọi callback không xử lý riêng sang delegate gốc
    override func responds(to aSelector: Selector!) -> Bool {
        return super.responds(to: aSelector) || original.responds(to: aSelector)
    }

    override func forwardingTarget(for aSelector: Selector!) -> Any? {
        return original.responds(to: aSelector) ? original : super.forwardingTarget(for: aSelector)
    }

    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        pendingRetry?.cancel()
        original.webView?(webView, didStartProvisionalNavigation: navigation)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        retryCount = 0
        original.webView?(webView, didFinish: navigation)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        handleFailure(of: webView, error: error as NSError)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        handleFailure(of: webView, error: error as NSError)
    }

    // MARK: - Xử lý lỗi
    private func handleFailure(of webView: WKWebView, error: NSError) {
        let failedURL = error.userInfo[NSURLErrorFailingURLErrorKey] as? URL ?? serverURL
        guard !isErrorPage(failedURL) else { return }

        // Lỗi vặt chỉ được bỏ qua khi webview đã có trang hiển thị; nếu chưa có thì sẽ thành màn trắng
        if isNegligible(error) {
            guard webView.url == nil else { return }
            showErrorPage(in: webView, failedURL: serverURL, reason: Reason.unknown, code: error.code)
            return
        }

        let reason = Self.reason(for: error)
        if Reason.retryable.contains(reason), retryCount < Self.maxRetryCount, let url = failedURL {
            scheduleRetry(of: url, in: webView)
            return
        }
        showErrorPage(in: webView, failedURL: failedURL, reason: reason, code: error.code)
    }

    private func scheduleRetry(of url: URL, in webView: WKWebView) {
        retryCount += 1
        let workItem = DispatchWorkItem { [weak webView] in
            webView?.load(URLRequest(url: url))
        }
        pendingRetry = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.retryDelay, execute: workItem)
    }

    private func showErrorPage(in webView: WKWebView, failedURL: URL?, reason: String, code: Int) {
        guard let errorPageURL = errorPageURL,
              var components = URLComponents(url: errorPageURL, resolvingAgainstBaseURL: false) else { return }

        var queryItems = [URLQueryItem(name: "reason", value: reason), URLQueryItem(name: "code", value: String(code))]
        if let failedURL = failedURL {
            queryItems.append(URLQueryItem(name: "target", value: failedURL.absoluteString))
        }
        components.queryItems = queryItems
        webView.load(URLRequest(url: components.url ?? errorPageURL))
    }

    /// Lỗi vặt: điều hướng bị hủy / bị thay thế bởi điều hướng khác (không phải lỗi mạng thật)
    private func isNegligible(_ error: NSError) -> Bool {
        if error.domain == NSURLErrorDomain && error.code == NSURLErrorCancelled { return true }
        return error.domain == Self.webKitErrorDomain && error.code == Self.webKitFrameLoadInterruptedCode
    }

    private func isErrorPage(_ url: URL?) -> Bool {
        guard let url = url, let errorPageURL = errorPageURL else { return false }
        return url.path == errorPageURL.path
    }

    /// Chuẩn hóa mã lỗi hệ thống thành mã định danh tiếng Anh; trang offline.html chịu trách nhiệm dịch sang tiếng Việt
    private static func reason(for error: NSError) -> String {
        guard error.domain == NSURLErrorDomain else { return Reason.unknown }
        switch error.code {
        case NSURLErrorCannotFindHost, NSURLErrorDNSLookupFailed:
            return Reason.dns
        case NSURLErrorNotConnectedToInternet, NSURLErrorDataNotAllowed, NSURLErrorInternationalRoamingOff:
            return Reason.noNetwork
        case NSURLErrorTimedOut:
            return Reason.timeout
        case NSURLErrorCannotConnectToHost, NSURLErrorNetworkConnectionLost:
            return Reason.connectFailed
        case NSURLErrorSecureConnectionFailed, NSURLErrorServerCertificateUntrusted,
             NSURLErrorServerCertificateHasBadDate, NSURLErrorServerCertificateHasUnknownRoot:
            return Reason.tls
        default:
            return Reason.unknown
        }
    }
}
