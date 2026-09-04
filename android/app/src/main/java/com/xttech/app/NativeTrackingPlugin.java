package com.xttech.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

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
}
