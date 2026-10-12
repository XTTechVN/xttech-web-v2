import UIKit
import Capacitor

/// Capacitor 6+ không còn tự quét plugin nội bộ của app (chỉ đọc `packageClassList` của plugin npm).
/// Plugin viết trực tiếp trong app phải được đăng ký thủ công tại đây, nếu không JS sẽ báo "not implemented on ios".
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeTrackingPlugin())
    }
}
