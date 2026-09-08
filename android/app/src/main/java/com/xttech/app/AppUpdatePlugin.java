package com.xttech.app;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {
    private static final String TAG = "AppUpdatePlugin";
    private static final String APK_FILE_NAME = "xttech_update.apk";
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            PackageManager pm = context.getPackageManager();
            PackageInfo pInfo = pm.getPackageInfo(context.getPackageName(), 0);
            
            long versionCode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }

            JSObject ret = new JSObject();
            ret.put("versionCode", versionCode);
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.0.0");
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get app version", e);
            call.reject("Failed to get app version: " + e.getMessage());
        }
    }

    @PluginMethod
    public void canInstall(PluginCall call) {
        Context context = getContext();
        boolean canInstall = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && context != null) {
            canInstall = context.getPackageManager().canRequestPackageInstalls();
        }
        JSObject ret = new JSObject();
        ret.put("canInstall", canInstall);
        call.resolve(ret);
    }

    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                intent.setData(Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to open settings", e);
            call.reject("Failed to open install permission settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String downloadUrl = call.getString("url");
        if (downloadUrl == null || downloadUrl.trim().isEmpty()) {
            call.reject("URL tải APK không hợp lệ");
            return;
        }

        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        executor.execute(() -> {
            HttpURLConnection connection = null;
            InputStream input = null;
            OutputStream output = null;

            try {
                URL url = new URL(downloadUrl);
                connection = (HttpURLConnection) url.openConnection();
                connection.setInstanceFollowRedirects(true);
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(30000);
                connection.connect();

                int responseCode = connection.getResponseCode();
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    notifyError("Tải file thất bại với mã lỗi HTTP: " + responseCode);
                    if (getActivity() != null) {
                        getActivity().runOnUiThread(() -> call.reject("HTTP response: " + responseCode));
                    }
                    return;
                }

                int fileLength = connection.getContentLength();
                File targetDir = context.getExternalCacheDir();
                if (targetDir == null) {
                    targetDir = context.getCacheDir();
                }

                File apkFile = new File(targetDir, APK_FILE_NAME);
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                input = new BufferedInputStream(connection.getInputStream());
                output = new FileOutputStream(apkFile);

                byte[] buffer = new byte[8192];
                long total = 0;
                int count;
                int lastPercent = -1;

                while ((count = input.read(buffer)) != -1) {
                    total += count;
                    output.write(buffer, 0, count);

                    if (fileLength > 0) {
                        int percent = (int) (total * 100 / fileLength);
                        if (percent != lastPercent) {
                            lastPercent = percent;
                            JSObject progress = new JSObject();
                            progress.put("percent", percent);
                            progress.put("loaded", total);
                            progress.put("total", fileLength);
                            notifyListeners("downloadProgress", progress);
                        }
                    }
                }

                output.flush();

                // Kiểm tra quyền cài đặt từ nguồn không xác định trên Android 8.0+
                boolean canInstall = true;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    canInstall = context.getPackageManager().canRequestPackageInstalls();
                }

                if (canInstall) {
                    triggerApkInstall(apkFile);
                    if (getActivity() != null) {
                        getActivity().runOnUiThread(() -> {
                            JSObject ret = new JSObject();
                            ret.put("success", true);
                            ret.put("installedTriggered", true);
                            call.resolve(ret);
                        });
                    }
                } else {
                    if (getActivity() != null) {
                        getActivity().runOnUiThread(() -> {
                            JSObject ret = new JSObject();
                            ret.put("success", true);
                            ret.put("needPermission", true);
                            call.resolve(ret);
                        });
                    }
                }

            } catch (Exception e) {
                Log.e(TAG, "Error downloading and installing APK", e);
                notifyError("Lỗi trong quá trình tải hoặc cài đặt APK: " + e.getMessage());
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> call.reject("Download/Install error: " + e.getMessage()));
                }
            } finally {
                try {
                    if (output != null) output.close();
                    if (input != null) input.close();
                    if (connection != null) connection.disconnect();
                } catch (Exception ignored) {}
            }
        });
    }

    @PluginMethod
    public void installDownloadedApk(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        File targetDir = context.getExternalCacheDir();
        if (targetDir == null) {
            targetDir = context.getCacheDir();
        }
        File apkFile = new File(targetDir, APK_FILE_NAME);

        if (!apkFile.exists()) {
            call.reject("File APK chưa được tải về máy.");
            return;
        }

        try {
            triggerApkInstall(apkFile);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Lỗi khi kích hoạt cài đặt APK", e);
            call.reject("Lỗi khi mở cài đặt: " + e.getMessage());
        }
    }

    private void triggerApkInstall(File apkFile) {
        Context context = getContext();
        if (context == null) return;

        Uri apkUri = FileProvider.getUriForFile(
                context,
                context.getPackageName() + ".fileprovider",
                apkFile
        );

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    private void notifyError(String errorMessage) {
        JSObject error = new JSObject();
        error.put("message", errorMessage);
        notifyListeners("downloadError", error);
    }
}
