'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { ArrowDownToLine, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, X } from 'lucide-react';
import { BASE_API_URL } from '@/config';

export interface AppVersionResponse {
  platform: string;
  versionCode: number;
  versionName: string;
  apkUrl: string;
  forceUpdate: boolean;
  changelog: string[];
  releaseDate?: string | null;
}

interface AppUpdateNativePlugin {
  getAppVersion(): Promise<{ versionCode: number; versionName: string }>;
  canInstall(): Promise<{ canInstall: boolean }>;
  openInstallPermissionSettings(): Promise<{ success: boolean }>;
  downloadAndInstall(options: { url: string }): Promise<{ success: boolean; needPermission?: boolean; installedTriggered?: boolean }>;
  installDownloadedApk(): Promise<{ success: boolean }>;
  addListener(eventName: 'downloadProgress', listenerFunc: (data: { percent: number; loaded: number; total: number }) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'downloadError', listenerFunc: (data: { message: string }) => void): Promise<{ remove: () => void }>;
}

const AppUpdate = registerPlugin<AppUpdateNativePlugin>('AppUpdate');

type UpdateStatus = 'IDLE' | 'DOWNLOADING' | 'NEED_PERMISSION' | 'READY_TO_INSTALL' | 'ERROR';

export function AppUpdateModal() {
  const [updateInfo, setUpdateInfo] = useState<AppVersionResponse | null>(null);
  const [currentVersion, setCurrentVersion] = useState<{ versionCode: number; versionName: string } | null>(null);
  const [status, setStatus] = useState<UpdateStatus>('IDLE');
  const [progress, setProgress] = useState<number>(0);
  const [downloadedMb, setDownloadedMb] = useState<string>('0');
  const [totalMb, setTotalMb] = useState<string>('0');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // 1. Kiểm tra phiên bản khi mở ứng dụng trên Android
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    let isMounted = true;

    async function checkVersion() {
      try {
        // Lấy version hiện tại từ Android Native
        const current = await AppUpdate.getAppVersion();
        if (!isMounted) return;
        setCurrentVersion(current);

        // Lấy version mới nhất từ Server Backend (FastAPI / Railway)
        const res = await fetch(`${BASE_API_URL}/api/v1/app-versions/latest?platform=android&_t=` + Date.now());
        if (!res.ok) return;
        const serverData: AppVersionResponse = await res.json();

        // Nếu versionCode trên server cao hơn trong máy
        if (serverData && serverData.versionCode > current.versionCode) {
          setUpdateInfo(serverData);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn('[AppUpdate] Lỗi khi kiểm tra phiên bản:', err);
      }
    }

    checkVersion();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Lắng nghe tiến trình download từ native
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    let progressSub: { remove: () => void } | null = null;
    let errorSub: { remove: () => void } | null = null;

    AppUpdate.addListener('downloadProgress', (data) => {
      setProgress(data.percent);
      setDownloadedMb((data.loaded / (1024 * 1024)).toFixed(1));
      if (data.total > 0) {
        setTotalMb((data.total / (1024 * 1024)).toFixed(1));
      }
    }).then((sub) => {
      progressSub = sub;
    });

    AppUpdate.addListener('downloadError', (data) => {
      setStatus('ERROR');
      setErrorMessage(data.message || 'Lỗi không xác định khi tải file');
    }).then((sub) => {
      errorSub = sub;
    });

    return () => {
      progressSub?.remove();
      errorSub?.remove();
    };
  }, []);

  // 3. Xử lý tải và cài đặt
  const handleStartUpdate = useCallback(async () => {
    if (!updateInfo) return;

    setStatus('DOWNLOADING');
    setProgress(0);
    setErrorMessage('');

    try {
      // Biến url tương đối thành tuyệt đối nếu cần
      let fullUrl = updateInfo.apkUrl;
      if (!fullUrl) {
        setStatus('ERROR');
        setErrorMessage('Chưa có liên kết tải gói cài đặt trên hệ thống');
        return;
      }
      if (fullUrl.startsWith('/')) {
        fullUrl = `${BASE_API_URL}${fullUrl}`;
      }

      const result = await AppUpdate.downloadAndInstall({ url: fullUrl });

      if (result.needPermission) {
        setStatus('NEED_PERMISSION');
      } else if (result.installedTriggered) {
        setStatus('READY_TO_INSTALL');
      }
    } catch (err: unknown) {
      setStatus('ERROR');
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'Không thể tải xuống bản cập nhật');
    }
  }, [updateInfo]);

  // 4. Mở cài đặt cấp quyền nguồn không xác định
  const handleOpenSettings = async () => {
    try {
      await AppUpdate.openInstallPermissionSettings();
      setStatus('NEED_PERMISSION');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Cài đặt lại file đã tải về
  const handleInstallDownloaded = async () => {
    try {
      await AppUpdate.installDownloadedApk();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setStatus('ERROR');
    }
  };

  if (!isOpen || !updateInfo) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header modal */}
        <div className="bg-gradient-to-r from-[#045863] to-[#087f8f] p-5 text-white relative">
          {!updateInfo.forceUpdate && status !== 'DOWNLOADING' && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Đã có bản cập nhật mới!</h3>
              <p className="text-xs text-white/80">
                Phiên bản {updateInfo.versionName} (Hiện tại: {currentVersion?.versionName || '1.0.0'})
              </p>
            </div>
          </div>
        </div>

        {/* Nội dung modal theo từng trạng thái */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          {/* Trạng thái 1: IDLE - Hiện danh sách thay đổi */}
          {status === 'IDLE' && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Nội dung cập nhật:</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 max-h-48 overflow-y-auto">
                  <ul className="space-y-2">
                    {updateInfo.changelog?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#045863] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {!updateInfo.forceUpdate && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                  >
                    Để sau
                  </button>
                )}
                <button
                  onClick={handleStartUpdate}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#045863] hover:bg-[#03444d] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#045863]/25 transition-all"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Cập nhật ngay
                </button>
              </div>
            </>
          )}

          {/* Trạng thái 2: Đang tải xuống */}
          {status === 'DOWNLOADING' && (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#045863]/10 flex items-center justify-center text-[#045863] animate-bounce">
                <ArrowDownToLine className="w-7 h-7" />
              </div>
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600 px-1">
                  <span>Đang tải gói cài đặt...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#045863] to-[#087f8f] rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-right">
                  {downloadedMb} MB {totalMb !== '0' ? `/ ${totalMb} MB` : ''}
                </p>
              </div>
              <p className="text-xs text-slate-500 italic">Vui lòng không tắt ứng dụng trong lúc tải</p>
            </div>
          )}

          {/* Trạng thái 3: Cần cấp quyền cài app không rõ nguồn gốc */}
          {status === 'NEED_PERMISSION' && (
            <div className="py-2 flex flex-col gap-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <p className="font-semibold text-amber-900 mb-0.5">Yêu cầu quyền cài đặt:</p>
                  Hệ điều hành Android yêu cầu bạn cho phép <strong>XTTech</strong> cài đặt ứng dụng từ nguồn này để tiếp tục cập nhật.
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleOpenSettings}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors shadow-md"
                >
                  Mở cài đặt cấp quyền
                </button>
                <button
                  onClick={handleInstallDownloaded}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Đã cấp quyền, tiếp tục cài đặt
                </button>
              </div>
            </div>
          )}

          {/* Trạng thái 4: Sẵn sàng cài đặt */}
          {status === 'READY_TO_INSTALL' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Tải gói cập nhật thành công!</h4>
                <p className="text-xs text-slate-500 mt-1">Bấm nút bên dưới để tiến hành cài đặt bản mới.</p>
              </div>
              <button
                onClick={handleInstallDownloaded}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-md"
              >
                Cài đặt ngay
              </button>
            </div>
          )}

          {/* Trạng thái 5: Lỗi */}
          {status === 'ERROR' && (
            <div className="py-3 space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage || 'Đã xảy ra sự cố khi tải bản cập nhật.'}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleStartUpdate}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#045863] text-white text-sm hover:bg-[#03444d]"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
