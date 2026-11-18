'use client';

import { useState, useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import { AlertTriangle, Loader2, Lock, MapPin, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components';
import {
  COARSE_ACCURACY_BANNER,
  DIAG_SOURCE_LABELS,
  getLocationErrorGuidance,
  WHEN_IN_USE_CHECKIN_BANNER,
  type DiagGuidePlatform,
} from '@/config';
import type { HybridLocationFailure, HybridLocationFix } from '@/types';

const emptySubscribe = () => () => {};

function getGuidePlatformSnapshot(): DiagGuidePlatform {
  if (typeof navigator === 'undefined') return 'android';
  const ua = navigator.userAgent || '';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

function getGuidePlatformServerSnapshot(): DiagGuidePlatform {
  return 'android';
}

export interface TimekeepingLocationCardProps {
  location: HybridLocationFix | null;
  locationFailure: HybridLocationFailure | null;
  isLocating: boolean;
  onRetry: () => void;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onOpenLocationSettings: () => void;
  onUpgradeAlwaysPermission: () => void;
}

export function TimekeepingLocationCard({
  location,
  locationFailure,
  isLocating,
  onRetry,
  onRequestPermission,
  onOpenSettings,
  onOpenLocationSettings,
  onUpgradeAlwaysPermission,
}: TimekeepingLocationCardProps) {
  const defaultGuidePlatform = useSyncExternalStore(
    emptySubscribe,
    getGuidePlatformSnapshot,
    getGuidePlatformServerSnapshot,
  );
  const [selectedPlatform, setSelectedPlatform] = useState<DiagGuidePlatform | null>(null);
  const guidePlatform = selectedPlatform ?? defaultGuidePlatform;

  const isNative = Capacitor.isNativePlatform();
  const isIosWhenInUse =
    Capacitor.getPlatform() === 'ios' &&
    Boolean(location && location.authorizationStatus === 'when_in_use');

  const mapsEmbedUrl = location
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`
    : null;
  const mapsLinkUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : null;

  const guidance = locationFailure ? getLocationErrorGuidance(locationFailure) : null;

  const handleGuidancePrimaryAction = () => {
    if (!guidance) {
      onRetry();
      return;
    }
    switch (guidance.primaryAction) {
      case 'open_settings':
        onOpenSettings();
        break;
      case 'open_location_settings':
        onOpenLocationSettings();
        break;
      case 'request_permission':
        onRequestPermission();
        break;
      default:
        onRetry();
        break;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 space-y-2 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <MapPin size={13} />
          </div>
          <span className="text-xs font-semibold text-slate-800">Toạ độ &amp; Vị trí hiện tại</span>
        </div>

        {location && (
          <div className="flex items-center gap-2">
            {location.isRefining && (
              <span className="text-[10px] text-primary bg-primary/5 border border-primary/15 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                Đang tinh chỉnh
              </span>
            )}
            <span
              title={DIAG_SOURCE_LABELS[location.source]}
              className={`text-[10px] px-2 py-0.5 rounded-md font-mono border ${
                location.isCoarseWarning
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-slate-600 bg-white border-slate-200'
              }`}
            >
              ±{location.accuracy}m
            </span>
            <button
              type="button"
              onClick={onRetry}
              disabled={isLocating}
              title="Cập nhật lại vị trí"
              className="text-[11px] font-medium text-slate-600 hover:text-primary inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={11} className={isLocating ? 'animate-spin' : ''} />
            </button>
            {mapsLinkUrl && (
              <a
                href={mapsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <span>Maps</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}
          </div>
        )}
      </div>

      <div
        className={`relative overflow-hidden rounded-lg border border-slate-200 bg-white w-full ${
          !location && guidance ? 'min-h-28 max-h-48 overflow-y-auto' : 'h-24 sm:h-28'
        }`}
      >
        {mapsEmbedUrl ? (
          <iframe
            src={mapsEmbedUrl}
            title="Vị trí hiện tại"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
          />
        ) : guidance ? (
          <div className="flex h-full flex-col justify-between p-2.5 bg-gradient-to-b from-amber-50/90 to-white text-slate-800 text-left gap-2">
            <div>
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-amber-200">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-0.5 bg-amber-500 text-white rounded shrink-0">
                    <Lock size={11} />
                  </div>
                  <span className="font-bold text-[11px] text-amber-900 truncate">
                    {guidance.title}
                  </span>
                </div>
                <div className="flex bg-slate-200/80 p-0.5 rounded text-[9px] font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('android')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      guidePlatform === 'android' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('ios')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      guidePlatform === 'ios' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    iPhone
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('desktop')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      guidePlatform === 'desktop' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    PC
                  </button>
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-600 leading-snug">{guidance.description}</p>
              <p className="mt-1 text-[10px] text-slate-700 font-medium leading-snug">
                {guidance.steps[guidePlatform]}
              </p>
            </div>
            <div className="flex items-center justify-end gap-1.5 pt-0.5">
              {guidance.primaryAction !== 'retry' && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={onRetry}
                  disabled={isLocating}
                  leftIcon={<RefreshCw size={10} className={isLocating ? 'animate-spin' : ''} />}
                  className="px-2 py-0.5 text-[10px]"
                >
                  Thử lại
                </Button>
              )}
              <Button
                variant="primary"
                size="xs"
                onClick={handleGuidancePrimaryAction}
                disabled={isLocating}
                leftIcon={
                  guidance.primaryAction === 'retry' ? (
                    <RefreshCw size={10} className={isLocating ? 'animate-spin' : ''} />
                  ) : (
                    <Settings size={10} />
                  )
                }
                className="px-2.5 py-0.5 text-[10px]"
              >
                {isLocating ? 'Đang lấy...' : guidance.primaryActionLabel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
            <MapPin size={18} className="text-slate-400" />
            {isLocating ? (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Loader2 size={12} className="animate-spin" />
                <span>Đang kết nối GPS...</span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400">Chưa có tọa độ GPS.</p>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={onRetry}
                  leftIcon={<RefreshCw size={10} />}
                  className="text-[10px] py-0.5 px-2"
                >
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {location?.isCoarseWarning && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800">
          <div className="flex items-start gap-1.5 min-w-0">
            <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-snug">
              Vị trí gần đúng (±{location.accuracy}m) — {COARSE_ACCURACY_BANNER}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isNative && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold text-[10px] hover:bg-amber-700 cursor-pointer"
              >
                Mở Cài đặt
              </button>
            )}
            <button
              type="button"
              onClick={onRetry}
              disabled={isLocating}
              className="px-2 py-0.5 rounded border border-amber-300 bg-white text-amber-900 font-medium text-[10px] hover:bg-amber-100 cursor-pointer disabled:opacity-50"
            >
              Cập nhật lại
            </button>
          </div>
        </div>
      )}

      {isIosWhenInUse && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1.5 text-[11px] text-amber-900">
          <span className="leading-snug">{WHEN_IN_USE_CHECKIN_BANNER}</span>
          <button
            type="button"
            onClick={onUpgradeAlwaysPermission}
            className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold text-[10px] hover:bg-amber-700 shrink-0 cursor-pointer"
          >
            Mở Cài đặt
          </button>
        </div>
      )}

      {location && (
        <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono bg-white rounded-lg px-2.5 py-1.5 border border-slate-200/80">
          <span>Lat: {location.lat.toFixed(5)}</span>
          <span>Lng: {location.lng.toFixed(5)}</span>
          <span className={`font-semibold ${location.isCoarseWarning ? 'text-amber-700' : 'text-primary'}`}>
            Độ chính xác: ±{location.accuracy}m
          </span>
        </div>
      )}
    </div>
  );
}
