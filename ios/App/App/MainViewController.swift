import UIKit
import WebKit
import Capacitor

/// Capacitor 6+ không còn tự quét plugin nội bộ của app (chỉ đọc `packageClassList` của plugin npm).
/// Plugin viết trực tiếp trong app phải được đăng ký thủ công tại đây, nếu không JS sẽ báo "not implemented on ios".
class MainViewController: CAPBridgeViewController {
    /// Giữ tham chiếu mạnh: `WKWebView.navigationDelegate` chỉ là weak
    private var webViewErrorGuard: WebViewErrorGuard?

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeTrackingPlugin())
        installWebViewErrorGuard()
    }

    /// Thay delegate điều hướng của Capacitor bằng proxy có lọc lỗi (xem `WebViewErrorGuard`)
    private func installWebViewErrorGuard() {
        guard let webView = webView,
              let capacitorDelegate = webView.navigationDelegate,
              let config = bridge?.config else { return }

        let errorGuard = WebViewErrorGuard(
            original: capacitorDelegate,
            serverURL: config.serverURL,
            errorPageURL: config.errorPathURL
        )
        webViewErrorGuard = errorGuard
        webView.navigationDelegate = errorGuard
    }
}
