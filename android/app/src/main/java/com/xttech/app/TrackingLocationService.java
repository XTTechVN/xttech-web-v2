package com.xttech.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.os.SystemClock;
import android.util.Log;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

public class TrackingLocationService extends Service implements LocationListener {
    private static final String TAG = "TrackingLocService";

    // ===================== Tracking Notification =====================
    public static final String CHANNEL_ID = "xttech_tracking_channel";
    public static final int NOTIFICATION_ID = 1998;

    // ===================== AppClosed Reminder Notification =====================
    // Nhắc nhân viên mở lại app khi lỡ vuốt tắt trong ca làm việc (giống iOS AppClosedReminder)
    private static final String CHANNEL_REMINDER_ID  = "xttech_app_closed_reminder";
    private static final int    NOTIFICATION_REMINDER_ID = 1999;

    // ===================== Actions =====================
    public static final String ACTION_START         = "com.xttech.app.ACTION_START_TRACKING";
    public static final String ACTION_STOP          = "com.xttech.app.ACTION_STOP_TRACKING";
    public static final String ACTION_UPDATE_TOKEN  = "com.xttech.app.ACTION_UPDATE_TOKEN";
    private static final String ACTION_HEARTBEAT_ALARM = "com.xttech.app.ACTION_HEARTBEAT_ALARM";

    // ===================== EventType (đồng bộ với Backend enum eventType) =====================
    private static final String EVENT_TYPE_LOCATION   = "location";
    private static final String EVENT_TYPE_APP_CLOSED = "app_closed";

    // ===================== Timing Constants =====================
    // Nhịp kiểm tra heartbeat (Doze có thể giãn tối đa ~9 phút, vẫn dưới ngưỡng offline 15 phút của Backend)
    private static final long HEARTBEAT_CHECK_INTERVAL_MS = 60_000L;
    // Chỉ gửi heartbeat khi đã quá 3 phút không có ping nào
    private static final long HEARTBEAT_PING_INTERVAL_MS  = 180_000L;
    // Giữ CPU thức đủ lâu để luồng mạng kịp nhận việc sau khi Alarm đánh thức thiết bị
    private static final long HEARTBEAT_WAKELOCK_TIMEOUT_MS = 20_000L;
    // Vị trí cache khi khởi động: chỉ nhận nếu mới trong 60 giây (tránh điểm cũ sai lệch)
    private static final long STARTUP_CACHE_MAX_AGE_MS    = 60_000L;
    // Vị trí cache cho heartbeat khi chưa từng có fix (trong nhà mất GPS): nới rộng 10 phút
    private static final long HEARTBEAT_CACHE_MAX_AGE_MS  = 600_000L;
    // Timeout tối đa cho app_closed ping trước khi onTaskRemoved() return (~5 giây)
    private static final long APP_CLOSED_PING_TIMEOUT_MS  = 5_000L;

    // ===================== SharedPreferences Keys =====================
    public static final String PREFS_NAME        = "xttech_native_tracking_prefs";
    public static final String KEY_TOKEN         = "access_token";
    public static final String KEY_REFRESH_TOKEN = "refresh_token";
    public static final String KEY_API_URL       = "api_url";

    // ===================== Diagnostics Keys (camelCase - khớp schema DeviceDiagnostics Backend) =====================
    private static final String DIAG_KEY_SESSION_STATE = "xttech_diag_session_state";
    private static final String DIAG_KEY_BUILD_KEY     = "xttech_diag_build_key";
    private static final String DIAG_KEY_BOOT_TIME     = "xttech_diag_boot_time";
    private static final String DIAG_SESSION_FOREGROUND  = "foreground";
    private static final String DIAG_SESSION_BACKGROUND  = "background";
    private static final String DIAG_SESSION_TERMINATED  = "terminated";
    // Sai lệch tối đa (ms) khi so sánh thời điểm khởi động máy giữa hai lần chạy
    private static final long DIAG_BOOT_TOLERANCE_MS = 60_000L;

    // ===================== State =====================
    private LocationManager locationManager;
    private AlarmManager alarmManager;
    private boolean isHeartbeatReceiverRegistered = false;
    private final java.util.concurrent.ExecutorService networkExecutor = Executors.newSingleThreadExecutor();

    // Ghi từ luồng mạng, đọc từ luồng main (Alarm) -> volatile để luôn thấy giá trị mới nhất
    private volatile long lastPingTime = 0;
    private Location lastLocation = null;
    private boolean isTracking = false;

