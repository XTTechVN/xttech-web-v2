package com.xttech.app;

import android.Manifest;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.location.LocationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.Granularity;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(
    name = "NativeTracking",
    permissions = {
        @Permission(
            alias = "location",
            strings = {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            }
        )
    }
)
public class NativeTrackingPlugin extends Plugin {
    private static final String TAG = "NativeTrackingPlugin";
    public static final String KEY_HAS_REQUESTED_LOCATION_PERMISSION = "has_requested_location_permission";

    private static final long DEFAULT_TIMEOUT_MS = 12_000L;
    private static final long MIN_TIMEOUT_MS = 2_000L;
    private static final long MAX_TIMEOUT_MS = 60_000L;
    private static final long DEFAULT_MAX_AGE_MS = 15_000L;
    private static final double DEFAULT_HIGH_ACCURACY_METERS = 50.0;
    private static final double DEFAULT_LOW_ACCURACY_METERS = 200.0;
    private static final double CACHE_HIGH_ACCEPT_MIN_METERS = 80.0;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Set<ActivePositionRequest> activePositionRequests = new HashSet<>();

    private static final class LocationStatusMeta {
        final boolean hasFine;
        final boolean hasCoarse;
        final boolean hasBackground;
        final boolean isPrecise;
        final String authorizationStatus;
        final boolean canAskAgain;
        final boolean locationEnabled;
        final boolean isLowPowerMode;
        final boolean gmsAvailable;

        LocationStatusMeta(
            boolean hasFine,
            boolean hasCoarse,
            boolean hasBackground,
            boolean isPrecise,
            String authorizationStatus,
            boolean canAskAgain,
            boolean locationEnabled,
            boolean isLowPowerMode,
            boolean gmsAvailable
        ) {
            this.hasFine = hasFine;
            this.hasCoarse = hasCoarse;
            this.hasBackground = hasBackground;
            this.isPrecise = isPrecise;
            this.authorizationStatus = authorizationStatus;
            this.canAskAgain = canAskAgain;
            this.locationEnabled = locationEnabled;
            this.isLowPowerMode = isLowPowerMode;
            this.gmsAvailable = gmsAvailable;
        }

        static LocationStatusMeta unavailable() {
            return new LocationStatusMeta(false, false, false, false, "denied", false, false, false, false);
        }
    }

    @Override
    protected void handleOnDestroy() {
        cancelAllPositionRequests();
        super.handleOnDestroy();
    }

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
    public void checkPermission(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        LocationStatusMeta meta = readLocationStatusMeta(context);
        JSObject ret = new JSObject();
        ret.put("status", meta.authorizationStatus);
        ret.put("isAlways", "always".equals(meta.authorizationStatus));
        ret.put("isWhenInUse", "whenInUse".equals(meta.authorizationStatus));
        ret.put("isPrecise", meta.isPrecise);
        ret.put("locationEnabled", meta.locationEnabled);
        ret.put("isLowPowerMode", meta.isLowPowerMode);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestLocationPermission(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        LocationStatusMeta meta = readLocationStatusMeta(context);
        if (meta.hasFine) {
            resolvePermissionResult(call, meta);
            return;
        }

        if (getActivity() == null) {
            resolvePermissionResult(call, meta);
            return;
        }

        markLocationPermissionRequested(context);
        requestPermissionForAlias("location", call, "onRequestLocationPermissionResult");
    }

    @PermissionCallback
    private void onRequestLocationPermissionResult(PluginCall call) {
        if (call == null) return;
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }
        LocationStatusMeta meta = readLocationStatusMeta(context);
        resolvePermissionResult(call, meta);
    }

    private void resolvePermissionResult(PluginCall call, LocationStatusMeta meta) {
        boolean granted = meta.hasFine || meta.hasCoarse;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        ret.put("status", meta.authorizationStatus);
        ret.put("isAlways", "always".equals(meta.authorizationStatus));
        ret.put("isWhenInUse", "whenInUse".equals(meta.authorizationStatus));
        ret.put("isPrecise", meta.isPrecise);
        ret.put("locationEnabled", meta.locationEnabled);
        ret.put("canAskAgain", meta.canAskAgain);
        call.resolve(ret);
    }

