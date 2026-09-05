package com.xttech.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class TrackingLocationService extends Service implements LocationListener {
    private static final String TAG = "TrackingLocService";
    public static final String CHANNEL_ID = "xttech_tracking_channel";
    public static final int NOTIFICATION_ID = 1998;

    public static final String ACTION_START = "com.xttech.app.ACTION_START_TRACKING";
    public static final String ACTION_STOP = "com.xttech.app.ACTION_STOP_TRACKING";
    public static final String ACTION_UPDATE_TOKEN = "com.xttech.app.ACTION_UPDATE_TOKEN";

    public static final String PREFS_NAME = "xttech_native_tracking_prefs";
    public static final String KEY_TOKEN = "access_token";
    public static final String KEY_REFRESH_TOKEN = "refresh_token";
    public static final String KEY_API_URL = "api_url";

    private LocationManager locationManager;
    private ScheduledExecutorService heartbeatScheduler;
    private final java.util.concurrent.ExecutorService networkExecutor = Executors.newSingleThreadExecutor();

    private long lastPingTime = 0;
    private Location lastLocation = null;
    private boolean isTracking = false;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopTracking();
                return START_NOT_STICKY;
            } else if (ACTION_UPDATE_TOKEN.equals(action)) {
                String token = intent.getStringExtra(KEY_TOKEN);
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
                String token = intent.getStringExtra(KEY_TOKEN);
                String refreshToken = intent.getStringExtra(KEY_REFRESH_TOKEN);
                String apiUrl = intent.getStringExtra(KEY_API_URL);
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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, buildNotification(), android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, buildNotification());
        }
        startTracking();

        // START_STICKY yêu cầu Android OS tự khởi động lại Service nếu bị hệ điều hành tắt tạm thời
        return START_STICKY;
    }

    private void startTracking() {
        if (isTracking) return;
        isTracking = true;

        requestLocationUpdates();
        startHeartbeatTimer();
        Log.i(TAG, "Native Tracking Service started successfully.");
    }

    private void stopTracking() {
        isTracking = false;
        if (locationManager != null) {
            try {
                locationManager.removeUpdates(this);
            } catch (Exception e) {
                Log.e(TAG, "Error removing location updates", e);
            }
        }

        if (heartbeatScheduler != null && !heartbeatScheduler.isShutdown()) {
            heartbeatScheduler.shutdownNow();
            heartbeatScheduler = null;
        }

        stopForeground(true);
        stopSelf();
        Log.i(TAG, "Native Tracking Service stopped.");
    }

    private void requestLocationUpdates() {
        if (locationManager == null) return;

        boolean fineLocGranted = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean coarseLocGranted = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

        if (!fineLocGranted && !coarseLocGranted) {
            Log.w(TAG, "Location permission not granted for native service");
            return;
        }

        try {
            // Đăng ký GPS Provider (vệ tinh, độ chính xác cao)
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        10000, // 10 giây
                        10.0f, // 10 mét
                        this
                );
            }

            // Đăng ký Network Provider (trạm sóng di động, wifi) làm kênh dự phòng
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        15000,
                        15.0f,
                        this
                );
            }

            // Lấy vị trí gần nhất ngay khi khởi động
            Location lastKnown = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            if (lastKnown == null) {
                lastKnown = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }
            if (lastKnown != null) {
                onLocationChanged(lastKnown);
            }
        } catch (SecurityException se) {
            Log.e(TAG, "SecurityException requesting location updates", se);
        } catch (Exception e) {
            Log.e(TAG, "Exception requesting location updates", e);
        }
    }

    private void startHeartbeatTimer() {
        if (heartbeatScheduler != null && !heartbeatScheduler.isShutdown()) {
            heartbeatScheduler.shutdownNow();
        }
        heartbeatScheduler = Executors.newSingleThreadScheduledExecutor();

        // Kiểm tra nhịp tim định kỳ mỗi 60 giây (Nếu quá 3 phút không có ping di chuyển -> gửi heartbeat đứng yên)
        heartbeatScheduler.scheduleWithFixedDelay(() -> {
            try {
                long elapsed = System.currentTimeMillis() - lastPingTime;
                if (elapsed >= 180000) { // 3 phút
                    if (lastLocation != null) {
                        Log.d(TAG, "Heartbeat: sending stationary ping (standing still > 3m)");
                        sendPingToBackend(lastLocation, true);
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Heartbeat executor error", e);
            }
        }, 60, 60, TimeUnit.SECONDS);
    }

    @Override
    public void onLocationChanged(Location location) {
        if (location == null) return;

        long now = System.currentTimeMillis();
        // Giới hạn tối thiểu 10 giây giữa 2 lần ping liên tiếp để chống nghẽn mạng
        if (now - lastPingTime < 10000) {
            return;
        }

        lastLocation = location;
        sendPingToBackend(location, false);
    }

    private int performHttpPing(Location loc, boolean isHeartbeat, String apiUrl, String token) {
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
            float speed = isHeartbeat ? 0.0f : (loc.hasSpeed() ? loc.getSpeed() : 0.0f);

            JSONObject payload = new JSONObject();
            payload.put("latitude", loc.getLatitude());
            payload.put("longitude", loc.getLongitude());
            if (loc.hasAccuracy()) payload.put("accuracy", (double) loc.getAccuracy());
            payload.put("speed", (double) speed);
            if (loc.hasBearing()) payload.put("heading", (double) loc.getBearing());
            if (batteryLevel >= 0) payload.put("battery_level", (double) batteryLevel);

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

    private synchronized boolean refreshAccessToken() {
        HttpURLConnection conn = null;
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String apiUrl = prefs.getString(KEY_API_URL, null);
            String refreshToken = prefs.getString(KEY_REFRESH_TOKEN, null);

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

            JSONObject payload = new JSONObject();
            payload.put("refreshToken", refreshToken);

            byte[] postData = payload.toString().getBytes(StandardCharsets.UTF_8);
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
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
        return false;
    }

    private void sendPingToBackend(Location loc, boolean isHeartbeat) {
        networkExecutor.execute(() -> {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wakeLock = null;
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "XTTech::TrackingPingWakeLock");
                wakeLock.acquire(15000);
            }

            try {
                SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                String apiUrl = prefs.getString(KEY_API_URL, null);
                String token = prefs.getString(KEY_TOKEN, null);

                if (apiUrl == null || apiUrl.isEmpty()) {
                    Log.w(TAG, "API URL is missing in native service");
                    return;
                }

                int responseCode = performHttpPing(loc, isHeartbeat, apiUrl, token);
                if (responseCode == 401) {
                    Log.w(TAG, "Received 401 Unauthorized. Attempting to refresh access token in background...");
                    boolean refreshed = refreshAccessToken();
                    if (refreshed) {
                        String newToken = prefs.getString(KEY_TOKEN, null);
                        responseCode = performHttpPing(loc, isHeartbeat, apiUrl, newToken);
                    }
                }

                if (responseCode >= 200 && responseCode < 300) {
                    lastPingTime = System.currentTimeMillis();
                    Log.i(TAG, "Native ping sent successfully (" + (isHeartbeat ? "Heartbeat" : "Movement") + "): HTTP " + responseCode);
                } else {
                    Log.w(TAG, "Native ping failed with HTTP " + responseCode);
                }
            } catch (Exception e) {
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

    private float getDeviceBatteryLevel() {
        try {
            IntentFilter iFilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = registerReceiver(null, iFilter);
            if (batteryStatus != null) {
                int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                if (level >= 0 && scale > 0) {
                    return (level * 100.0f) / scale;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not read battery level", e);
        }
        return -1.0f;
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

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // ĐÂY LÀ ĐIỂM MẤU CHỐT GIỐNG ZALO:
        // Khi người dùng vuốt tắt app ở màn hình đa nhiệm (Recent Apps), Android gọi hàm này.
        // Ta ghi nhận log và KHÔNG stopSelf() -> Service sẽ tiếp tục sống và ghi nhận vị trí!
        Log.i(TAG, "App was swiped away from recent apps. TrackingLocationService continues running in background.");
        super.onTaskRemoved(rootIntent);
    }

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
