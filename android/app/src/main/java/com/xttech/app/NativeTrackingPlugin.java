package com.xttech.app;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeTracking")
public class NativeTrackingPlugin extends Plugin {
    private static final String TAG = "NativeTrackingPlugin";

    @PluginMethod
    public void startTracking(PluginCall call) {
        String token = call.getString("token", "");
        String refreshToken = call.getString("refreshToken", "");
        String apiUrl = call.getString("apiUrl", "");

        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            Intent intent = new Intent(context, TrackingLocationService.class);
            intent.setAction(TrackingLocationService.ACTION_START);
            intent.putExtra(TrackingLocationService.KEY_TOKEN, token);
            intent.putExtra(TrackingLocationService.KEY_REFRESH_TOKEN, refreshToken);
            intent.putExtra(TrackingLocationService.KEY_API_URL, apiUrl);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }

            Log.i(TAG, "NativeTracking startTracking called successfully.");
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start TrackingLocationService", e);
            call.reject("Failed to start tracking service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateToken(PluginCall call) {
        String token = call.getString("token", "");
        String refreshToken = call.getString("refreshToken", "");

        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            Intent intent = new Intent(context, TrackingLocationService.class);
            intent.setAction(TrackingLocationService.ACTION_UPDATE_TOKEN);
            if (!token.isEmpty()) intent.putExtra(TrackingLocationService.KEY_TOKEN, token);
            if (!refreshToken.isEmpty()) intent.putExtra(TrackingLocationService.KEY_REFRESH_TOKEN, refreshToken);
            context.startService(intent);

            Log.i(TAG, "NativeTracking updateToken called successfully.");
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to update token for TrackingLocationService", e);
            call.reject("Failed to update token: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopTracking(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            Intent intent = new Intent(context, TrackingLocationService.class);
            intent.setAction(TrackingLocationService.ACTION_STOP);
            context.startService(intent);

            Log.i(TAG, "NativeTracking stopTracking called successfully.");
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop TrackingLocationService", e);
            call.reject("Failed to stop tracking service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void checkAndroidPermissions(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        JSObject ret = new JSObject();
        String packageName = context.getPackageName();

        // 1. Kiểm tra miễn trừ tối ưu hóa pin (Doze mode)
        boolean isIgnoringBattery = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                isIgnoringBattery = pm.isIgnoringBatteryOptimizations(packageName);
            }
        }
        ret.put("isIgnoringBatteryOptimizations", isIgnoringBattery);

        // 2. Kiểm tra quyền vị trí chính xác
        boolean hasFineLocation = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        ret.put("hasFineLocation", hasFineLocation);

        // 3. Kiểm tra quyền vị trí chạy ngầm (Android 10+)
        boolean hasBackgroundLocation = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            hasBackgroundLocation = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED;
        }
        ret.put("hasBackgroundLocation", hasBackgroundLocation);

        // 4. Trả về tên hãng thiết bị (để UI đưa ra gợi ý phù hợp)
        ret.put("manufacturer", Build.MANUFACTURER != null ? Build.MANUFACTURER : "unknown");

        call.resolve(ret);
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimization(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                String packageName = context.getPackageName();
                if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + packageName));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                }
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to request ignore battery optimizations", e);
            call.reject("Failed to request battery optimization: " + e.getMessage());
        }
    }

    @PluginMethod
    public void requestBackgroundLocation(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.fromParts("package", context.getPackageName(), null));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to open application details settings", e);
            call.reject("Failed to open settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openAutoStartSettings(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        String manufacturer = Build.MANUFACTURER != null ? Build.MANUFACTURER.toLowerCase() : "";
        Intent intent = new Intent();
        boolean customIntentFound = false;

        try {
            if (manufacturer.contains("xiaomi") || manufacturer.contains("redmi")) {
                intent.setComponent(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
                customIntentFound = true;
            } else if (manufacturer.contains("oppo") || manufacturer.contains("realme")) {
                intent.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"));
                customIntentFound = true;
            } else if (manufacturer.contains("vivo")) {
                intent.setComponent(new ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.PurviewTabActivity"));
                customIntentFound = true;
            } else if (manufacturer.contains("huawei") || manufacturer.contains("honor")) {
                intent.setComponent(new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"));
                customIntentFound = true;
            } else if (manufacturer.contains("samsung")) {
                intent.setComponent(new ComponentName("com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"));
                customIntentFound = true;
            }
        } catch (Exception ignored) {}

        try {
            if (!customIntentFound || context.getPackageManager().resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) == null) {
                // Fallback nếu máy không hỗ trợ màn hình riêng của hãng
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.fromParts("package", context.getPackageName(), null));
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("manufacturer", manufacturer);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to open auto start settings", e);
            call.reject("Failed to open auto-start settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        requestBackgroundLocation(call);
    }
}
