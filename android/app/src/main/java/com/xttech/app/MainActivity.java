package com.xttech.app;

import android.Manifest;
import android.app.AlertDialog;
import android.app.NotificationManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int REQ_PERMISSIONS = 1001;

    private static final String STATE_STARTUP_PERMISSION_PASS = "xttech_startup_permission_pass";
    private static final String STATE_PROMPTED_BASIC = "xttech_prompted_basic";
    private static final String STATE_PROMPTED_BATTERY = "xttech_prompted_battery";
    private static final String STATE_PROMPTED_BG_LOCATION = "xttech_prompted_bg_location";
    private static final String STATE_PROMPTED_AUTOSTART = "xttech_prompted_autostart";

    private boolean hasCompletedStartupPermissionPass = false;
    private boolean awaitingSettingsReturn = false;
    private boolean promptedBasicThisSession = false;
    private boolean promptedBatteryThisSession = false;
    private boolean promptedBgLocationThisSession = false;
    private boolean promptedAutoStartThisSession = false;
    private AlertDialog activePermissionDialog = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeTrackingPlugin.class);
        registerPlugin(AppUpdatePlugin.class);
        super.onCreate(savedInstanceState);

        if (savedInstanceState != null) {
            // Activity được OS tạo lại (vd low-RAM khi chụp ảnh Camera gốc): không bật lại popup quyền
            hasCompletedStartupPermissionPass = savedInstanceState.getBoolean(STATE_STARTUP_PERMISSION_PASS, true);
            promptedBasicThisSession = savedInstanceState.getBoolean(STATE_PROMPTED_BASIC, false);
            promptedBatteryThisSession = savedInstanceState.getBoolean(STATE_PROMPTED_BATTERY, false);
            promptedBgLocationThisSession = savedInstanceState.getBoolean(STATE_PROMPTED_BG_LOCATION, false);
            promptedAutoStartThisSession = savedInstanceState.getBoolean(STATE_PROMPTED_AUTOSTART, false);
        }

        // Đăng ký WebViewClient tùy biến để xử lý Auto-retry và Fallback màn hình mất mạng chuẩn UX
        if (getBridge() != null) {
            getBridge().setWebViewClient(new XtTechWebViewClient(getBridge()));
        }

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && getBridge() != null && getBridge().getWebView() != null) {
            cookieManager.setAcceptThirdPartyCookies(getBridge().getWebView(), true);
        }
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putBoolean(STATE_STARTUP_PERMISSION_PASS, hasCompletedStartupPermissionPass);
        outState.putBoolean(STATE_PROMPTED_BASIC, promptedBasicThisSession);
        outState.putBoolean(STATE_PROMPTED_BATTERY, promptedBatteryThisSession);
        outState.putBoolean(STATE_PROMPTED_BG_LOCATION, promptedBgLocationThisSession);
        outState.putBoolean(STATE_PROMPTED_AUTOSTART, promptedAutoStartThisSession);
    }

    /**
     * Tùy biến WebViewClient để tăng cường độ tin cậy kết nối mạng:
     * 1. Tự động retry ngầm 2 lần khi gặp lỗi DNS (ERR_NAME_NOT_RESOLVED) hoặc mất kết nối tạm thời.
     * 2. Chỉ chuyển sang trang offline.html khi đã retry thất bại.
     */
    private static class XtTechWebViewClient extends BridgeWebViewClient {
        private static final String CLIENT_TAG = "XtTechWebViewClient";
        private static final int MAX_RETRY = 2;
        private int retryCount = 0;
        private final Bridge bridge;
        private final Handler mainHandler = new Handler(Looper.getMainLooper());

        public XtTechWebViewClient(Bridge bridge) {
            super(bridge);
            this.bridge = bridge;
        }

        @Override
        public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            if (url != null && !url.contains("offline.html")) {
                retryCount = 0;
            }
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request != null && request.isForMainFrame()) {
                int errorCode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? error.getErrorCode() : 0;
                CharSequence description = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? error.getDescription() : "";
                Log.w(CLIENT_TAG, "Lỗi tải trang chính: code=" + errorCode + " (" + description + "), retry=" + retryCount);

                boolean isNetworkOrDnsError = (
                    errorCode == WebViewClient.ERROR_HOST_LOOKUP ||
                    errorCode == WebViewClient.ERROR_CONNECT ||
                    errorCode == WebViewClient.ERROR_TIMEOUT ||
                    errorCode == WebViewClient.ERROR_FAILED_SSL_HANDSHAKE
                );

                if (isNetworkOrDnsError && retryCount < MAX_RETRY) {
                    retryCount++;
                    Log.i(CLIENT_TAG, "Mạng/DNS chưa sẵn sàng. Tự động kết nối lại lần " + retryCount + " sau 2 giây...");
                    mainHandler.postDelayed(() -> {
                        if (view != null) {
                            view.reload();
                        }
                    }, 2000);
                    return;
                }

                // Đã hết số lần retry -> nạp trang errorPath kèm targetUrl chính xác để nút Thử lại reload đúng trang
                String errorPath = bridge != null ? bridge.getErrorUrl() : null;
                if (errorPath != null) {
                    String failedUrl = request.getUrl() != null ? request.getUrl().toString() : "";
                    String targetParam = failedUrl.isEmpty() ? "" : "?target=" + Uri.encode(failedUrl);
                    view.loadUrl(errorPath + targetParam);
                    return;
                }
            }

            super.onReceivedError(view, request, error);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            if (url != null && !url.contains("offline.html")) {
                retryCount = 0;
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        CookieManager.getInstance().flush();
        // Nhân viên mở lại app: xóa thông báo cảnh báo đóng app để quản lý biết đã online lại
        // (giống iOS AppClosedReminder.clear() trong NativeTrackingPlugin.load())
        clearAppClosedReminder();
        // Chỉ chạy wizard kiểm tra quyền lúc cold start hoặc khi vừa quay lại từ màn hình Cài đặt do chính wizard mở
        // (tránh bật popup đè lên khi vừa chụp ảnh Camera gốc hoặc từ NativeTracking.openLocationSettings quay lại)
        if (!hasCompletedStartupPermissionPass || awaitingSettingsReturn) {
            awaitingSettingsReturn = false;
            hasCompletedStartupPermissionPass = true;
            checkAndEnforcePermissions();
        }
    }

    /**
     * Xóa thông báo nhắc nhân viên mở lại app (pending + delivered).
     * Giống iOS: AppClosedReminder.clear() gọi removePendingNotificationRequests + removeDeliveredNotifications.
     */
    private void clearAppClosedReminder() {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(TrackingLocationService.NOTIFICATION_REMINDER_ID);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to clear app closed reminder notification", e);
        }
    }

    /**
     * Chu trình kiểm tra quyền tuần tự (tối đa 1 lần mỗi bước trong phiên để không làm gián đoạn chấm công/camera).
     */
    private void checkAndEnforcePermissions() {
        // Bước 1: Quyền Vị trí (Fine hoặc Coarse) và Thông báo cơ bản
        if (!hasBasicPermissions()) {
            if (!promptedBasicThisSession) {
                requestBasicPermissions();
                return;
            }
            if (!hasLocationPermission()) {
                return;
            }
        }

        // Bước 2: Bỏ qua tối ưu hóa Pin (Không bị ngắt ngầm)
        if (!isIgnoringBatteryOptimizations() && !promptedBatteryThisSession) {
            promptedBatteryThisSession = true;
            awaitingSettingsReturn = true;
            requestIgnoreBatteryOptimizations();
            return;
        }

        // Bước 3: Quyền Vị trí nền "Luôn cho phép" (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && !hasBackgroundLocationPermission() && !promptedBgLocationThisSession) {
            promptedBgLocationThisSession = true;
            enforceBackgroundLocationPermission();
            return;
        }

        // Bước 4: Bật Tự khởi chạy (Auto-start) trên các dòng máy đặc thù (Xiaomi, Oppo, Vivo, Samsung, Huawei)
        if (isSpecialManufacturer() && !isAutoStartConfigured() && !promptedAutoStartThisSession) {
            promptedAutoStartThisSession = true;
            enforceAutoStartPermission();
        }
    }

    private boolean hasLocationPermission() {
        boolean hasFine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasCoarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        return hasFine || hasCoarse;
    }

    private boolean hasNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    private boolean hasBasicPermissions() {
        return hasLocationPermission() && hasNotificationPermission();
    }

    private void requestBasicPermissions() {
        promptedBasicThisSession = true;
        List<String> permissions = new ArrayList<>();
        if (!hasLocationPermission()) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
            getSharedPreferences(TrackingLocationService.PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(NativeTrackingPlugin.KEY_HAS_REQUESTED_LOCATION_PERMISSION, true)
                .apply();
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotificationPermission()) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), REQ_PERMISSIONS);
        }
    }

    private boolean isIgnoringBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            return pm != null && pm.isIgnoringBatteryOptimizations(getPackageName());
        }
        return true;
    }

    private void requestIgnoreBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            } catch (Exception e) {
                awaitingSettingsReturn = false;
                Log.e(TAG, "Lỗi mở intent tối ưu pin", e);
            }
        }
    }

    private boolean hasBackgroundLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    private void enforceBackgroundLocationPermission() {
        AlertDialog dialog = new AlertDialog.Builder(this)
            .setTitle("Yêu cầu quyền Vị trí 'Luôn cho phép'")
            .setMessage("Ứng dụng cần quyền vị trí 'Luôn cho phép' để chấm công và giám sát lịch trình liên tục khi khóa màn hình.\n\nVui lòng bấm 'Đi tới cài đặt' -> Chọn mục Quyền -> Vị trí -> Chọn 'Luôn cho phép'.")
            .setCancelable(true)
            .setNegativeButton("Để sau", (d, which) -> d.dismiss())
            .setPositiveButton("Đi tới cài đặt", (d, which) -> {
                try {
                    awaitingSettingsReturn = true;
                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.fromParts("package", getPackageName(), null));
                    startActivity(intent);
                } catch (Exception e) {
                    awaitingSettingsReturn = false;
                    Log.e(TAG, "Lỗi mở app details", e);
                }
            })
            .create();
        showPermissionDialog(dialog);
    }

    private boolean isSpecialManufacturer() {
        String m = Build.MANUFACTURER != null ? Build.MANUFACTURER.toLowerCase() : "";
        return m.contains("xiaomi") || m.contains("redmi") || m.contains("poco") ||
               m.contains("oppo") || m.contains("realme") || m.contains("oneplus") ||
               m.contains("vivo") || m.contains("iqoo") ||
               m.contains("huawei") || m.contains("honor") ||
               m.contains("samsung");
    }

    private boolean isAutoStartConfigured() {
        SharedPreferences prefs = getSharedPreferences("app_permissions", Context.MODE_PRIVATE);
        return prefs.getBoolean("autostart_confirmed", false);
    }

    private void enforceAutoStartPermission() {
        String manufacturer = Build.MANUFACTURER != null ? Build.MANUFACTURER : "điện thoại";
        AlertDialog dialog = new AlertDialog.Builder(this)
            .setTitle("Yêu cầu Bật Tự khởi chạy")
            .setMessage("Thiết bị " + manufacturer + " có cơ chế tự đóng ứng dụng chạy ngầm.\n\nVui lòng bấm 'Mở cài đặt' và BẬT công tắc Tự khởi chạy (Auto-start) cho ứng dụng XT Tech.")
            .setCancelable(true)
            .setNegativeButton("Để sau", (d, which) -> d.dismiss())
            .setPositiveButton("Mở cài đặt", (d, which) -> {
                awaitingSettingsReturn = true;
                openAutoStartSettings();
            })
            .setNeutralButton("Tôi đã bật rồi", (d, which) -> {
                SharedPreferences prefs = getSharedPreferences("app_permissions", Context.MODE_PRIVATE);
                prefs.edit().putBoolean("autostart_confirmed", true).apply();
            })
            .create();
        showPermissionDialog(dialog);
    }

    private void showPermissionDialog(AlertDialog dialog) {
        if (isFinishing() || isDestroyed()) {
            return;
        }
        dismissActivePermissionDialog();
        activePermissionDialog = dialog;
        dialog.setOnDismissListener(d -> {
            if (activePermissionDialog == dialog) {
                activePermissionDialog = null;
            }
        });
        dialog.show();
    }

    private void dismissActivePermissionDialog() {
        if (activePermissionDialog != null) {
            try {
                if (activePermissionDialog.isShowing()) {
                    activePermissionDialog.dismiss();
                }
            } catch (Exception ignored) {}
            activePermissionDialog = null;
        }
    }

    private void openAutoStartSettings() {
        String manufacturer = Build.MANUFACTURER != null ? Build.MANUFACTURER.toLowerCase() : "";
        Intent intent = new Intent();
        try {
            if (manufacturer.contains("xiaomi") || manufacturer.contains("redmi") || manufacturer.contains("poco")) {
                intent.setComponent(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
            } else if (manufacturer.contains("oppo") || manufacturer.contains("realme") || manufacturer.contains("oneplus")) {
                intent.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"));
            } else if (manufacturer.contains("vivo") || manufacturer.contains("iqoo")) {
                intent.setComponent(new ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.PurviewTabActivity"));
            } else if (manufacturer.contains("huawei") || manufacturer.contains("honor")) {
                intent.setComponent(new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"));
            } else if (manufacturer.contains("samsung")) {
                intent.setComponent(new ComponentName("com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"));
            }
            startActivity(intent);
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                fallback.setData(Uri.fromParts("package", getPackageName(), null));
                startActivity(fallback);
            } catch (Exception inner) {
                awaitingSettingsReturn = false;
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_PERMISSIONS) {
            checkAndEnforcePermissions();
        }
    }


    @Override
    public void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    public void onStop() {
        super.onStop();
        CookieManager.getInstance().flush();
    }

    @Override
    public void onDestroy() {
        dismissActivePermissionDialog();
        super.onDestroy();
    }
}