    @PluginMethod
    public void getCurrentPosition(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            resolvePositionError(call, LocationStatusMeta.unavailable(), "CONTEXT_UNAVAILABLE", "Application context is unavailable", null, null);
            return;
        }

        boolean requestPermission = Boolean.TRUE.equals(call.getBoolean("requestPermission", false));
        executeGetCurrentPosition(call, context, requestPermission);
    }

    @PermissionCallback
    private void onPositionPermissionResult(PluginCall call) {
        if (call == null) return;
        Context context = getContext();
        if (context == null) {
            resolvePositionError(call, LocationStatusMeta.unavailable(), "CONTEXT_UNAVAILABLE", "Application context is unavailable", null, null);
            return;
        }
        executeGetCurrentPosition(call, context, false);
    }

    private void executeGetCurrentPosition(PluginCall call, Context context, boolean allowRequestPermission) {
        LocationStatusMeta meta = readLocationStatusMeta(context);
        if (!meta.hasFine && !meta.hasCoarse) {
            if (allowRequestPermission && getActivity() != null) {
                markLocationPermissionRequested(context);
                requestPermissionForAlias("location", call, "onPositionPermissionResult");
                return;
            }
            String errCode = "notDetermined".equals(meta.authorizationStatus)
                ? "PERMISSION_NOT_DETERMINED"
                : "PERMISSION_DENIED";
            String errMsg = "notDetermined".equals(meta.authorizationStatus)
                ? "Location permission has not been requested yet"
                : "Location permission denied";
            resolvePositionError(call, meta, errCode, errMsg, null, null);
            return;
        }

        if (!meta.locationEnabled) {
            resolvePositionError(call, meta, "LOCATION_SERVICES_DISABLED", "Location services are disabled on this device", null, null);
            return;
        }

        boolean enableHighAccuracy = Boolean.TRUE.equals(call.getBoolean("enableHighAccuracy", true));
        long rawTimeoutMs = readLongOption(call, "timeoutMs", DEFAULT_TIMEOUT_MS);
        long timeoutMs = Math.max(MIN_TIMEOUT_MS, Math.min(MAX_TIMEOUT_MS, rawTimeoutMs));
        long rawMaxAgeMs = readLongOption(call, "maximumAgeMs", DEFAULT_MAX_AGE_MS);
        long maximumAgeMs = Math.max(0L, rawMaxAgeMs);
        Double rawDesired = call.getDouble("desiredAccuracyMeters");
        double defaultDesired = enableHighAccuracy ? DEFAULT_HIGH_ACCURACY_METERS : DEFAULT_LOW_ACCURACY_METERS;
        double desiredAccuracyMeters = (rawDesired != null && rawDesired > 0.0) ? rawDesired : defaultDesired;

        LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);

        // 1. Kiểm tra đồng bộ cache (Service cache trước, sau đó LocationManager lastKnown)
        Location bestCache = null;
        String bestCacheSource = null;
        String bestCacheProvider = null;

        if (maximumAgeMs > 0L) {
            Location serviceLoc = TrackingLocationService.getLatestValidLocation(maximumAgeMs);
            if (isValidLocation(serviceLoc)) {
                long ageMs = computeLocationAgeMs(serviceLoc);
                if (ageMs <= maximumAgeMs) {
                    if (isCacheAcceptable(serviceLoc, meta.isPrecise, enableHighAccuracy, desiredAccuracyMeters)) {
                        resolvePositionSuccess(call, meta, serviceLoc, "service_cache", "service_cache", ageMs);
                        return;
                    }
                    bestCache = serviceLoc;
                    bestCacheSource = "service_cache";
                    bestCacheProvider = "service_cache";
                }
            }

            if (lm != null) {
                Location lmCache = readFreshLastKnownLocation(lm, meta.hasFine, maximumAgeMs);
                if (lmCache != null) {
                    long ageMs = computeLocationAgeMs(lmCache);
                    String mappedProvider = mapProvider(lmCache.getProvider());
                    if (isCacheAcceptable(lmCache, meta.isPrecise, enableHighAccuracy, desiredAccuracyMeters)) {
                        resolvePositionSuccess(call, meta, lmCache, mappedProvider, "cache", ageMs);
                        return;
                    }
                    if (isBetterCandidate(lmCache, bestCache)) {
                        bestCache = lmCache;
                        bestCacheSource = "cache";
                        bestCacheProvider = mappedProvider;
                    }
                }
            }
        }

        final Location initialBest = bestCache;
        final String initialBestSource = bestCacheSource;
        final String initialBestProvider = bestCacheProvider;

        mainHandler.post(() -> {
            ActivePositionRequest req = new ActivePositionRequest(
                call,
                context.getApplicationContext(),
                meta,
                enableHighAccuracy,
                desiredAccuracyMeters,
                maximumAgeMs,
                timeoutMs,
                lm,
                initialBest,
                initialBestSource,
                initialBestProvider
            );
            startActivePositionRequest(req);
        });
    }

    private void startActivePositionRequest(ActivePositionRequest req) {
        synchronized (activePositionRequests) {
            activePositionRequests.add(req);
        }

        req.timeoutRunnable = () -> {
            if (req.settled.get()) return;
            if (req.bestLocation != null) {
                long ageMs = computeLocationAgeMs(req.bestLocation);
                req.settleSuccess(req.bestLocation, req.bestSource, req.bestProvider, ageMs);
            } else {
                req.settleError("TIMEOUT", "Timed out acquiring native GPS position", null, null);
            }
        };
        mainHandler.postDelayed(req.timeoutRunnable, req.timeoutMs);

        if (req.meta.gmsAvailable) {
            startGmsAcquisition(req);
            long fallbackDelayMs = Math.max(1_500L, Math.min(4_500L, req.timeoutMs / 2L));
            req.fallbackStartRunnable = () -> startLocationManagerFallback(req, false);
            mainHandler.postDelayed(req.fallbackStartRunnable, fallbackDelayMs);
        } else {
            startLocationManagerFallback(req, true);
        }
    }

    private void startGmsAcquisition(ActivePositionRequest req) {
        try {
            FusedLocationProviderClient client = LocationServices.getFusedLocationProviderClient(req.appContext);
            req.fusedClient = client;
            Executor mainExecutor = ContextCompat.getMainExecutor(req.appContext);

            // Đọc cache GMS bất đồng bộ (không block luồng gọi)
            if (req.maximumAgeMs > 0L) {
                try {
                    client.getLastLocation().addOnSuccessListener(mainExecutor, loc -> {
                        if (req.settled.get() || !isValidLocation(loc)) return;
                        long ageMs = computeLocationAgeMs(loc);
                        if (ageMs <= req.maximumAgeMs) {
                            if (isCacheAcceptable(loc, req.meta.isPrecise, req.enableHighAccuracy, req.desiredAccuracyMeters)) {
                                req.settleSuccess(loc, "cache", "fused", ageMs);
                            } else {
                                req.considerCandidate(loc, "cache", "fused");
                            }
                        }
                    });
                } catch (SecurityException se) {
                    Log.w(TAG, "SecurityException reading GMS getLastLocation", se);
                }
            }

            // Nếu chỉ có Coarse (Android 12+), bắt buộc hạ priority & granularity tránh SecurityException từ GMS 21.3.0
            final int priority;
            final int granularity;
            if (!req.meta.hasFine) {
                priority = Priority.PRIORITY_BALANCED_POWER_ACCURACY;
                granularity = Granularity.GRANULARITY_COARSE;
            } else if (req.enableHighAccuracy) {
                priority = Priority.PRIORITY_HIGH_ACCURACY;
                granularity = Granularity.GRANULARITY_PERMISSION_LEVEL;
            } else {
                priority = Priority.PRIORITY_BALANCED_POWER_ACCURACY;
                granularity = Granularity.GRANULARITY_PERMISSION_LEVEL;
            }

            LocationRequest.Builder reqBuilder = new LocationRequest.Builder(priority, 1_000L)
                .setMinUpdateIntervalMillis(500L)
                .setDurationMillis(req.timeoutMs)
                .setGranularity(granularity)
                .setWaitForAccurateLocation(false);
            if (req.maximumAgeMs == 0L) {
                reqBuilder.setMaxUpdateAgeMillis(0L);
            }

            req.fusedCallback = new LocationCallback() {
                @Override
                public void onLocationResult(@NonNull LocationResult result) {
                    if (req.settled.get()) return;
                    List<Location> locations = result.getLocations();
                    if (locations == null || locations.isEmpty()) {
                        Location last = result.getLastLocation();
                        if (last != null) {
                            handleLiveLocation(req, last, "fused");
                        }
                        return;
                    }
                    for (Location loc : locations) {
                        if (req.settled.get()) break;
                        handleLiveLocation(req, loc, "fused");
                    }
                }
            };

            client.requestLocationUpdates(reqBuilder.build(), req.fusedCallback, Looper.getMainLooper())
                .addOnFailureListener(mainExecutor, err -> {
                    Log.w(TAG, "GMS requestLocationUpdates failed, falling back to LocationManager", err);
                    startLocationManagerFallback(req, true);
                });
        } catch (SecurityException se) {
            Log.w(TAG, "SecurityException starting GMS location updates", se);
            startLocationManagerFallback(req, true);
        } catch (Throwable t) {
            Log.w(TAG, "GMS location acquisition unavailable, falling back to LocationManager", t);
            startLocationManagerFallback(req, true);
        }
    }

    private void startLocationManagerFallback(ActivePositionRequest req, boolean gmsInactive) {
        if (req.settled.get() || req.lmFallbackStarted) return;
        req.lmFallbackStarted = true;

        LocationManager lm = req.locationManager;
        if (lm == null) {
            if (gmsInactive && req.bestLocation == null) {
                req.settleError("POSITION_UNAVAILABLE", "LocationManager service is unavailable", null, null);
            }
            return;
        }

        req.locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                handleLiveLocation(req, location, null);
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {}

            @Override
            public void onProviderEnabled(@NonNull String provider) {}

            @Override
            public void onProviderDisabled(@NonNull String provider) {}
        };

        int registeredCount = 0;

        // Tuyệt đối không đăng ký GPS_PROVIDER nếu thiếu ACCESS_FINE_LOCATION
        if (req.meta.hasFine && isProviderEnabledSafe(lm, LocationManager.GPS_PROVIDER)) {
            if (requestLmUpdatesSafe(lm, LocationManager.GPS_PROVIDER, req.locationListener)) {
                registeredCount++;
            }
        }

        if (isProviderEnabledSafe(lm, LocationManager.NETWORK_PROVIDER)) {
            if (requestLmUpdatesSafe(lm, LocationManager.NETWORK_PROVIDER, req.locationListener)) {
                registeredCount++;
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                if (lm.hasProvider(LocationManager.FUSED_PROVIDER) && isProviderEnabledSafe(lm, LocationManager.FUSED_PROVIDER)) {
                    if (requestLmUpdatesSafe(lm, LocationManager.FUSED_PROVIDER, req.locationListener)) {
                        registeredCount++;
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed checking/registering FUSED_PROVIDER", e);
            }
        }

        if (registeredCount == 0 && gmsInactive) {
            if (req.bestLocation != null) {
                long ageMs = computeLocationAgeMs(req.bestLocation);
                req.settleSuccess(req.bestLocation, req.bestSource, req.bestProvider, ageMs);
            } else {
                req.settleError("POSITION_UNAVAILABLE", "No enabled location providers available", null, null);
            }
        }
    }

    private boolean requestLmUpdatesSafe(LocationManager lm, String provider, LocationListener listener) {
        try {
            lm.requestLocationUpdates(provider, 500L, 0f, listener, Looper.getMainLooper());
            return true;
        } catch (SecurityException se) {
            Log.w(TAG, "SecurityException requesting updates for provider " + provider, se);
            return false;
        } catch (IllegalArgumentException | IllegalStateException e) {
            Log.w(TAG, "Provider unavailable: " + provider, e);
            return false;
        }
    }

    private void handleLiveLocation(ActivePositionRequest req, @Nullable Location loc, @Nullable String defaultProvider) {
        if (req.settled.get() || !isValidLocation(loc)) return;

        long ageMs = computeLocationAgeMs(loc);
        long maxLiveAgeMs = req.maximumAgeMs == 0L ? 10_000L : Math.max(15_000L, req.maximumAgeMs);
        if (ageMs > maxLiveAgeMs) {
            return;
        }

        String provider = mapProvider(loc.getProvider());
        if ("unknown".equals(provider) && defaultProvider != null) {
            provider = defaultProvider;
        }

        req.considerCandidate(loc, "live", provider);

        if (isLiveAcceptable(loc, req.meta.isPrecise, req.enableHighAccuracy, req.desiredAccuracyMeters)) {
            req.settleSuccess(loc, "live", provider, ageMs);
        }
    }

    private final class ActivePositionRequest {
        final PluginCall call;
        final Context appContext;
        final LocationStatusMeta meta;
        final boolean enableHighAccuracy;
        final double desiredAccuracyMeters;
        final long maximumAgeMs;
        final long timeoutMs;
        @Nullable final LocationManager locationManager;
        final AtomicBoolean settled = new AtomicBoolean(false);

        @Nullable FusedLocationProviderClient fusedClient;
        @Nullable LocationCallback fusedCallback;
        @Nullable LocationListener locationListener;
        @Nullable Runnable timeoutRunnable;
        @Nullable Runnable fallbackStartRunnable;

        @Nullable Location bestLocation;
        @Nullable String bestSource;
        @Nullable String bestProvider;
        boolean lmFallbackStarted = false;

        ActivePositionRequest(
            PluginCall call,
            Context appContext,
            LocationStatusMeta meta,
            boolean enableHighAccuracy,
            double desiredAccuracyMeters,
            long maximumAgeMs,
            long timeoutMs,
            @Nullable LocationManager locationManager,
            @Nullable Location initialBest,
            @Nullable String initialBestSource,
            @Nullable String initialBestProvider
        ) {
            this.call = call;
            this.appContext = appContext;
            this.meta = meta;
            this.enableHighAccuracy = enableHighAccuracy;
            this.desiredAccuracyMeters = desiredAccuracyMeters;
            this.maximumAgeMs = maximumAgeMs;
            this.timeoutMs = timeoutMs;
            this.locationManager = locationManager;
            this.bestLocation = initialBest;
            this.bestSource = initialBestSource;
            this.bestProvider = initialBestProvider;
        }

        void considerCandidate(Location loc, String source, String provider) {
            // Ưu tiên điểm live thay cho cache cũ, hoặc điểm có sai số nhỏ hơn
            boolean isLiveVsCache = "live".equals(source) && !"live".equals(this.bestSource);
            if (this.bestLocation == null || isLiveVsCache || isBetterCandidate(loc, this.bestLocation)) {
                this.bestLocation = new Location(loc);
                this.bestSource = source;
                this.bestProvider = provider;
            }
        }

        void settleSuccess(Location loc, @Nullable String source, @Nullable String provider, long ageMs) {
            if (!settled.compareAndSet(false, true)) return;
            cleanup();
            resolvePositionSuccess(
                call,
                meta,
                loc,
                provider != null ? provider : "unknown",
                source != null ? source : "live",
                ageMs
            );
        }

        void settleError(String errorCode, String errorMessage, @Nullable String provider, @Nullable Integer osErrorCode) {
            if (!settled.compareAndSet(false, true)) return;
            cleanup();
            resolvePositionError(call, meta, errorCode, errorMessage, provider, osErrorCode);
        }

        void cancelFromDestroy() {
            if (!settled.compareAndSet(false, true)) return;
            cleanup();
            resolvePositionError(call, meta, "CONTEXT_UNAVAILABLE", "Plugin destroyed before location fix completed", null, null);
        }

        void cleanup() {
            if (timeoutRunnable != null) {
                mainHandler.removeCallbacks(timeoutRunnable);
                timeoutRunnable = null;
            }
            if (fallbackStartRunnable != null) {
                mainHandler.removeCallbacks(fallbackStartRunnable);
                fallbackStartRunnable = null;
            }
            if (fusedClient != null && fusedCallback != null) {
                try {
                    fusedClient.removeLocationUpdates(fusedCallback);
                } catch (Exception e) {
                    Log.w(TAG, "Error removing GMS location updates", e);
                }
                fusedCallback = null;
            }
            if (locationManager != null && locationListener != null) {
                try {
                    locationManager.removeUpdates(locationListener);
                } catch (Exception e) {
                    Log.w(TAG, "Error removing LocationManager updates", e);
                }
                locationListener = null;
            }
            synchronized (activePositionRequests) {
                activePositionRequests.remove(this);
            }
        }
    }

    private void cancelAllPositionRequests() {
        List<ActivePositionRequest> copy;
        synchronized (activePositionRequests) {
            copy = new ArrayList<>(activePositionRequests);
        }
        Runnable cancelTask = () -> {
            for (ActivePositionRequest req : copy) {
                req.cancelFromDestroy();
            }
        };
        if (Looper.myLooper() == Looper.getMainLooper()) {
            cancelTask.run();
        } else {
            mainHandler.post(cancelTask);
        }
    }

    @Nullable
    private Location readFreshLastKnownLocation(LocationManager lm, boolean hasFine, long maximumAgeMs) {
        List<String> providers = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                if (lm.hasProvider(LocationManager.FUSED_PROVIDER)) {
                    providers.add(LocationManager.FUSED_PROVIDER);
                }
            } catch (Exception ignored) {}
        }
        if (hasFine) {
            providers.add(LocationManager.GPS_PROVIDER);
        }
        providers.add(LocationManager.NETWORK_PROVIDER);
        providers.add(LocationManager.PASSIVE_PROVIDER);

        Location best = null;
        for (String provider : providers) {
            try {
                Location candidate = lm.getLastKnownLocation(provider);
                if (!isValidLocation(candidate)) continue;
                long ageMs = computeLocationAgeMs(candidate);
                if (ageMs > maximumAgeMs) continue;
                if (isBetterCandidate(candidate, best)) {
                    best = candidate;
                }
            } catch (SecurityException | IllegalArgumentException ignored) {}
        }
        return best;
    }

    private static boolean isProviderEnabledSafe(LocationManager lm, String provider) {
        try {
            return lm.isProviderEnabled(provider);
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean isValidLocation(@Nullable Location loc) {
        if (loc == null) return false;
        double lat = loc.getLatitude();
        double lng = loc.getLongitude();
        if (Double.isNaN(lat) || Double.isNaN(lng) || Double.isInfinite(lat) || Double.isInfinite(lng)) {
            return false;
        }
        return !(Math.abs(lat) < 1e-7 && Math.abs(lng) < 1e-7);
    }

    private static long computeLocationAgeMs(Location loc) {
        long elapsedNanos = loc.getElapsedRealtimeNanos();
        if (elapsedNanos > 0L) {
            long diff = (SystemClock.elapsedRealtimeNanos() - elapsedNanos) / 1_000_000L;
            return diff < -5_000L ? Long.MAX_VALUE : Math.max(0L, diff);
        }
        long diff = System.currentTimeMillis() - loc.getTime();
        return diff < -60_000L ? Long.MAX_VALUE : Math.max(0L, diff);
    }

    private static boolean isCacheAcceptable(Location loc, boolean isPrecise, boolean enableHighAccuracy, double desiredAccuracyMeters) {
        if (!isPrecise || !enableHighAccuracy) {
            return true;
        }
        double threshold = Math.max(desiredAccuracyMeters, CACHE_HIGH_ACCEPT_MIN_METERS);
        return loc.hasAccuracy() && loc.getAccuracy() <= threshold;
    }

    private static boolean isLiveAcceptable(Location loc, boolean isPrecise, boolean enableHighAccuracy, double desiredAccuracyMeters) {
        if (!isPrecise) {
            return true;
        }
        if (!enableHighAccuracy) {
            return !loc.hasAccuracy() || loc.getAccuracy() <= desiredAccuracyMeters;
        }
        return loc.hasAccuracy() && loc.getAccuracy() <= desiredAccuracyMeters;
    }

    private static boolean isBetterCandidate(Location candidate, @Nullable Location currentBest) {
        if (currentBest == null) return true;
        float candidateAcc = candidate.hasAccuracy() ? candidate.getAccuracy() : Float.MAX_VALUE;
        float bestAcc = currentBest.hasAccuracy() ? currentBest.getAccuracy() : Float.MAX_VALUE;
        if (Math.abs(candidateAcc - bestAcc) > 10.0f) {
            return candidateAcc < bestAcc;
        }
        return computeLocationAgeMs(candidate) <= computeLocationAgeMs(currentBest);
    }

    private static String mapProvider(@Nullable String rawProvider) {
        if (rawProvider == null) return "unknown";
        switch (rawProvider) {
            case "fused":
                return "fused";
            case LocationManager.GPS_PROVIDER:
                return "gps";
            case LocationManager.NETWORK_PROVIDER:
                return "network";
            case LocationManager.PASSIVE_PROVIDER:
                return "passive";
            default:
                return "unknown";
        }
    }

    private static long readLongOption(PluginCall call, String key, long defaultValue) {
        Object value = call.getData().opt(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return defaultValue;
    }

    private void resolvePositionSuccess(
        PluginCall call,
        LocationStatusMeta meta,
        Location loc,
        String provider,
        String source,
        long ageMs
    ) {
        JSObject ret = new JSObject();
        appendStatusMeta(ret, meta);
        ret.put("success", true);
        ret.put("latitude", loc.getLatitude());
        ret.put("longitude", loc.getLongitude());
        double accuracy = loc.hasAccuracy() ? (double) loc.getAccuracy() : (meta.isPrecise ? 100.0 : 500.0);
        ret.put("accuracy", accuracy);
        if (loc.hasAltitude()) {
            ret.put("altitude", loc.getAltitude());
        }
        if (loc.hasSpeed()) {
            ret.put("speed", (double) loc.getSpeed());
        }
        if (loc.hasBearing()) {
            ret.put("heading", (double) loc.getBearing());
        }
        ret.put("timestamp", loc.getTime() > 0L ? loc.getTime() : System.currentTimeMillis());
        ret.put("provider", provider);
        ret.put("source", source);
        ret.put("ageMs", ageMs);
        call.resolve(ret);
    }

    private void resolvePositionError(
        PluginCall call,
        LocationStatusMeta meta,
        String errorCode,
        String errorMessage,
        @Nullable String provider,
        @Nullable Integer osErrorCode
    ) {
        JSObject ret = new JSObject();
        appendStatusMeta(ret, meta);
        ret.put("success", false);
        ret.put("errorCode", errorCode);
        ret.put("errorMessage", errorMessage);
        if (provider != null) {
            ret.put("provider", provider);
        }
        if (osErrorCode != null) {
            ret.put("osErrorCode", osErrorCode.intValue());
        }
        call.resolve(ret);
    }

    private static void appendStatusMeta(JSObject ret, LocationStatusMeta meta) {
        ret.put("isPrecise", meta.isPrecise);
        ret.put("authorizationStatus", meta.authorizationStatus);
        ret.put("locationEnabled", meta.locationEnabled);
        ret.put("isLowPowerMode", meta.isLowPowerMode);
        ret.put("gmsAvailable", meta.gmsAvailable);
    }

    private LocationStatusMeta readLocationStatusMeta(Context context) {
        boolean hasFine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasCoarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasBackground = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            hasBackground = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED;
        }

        SharedPreferences prefs = context.getSharedPreferences(TrackingLocationService.PREFS_NAME, Context.MODE_PRIVATE);
        boolean hasRequested = prefs.getBoolean(KEY_HAS_REQUESTED_LOCATION_PERMISSION, false);

        Activity activity = getActivity();
        boolean shouldShowFineRationale = activity != null && ActivityCompat.shouldShowRequestPermissionRationale(activity, Manifest.permission.ACCESS_FINE_LOCATION);
        boolean shouldShowCoarseRationale = activity != null && ActivityCompat.shouldShowRequestPermissionRationale(activity, Manifest.permission.ACCESS_COARSE_LOCATION);
        boolean shouldShowRationale = shouldShowFineRationale || shouldShowCoarseRationale;

        String authStatus;
        boolean canAskAgain;
        if (hasFine || hasCoarse) {
            authStatus = hasBackground ? "always" : "whenInUse";
            canAskAgain = !hasFine && (!hasRequested || shouldShowFineRationale);
        } else if (hasRequested || shouldShowRationale) {
            authStatus = "denied";
            canAskAgain = shouldShowRationale;
        } else {
            authStatus = "notDetermined";
            canAskAgain = true;
        }

        LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        boolean locationEnabled = lm != null && LocationManagerCompat.isLocationEnabled(lm);

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        boolean isLowPowerMode = pm != null && pm.isPowerSaveMode();

        boolean gmsAvailable = isGmsAvailable(context);

        return new LocationStatusMeta(
            hasFine,
            hasCoarse,
            hasBackground,
            hasFine,
            authStatus,
            canAskAgain,
            locationEnabled,
            isLowPowerMode,
            gmsAvailable
        );
    }

    private static void markLocationPermissionRequested(Context context) {
        context.getSharedPreferences(TrackingLocationService.PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_HAS_REQUESTED_LOCATION_PERMISSION, true)
            .apply();
    }

    private static boolean isGmsAvailable(Context context) {
        try {
            return GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context) == ConnectionResult.SUCCESS;
        } catch (Throwable t) {
            return false;
        }
    }

    @PluginMethod
    public void checkAndroidPermissions(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        LocationStatusMeta meta = readLocationStatusMeta(context);
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

        // 2. Kiểm tra quyền vị trí chính xác & gần đúng
        ret.put("hasFineLocation", meta.hasFine);
        ret.put("hasCoarseLocation", meta.hasCoarse);

        // 3. Kiểm tra quyền vị trí chạy ngầm (Android 10+)
        ret.put("hasBackgroundLocation", meta.hasBackground);

        // 4. Bổ sung trạng thái Location Services tổng & GMS
        ret.put("isLocationEnabled", meta.locationEnabled);
        ret.put("gmsAvailable", meta.gmsAvailable);

        // 5. Trả về tên hãng thiết bị (để UI đưa ra gợi ý phù hợp)
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

    @PluginMethod
    public void openLocationSettings(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (intent.resolveActivity(context.getPackageManager()) == null) {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.fromParts("package", context.getPackageName(), null));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            }
            context.startActivity(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                fallback.setData(Uri.fromParts("package", context.getPackageName(), null));
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(fallback);

                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception inner) {
                Log.e(TAG, "Failed to open location settings", inner);
                JSObject ret = new JSObject();
                ret.put("success", false);
                call.resolve(ret);
            }
        }
    }

    @PluginMethod
    public void ensureAlwaysPermission(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        LocationStatusMeta meta = readLocationStatusMeta(context);
        boolean isAlways = "always".equals(meta.authorizationStatus);
        String action;
        if (isAlways) {
            action = "already_granted";
        } else if ("whenInUse".equals(meta.authorizationStatus)) {
            action = "when_in_use_only";
        } else {
            action = "denied";
        }

        JSObject ret = new JSObject();
        ret.put("isAlways", isAlways);
        ret.put("action", action);
        ret.put("status", meta.authorizationStatus);
        ret.put("isPrecise", meta.isPrecise);
        call.resolve(ret);
    }

    @PluginMethod
    public void getBatteryLevel(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            JSObject ret = new JSObject();
            ret.put("level", -1);
            call.resolve(ret);
            return;
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                BatteryManager bm = (BatteryManager) context.getSystemService(Context.BATTERY_SERVICE);
                if (bm != null) {
                    int cap = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
                    if (cap >= 0) {
                        JSObject ret = new JSObject();
                        ret.put("level", cap);
                        call.resolve(ret);
                        return;
                    }
                }
            }
            IntentFilter iFilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = context.registerReceiver(null, iFilter);
            if (batteryStatus != null) {
                int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                if (level >= 0 && scale > 0) {
                    int pct = Math.round((level / (float) scale) * 100);
                    JSObject ret = new JSObject();
                    ret.put("level", pct);
                    call.resolve(ret);
                    return;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not read battery level", e);
        }
        JSObject ret = new JSObject();
        ret.put("level", -1);
        call.resolve(ret);
    }
}