    // ===================== Diagnostics State (đọc/ghi trên luồng chính) =====================
    private String diagPreviousExit = null;
    private String diagLaunchReason = "user_or_other";
    private String diagAppState     = "active";   // active | background | terminated
    private int    diagConsecutiveFailures = 0;
    private String diagLastFailureReason  = null;
    private int    diagLastPingHttpStatus  = -1;
    private int    diagReceivedLocationCount  = 0;
    private int    diagFilteredLocationCount  = 0;
    private long   diagLastLocationAt         = 0;
    private int    diagLastLocationErrorCode  = -1;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        createNotificationChannel();
        createReminderNotificationChannel();
        initDiagnostics();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopTracking();
                return START_NOT_STICKY;
            } else if (ACTION_UPDATE_TOKEN.equals(action)) {
                String token       = intent.getStringExtra(KEY_TOKEN);
                String refreshToken = intent.getStringExtra(KEY_REFRESH_TOKEN);
                if (token != null || refreshToken != null) {
                    SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                    SharedPreferences.Editor editor = prefs.edit();
                    if (token != null) editor.putString(KEY_TOKEN, token);
                    if (refreshToken != null) editor.putString(KEY_REFRESH_TOKEN, refreshToken);
                    editor.apply();
                    Log.i(TAG, "Native tokens updated via ACTION_UPDATE_TOKEN");
                }
                return START_STICKY;
            } else if (ACTION_START.equals(action)) {
                String token        = intent.getStringExtra(KEY_TOKEN);
                String refreshToken = intent.getStringExtra(KEY_REFRESH_TOKEN);
                String apiUrl       = intent.getStringExtra(KEY_API_URL);
                if (token != null || refreshToken != null || apiUrl != null) {
                    SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                    SharedPreferences.Editor editor = prefs.edit();
                    if (token != null) editor.putString(KEY_TOKEN, token);
                    if (refreshToken != null) editor.putString(KEY_REFRESH_TOKEN, refreshToken);
                    if (apiUrl != null) editor.putString(KEY_API_URL, apiUrl);
                    editor.apply();
                }
            }
        }

        try {
            boolean fineLoc   = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
            boolean coarseLoc = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && (fineLoc || coarseLoc)) {
                startForeground(NOTIFICATION_ID, buildNotification(), android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            } else {
                startForeground(NOTIFICATION_ID, buildNotification());
            }
            startTracking();
        } catch (SecurityException se) {
            Log.e(TAG, "SecurityException starting foreground service (location permission not granted yet)", se);
        } catch (Exception e) {
            Log.e(TAG, "Exception starting foreground service", e);
        }

        // START_STICKY yêu cầu Android OS tự khởi động lại Service nếu bị hệ điều hành tắt tạm thời
        return START_STICKY;
    }

    private void startTracking() {
        if (isTracking) return;
        isTracking = true;
        persistDiagSessionState(DIAG_SESSION_FOREGROUND);

        requestLocationUpdates();
        startHeartbeatAlarm();
        Log.i(TAG, "Native Tracking Service started successfully.");
    }

    private void stopTracking() {
        isTracking = false;
        persistDiagSessionState(DIAG_SESSION_TERMINATED);
        if (locationManager != null) {
            try {
                locationManager.removeUpdates(this);
            } catch (Exception e) {
                Log.e(TAG, "Error removing location updates", e);
            }
        }

        stopHeartbeatAlarm();

        stopForeground(true);
        stopSelf();
        Log.i(TAG, "Native Tracking Service stopped.");
    }

    private void requestLocationUpdates() {
        if (locationManager == null) return;

        boolean fineLocGranted   = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean coarseLocGranted = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

        if (!fineLocGranted && !coarseLocGranted) {
            Log.w(TAG, "Location permission not granted for native service");
            return;
        }

        try {
            // 1. Đăng ký GPS Provider (3s / 5m) cho độ chính xác cao ngoài trời
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        3000, // 3 giây khi di chuyển
                        5.0f, // 5 mét
                        this
                );
                Log.i(TAG, "Registered GPS_PROVIDER for high-accuracy tracking.");
            }

            // 2. Đăng ký song song NETWORK_PROVIDER (10s / 10m) làm dự phòng cho trong nhà / văn phòng
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        10000,
                        10.0f,
                        this
                );
                Log.i(TAG, "Registered NETWORK_PROVIDER for indoor/office fallback.");
            }

            // 3. Lấy vị trí gần nhất ngay khi khởi động (CHỈ chấp nhận nếu mới trong vòng 60 giây)
            Location lastKnown = getFreshLastKnownLocation(STARTUP_CACHE_MAX_AGE_MS);
            if (lastKnown != null) {
                onLocationChanged(lastKnown);
            }
        } catch (SecurityException se) {
            Log.e(TAG, "SecurityException requesting location updates", se);
        } catch (Exception e) {
            Log.e(TAG, "Exception requesting location updates", e);
        }
    }

    /**
     * Lấy vị trí cache gần nhất của hệ thống (ưu tiên GPS, sau đó Network).
     * Chỉ trả về nếu đủ mới (<= maxAgeMs) và đủ chính xác, ngược lại trả về null.
     */
    @Nullable
    private Location getFreshLastKnownLocation(long maxAgeMs) {
        if (locationManager == null) return null;
        try {
            Location lastKnown = null;
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                lastKnown = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            }
            if (lastKnown == null && locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                lastKnown = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }
            if (lastKnown == null) return null;

            long cacheAgeMs = System.currentTimeMillis() - lastKnown.getTime();
            // Triệt tiêu Stale Cache: điểm cache quá cũ -> bỏ qua hoàn toàn
            if (cacheAgeMs < 0 || cacheAgeMs > maxAgeMs) {
                Log.i(TAG, "Ignoring stale lastKnown location (age: " + (cacheAgeMs / 1000) + "s)");
                return null;
            }

            float speed  = lastKnown.hasSpeed() ? lastKnown.getSpeed() : 0.0f;
            float maxAcc = speed >= 1.0f ? 70.0f : 80.0f;
            if (lastKnown.hasAccuracy() && lastKnown.getAccuracy() > maxAcc) return null;
            return lastKnown;
        } catch (SecurityException se) {
            Log.e(TAG, "SecurityException reading lastKnown location", se);
            return null;
        }
    }

    // ===================== HEARTBEAT (AlarmManager) =====================
    // Không dùng ScheduledExecutorService: executor KHÔNG giữ CPU thức, khi tắt màn hình CPU ngủ sâu
    // thì đồng hồ executor cũng dừng -> thiết bị đứng yên không gửi được heartbeat -> Admin thấy "Ngoại tuyến".
    // AlarmManager.setAndAllowWhileIdle đánh thức CPU (kể cả trong Doze) và không cần quyền SCHEDULE_EXACT_ALARM.

    private final BroadcastReceiver heartbeatReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (!ACTION_HEARTBEAT_ALARM.equals(intent.getAction())) return;
            acquireHeartbeatWakeLock();
            scheduleNextHeartbeat();
            runHeartbeatCheck();
        }
    };

    private void startHeartbeatAlarm() {
        if (!isHeartbeatReceiverRegistered) {
            ContextCompat.registerReceiver(
                    this,
                    heartbeatReceiver,
                    new IntentFilter(ACTION_HEARTBEAT_ALARM),
                    ContextCompat.RECEIVER_NOT_EXPORTED
            );
            isHeartbeatReceiverRegistered = true;
        }
        scheduleNextHeartbeat();
    }

    private void stopHeartbeatAlarm() {
        if (alarmManager != null) {
            alarmManager.cancel(buildHeartbeatPendingIntent());
        }
        if (!isHeartbeatReceiverRegistered) return;
        try {
            unregisterReceiver(heartbeatReceiver);
        } catch (IllegalArgumentException ignored) {
            // Receiver đã được gỡ trước đó
        }
        isHeartbeatReceiverRegistered = false;
    }

    private void scheduleNextHeartbeat() {
        if (alarmManager == null || !isTracking) return;
        long triggerAt = SystemClock.elapsedRealtime() + HEARTBEAT_CHECK_INTERVAL_MS;
        alarmManager.setAndAllowWhileIdle(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                triggerAt,
                buildHeartbeatPendingIntent()
        );
    }

    private PendingIntent buildHeartbeatPendingIntent() {
        Intent intent = new Intent(ACTION_HEARTBEAT_ALARM).setPackage(getPackageName());
        return PendingIntent.getBroadcast(
                this,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    /** Alarm chỉ giữ CPU thức trong onReceive -> tự giữ thêm để luồng mạng kịp xử lý (tự nhả theo timeout) */
    private void acquireHeartbeatWakeLock() {
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager == null) return;
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK, "XTTech::HeartbeatAlarmWakeLock");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire(HEARTBEAT_WAKELOCK_TIMEOUT_MS);
    }

    private void runHeartbeatCheck() {
        if (!isTracking) return;
        long elapsed = System.currentTimeMillis() - lastPingTime;
        if (elapsed < HEARTBEAT_PING_INTERVAL_MS) return;

        // Chưa từng có fix (trong nhà mất GPS, minDistance chặn update khi đứng yên) -> thử vị trí cache của hệ thống
        Location heartbeatLocation = lastLocation != null
                ? lastLocation
                : getFreshLastKnownLocation(HEARTBEAT_CACHE_MAX_AGE_MS);
        if (heartbeatLocation == null) {
            Log.w(TAG, "Heartbeat skipped: no location fix available yet");
            return;
        }
        Log.d(TAG, "Heartbeat: sending stationary ping (no ping for " + (elapsed / 1000) + "s)");
        sendPingToBackend(heartbeatLocation, true, EVENT_TYPE_LOCATION);
    }

    private long lastGpsFixTime = 0;

    @Override
    public void onLocationChanged(Location location) {
        if (location == null) return;

        String provider = location.getProvider();
        long now = System.currentTimeMillis();

        // Cập nhật chẩn đoán luồng vị trí
        diagReceivedLocationCount++;
        diagLastLocationAt = now;

        // 1. Quản lý trạng thái nguồn định vị (Provider Priority):
        // Nếu là GPS_PROVIDER: cập nhật mốc thời gian GPS hoạt động
        if (LocationManager.GPS_PROVIDER.equals(provider)) {
            lastGpsFixTime = now;
        } else if (LocationManager.NETWORK_PROVIDER.equals(provider)) {
            // Nếu là NETWORK_PROVIDER (trạm sóng BTS / Wi-Fi):
            // Nếu GPS đã có tín hiệu trong vòng 25 giây qua, BỎ QUA hoàn toàn Network Provider
            // để triệt tiêu hiện tượng nhảy cóc con thoi (zic zac) giữa trạm BTS và vệ tinh GPS!
            if (now - lastGpsFixTime < 25000L) {
                diagFilteredLocationCount++;
                return;
            }
        }

        float speed = location.hasSpeed() ? location.getSpeed() : 0.0f;

        // 2. Bộ lọc độ chính xác thích ứng (Adaptive Accuracy Filter):
        // Khi di chuyển ngoài đường (speed >= 1.0 m/s): yêu cầu accuracy <= 45m (loại bỏ BTS lệch xa)
        // Khi đứng yên / trong phòng (speed < 1.0 m/s): chấp nhận accuracy <= 80m (phù hợp Wi-Fi văn phòng)
        float maxAllowedAccuracy = (speed >= 1.0f) ? 45.0f : 80.0f;
        if (location.hasAccuracy() && location.getAccuracy() > maxAllowedAccuracy) {
            diagFilteredLocationCount++;
            Log.d(TAG, "Ignoring inaccurate location point: accuracy = " + location.getAccuracy() + "m (max: " + maxAllowedAccuracy + "m)");
            return;
        }

        long elapsed  = now - lastPingTime;
        float distance = (lastLocation != null) ? location.distanceTo(lastLocation) : Float.MAX_VALUE;

        // 3. Chốt chặn bước nhảy dị biệt (Jump / Outlier Filter):
        // Nếu khoảng cách nhảy vọt > 150m với tốc độ bất thường > 35 m/s (~126 km/h) hoặc > 400m trong thời gian ngắn (< 30s)
        float jumpSpeed = (elapsed > 0) ? (distance / (elapsed / 1000.0f)) : 999.0f;
        if (lastLocation != null && distance > 150.0f && (jumpSpeed > 35.0f || (distance > 400.0f && elapsed < 30000L))) {
            diagFilteredLocationCount++;
            Log.w(TAG, "Discarding outlier jump point: distance=" + distance + "m, speed=" + jumpSpeed + "m/s");
            return;
        }

        // 4. Smart Adaptive: Xác định có đang di chuyển (speed >= 1.0 m/s hoặc di dời >= 5m)
        boolean isMoving = speed >= 1.0f || distance >= 5.0f;

        if (isMoving) {
            // Khi đang di chuyển: throttle 3 giây / lần để Live-Map mượt mà
            if (elapsed < 3000) {
                return;
            }
        } else {
            // Khi dừng lại (đèn đỏ, ngồi yên): tạm dừng gửi dồn 3s để tiết kiệm pin
            if (elapsed < 15000) {
                return;
            }
        }

        lastLocation = location;
        sendPingToBackend(location, false, EVENT_TYPE_LOCATION);
    }

    private int performHttpPing(Location loc, boolean isHeartbeat, String eventType, String apiUrl, String token) {
        HttpURLConnection conn = null;
        try {
            String endpoint = apiUrl;
            if (endpoint.endsWith("/")) {
                endpoint = endpoint.substring(0, endpoint.length() - 1);
            }
            endpoint += "/api/v1/attendances/location-ping";

            URL url = new URL(endpoint);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setDoOutput(true);

            if (token != null && !token.isEmpty()) {
                conn.setRequestProperty("Authorization", "Bearer " + token);
            }

            float batteryLevel = getDeviceBatteryLevel();
            float rawSpeed = (isHeartbeat || eventType.equals(EVENT_TYPE_APP_CLOSED))
                    ? 0.0f
                    : (loc.hasSpeed() ? loc.getSpeed() : 0.0f);
            float speed = rawSpeed >= 0.8f ? rawSpeed : 0.0f;

            JSONObject payload = new JSONObject();
            payload.put("latitude",  loc.getLatitude());
            payload.put("longitude", loc.getLongitude());
            if (loc.hasAccuracy()) payload.put("accuracy", (double) loc.getAccuracy());
            payload.put("speed",     (double) speed);
            if (loc.hasBearing()) payload.put("heading", (double) loc.getBearing());
            if (batteryLevel >= 0)  payload.put("battery_level", (double) batteryLevel);
            payload.put("platform",  "android");
            payload.put("eventType", eventType);

            // ---- Chẩn đoán thiết bị (camelCase - khớp schema DeviceDiagnostics Backend) ----
            JSONObject diagnostics = buildDiagnosticsSnapshot();
            payload.put("diagnostics", diagnostics);

            byte[] postData = payload.toString().getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(postData);
                os.flush();
            }

            return conn.getResponseCode();
        } catch (Exception e) {
            Log.e(TAG, "performHttpPing error", e);
            return -1;
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    /**
     * Dựng bản chẩn đoán thiết bị gửi kèm mỗi ping (camelCase, khớp schema DeviceDiagnostics Backend).
     * Phiên bản Android tương đương TrackingDiagnostics.snapshot() của iOS.
     */
    private JSONObject buildDiagnosticsSnapshot() {
        JSONObject diag = new JSONObject();
        try {
            diag.put("appVersion",       getAppVersion());
            diag.put("osVersion",        "Android " + Build.VERSION.RELEASE);
            diag.put("deviceModel",      Build.MANUFACTURER + " " + Build.MODEL);
            diag.put("launchReason",     diagLaunchReason);
            diag.put("appState",         diagAppState);
            diag.put("consecutiveFailures", diagConsecutiveFailures);
            diag.put("receivedLocationCount", diagReceivedLocationCount);
            diag.put("filteredLocationCount", diagFilteredLocationCount);

            if (diagPreviousExit != null) diag.put("previousExit", diagPreviousExit);
            if (diagLastPingHttpStatus >= 0) diag.put("lastPingHttpStatus", diagLastPingHttpStatus);
            if (diagLastFailureReason != null) diag.put("lastFailureReason", diagLastFailureReason);
            if (diagLastLocationErrorCode >= 0) diag.put("lastLocationErrorCode", diagLastLocationErrorCode);
            if (diagLastLocationAt > 0) {
                long ageSec = (System.currentTimeMillis() - diagLastLocationAt) / 1000;
                diag.put("lastLocationAgeSec", Math.max(0, ageSec));
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to build diagnostics snapshot", e);
        }
        return diag;
    }

    private synchronized boolean refreshAccessToken() {
        HttpURLConnection conn = null;
        try {
            SharedPreferences prefs     = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String apiUrl        = prefs.getString(KEY_API_URL, null);
            String refreshToken  = prefs.getString(KEY_REFRESH_TOKEN, null);

            if (apiUrl == null || refreshToken == null || refreshToken.isEmpty()) {
                Log.w(TAG, "Cannot refresh token: apiUrl or refreshToken is missing");
                return false;
            }

            String endpoint = apiUrl;
            if (endpoint.endsWith("/")) {
                endpoint = endpoint.substring(0, endpoint.length() - 1);
            }
            endpoint += "/api/v1/auth/refresh";

            URL url = new URL(endpoint);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setDoOutput(true);

            JSONObject reqPayload = new JSONObject();
            reqPayload.put("refreshToken", refreshToken);

            byte[] postData = reqPayload.toString().getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(postData);
                os.flush();
            }

            int responseCode = conn.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                java.io.InputStream in = conn.getInputStream();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int len;
                while ((len = in.read(buffer)) != -1) {
                    out.write(buffer, 0, len);
                }
                String respStr = out.toString(StandardCharsets.UTF_8.name());
                JSONObject resJson = new JSONObject(respStr);

                String newAccessToken = null;
                if (resJson.has("accessToken")) {
                    newAccessToken = resJson.getString("accessToken");
                } else if (resJson.has("access_token")) {
                    newAccessToken = resJson.getString("access_token");
                } else if (resJson.has("data")) {
                    JSONObject dataObj = resJson.getJSONObject("data");
                    if (dataObj.has("accessToken")) {
                        newAccessToken = dataObj.getString("accessToken");
                    } else if (dataObj.has("access_token")) {
                        newAccessToken = dataObj.getString("access_token");
                    }
                }

                if (newAccessToken != null && !newAccessToken.isEmpty()) {
                    SharedPreferences.Editor editor = prefs.edit();
                    editor.putString(KEY_TOKEN, newAccessToken);
                    editor.apply();
                    Log.i(TAG, "Access token refreshed successfully in Native Service!");
                    return true;
                }
            } else {
                Log.w(TAG, "Token refresh request failed with HTTP " + responseCode);
            }
        } catch (Exception e) {
            Log.e(TAG, "Exception during token refresh", e);
            diagLastFailureReason = "refresh_failed";
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
        return false;
    }

    private void sendPingToBackend(Location loc, boolean isHeartbeat, String eventType) {
        networkExecutor.execute(() -> {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wakeLock = null;
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "XTTech::TrackingPingWakeLock");
                wakeLock.acquire(15000);
            }

            try {
                SharedPreferences prefs  = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                String apiUrl = prefs.getString(KEY_API_URL, null);
                String token  = prefs.getString(KEY_TOKEN, null);

                if (apiUrl == null || apiUrl.isEmpty()) {
                    Log.w(TAG, "API URL is missing in native service");
                    return;
                }

                int responseCode = performHttpPing(loc, isHeartbeat, eventType, apiUrl, token);
                if (responseCode == 401) {
                    Log.w(TAG, "Received 401 Unauthorized. Attempting to refresh access token in background...");
                    boolean refreshed = refreshAccessToken();
                    if (refreshed) {
                        String newToken = prefs.getString(KEY_TOKEN, null);
                        responseCode = performHttpPing(loc, isHeartbeat, eventType, apiUrl, newToken);
                    }
                }

                if (responseCode >= 200 && responseCode < 300) {
                    lastPingTime = System.currentTimeMillis();
                    diagLastPingHttpStatus = responseCode;
                    diagConsecutiveFailures = 0;
                    diagLastFailureReason   = null;
                    Log.i(TAG, "Native ping sent successfully (" + eventType + (isHeartbeat ? "/Heartbeat" : "/Movement") + "): HTTP " + responseCode);
                } else {
                    diagLastPingHttpStatus = responseCode;
                    diagConsecutiveFailures++;
                    diagLastFailureReason = responseCode > 0 ? "http_" + responseCode : "network_error";
                    Log.w(TAG, "Native ping failed with HTTP " + responseCode);
                }
            } catch (Exception e) {
                diagConsecutiveFailures++;
                diagLastFailureReason = "network_error";
                Log.e(TAG, "Exception while sending native ping to backend", e);
            } finally {
                if (wakeLock != null && wakeLock.isHeld()) {
                    try {
                        wakeLock.release();
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    // ===================== App Terminated — đồng bộ với iOS handleAppWillTerminate =====================
    /**
     * Gọi khi người dùng vuốt tắt app ở màn hình đa nhiệm (Recent Apps).
     * Khác iOS (applicationWillTerminate), Android KHÔNG tắt Service khi vuốt app ->
     * Service vẫn tiếp tục sống và ghi nhận vị trí.
     * Nhưng ta VẪN gửi app_closed ping để:
     *   1. Server biết người dùng đã tắt app UI (có thể cần cảnh báo admin).
     *   2. Gắn local notification nhắc nhân viên mở lại app trong ca làm việc.
     */
    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.i(TAG, "App was swiped away from recent apps. Sending app_closed ping and scheduling reminder.");

        // Cập nhật chẩn đoán
        diagAppState = "terminated";
        persistDiagSessionState(DIAG_SESSION_TERMINATED);

        // Gửi app_closed ping đồng bộ trên luồng mạng riêng (tối đa APP_CLOSED_PING_TIMEOUT_MS)
        sendAppClosedPingSync();

        // Hiện local notification nhắc nhân viên mở lại app
        showAppClosedReminder();

        super.onTaskRemoved(rootIntent);
    }

    /**
     * Gửi app_closed ping đồng bộ (block tối đa APP_CLOSED_PING_TIMEOUT_MS).
     * onTaskRemoved() thường được gọi trên luồng chính nhưng Android cho thời gian ngắn trước khi
     * process bị kill -> dùng thread riêng + join để không block Main Thread quá lâu.
     */
    private void sendAppClosedPingSync() {
        Location pingLocation = lastLocation != null
                ? lastLocation
                : getFreshLastKnownLocation(HEARTBEAT_CACHE_MAX_AGE_MS);
        if (pingLocation == null) {
            Log.w(TAG, "app_closed ping skipped: no location available");
            return;
        }

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String apiUrl = prefs.getString(KEY_API_URL, null);
        String token  = prefs.getString(KEY_TOKEN, null);

        if (apiUrl == null || apiUrl.isEmpty()) {
            Log.w(TAG, "app_closed ping skipped: API URL missing");
            return;
        }

        final Location finalLocation = pingLocation;
        final String finalApiUrl = apiUrl;
        final String finalToken  = token;

        Thread pingThread = new Thread(() -> {
            int code = performHttpPing(finalLocation, true, EVENT_TYPE_APP_CLOSED, finalApiUrl, finalToken);
            if (code == 401) {
                boolean refreshed = refreshAccessToken();
                if (refreshed) {
                    String newToken = getSharedPreferences(PREFS_NAME, MODE_PRIVATE).getString(KEY_TOKEN, null);
                    code = performHttpPing(finalLocation, true, EVENT_TYPE_APP_CLOSED, finalApiUrl, newToken);
                }
            }
            Log.i(TAG, "app_closed ping result: HTTP " + code);
        });
        pingThread.setDaemon(true);
        pingThread.start();

        try {
            pingThread.join(APP_CLOSED_PING_TIMEOUT_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            Log.w(TAG, "app_closed ping thread interrupted");
        }
    }

    /**
     * Hiển thị local notification nhắc nhân viên mở lại app.
     * Giống iOS AppClosedReminder.schedule() — âm thanh riêng để nổi bật.
     */
    private void showAppClosedReminder() {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            Intent openIntent = new Intent(this, MainActivity.class);
            openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pendingOpen = PendingIntent.getActivity(
                    this, 0, openIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_REMINDER_ID)
                    .setContentTitle("⚠️ Cảnh báo ca làm việc!")
                    .setContentText("Đang trong ca làm việc, vui lòng vào lại app XTTech và không đóng app!")
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentIntent(pendingOpen)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            nm.notify(NOTIFICATION_REMINDER_ID, builder.build());
            Log.i(TAG, "App closed reminder notification shown.");
        } catch (Exception e) {
            Log.e(TAG, "Failed to show app closed reminder notification", e);
        }
    }

    private float lastValidBatteryLevel = -1.0f;

    private float getDeviceBatteryLevel() {
        try {
            // Cách 1: Qua BatteryManager System Service (Lollipop 5.0+): Đọc trực tiếp từ IC quản lý nguồn,
            // không bị các ROM như Xiaomi/Oppo chặn broadcast khi màn hình tắt.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                BatteryManager bm = (BatteryManager) getSystemService(BATTERY_SERVICE);
                if (bm != null) {
                    int capacity = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
                    if (capacity >= 0 && capacity <= 100) {
                        lastValidBatteryLevel = (float) capacity;
                        return (float) capacity;
                    }
                }
            }

            // Cách 2: Qua Intent.ACTION_BATTERY_CHANGED
            IntentFilter iFilter = new IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED);
            android.content.Intent batteryStatus = registerReceiver(null, iFilter);
            if (batteryStatus != null) {
                int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                if (level >= 0 && scale > 0) {
                    float pct = (level * 100.0f) / scale;
                    lastValidBatteryLevel = pct;
                    return pct;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not read battery level", e);
        }
        return lastValidBatteryLevel;
    }

    private Notification buildNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("XTTech đang hoạt động")
                .setContentText("Hệ thống đang ghi nhận vị trí trong ca làm việc...")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "XTTech Vị trí ca làm việc",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Duy trì cập nhật vị trí trực tiếp trong ca làm việc");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    /**
     * Kênh thông báo riêng cho cảnh báo đóng app: độ ưu tiên CAO, có âm thanh để nhân viên chú ý.
     * Giống iOS AppClosedReminder sử dụng nhac_out_app.wav.
     */
    private void createReminderNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_REMINDER_ID,
                    "XTTech Cảnh báo đóng app",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Nhắc nhân viên mở lại app khi lỡ tắt trong ca làm việc");
            channel.enableVibration(true);
            channel.enableLights(true);

            // Thử dùng âm thanh tùy chỉnh nếu có file nhac_out_app trong res/raw
            try {
                Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/raw/nhac_out_app");
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .build();
                channel.setSound(soundUri, audioAttributes);
            } catch (Exception e) {
                // Fallback về âm thanh mặc định nếu file không tồn tại
                Log.d(TAG, "Custom notification sound not found, using default");
            }

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    // ===================== Diagnostics — suy luận lý do lần chạy trước kết thúc =====================

    /**
     * Khởi tạo diagnostics khi Service được tạo:
     * - Suy luận lý do tiến trình trước đó kết thúc (previousExit).
     * - Lưu trạng thái phiên hiện tại để lần sau suy luận.
     * Tương đương TrackingDiagnostics.start() của iOS.
     */
    private void initDiagnostics() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        String currentBuildKey = getAppBuildKey();
        long   currentBootTime = getSystemBootTimeMs();

        String previousState    = prefs.getString(DIAG_KEY_SESSION_STATE, null);
        String previousBuildKey = prefs.getString(DIAG_KEY_BUILD_KEY, null);
        long   previousBootTime = prefs.getLong(DIAG_KEY_BOOT_TIME, -1L);

        // Lưu build key và boot time hiện tại để lần sau suy luận
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(DIAG_KEY_BUILD_KEY, currentBuildKey);
        if (currentBootTime > 0) editor.putLong(DIAG_KEY_BOOT_TIME, currentBootTime);
        editor.apply();

        // Lần chạy đầu tiên sau khi cài đặt: chưa có dữ liệu để suy luận
        if (previousState == null) {
            diagPreviousExit = null;
            Log.d(TAG, "Diagnostics: first run, no previous exit to infer.");
            return;
        }

        // Phiên bản app vừa cập nhật
        if (previousBuildKey != null && !previousBuildKey.equals(currentBuildKey)) {
            diagPreviousExit = "app_updated";
        }
        // Máy vừa được khởi động lại
        else if (previousBootTime > 0 && currentBootTime > 0
                && Math.abs(previousBootTime - currentBootTime) > DIAG_BOOT_TOLERANCE_MS) {
            diagPreviousExit = "device_rebooted";
        }
        // Suy luận từ trạng thái phiên trước
        else {
            switch (previousState) {
                case DIAG_SESSION_TERMINATED:
                    diagPreviousExit = "user_terminated";
                    break;
                case DIAG_SESSION_FOREGROUND:
                    diagPreviousExit = "foreground_kill_suspected";
                    break;
                case DIAG_SESSION_BACKGROUND:
                    diagPreviousExit = "background_kill_suspected";
                    break;
                default:
                    diagPreviousExit = null;
            }
        }

        // Service được khởi động lại bởi Android OS (START_STICKY) -> launchReason = system_restart
        diagLaunchReason = "system_restart";

        Log.d(TAG, "Diagnostics init: previousExit=" + diagPreviousExit + ", launchReason=" + diagLaunchReason);
    }

    private void persistDiagSessionState(String state) {
        getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                .edit()
                .putString(DIAG_KEY_SESSION_STATE, state)
                .apply();
        diagAppState = state;
    }

    /** Lấy tên + mã phiên bản app từ PackageManager */
    private String getAppVersion() {
        try {
            return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "unknown";
        }
    }

    /** Khóa phiên bản: đổi giá trị nghĩa là app hoặc Android vừa được cập nhật */
    private String getAppBuildKey() {
        try {
            String versionName = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            return versionName + "|" + Build.VERSION.RELEASE;
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * Thời điểm khởi động máy (epoch ms) lấy từ SystemClock.elapsedRealtime() và currentTimeMillis().
     * Không bị ảnh hưởng bởi NTP drift nhỏ trong phiên.
     */
    private long getSystemBootTimeMs() {
        try {
            return System.currentTimeMillis() - SystemClock.elapsedRealtime();
        } catch (Exception e) {
            return -1L;
        }
    }

    // ===================== Lifecycle =====================

    @Override
    public void onDestroy() {
        stopTracking();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}

    @Override
    public void onProviderEnabled(String provider) {
        requestLocationUpdates();
    }

    @Override
    public void onProviderDisabled(String provider) {}
}
