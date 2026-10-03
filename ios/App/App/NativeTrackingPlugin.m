#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeTrackingPlugin, "NativeTracking",
    CAP_PLUGIN_METHOD(startTracking, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopTracking, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(updateToken, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(checkPermission, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openSettings, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(ensureAlwaysPermission, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getBatteryLevel, CAPPluginReturnPromise);
)
