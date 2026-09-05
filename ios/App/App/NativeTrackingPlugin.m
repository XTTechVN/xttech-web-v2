#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeTrackingPlugin, "NativeTracking",
    CAP_PLUGIN_METHOD(startTracking, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopTracking, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(updateToken, CAPPluginReturnPromise);
)
