package com.xttech.app;

import android.Manifest;
import android.app.AlertDialog;
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
import android.webkit.CookieManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int REQ_PERMISSIONS = 1001;
    private static final int REQ_BACKGROUND_LOCATION = 1002;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeTrackingPlugin.class);
        registerPlugin(AppUpdatePlugin.class);
        super.onCreate(savedInstanceState);
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && getBridge() != null && getBridge().getWebView() != null) {
            cookieManager.setAcceptThirdPartyCookies(getBridge().getWebView(), true);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        CookieManager.getInstance().flush();
        // Mỗi lần người dùng mở app hoặc từ Cài đặt quay trở lại, quét kiểm tra toàn bộ quyền
        checkAndEnforcePermissions();
    }

    /**
     * Chu trình kiểm tra quyền tuần tự: Phải hoàn thành từng bước mới cho đi tiếp.
     */
    private void checkAndEnforcePermissions() {
        // Bước 1: Quyền Vị trí (GPS) và Thông báo cơ bản
        if (!hasBasicPermissions()) {
            requestBasicPermissions();
            return;
        }

        // Bước 2: Bỏ qua tối ưu hóa Pin (Không bị ngắt ngầm)
        if (!isIgnoringBatteryOptimizations()) {
            requestIgnoreBatteryOptimizations();
            return;
        }

        // Bước 3: Quyền Vị trí nền "Luôn cho phép" (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && !hasBackgroundLocationPermission()) {
            enforceBackgroundLocationPermission();
            return;
        }

        // Bước 4: Bật Tự khởi chạy (Auto-start) trên các dòng máy đặc thù (Xiaomi, Oppo, Vivo, Samsung, Huawei)
        if (isSpecialManufacturer() && !isAutoStartConfigured()) {
            enforceAutoStartPermission();
        }
    }

    private boolean hasBasicPermissions() {
        boolean hasLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasNotification = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            hasNotification = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return hasLocation && hasNotification;
    }

    private void requestBasicPermissions() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
        ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), REQ_PERMISSIONS);
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
        new AlertDialog.Builder(this)
            .setTitle("Yêu cầu quyền Vị trí 'Luôn cho phép'")
            .setMessage("Ứng dụng cần quyền vị trí 'Luôn cho phép' để chấm công và giám sát lịch trình liên tục khi khóa màn hình.\n\nVui lòng bấm 'Đi tới cài đặt' -> Chọn mục Quyền -> Vị trí -> Chọn 'Luôn cho phép'.")
            .setCancelable(false)
            .setPositiveButton("Đi tới cài đặt", (dialog, which) -> {
                try {
                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.fromParts("package", getPackageName(), null));
                    startActivity(intent);
                } catch (Exception e) {
                    Log.e(TAG, "Lỗi mở app details", e);
                }
            })
            .show();
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
        new AlertDialog.Builder(this)
            .setTitle("Yêu cầu Bật Tự khởi chạy")
            .setMessage("Thiết bị " + manufacturer + " có cơ chế tự đóng ứng dụng chạy ngầm.\n\nVui lòng bấm 'Mở cài đặt' và BẬT công tắc Tự khởi chạy (Auto-start) cho ứng dụng XT Tech.")
            .setCancelable(false)
            .setPositiveButton("Mở cài đặt", (dialog, which) -> {
                openAutoStartSettings();
            })
            .setNeutralButton("Tôi đã bật rồi", (dialog, which) -> {
                SharedPreferences prefs = getSharedPreferences("app_permissions", Context.MODE_PRIVATE);
                prefs.edit().putBoolean("autostart_confirmed", true).apply();
            })
            .show();
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
            } catch (Exception ignored) {}
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
}
